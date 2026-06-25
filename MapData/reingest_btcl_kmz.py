"""
reingest_btcl_kmz.py
Re-process fiber_network_multiple_district.kmz with corrected schema.
All 8,173 lines are BTCL-owned. Tenant is derived from segment name.
Replaces fiber-lines.geojson entirely.

Schema:
  gid      : int   (sequential 1..N)
  name     : str   (original KMZ name)
  owner    : "BTCL"
  tenant   : "BTCL"|"GP"|"Robi"|"MOTN"|"BL"|"BSCCL"
  dist_km  : float (parsed from name, 0.0 if absent)
"""

import zipfile, re, pathlib, json
import xml.etree.ElementTree as ET

KMZ  = pathlib.Path(r"C:\Users\ASUS\Downloads\BTRC-IMS-RFP-Submission-master"
                    r"\BTRC-IMS-RFP-Submission-master\Demo-UI\MapData"
                    r"\Latest Data\fiber_network_multiple_district.kmz")
OUT  = pathlib.Path(r"C:\Users\ASUS\Downloads\BTRC-IMS-RFP-Submission-master"
                    r"\BTRC-IMS-RFP-Submission-master\Demo-UI\public\data"
                    r"\fiber-lines.geojson")

NS_STD = "{http://www.opengis.net/kml/2.2}"
NS_GGL = "{http://earth.google.com/kml/2.2}"

def T(tag, root_tag):
    ns = NS_GGL if "earth.google.com" in root_tag else NS_STD
    return ns + tag

# Tenant detection — priority order matters (non-BTCL takes precedence)
TENANT_PATTERNS = [
    ("GP",    re.compile(r"\bGP\b|Grameenphone", re.I)),
    ("Robi",  re.compile(r"\bRobi\b", re.I)),
    ("MOTN",  re.compile(r"\bMOTN\b", re.I)),
    ("BL",    re.compile(r"\bBanglalink\b|\bBL\b", re.I)),
    ("BSCCL", re.compile(r"\bBSCCL\b|\bBSCPLC\b", re.I)),
]

def detect_tenant(name: str) -> str:
    for tenant, pat in TENANT_PATTERNS:
        if pat.search(name):
            return tenant
    return "BTCL"   # pure backbone or BTCL-only name

def parse_dist(name: str) -> float:
    m = re.search(r"\((\d+\.?\d*)\s*[Kk]m\)", name)
    return round(float(m.group(1)), 2) if m else 0.0

def parse_coords(text: str):
    pairs = []
    for token in text.strip().split():
        parts = token.split(",")
        if len(parts) >= 2:
            try:
                pairs.append([float(parts[0]), float(parts[1])])
            except ValueError:
                pass
    return pairs

# ── Parse KMZ ─────────────────────────────────────────────────────────────
print("Parsing KMZ ...")
with zipfile.ZipFile(KMZ) as z:
    kml_name = next(n for n in z.namelist() if n.endswith(".kml"))
    with z.open(kml_name) as kf:
        tree = ET.parse(kf)

root     = tree.getroot()
root_tag = root.tag

features = []
gid      = 0
skipped  = 0

from collections import Counter
tenant_counts = Counter()

for pm in root.iter(T("Placemark", root_tag)):
    name_el = pm.find(T("name", root_tag))
    name    = (name_el.text or "").strip() if name_el is not None else ""

    ls = pm.find(".//" + T("LineString", root_tag))
    if ls is None:
        continue

    coord_el = ls.find(T("coordinates", root_tag))
    if coord_el is None or not coord_el.text:
        skipped += 1
        continue

    coords = parse_coords(coord_el.text)
    if len(coords) < 2:
        skipped += 1
        continue

    gid    += 1
    tenant  = detect_tenant(name)
    tenant_counts[tenant] += 1

    features.append({
        "type": "Feature",
        "properties": {
            "gid":     gid,
            "name":    name,
            "owner":   "BTCL",
            "tenant":  tenant,
            "dist_km": parse_dist(name),
        },
        "geometry": {
            "type":        "LineString",
            "coordinates": coords,
        }
    })

print(f"  Lines parsed : {len(features)}")
print(f"  Skipped      : {skipped}")
print()
print("Tenant breakdown:")
for t in ["BTCL", "GP", "Robi", "MOTN", "BL", "BSCCL"]:
    print(f"  {t:6s} : {tenant_counts[t]}")

# ── Write GeoJSON ──────────────────────────────────────────────────────────
geojson = {
    "type": "FeatureCollection",
    "features": features,
}
print(f"\nWriting {OUT.name} ...")
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(geojson, f, separators=(",", ":"), ensure_ascii=False)

sz = OUT.stat().st_size
print(f"Done. {len(features)} features, {sz/1024:.0f} KB")
