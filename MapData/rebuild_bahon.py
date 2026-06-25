"""
Rebuild Bahon Limited map data:
  1. Enrich bahon-lines.geojson  — normalize ct, add pct, clean props
  2. Create bahon-points.geojson — unique network nodes from DBF endpoint coords
"""
import json, struct, os
from collections import defaultdict

BAHON_DIR  = "Bahon Limited Shape Files/Bahon Limited Shape Files"
DBF_PATH   = f"{BAHON_DIR}/Bahon Network_System Line.dbf"
SRC_LINES  = "../public/data/bahon-lines.geojson"
OUT_LINES  = "../public/data/bahon-lines.geojson"
OUT_POINTS = "../public/data/bahon-points.geojson"

# ── DBF reader ────────────────────────────────────────────────────

def read_dbf(path):
    with open(path, "rb") as f:
        f.seek(4)
        n_rec  = struct.unpack("<I", f.read(4))[0]
        hdr_sz = struct.unpack("<H", f.read(2))[0]
        f.seek(32)
        fields = []
        while True:
            raw = f.read(32)
            if not raw or raw[0] == 0x0D: break
            name  = raw[:11].split(b"\x00")[0].decode("ascii", errors="replace").strip()
            ftype = chr(raw[11])
            flen  = raw[16]
            fields.append((name, ftype, flen))
        f.seek(hdr_sz)
        records = []
        for _ in range(n_rec):
            del_flag = f.read(1)
            if not del_flag: break
            row = {}
            for name, ftype, flen in fields:
                row[name] = f.read(flen).decode("latin-1", errors="replace").strip()
            if del_flag != b"*":
                records.append(row)
    return records

# ── Cable type normalizer ─────────────────────────────────────────

def normalize_ct(ct):
    ct = ct.strip().upper()
    if ct == "OH":   return "OH"
    if ct == "UG":   return "UG"
    if ct.startswith("WC") or ct.startswith("WALL"): return "WC"
    return "Other"

# ── Step 1: Enrich lines GeoJSON ─────────────────────────────────

print(f"Loading {SRC_LINES} ...")
with open(SRC_LINES, "r", encoding="utf-8") as f:
    gj = json.load(f)
print(f"  {len(gj['features'])} features")

for feat in gj["features"]:
    p = feat["properties"]
    ct_raw = str(p.get("ct", ""))
    ct     = normalize_ct(ct_raw)
    cores  = int(p.get("cores", 0) or 0) if str(p.get("cores","")).isdigit() else 0
    used   = int(p.get("used",  0) or 0) if str(p.get("used", "")).isdigit() else 0
    pct    = round(used / cores * 100) if cores > 0 else 0
    m_raw  = p.get("km", p.get("m", 0))
    try:    metres = round(float(m_raw), 1)
    except: metres = 0.0

    feat["properties"] = {
        "ct":   ct,                              # OH | UG | WC | Other
        "a":    str(p.get("a", "") or "").strip(),
        "b":    str(p.get("b", "") or "").strip(),
        "div":  str(p.get("div", "") or "").strip(),
        "dist": str(p.get("dist","") or "").strip(),
        "cn":   cores,   # core_no
        "cu":   used,    # core_use
        "pct":  pct,
        "m":    metres,  # length in metres (field was mis-labelled 'km')
    }

with open(OUT_LINES, "w", encoding="utf-8") as f:
    json.dump(gj, f, separators=(",", ":"), ensure_ascii=False)
sz = os.path.getsize(OUT_LINES) / 1024
print(f"Saved lines -> {OUT_LINES}  ({sz:.1f} KB)")

# ── Step 2: Extract unique network nodes from DBF ────────────────

print(f"\nReading DBF for endpoint coordinates ...")
recs = read_dbf(DBF_PATH)
print(f"  {len(recs)} records")

nodes = {}   # coord_key -> {lon, lat, nm, dist, div}

def add_node(coord_str, nm, dist, div):
    coord_str = coord_str.strip()
    if not coord_str: return
    parts = coord_str.split()
    if len(parts) != 2: return
    try:
        lon, lat = float(parts[0]), float(parts[1])
    except ValueError:
        return
    # Bangladesh bounding box sanity check
    if not (88.0 <= lon <= 93.0 and 20.0 <= lat <= 27.0): return
    key = f"{lon:.5f},{lat:.5f}"
    if key not in nodes:
        nodes[key] = {"lon": lon, "lat": lat, "nm": nm.strip(), "dist": dist.strip(), "div": div.strip()}

for r in recs:
    add_node(r["A Latitude"], r["A City Nam"], r["District N"], r["Division N"])
    add_node(r["Site B Loc"], r["B City Nam"], r["District N"], r["Division N"])

print(f"  {len(nodes)} unique network nodes")

features = [
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [round(v["lon"], 5), round(v["lat"], 5)]},
        "properties": {"nm": v["nm"], "dist": v["dist"], "div": v["div"]},
    }
    for v in nodes.values()
]

pts_gj = {"type": "FeatureCollection", "features": features}
with open(OUT_POINTS, "w", encoding="utf-8") as f:
    json.dump(pts_gj, f, separators=(",", ":"), ensure_ascii=False)
sz = os.path.getsize(OUT_POINTS) / 1024
print(f"Saved points -> {OUT_POINTS}  ({sz:.1f} KB)")
print(f"\nDone. Lines: {len(gj['features'])}  Points: {len(features)}")
