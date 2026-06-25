"""
Simplify GeoJSON line geometries using Douglas-Peucker algorithm.
Pure Python, no external dependencies.
Usage: python simplify_geojson.py <input.geojson> <output.geojson> [tolerance]
Default tolerance: 0.0002 degrees (~22m)
"""
import json, sys, math

def perp_distance(point, line_start, line_end):
    """Perpendicular distance from point to line segment (XY only)."""
    x0, y0 = point[0], point[1]
    x1, y1 = line_start[0], line_start[1]
    x2, y2 = line_end[0], line_end[1]
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(x0 - x1, y0 - y1)
    t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy)
    t = max(0, min(1, t))
    return math.hypot(x0 - (x1 + t * dx), y0 - (y1 + t * dy))

def rdp(coords, tol):
    """Ramer-Douglas-Peucker simplification."""
    if len(coords) < 3:
        return coords
    start, end = coords[0], coords[-1]
    max_dist, max_idx = 0, 0
    for i in range(1, len(coords) - 1):
        d = perp_distance(coords[i], start, end)
        if d > max_dist:
            max_dist, max_idx = d, i
    if max_dist > tol:
        left  = rdp(coords[:max_idx + 1], tol)
        right = rdp(coords[max_idx:], tol)
        return left[:-1] + right
    return [start, end]

def simplify_geometry(geom, tol):
    gtype = geom["type"]
    if gtype == "LineString":
        simplified = rdp(geom["coordinates"], tol)
        if len(simplified) < 2:
            return None
        return {"type": "LineString", "coordinates": simplified}
    if gtype == "MultiLineString":
        lines = [rdp(line, tol) for line in geom["coordinates"]]
        lines = [l for l in lines if len(l) >= 2]
        if not lines:
            return None
        return {"type": "MultiLineString", "coordinates": lines}
    return geom

def round_coords(geom, precision=5):
    """Round coordinate values and drop Z to reduce JSON size."""
    def rnd(c):
        return [round(c[0], precision), round(c[1], precision)]
    gtype = geom["type"]
    if gtype == "LineString":
        return {"type": "LineString", "coordinates": [rnd(c) for c in geom["coordinates"]]}
    if gtype == "MultiLineString":
        return {"type": "MultiLineString", "coordinates": [[rnd(c) for c in line] for line in geom["coordinates"]]}
    return geom

if __name__ == "__main__":
    inp   = sys.argv[1]
    out   = sys.argv[2]
    tol   = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0002

    print(f"Reading {inp}...")
    with open(inp, encoding="utf-8") as f:
        gj = json.load(f)

    orig_count  = len(gj["features"])
    kept        = []
    orig_pts    = 0
    simpl_pts   = 0

    for feat in gj["features"]:
        geom = feat.get("geometry")
        if not geom:
            continue
        # count original points
        if geom["type"] == "LineString":
            orig_pts += len(geom["coordinates"])
        elif geom["type"] == "MultiLineString":
            orig_pts += sum(len(l) for l in geom["coordinates"])

        sgeom = simplify_geometry(geom, tol)
        if sgeom is None:
            continue
        sgeom = round_coords(sgeom, 5)

        if sgeom["type"] == "LineString":
            simpl_pts += len(sgeom["coordinates"])
        elif sgeom["type"] == "MultiLineString":
            simpl_pts += sum(len(l) for l in sgeom["coordinates"])

        kept.append({"type": "Feature", "geometry": sgeom, "properties": feat["properties"]})

    result = {"type": "FeatureCollection", "features": kept}

    print(f"Writing {out}...")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(result, f, separators=(",", ":"))

    import os
    size_mb = os.path.getsize(out) / 1_048_576
    print(f"Features:  {orig_count} → {len(kept)}")
    print(f"Points:    {orig_pts:,} → {simpl_pts:,} ({100*simpl_pts//orig_pts}% kept)")
    print(f"File size: {size_mb:.2f} MB")
