import openpyxl, re

def dms_to_dd(s):
    m = re.search(r"(\d{1,3})\D+(\d{1,2})'([\d.]+)\"?\s*([NSEW])", str(s), re.I)
    if not m: return None
    d, mi, sec, hem = int(m.group(1)), int(m.group(2)), float(m.group(3)), m.group(4).upper()
    dd = d + mi/60 + sec/3600
    return -dd if hem in ('S', 'W') else dd

def clean_coord(v):
    if v is None: return None
    s = str(v).strip()
    if re.search(r"\d+\D+\d+'\d", s) or re.search(r'\d[^\d]*[NSEW]\s*$', s, re.I):
        dd = dms_to_dd(s)
        if dd is not None: return dd
    cleaned = re.sub(r'[^0-9.\-]', '', s)
    parts = cleaned.split('.')
    if len(parts) > 2: cleaned = parts[0] + '.' + parts[1]
    try: return float(cleaned)
    except: return None

in_bd = lambda la, lo: (20 <= la <= 27 and 88 <= lo <= 93)

wb = openpyxl.load_workbook('../Shakib/ISP-POP-Dropped-Coordinates-v2.xlsx', read_only=True)
ws = wb['Dropped Records']
rows = list(ws.iter_rows(values_only=True))

fixed = []
still_dropped = []

for r in rows[1:]:
    sl, name, isp_type, license_no, lat_raw, lon_raw, nttn, reason = r
    lat = clean_coord(lat_raw)
    lon = clean_coord(lon_raw)
    if lat is not None and lon is not None:
        if in_bd(lat, lon):
            fixed.append((sl, name, isp_type, license_no, lat_raw, lon_raw, nttn, lat, lon, 'direct'))
        elif in_bd(lon, lat):
            fixed.append((sl, name, isp_type, license_no, lat_raw, lon_raw, nttn, lon, lat, 'swapped'))
        else:
            still_dropped.append(r)
    else:
        still_dropped.append(r)

print(f'Fixed by user: {len(fixed)}')
print(f'Still dropped: {len(still_dropped)}')
print()
print('--- FIXED RECORDS ---')
for f in fixed:
    print(f'  SL={f[0]} | {str(f[1])[:40]} | raw=({f[4]}, {f[5]}) -> ({f[7]:.6f}, {f[8]:.6f}) [{f[9]}]')
