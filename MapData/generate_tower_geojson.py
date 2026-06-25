"""Convert MNO + TowerCo tower Excel files into per-operator GeoJSON files.

Sources (MapData/TowerData/):
  All MNO Tower data.xlsx   -> sheets GP, ROBI, BL, TT
  ALL TOWERCO Data.xlsx     -> sheets EDOTCO, STL, KBTL, FTL

Output: public/data/tower-{op}.geojson
Properties kept minimal for file size:
  id   tower ID
  t    tower type (raw)
  o    owner name
  tn   tenants (string)
  div  division
  dist district
  th   thana
"""
import json
import os
import re

import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, '..', 'public', 'data')

# Bangladesh bounding box (generous)
LAT_MIN, LAT_MAX = 20.3, 26.8
LON_MIN, LON_MAX = 87.9, 92.9

FLOAT_RE = re.compile(r'-?\d+\.?\d*')


def parse_latlon_combined(value):
    """Parse 'lat,lon' / 'lat/lon' / 'lat°  lon°' strings."""
    if value is None:
        return None
    nums = FLOAT_RE.findall(str(value))
    if len(nums) < 2:
        return None
    try:
        return float(nums[0]), float(nums[1])
    except ValueError:
        return None


def valid(lat, lon):
    return LAT_MIN <= lat <= LAT_MAX and LON_MIN <= lon <= LON_MAX


def cell(row, idx):
    if idx is None or idx >= len(row):
        return ''
    v = row[idx]
    if v is None:
        return ''
    s = str(v).strip()
    return '' if s.upper() in ('N/A', '#N/A', 'NA', 'NONE', '-') else s


# Per-sheet column maps (0-based). latlon: either ('split', lat_idx, lon_idx)
# or ('combined', idx). data_row: first data row (1-based).
SHEETS = {
    'gp':     dict(file='All MNO Tower data.xlsx', sheet='GP',     data_row=4,
                   latlon=('split', 3, 4), type=1, id=2, owner=5, tenants=6,
                   div=21, dist=22, th=23),
    'robi':   dict(file='All MNO Tower data.xlsx', sheet='ROBI',   data_row=4,
                   latlon=('combined', 1), type=0, id=16, owner=2, tenants=3,
                   div=17, dist=18, th=19),
    'bl':     dict(file='All MNO Tower data.xlsx', sheet='BL',     data_row=4,
                   latlon=('combined', 3), type=1, id=2, owner=4, tenants=6,
                   div=22, dist=23, th=24),
    'tt':     dict(file='All MNO Tower data.xlsx', sheet='TT',     data_row=4,
                   latlon=('combined', 3), type=1, id=2, owner=4, tenants=5,
                   div=20, dist=21, th=22),
    'edotco': dict(file='ALL TOWERCO Data.xlsx',   sheet='EDOTCO', data_row=4,
                   latlon=('split', 3, 4), type=1, id=2, owner=5, tenants=7,
                   div=23, dist=24, th=25),
    'stl':    dict(file='ALL TOWERCO Data.xlsx',   sheet='STL',    data_row=4,
                   latlon=('split', 3, 4), type=1, id=2, owner=5, tenants=6,
                   div=21, dist=22, th=23),
    'kbtl':   dict(file='ALL TOWERCO Data.xlsx',   sheet='KBTL',   data_row=4,
                   latlon=('split', 3, 4), type=1, id=2, owner=5, tenants=6,
                   div=21, dist=22, th=23),
    'ftl':    dict(file='ALL TOWERCO Data.xlsx',   sheet='FTL',    data_row=5,
                   latlon=('combined', 3), type=1, id=2, owner=4, tenants=5,
                   div=20, dist=21, th=22),
}


def convert(op, cfg, wb_cache):
    path = os.path.join(HERE, 'TowerData', cfg['file'])
    if path not in wb_cache:
        wb_cache[path] = openpyxl.load_workbook(path, read_only=True)
    ws = wb_cache[path][cfg['sheet']]

    features, skipped = [], 0
    mode = cfg['latlon']

    for row in ws.iter_rows(min_row=cfg['data_row'], values_only=True):
        if mode[0] == 'split':
            lat_raw, lon_raw = row[mode[1]] if mode[1] < len(row) else None, \
                               row[mode[2]] if mode[2] < len(row) else None
            try:
                lat, lon = float(lat_raw), float(lon_raw)
            except (TypeError, ValueError):
                ll = parse_latlon_combined(lat_raw)
                if ll is None:
                    skipped += 1
                    continue
                lat, lon = ll
        else:
            ll = parse_latlon_combined(row[mode[1]] if mode[1] < len(row) else None)
            if ll is None:
                skipped += 1
                continue
            lat, lon = ll

        if not valid(lat, lon):
            # some sheets swap lat/lon
            if valid(lon, lat):
                lat, lon = lon, lat
            else:
                skipped += 1
                continue

        features.append({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [round(lon, 6), round(lat, 6)]},
            'properties': {
                'id':   cell(row, cfg['id']),
                't':    cell(row, cfg['type']),
                'o':    cell(row, cfg['owner']),
                'tn':   cell(row, cfg['tenants']),
                'div':  cell(row, cfg['div']),
                'dist': cell(row, cfg['dist']),
                'th':   cell(row, cfg['th']),
            },
        })

    out = os.path.join(OUT_DIR, f'tower-{op}.geojson')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump({'type': 'FeatureCollection', 'features': features}, f,
                  ensure_ascii=False, separators=(',', ':'))
    size_mb = os.path.getsize(out) / 1024 / 1024
    print(f'{op:8s} {len(features):6d} towers  ({skipped} skipped)  {size_mb:.2f} MB')


def main():
    wb_cache = {}
    for op, cfg in SHEETS.items():
        convert(op, cfg, wb_cache)
    for wb in wb_cache.values():
        wb.close()


if __name__ == '__main__':
    main()
