"""Convert multi-layer KML to a single GeoJSON FeatureCollection."""
import json
import sys
import os

# Prefer lxml (handles malformed/namespace-loose KML); fall back to stdlib
try:
    from lxml import etree as ET
    USE_LXML = True
except ImportError:
    import xml.etree.ElementTree as ET
    USE_LXML = False

KML_NS = "http://www.opengis.net/kml/2.2"

def parse_coords(coord_text):
    coords = []
    for token in coord_text.strip().split():
        parts = token.split(",")
        if len(parts) >= 2:
            try:
                lon, lat = float(parts[0]), float(parts[1])
                coords.append([lon, lat])
            except ValueError:
                pass
    return coords

def extract_geometry(placemark, ns):
    ls = placemark.find(f".//{{{ns}}}LineString/{{{ns}}}coordinates")
    if ls is not None:
        coords = parse_coords(ls.text)
        if coords:
            return {"type": "LineString", "coordinates": coords}

    mls = placemark.findall(f".//{{{ns}}}LineString")
    if len(mls) > 1:
        lines = []
        for ls_elem in mls:
            c = ls_elem.find(f"{{{ns}}}coordinates")
            if c is not None:
                coords = parse_coords(c.text)
                if coords:
                    lines.append(coords)
        if lines:
            return {"type": "MultiLineString", "coordinates": lines}

    return None

def folder_name(folder, ns):
    name_elem = folder.find(f"{{{ns}}}name")
    return name_elem.text.strip() if name_elem is not None else "Unknown"

def kml_to_geojson(kml_path):
    if USE_LXML:
        parser = ET.XMLParser(recover=True)
        tree   = ET.parse(kml_path, parser)
    else:
        tree = ET.parse(kml_path)
    root = tree.getroot()

    # Strip namespace from tag if present
    tag = root.tag
    ns = KML_NS
    if tag.startswith("{"):
        ns = tag[1:tag.index("}")]

    features = []

    # Walk all Folder/Document elements and collect Placemarks with their folder name
    def walk(node, layer="Unknown"):
        tag_local = node.tag.split("}")[-1] if "}" in node.tag else node.tag

        if tag_local == "Folder":
            name_elem = node.find(f"{{{ns}}}name")
            layer = name_elem.text.strip() if name_elem is not None else layer

        if tag_local == "Placemark":
            geom = extract_geometry(node, ns)
            if geom:
                name_elem = node.find(f"{{{ns}}}name")
                desc_elem = node.find(f"{{{ns}}}description")
                props = {
                    "layer": layer,
                    "name": name_elem.text.strip() if name_elem is not None and name_elem.text else "",
                    "description": desc_elem.text.strip() if desc_elem is not None and desc_elem.text else "",
                }
                features.append({"type": "Feature", "geometry": geom, "properties": props})
            return  # Don't recurse into Placemark children

        for child in node:
            walk(child, layer)

    walk(root)

    return {
        "type": "FeatureCollection",
        "features": features
    }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python kml_to_geojson.py <input.kml> <output.geojson>")
        sys.exit(1)

    kml_path = sys.argv[1]
    out_path = sys.argv[2]

    geojson = kml_to_geojson(kml_path)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, separators=(",", ":"))

    print(f"Done: {len(geojson['features'])} features written to {out_path}")

    # Print layer summary
    from collections import Counter
    layers = Counter(f["properties"]["layer"] for f in geojson["features"])
    for layer, count in sorted(layers.items()):
        print(f"  {layer}: {count} features")
