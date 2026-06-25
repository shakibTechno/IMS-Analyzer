"""
Step 2: Enrich fhlfon-lines.geojson with utilization data from DBF.

The existing GeoJSON has 18,405 simplified features (no Line_IDs) so we
can't do an exact join. Instead we compute Core_Use/Core_No ratio per
Line_Type from the DBF and apply per-type averages to the GeoJSON features.
We also expand 'lt' from single-char to full string for popups.
"""
import json, struct, os

SRC_GEOJSON = "../public/data/fhlfon-lines.geojson"
DBF_PATH    = "FHLFON/FHLFONLine.dbf"
OUT         = "../public/data/fhlfon-lines.geojson"  # overwrite in-place

LT_EXPAND = {"A": "Aerial", "B": "Burial", "O": "OPGW", "a": "Aerial", "b": "Burial", "o": "OPGW"}

# ─── Read DBF ─────────────────────────────────────────────────────
def read_dbf(path):
    with open(path, "rb") as f:
        f.seek(4)
        n_rec   = struct.unpack("<I", f.read(4))[0]
        hdr_sz  = struct.unpack("<H", f.read(2))[0]
        rec_sz  = struct.unpack("<H", f.read(2))[0]
        f.seek(32)

        fields = []
        while True:
            raw = f.read(32)
            if not raw or raw[0] == 0x0D:
                break
            name  = raw[:11].split(b"\x00")[0].decode("ascii", errors="replace").strip()
            ftype = chr(raw[11])
            flen  = raw[16]
            fields.append((name, ftype, flen))

        f.seek(hdr_sz)
        records = []
        for _ in range(n_rec):
            del_flag = f.read(1)
            if not del_flag:
                break
            row = {}
            for name, ftype, flen in fields:
                raw = f.read(flen).decode("latin-1", errors="replace").strip()
                if ftype == "N":
                    try: raw = int(raw)
                    except: raw = 0
                elif ftype == "F":
                    try: raw = float(raw)
                    except: raw = 0.0
                row[name] = raw
            if del_flag != b"*":
                records.append(row)
    return records

print("Reading DBF …")
dbf_records = read_dbf(DBF_PATH)
print(f"  {len(dbf_records)} records")

# Compute per-type utilization stats
from collections import defaultdict
type_stats = defaultdict(lambda: {"core_no": 0, "core_use": 0, "count": 0})
for r in dbf_records:
    lt = str(r.get("Line_Type", "")).strip()
    if lt.startswith("A"): key = "Aerial"
    elif lt.startswith("B"): key = "Burial"
    elif lt.startswith("O"): key = "OPGW"
    else: continue
    type_stats[key]["core_no"]  += r.get("Core_No",  0) or 0
    type_stats[key]["core_use"] += r.get("Core_Use", 0) or 0
    type_stats[key]["count"]    += 1

print("Per-type utilization:")
util_ratio = {}
for k, v in type_stats.items():
    ratio = v["core_use"] / v["core_no"] if v["core_no"] > 0 else 0
    util_ratio[k] = ratio
    print(f"  {k}: {v['count']} segs, {v['core_no']} cores total, "
          f"{v['core_use']} used ({ratio*100:.1f}%)")

# ─── Load existing GeoJSON ────────────────────────────────────────
print(f"\nLoading {SRC_GEOJSON} …")
with open(SRC_GEOJSON, "r", encoding="utf-8") as f:
    gj = json.load(f)
print(f"  {len(gj['features'])} features")

# ─── Enrich features ──────────────────────────────────────────────
lt_map = {"A": "Aerial", "B": "Burial", "O": "OPGW"}

for feat in gj["features"]:
    p = feat["properties"]
    lt_char  = str(p.get("lt", "")).upper()[:1]
    lt_full  = lt_map.get(lt_char, "Aerial")
    cores    = int(p.get("cores", 0) or 0)
    ratio    = util_ratio.get(lt_full, 0.35)
    core_use = round(cores * ratio)

    # Replace properties with enriched compact set
    feat["properties"] = {
        "lt":  lt_full,               # full line type string
        "cn":  cores,                 # core_no
        "cu":  core_use,              # core_use (estimated from type avg)
        "km":  round(float(p.get("km", 0) or 0), 3),
    }

# ─── Write output ────────────────────────────────────────────────
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(gj, f, separators=(",", ":"), ensure_ascii=False)

sz = os.path.getsize(OUT) / 1024
print(f"\nSaved {OUT}  ({sz:.1f} KB)")
print("Properties: lt (Aerial/Burial/OPGW), cn (core_no), cu (core_use est.), km (route km)")
