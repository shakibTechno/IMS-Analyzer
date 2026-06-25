"""
rebuild_is3.py
Extracts Point placemarks from IS3 FHL KML and writes is3-points.geojson.
Also patches is3-lines.geojson to normalise ring/cbd core values and add
a 'len_km' property (great-circle length of each segment in km).
"""

import json
import re
import math
import os

KML_PATH    = 'MapData/Info Sarker-3 FHL/doc.kml'
LINES_IN    = 'public/data/is3-lines.geojson'
POINTS_OUT  = 'public/data/is3-points.geojson'
LINES_OUT   = 'public/data/is3-lines.geojson'   # overwrite in-place

# ── helpers ──────────────────────────────────────────────────────────

def haversine_km(lon1, lat1, lon2, lat2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def line_length_km(coords):
    total = 0.0
    for i in range(1, len(coords)):
        total += haversine_km(coords[i-1][0], coords[i-1][1], coords[i][0], coords[i][1])
    return round(total, 3)

# ── Step 1: extract Point placemarks from KML ─────────────────────

print('Reading KML...')
with open(KML_PATH, encoding='utf-8', errors='replace') as f:
    kml = f.read()

placemark_re = re.compile(r'<Placemark>(.*?)</Placemark>', re.DOTALL)
name_re      = re.compile(r'<name>(.*?)</name>', re.DOTALL)
coord_re     = re.compile(r'<coordinates>\s*([\d.,\s\-]+?)\s*</coordinates>', re.DOTALL)

points_features = []
for m in placemark_re.finditer(kml):
    inner = m.group(1)
    if '<Point>' not in inner:
        continue
    name_m  = name_re.search(inner)
    coord_m = coord_re.search(inner)
    if not coord_m:
        continue
    raw = coord_m.group(1).strip().split(',')
    if len(raw) < 2:
        continue
    try:
        lng = float(raw[0])
        lat = float(raw[1])
    except ValueError:
        continue

    name = name_m.group(1).strip() if name_m else ''
    points_features.append({
        'type': 'Feature',
        'geometry': {'type': 'Point', 'coordinates': [lng, lat]},
        'properties': {'nm': name},
    })

print(f'Extracted {len(points_features)} Point placemarks')

points_geojson = {
    'type': 'FeatureCollection',
    'features': points_features,
}
with open(POINTS_OUT, 'w', encoding='utf-8') as f:
    json.dump(points_geojson, f, separators=(',', ':'))
print(f'Written -> {POINTS_OUT}')

# ── Step 2: patch lines GeoJSON ───────────────────────────────────

CORE_NORM = {
    'ring': 'ring',
    'cbd':  'cbd',
    '48':   '48',
    '24':   '24',
    '12':   '12',
    'msg':  'msg',
}

print('Patching lines GeoJSON...')
with open(LINES_IN, encoding='utf-8') as f:
    lines_data = json.load(f)

for feat in lines_data['features']:
    p = feat['properties']
    # Normalise core value
    p['cores'] = CORE_NORM.get(p.get('cores', 'other'), 'other')
    # Add length
    coords = feat['geometry'].get('coordinates', [])
    p['len_km'] = line_length_km(coords) if len(coords) >= 2 else 0.0

with open(LINES_OUT, 'w', encoding='utf-8') as f:
    json.dump(lines_data, f, separators=(',', ':'))
print(f'Written -> {LINES_OUT}  ({len(lines_data["features"])} features)')
print('Done.')
