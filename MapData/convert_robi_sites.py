"""
Convert Robi site list Excel -> robi-sites.geojson
Classifies each site as MW / Fiber / Both, then PIP-enriches with admin names.
"""

import json, pathlib, openpyxl

BASE   = pathlib.Path(r"C:\Users\ASUS\Downloads\BTRC-IMS-RFP-Submission-master\BTRC-IMS-RFP-Submission-master\Demo-UI")
XLSX   = BASE / "MapData" / "Latest Data" / "Robi site list_Nov'25_BTRC_MW & fiber.xlsx"
ADMIN  = BASE / "public" / "data" / "bd-upazilas.geojson"
OUT    = BASE / "public" / "data" / "robi-sites.geojson"
BD_OUT = BASE / "public" / "data" / "bd-outline.geojson"

# ── PIP helpers ──────────────────────────────────────────────────────────────

def ray_cast(px, py, ring):
    inside, j = False, len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside

def pip_polygon(px, py, coords):
    if not coords or not ray_cast(px, py, coords[0]):
        return False
    return not any(ray_cast(px, py, h) for h in coords[1:])

def pip_geom(px, py, geom):
    t = geom["type"]
    if t == "Polygon":
        return pip_polygon(px, py, geom["coordinates"])
    if t == "MultiPolygon":
        return any(pip_polygon(px, py, c) for c in geom["coordinates"])
    if t == "GeometryCollection":
        return any(pip_geom(px, py, g) for g in geom.get("geometries", []))
    return False

def bbox(geom):
    coords = []
    def _collect(g):
        t = g["type"]
        if t == "Polygon":
            for ring in g["coordinates"]: coords.extend(ring)
        elif t == "MultiPolygon":
            for poly in g["coordinates"]:
                for ring in poly: coords.extend(ring)
        elif t == "GeometryCollection":
            for sub in g.get("geometries", []): _collect(sub)
    _collect(geom)
    if not coords:
        return (0, 0, 0, 0)
    xs, ys = [c[0] for c in coords], [c[1] for c in coords]
    return (min(xs), min(ys), max(xs), max(ys))

# ── BD outline PIP (coarse filter) ──────────────────────────────────────────

def load_bd_outline(path):
    data = json.load(open(path, encoding="utf-8"))
    polygons = []
    for feat in data["features"]:
        g = feat["geometry"]
        bb = bbox(g)
        polygons.append((bb, g))
    return polygons

def in_bangladesh(px, py, bd_polygons):
    for bb, g in bd_polygons:
        if bb[0] <= px <= bb[2] and bb[1] <= py <= bb[3]:
            if pip_geom(px, py, g):
                return True
    return False

# ── load admin boundaries ────────────────────────────────────────────────────

print("Loading upazila boundaries...")
upazilas_raw = json.load(open(ADMIN, encoding="utf-8"))
upazilas = []
for feat in upazilas_raw["features"]:
    p = feat["properties"]
    g = feat["geometry"]
    upazilas.append({
        "division": p.get("division_n", ""),
        "district": p.get("district_n", ""),
        "upazila":  p.get("thana_name", ""),
        "geom":     g,
        "bbox":     bbox(g),
    })
print(f"  {len(upazilas)} upazilas")

print("Loading BD outline...")
bd_polygons = load_bd_outline(BD_OUT)

# ── read Excel ───────────────────────────────────────────────────────────────

print("Reading Excel...")
wb = openpyxl.load_workbook(str(XLSX), read_only=True, data_only=True)
ws = wb[wb.sheetnames[0]]

features = []
skipped_coord = 0
skipped_oob   = 0

counts = {"MW": 0, "Fiber": 0, "Both": 0}

for row in ws.iter_rows(min_row=2, values_only=True):
    code, lat, lon, mw_val, fiber_val = row[0], row[1], row[2], row[3], row[4]
    if code is None:
        continue
    if lat is None or lon is None:
        skipped_coord += 1
        continue
    try:
        lat, lon = float(lat), float(lon)
    except Exception:
        skipped_coord += 1
        continue

    # coarse BD bounding-box check
    if not (20.5 <= lat <= 26.7 and 88.0 <= lon <= 92.7):
        skipped_oob += 1
        continue

    has_mw    = str(mw_val).strip().lower()    == "yes"
    has_fiber = str(fiber_val).strip().lower() == "yes"

    if has_mw and has_fiber:
        tx = "Both"
    elif has_mw:
        tx = "MW"
    else:
        tx = "Fiber"

    counts[tx] += 1
    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lon, lat]},
        "properties": {
            "name":     str(code).strip(),
            "tx":       tx,
            "division": "",
            "district": "",
            "upazila":  "",
        },
    })

print(f"  Sites loaded: {len(features)} (MW:{counts['MW']} Fiber:{counts['Fiber']} Both:{counts['Both']})")
print(f"  Skipped (no coord): {skipped_coord} | out-of-bounds: {skipped_oob}")

# ── PIP admin enrichment ─────────────────────────────────────────────────────

print("Running PIP admin enrichment...")
matched = 0
for i, feat in enumerate(features):
    if i % 3000 == 0:
        print(f"  {i}/{len(features)}...")
    lon, lat = feat["geometry"]["coordinates"]
    for u in upazilas:
        minx, miny, maxx, maxy = u["bbox"]
        if not (minx <= lon <= maxx and miny <= lat <= maxy):
            continue
        if pip_geom(lon, lat, u["geom"]):
            feat["properties"]["division"] = u["division"]
            feat["properties"]["district"] = u["district"]
            feat["properties"]["upazila"]  = u["upazila"]
            matched += 1
            break

print(f"  Matched: {matched} / {len(features)} ({len(features)-matched} unmatched border/coast)")

# ── save ─────────────────────────────────────────────────────────────────────

geojson = {"type": "FeatureCollection", "features": features}
with open(OUT, "w", encoding="utf-8") as fh:
    json.dump(geojson, fh, separators=(",", ":"), ensure_ascii=False)

print(f"Saved {len(features)} features -> {OUT}")
