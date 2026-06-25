import openpyxl, re, json, os

def dms_to_dd(s):
    # Anchor on ' (minutes) and " (seconds) — both ASCII, survive encoding corruption of °
    m = re.search(r"(\d{1,3})\D+(\d{1,2})'([\d.]+)\"?\s*([NSEW])", str(s), re.I)
    if not m:
        return None
    d, mi, sec, hem = int(m.group(1)), int(m.group(2)), float(m.group(3)), m.group(4).upper()
    dd = d + mi/60 + sec/3600
    return -dd if hem in ('S', 'W') else dd

def clean_coord(v):
    if v is None:
        return None
    s = str(v).strip()
    # Detect DMS by presence of ' (minutes marker) followed by digits and hemisphere
    if re.search(r"\d+\D+\d+'\d", s) or re.search(r'\d[^\d]*[NSEW]\s*$', s, re.I):
        dd = dms_to_dd(s)
        if dd is not None:
            return dd
    cleaned = re.sub(r'[^0-9.\-]', '', s)
    parts = cleaned.split('.')
    if len(parts) > 2:
        cleaned = parts[0] + '.' + parts[1]
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None

in_bd = lambda la, lo: (20 <= la <= 27 and 88 <= lo <= 93)

wb = openpyxl.load_workbook('MapData/ISP pop list.xlsx', read_only=True)
ws = wb['Sheet2']
rows = list(ws.iter_rows(values_only=True))

features = []
counts = {'clean': 0, 'fixed': 0, 'swapped': 0, 'dropped': 0}

for r in rows[1:]:
    sl, name, isp_type, license_no, lat_raw, lon_raw, nttn = r

    # Fast path: already valid floats in Bangladesh bbox
    try:
        lat, lon = float(lat_raw), float(lon_raw)
        if in_bd(lat, lon):
            counts['clean'] += 1
            features.append({
                'type': 'Feature',
                'geometry': {'type': 'Point', 'coordinates': [round(lon, 6), round(lat, 6)]},
                'properties': {
                    'name': str(name).strip() if name else '',
                    'type': str(isp_type).strip() if isp_type else '',
                    'nttn': str(nttn).strip() if nttn else '',
                }
            })
            continue
    except (TypeError, ValueError):
        pass

    # Slow path: parse/strip/swap
    lat = clean_coord(lat_raw)
    lon = clean_coord(lon_raw)
    if lat is None or lon is None:
        counts['dropped'] += 1
        continue

    if in_bd(lat, lon):
        counts['fixed'] += 1
    elif in_bd(lon, lat):
        lat, lon = lon, lat
        counts['swapped'] += 1
    else:
        counts['dropped'] += 1
        continue

    features.append({
        'type': 'Feature',
        'geometry': {'type': 'Point', 'coordinates': [round(lon, 6), round(lat, 6)]},
        'properties': {
            'name': str(name).strip() if name else '',
            'type': str(isp_type).strip() if isp_type else '',
            'nttn': str(nttn).strip() if nttn else '',
        }
    })

out_path = 'public/data/isp-pops.geojson'
geojson = {'type': 'FeatureCollection', 'features': features}
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(geojson, f, ensure_ascii=False, separators=(',', ':'))

size_kb = os.path.getsize(out_path) // 1024
print(f'Written {len(features)} features ({size_kb} KB) to {out_path}')
for k, v in counts.items():
    print(f'  {k}: {v}')
