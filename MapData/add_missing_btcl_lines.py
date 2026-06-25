"""
add_missing_btcl_lines.py
Extract 165 missing BTCL lines from KMZ and append to fiber-lines.geojson.
"""

import zipfile, json, re, pathlib
import xml.etree.ElementTree as ET

KMZ_PATH  = pathlib.Path(r"C:\Users\ASUS\Downloads\BTRC-IMS-RFP-Submission-master\BTRC-IMS-RFP-Submission-master\Demo-UI\MapData\Latest Data\fiber_network_multiple_district.kmz")
GEOJSON_PATH = pathlib.Path(r"C:\Users\ASUS\Downloads\BTRC-IMS-RFP-Submission-master\BTRC-IMS-RFP-Submission-master\Demo-UI\public\data\fiber-lines.geojson")

NS  = "{http://www.opengis.net/kml/2.2}"
NS2 = "{http://earth.google.com/kml/2.2}"

def kml_ns(tag, root_tag):
    if "earth.google.com" in root_tag:
        return NS2 + tag
    return NS + tag

def parse_dist(name):
    m = re.search(r"\((\d+\.?\d*)\s*[Kk]m\)", name)
    return round(float(m.group(1)), 2) if m else 0.0

def parse_coords(coord_text):
    """Return list of [lon, lat] pairs."""
    pairs = []
    for token in coord_text.strip().split():
        parts = token.split(",")
        if len(parts) >= 2:
            try:
                lon, lat = float(parts[0]), float(parts[1])
                pairs.append([lon, lat])
            except ValueError:
                pass
    return pairs

# ── load existing GeoJSON ──────────────────────────────────────────────────
print("Loading fiber-lines.geojson …")
with open(GEOJSON_PATH, encoding="utf-8") as f:
    gj = json.load(f)

existing_features = gj["features"]
max_gid = max(
    (feat["properties"].get("gid") or 0)
    for feat in existing_features
)
impl_names = {
    feat["properties"].get("name", "")
    for feat in existing_features
    if (feat["properties"].get("operator") or "").upper() == "BTCL"
}
print(f"  Existing features : {len(existing_features)}")
print(f"  Max gid           : {max_gid}")
print(f"  BTCL impl names   : {len(impl_names)}")

# ── parse KMZ ─────────────────────────────────────────────────────────────
print("\nParsing KMZ …")
with zipfile.ZipFile(KMZ_PATH) as z:
    kml_name = next(n for n in z.namelist() if n.endswith(".kml"))
    with z.open(kml_name) as kf:
        tree = ET.parse(kf)

root = tree.getroot()
root_tag = root.tag  # detect namespace

def T(tag):
    return kml_ns(tag, root_tag)

missing_features = []
next_gid = max_gid + 1
skipped_no_coords = 0
skipped_point = 0

for pm in root.iter(T("Placemark")):
    name_el = pm.find(T("name"))
    name = name_el.text.strip() if name_el is not None and name_el.text else ""

    if "BTCL" not in name.upper():
        continue

    # must be a LineString
    ls = pm.find(".//" + T("LineString"))
    if ls is None:
        skipped_point += 1
        continue

    # skip if already implemented (by name)
    if name in impl_names:
        continue

    coord_el = ls.find(T("coordinates"))
    if coord_el is None or not coord_el.text:
        skipped_no_coords += 1
        continue

    coords = parse_coords(coord_el.text)
    if len(coords) < 2:
        skipped_no_coords += 1
        continue

    dist_km = parse_dist(name)

    feature = {
        "type": "Feature",
        "properties": {
            "gid": next_gid,
            "name": name,
            "operator": "BTCL",
            "dist_km": dist_km
        },
        "geometry": {
            "type": "LineString",
            "coordinates": coords
        }
    }
    missing_features.append(feature)
    next_gid += 1

print(f"  Missing BTCL lines found : {len(missing_features)}")
print(f"  Skipped (point)          : {skipped_point}")
print(f"  Skipped (no coords)      : {skipped_no_coords}")

if not missing_features:
    print("Nothing to add. Exiting.")
    raise SystemExit(0)

# ── append and save ────────────────────────────────────────────────────────
print(f"\nAppending {len(missing_features)} features to GeoJSON …")
gj["features"] = existing_features + missing_features

with open(GEOJSON_PATH, "w", encoding="utf-8") as f:
    json.dump(gj, f, separators=(",", ":"), ensure_ascii=False)

print(f"  Done. Total features now: {len(gj['features'])}")
print(f"  GIDs assigned: {max_gid + 1} – {next_gid - 1}")

# ── quick summary ──────────────────────────────────────────────────────────
total_km = sum(f["properties"]["dist_km"] for f in missing_features)
print(f"\nSummary")
print(f"  Lines added : {len(missing_features)}")
print(f"  Total km    : {total_km:.2f} km")
print("\nTop 10 added (by dist_km):")
for f in sorted(missing_features, key=lambda x: -x["properties"]["dist_km"])[:10]:
    p = f["properties"]
    print(f"  gid={p['gid']}  {p['dist_km']} km  {p['name'][:80]}")
