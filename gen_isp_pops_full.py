"""
Generates public/data/isp-pops-full.geojson
Source: MapData/ISP pop list.xlsx (Sheet2)
Enriches each POP with division/district/upazila via spatial join against bd-upazilas.geojson
"""
import openpyxl, re, json, os
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
from collections import Counter

def dms_to_dd(s):
    m = re.search(r"(\d{1,3})\D+(\d{1,2})'([\d.]+)\"?\s*([NSEW])", str(s), re.I)
    if not m: return None
    d, mi, sec, hem = int(m.group(1)), int(m.group(2)), float(m.group(3)), m.group(4).upper()
    dd = d + mi/60 + sec/3600
    return -dd if hem in ('S','W') else dd

def parse_coord(v):
    if v is None: return None
    s = str(v).strip().rstrip(',')
    if re.search(r"\d+\D+\d+'\d", s) or re.search(r'\d[^\d]*[NSEW]\s*$', s, re.I):
        dd = dms_to_dd(s)
        if dd is not None: return dd
    cleaned = re.sub(r'[^0-9.\-]', '', s)
    parts = cleaned.split('.')
    if len(parts) > 2: cleaned = parts[0] + '.' + parts[1]
    try: return float(cleaned)
    except: return None

in_bd = lambda la, lo: (20 <= la <= 27 and 87 <= lo <= 93.5)

NTTN_NORM = {
    'Summit Communications Limited':                  'Summit Communications',
    'Summit Communications Ltd':                      'Summit Communications',
    'Bangladesh Telecommunications Company Ltd':      'BTCL',
    'Bangladesh Telecommunications Company Limited':  'BTCL',
    'Bangladesh Telecommunication Company Limited':   'BTCL',
    'Bangladesh Telecommunication company limited.':  'BTCL',
    'Bangladesh Telecommunications Company Ltd. (BTCL)': 'BTCL',
}

LIC_NORM = {
    'Nationwide ISP':          'Nationwide',
    'Divisional ISP':          'Divisional',
    'District ISP':            'District',
    'Thana or Upazilla ISP':   'Upazila',
    'Thana or Upazilla':       'Upazila',
    'Upazila ISP':             'Upazila',
}

print('Loading upazila boundaries...')
with open('public/data/bd-upazilas.geojson', encoding='utf-8') as f:
    upa_gj = json.load(f)
upa_shapes = [shape(feat['geometry']) for feat in upa_gj['features']]
upa_props  = [feat['properties']      for feat in upa_gj['features']]
tree       = STRtree(upa_shapes)
print(f'  {len(upa_shapes)} upazila polygons indexed')

def spatial_lookup(lat, lon):
    pt   = Point(lon, lat)
    hits = tree.query(pt, predicate='within')
    if len(hits):
        p = upa_props[hits[0]]
        return p.get('division_n',''), p.get('district_n',''), p.get('thana_name','')
    idx = tree.nearest(pt)
    if idx is not None:
        p = upa_props[idx]
        return p.get('division_n',''), p.get('district_n',''), p.get('thana_name','')
    return '', '', ''

print('Reading Excel...')
wb   = openpyxl.load_workbook('MapData/ISP pop list.xlsx', read_only=True)
ws   = wb['Sheet2']
rows = list(ws.iter_rows(values_only=True))
print(f'  {len(rows)-1} data rows')

features = []
skipped  = 0

for r in rows[1:]:
    sl, name, isp_type, license_no, lat_raw, lon_raw, nttn_raw = r
    try:
        lat, lon = float(lat_raw), float(lon_raw)
        if not in_bd(lat, lon):
            if in_bd(lon, lat): lat, lon = lon, lat
            else: skipped += 1; continue
    except (TypeError, ValueError):
        lat = parse_coord(lat_raw)
        lon = parse_coord(lon_raw)
        if lat is None or lon is None: skipped += 1; continue
        if not in_bd(lat, lon):
            if in_bd(lon, lat): lat, lon = lon, lat
            else: skipped += 1; continue

    division, district, upazila = spatial_lookup(lat, lon)
    raw_nttn = str(nttn_raw).strip() if nttn_raw else ''
    nttn     = NTTN_NORM.get(raw_nttn, raw_nttn)
    raw_lic  = str(isp_type).strip() if isp_type else ''
    lic      = LIC_NORM.get(raw_lic, raw_lic)

    features.append({
        'type': 'Feature',
        'geometry': {'type': 'Point', 'coordinates': [round(lon,6), round(lat,6)]},
        'properties': {
            'name':         str(name).strip() if name else '',
            'license_type': lic,
            'nttn':         nttn,
            'division':     division,
            'district':     district,
            'upazila':      upazila,
        },
    })

print(f'Valid: {len(features)}  Skipped: {skipped}')
print(f'Unique ISPs: {len(set(f["properties"]["name"] for f in features if f["properties"]["name"]))}')
print('License types:', Counter(f['properties']['license_type'] for f in features).most_common())
print('NTTN:',         Counter(f['properties']['nttn']         for f in features).most_common())
print('Divisions:',    Counter(f['properties']['division']     for f in features).most_common())

out = 'public/data/isp-pops-full.geojson'
with open(out, 'w', encoding='utf-8') as f:
    json.dump({'type':'FeatureCollection','features':features}, f, ensure_ascii=False, separators=(',',':'))
print(f'\nWritten: {len(features)} features ({os.path.getsize(out)//1024} KB) -> {out}')
