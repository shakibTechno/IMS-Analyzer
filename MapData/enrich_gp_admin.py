"""
Enrich gp-sites.geojson with division / district / upazila names
using point-in-polygon against bd-upazilas.geojson (544 polygons).

Uses bounding-box pre-filter + ray-casting PIP for speed.
"""

import json, sys

DATA = "C:/Users/ASUS/Downloads/BTRC-IMS-RFP-Submission-master/BTRC-IMS-RFP-Submission-master/Demo-UI/public/data"

# ── helpers ──────────────────────────────────────────────────────────────────

def ray_cast(px, py, ring):
    """Ray-casting for a single ring (list of [lon, lat] pairs)."""
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside

def point_in_polygon_coords(px, py, coords):
    """coords = list-of-rings (exterior + holes). True if in exterior and not in any hole."""
    if not coords:
        return False
    if not ray_cast(px, py, coords[0]):
        return False
    for hole in coords[1:]:
        if ray_cast(px, py, hole):
            return False
    return True

def point_in_geometry(px, py, geom):
    """Handle Polygon, MultiPolygon, GeometryCollection."""
    t = geom["type"]
    if t == "Polygon":
        return point_in_polygon_coords(px, py, geom["coordinates"])
    if t == "MultiPolygon":
        return any(point_in_polygon_coords(px, py, ring) for ring in geom["coordinates"])
    if t == "GeometryCollection":
        return any(point_in_geometry(px, py, g) for g in geom.get("geometries", []))
    return False

def bbox(geom):
    """Bounding box (minx, miny, maxx, maxy) of any geometry."""
    coords = []
    def collect(g):
        t = g["type"]
        if t in ("Polygon", "MultiPolygon"):
            raw = g["coordinates"]
            rings = raw if t == "Polygon" else [r for poly in raw for r in poly]
            for ring in rings:
                coords.extend(ring)
        elif t == "GeometryCollection":
            for sub in g.get("geometries", []):
                collect(sub)
    collect(geom)
    if not coords:
        return (0, 0, 0, 0)
    xs = [c[0] for c in coords]
    ys = [c[1] for c in coords]
    return (min(xs), min(ys), max(xs), max(ys))

# ── load data ────────────────────────────────────────────────────────────────

print("Loading upazila boundaries …")
upazilas_raw = json.load(open(f"{DATA}/bd-upazilas.geojson", encoding="utf-8"))

upazilas = []
for feat in upazilas_raw["features"]:
    p = feat["properties"]
    g = feat["geometry"]
    bb = bbox(g)
    upazilas.append({
        "division": p.get("division_n", ""),
        "district": p.get("district_n", ""),
        "upazila":  p.get("thana_name", ""),
        "geom":     g,
        "bbox":     bb,
    })

print(f"  {len(upazilas)} upazilas loaded")

print("Loading GP sites …")
sites = json.load(open(f"{DATA}/gp-sites.geojson", encoding="utf-8"))
print(f"  {len(sites['features'])} sites")

# ── PIP enrichment ───────────────────────────────────────────────────────────

found = 0
not_found = 0

for i, feat in enumerate(sites["features"]):
    if i % 2000 == 0:
        print(f"  {i}/{len(sites['features'])} …")

    lon, lat = feat["geometry"]["coordinates"]

    division = district = upazila = ""

    for u in upazilas:
        minx, miny, maxx, maxy = u["bbox"]
        if not (minx <= lon <= maxx and miny <= lat <= maxy):
            continue
        if point_in_geometry(lon, lat, u["geom"]):
            division = u["division"]
            district = u["district"]
            upazila  = u["upazila"]
            found += 1
            break

    if not division:
        not_found += 1

    feat["properties"]["division"] = division
    feat["properties"]["district"] = district
    feat["properties"]["upazila"]  = upazila

print(f"\nPIP done: {found} matched, {not_found} unmatched (border/coast edge cases)")

# ── save ─────────────────────────────────────────────────────────────────────

out_path = f"{DATA}/gp-sites.geojson"
with open(out_path, "w", encoding="utf-8") as fh:
    json.dump(sites, fh, separators=(",", ":"), ensure_ascii=False)

print(f"Saved → {out_path}")
