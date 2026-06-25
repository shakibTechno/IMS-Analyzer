"""
gen_summit.py — Generate Summit Communication Limited GeoJSON files.

Outputs (in public/data/):
  summit-nodes.geojson       — network POPs / nodes  (~5,800 pts)
  summit-bts.geojson         — BTS sites             (~8,600 pts)
  summit-lines-backbone.geojson — burial+aerial core>=96   (~4,500 segs)
  summit-lines-major.geojson    — burial core 48-95        (~15,100 segs)
  summit-lines-infra.geojson    — PGCB + Railway route     (~1,860 segs)
"""

import json, sys, os, openpyxl, shapefile
sys.stdout.reconfigure(encoding='utf-8')

BASE   = os.path.dirname(os.path.abspath(__file__))
OUTDIR = os.path.join(BASE, 'public', 'data')

# ── helpers ──────────────────────────────────────────────────────────
def write_geojson(path, features):
    fc = {'type': 'FeatureCollection', 'features': features}
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(fc, f, ensure_ascii=False, separators=(',', ':'))
    mb = os.path.getsize(path) / 1024 / 1024
    print(f'  wrote {os.path.basename(path)}: {len(features):,} features, {mb:.2f} MB')

def safe_float(v):
    try: return float(v)
    except: return None

def safe_int(v):
    try: return int(float(v))
    except: return 0

# ════════════════════════════════════════════════════════════════════
# POINTS  (from Excel — has Lat/Lon columns)
# ════════════════════════════════════════════════════════════════════
print('Loading Point_data.xlsx ...')
pt_xlsx = os.path.join(BASE, 'MapData', 'Summit', 'Point_data Excel', 'Point_data.xlsx')
wb = openpyxl.load_workbook(pt_xlsx, read_only=True, data_only=True)
ws = wb.active
rows = list(ws.iter_rows(values_only=True))
wb.close()

# Row 0 = dummy a,b,c…  Row 1 = real headers  Row 2+ = data
# Cols: FID=0,Point_id=1,Year=2,Month=3,Op_Code=4,Op_Name=5,
#       Point_Type=6,Point_Name=7,Lat=8,Lon=9,Feature_code=10
pt_data = rows[2:]
print(f'  {len(pt_data):,} point rows')

# ── Node types to include ──────────────────────────────────────────
NODE_TYPES = {
    'POP', 'COLO/PoP', 'PoP(Damaged)',
    'Node', 'Node/Info', 'Node/TT', 'Node/CBD',
    'Node/GP HO', 'Node/TT HO', 'Node/GP IBS',
    'Node/ROBI HO', 'Node/BL IBS', 'Node/BL HO',
    'BS', 'POC', 'ODB', 'FAT', 'FDT', 'EC', 'POI',
}

# ── Node colour by type ────────────────────────────────────────────
def node_color(pt_type: str) -> str:
    t = pt_type or ''
    if t in ('POP', 'COLO/PoP', 'PoP(Damaged)'):
        return '#7c3aed'
    if t.startswith('Node'):
        return '#2563eb'
    if t == 'BS':
        return '#16a34a'
    if t in ('POC', 'ODB', 'FAT', 'FDT', 'EC', 'POI'):
        return '#64748b'
    return '#94a3b8'

node_feats = []
bts_feats  = []

for r in pt_data:
    pt_type = str(r[6] or '').strip()
    lat     = safe_float(r[8])
    lon     = safe_float(r[9])
    if lat is None or lon is None:
        continue
    # basic BD bbox check
    if not (20.0 <= lat <= 27.0 and 87.0 <= lon <= 93.0):
        continue

    props = {
        'point_type': pt_type,
        'point_name': str(r[7] or '').strip(),
        'color':      node_color(pt_type),
    }
    feat = {
        'type': 'Feature',
        'geometry': {'type': 'Point', 'coordinates': [round(lon, 6), round(lat, 6)]},
        'properties': props,
    }

    if pt_type == 'BTS':
        bts_feats.append(feat)
    elif pt_type in NODE_TYPES:
        node_feats.append(feat)

print(f'  Nodes: {len(node_feats):,}  BTS: {len(bts_feats):,}')

write_geojson(os.path.join(OUTDIR, 'summit-nodes.geojson'), node_feats)
write_geojson(os.path.join(OUTDIR, 'summit-bts.geojson'),   bts_feats)

# ════════════════════════════════════════════════════════════════════
# LINES  (geometry from shapefile, attributes already in shapefile)
# ════════════════════════════════════════════════════════════════════
print('Loading Line_data shapefile ...')
shp_path = os.path.join(BASE, 'MapData', 'Summit', 'Line_data shape', 'Line_data.shp')
sf = shapefile.Reader(shp_path)
print(f'  {len(sf):,} records')

# shapefile fields (skip DeletionFlag at index 0):
# OBJECTID_1, FID_1, Line_id, Year, Month, Operator_C, Operator_N,
# Infra_type, Line_Type, Line_Name, Path_Along, Nof_of_Duc, Duct_Use,
# No_s_of_ca, Total_core, Core_use_1, Core_unuse, Route_leng, Cable_leng, Feature_co

backbone_feats = []
major_feats    = []
infra_feats    = []

INFRA_PATHS = {'PGCB Grid line', 'Railway'}

for i, (rec, shp_rec) in enumerate(zip(sf.records(), sf.shapes())):
    pts = shp_rec.points
    if len(pts) < 2:
        continue

    line_type  = str(rec['Line_Type']  or '').strip()
    path_along = str(rec['Path_Along'] or '').strip()
    total_core = safe_int(rec['Total_core'])
    core_used  = safe_int(rec['Core_use_1'])
    core_unused= safe_int(rec['Core_unuse'])
    route_km   = safe_float(rec['Route_leng']) or 0.0
    line_name  = str(rec['Line_Name']  or '').strip()
    infra_type = str(rec['Infra_type'] or '').strip()

    # Determine line colour
    if total_core >= 96:
        color  = '#7c3aed'
        weight = 2.8
    elif total_core >= 48:
        color  = '#2563eb'
        weight = 1.8
    else:
        color  = '#64748b'
        weight = 1.2

    # PGCB/Railway get their own colours regardless of core
    if path_along == 'PGCB Grid line':
        color  = '#ca8a04'
        weight = 1.6
    elif path_along == 'Railway':
        color  = '#dc2626'
        weight = 1.8

    coords = [[round(x, 6), round(y, 6)] for x, y in pts]

    props = {
        'line_type':  line_type,
        'line_name':  line_name,
        'infra_type': infra_type,
        'path_along': path_along,
        'total_core': total_core,
        'core_used':  core_used,
        'core_unused':core_unused,
        'route_km':   round(route_km, 4),
        'color':      color,
        'weight':     weight,
    }
    feat = {
        'type': 'Feature',
        'geometry': {'type': 'LineString', 'coordinates': coords},
        'properties': props,
    }

    # Route to the right bucket
    if path_along in INFRA_PATHS:
        infra_feats.append(feat)
    elif total_core >= 96:
        backbone_feats.append(feat)
    elif total_core >= 48 and line_type in ('Burial', 'Burial(Damaged)', 'Bridge Crossing'):
        major_feats.append(feat)
    elif total_core >= 48 and line_type == 'Aerial':
        backbone_feats.append(feat)   # aerial backbone goes with high-value

sf.close()

print(f'  Backbone (>=96 core + aerial >=48): {len(backbone_feats):,}')
print(f'  Major (burial 48-95 core):          {len(major_feats):,}')
print(f'  Infra (PGCB + Railway):             {len(infra_feats):,}')

write_geojson(os.path.join(OUTDIR, 'summit-lines-backbone.geojson'), backbone_feats)
write_geojson(os.path.join(OUTDIR, 'summit-lines-major.geojson'),    major_feats)
write_geojson(os.path.join(OUTDIR, 'summit-lines-infra.geojson'),    infra_feats)

print('\nDone.')
