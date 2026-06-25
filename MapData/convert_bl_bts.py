"""
Convert Banglalink BTS Excel -> bl-bts-sites.geojson
Admin data (division/district/thana) is already in the Excel — no PIP needed.
"""

import json, pathlib, openpyxl

BASE = pathlib.Path(r"C:\Users\ASUS\Downloads\BTRC-IMS-RFP-Submission-master\BTRC-IMS-RFP-Submission-master\Demo-UI")
XLSX = BASE / "MapData" / "Latest Data" / "BTS Information_Banglalink_Till 15 Dec 25.xlsx"
OUT  = BASE / "public" / "data" / "bl-bts-sites.geojson"

DIV_NORMALIZE = { "RAJSHAHI": "Rajshahi" }

print("Reading Excel...")
wb = openpyxl.load_workbook(str(XLSX), read_only=True, data_only=True)
ws = wb["Site"]

features = []
skipped  = 0
counts   = {"Microwave": 0, "Fiber": 0, "Inactive": 0}

for row in ws.iter_rows(min_row=3, values_only=True):
    serial = row[0]
    if serial is None or not str(serial).strip().isdigit():
        continue

    site_id  = str(row[1] or "").strip()
    lat_raw  = row[2]
    lon_raw  = row[3]
    division = str(row[4] or "").strip()
    district = str(row[5] or "").strip()
    thana    = str(row[6] or "").strip()
    address  = str(row[7] or "").strip()
    primary  = str(row[10] or "").strip()

    if lat_raw is None or lon_raw is None:
        skipped += 1
        continue
    try:
        lat, lon = float(lat_raw), float(lon_raw)
    except Exception:
        skipped += 1
        continue

    if not (20.5 <= lat <= 26.7 and 88.0 <= lon <= 92.7):
        skipped += 1
        continue

    # Normalise tx
    if primary == "Fiber":
        tx = "Fiber"
    elif primary == "Microwave":
        tx = "Microwave"
    else:
        tx = "Inactive"

    # Normalise division casing
    division = DIV_NORMALIZE.get(division, division)

    counts[tx] += 1
    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lon, lat]},
        "properties": {
            "name":     site_id,
            "tx":       tx,
            "address":  address,
            "division": division,
            "district": district,
            "upazila":  thana,
        },
    })

print(f"  Sites: {len(features)} valid | {skipped} skipped")
print(f"  Microwave: {counts['Microwave']}  Fiber: {counts['Fiber']}  Inactive: {counts['Inactive']}")

geojson = {"type": "FeatureCollection", "features": features}
with open(OUT, "w", encoding="utf-8") as fh:
    json.dump(geojson, fh, separators=(",", ":"), ensure_ascii=False)

print(f"Saved -> {OUT}")
