from fastkml import kml
import json

with open("fiber_network_multiple_district.kml", "rb") as f:
    doc = f.read()

k = kml.KML()
k.from_string(doc)

features_list = []

def extract_features(features):
    for feature in features:

        # If geometry exists
        if hasattr(feature, 'geometry') and feature.geometry:
            features_list.append({
                "type": "Feature",
                "properties": {
                    "name": getattr(feature, 'name', '')
                },
                "geometry": feature.geometry.__geo_interface__
            })

        # Handle nested features/folders
        if hasattr(feature, 'features'):
            extract_features(feature.features)

extract_features(k.features)

geojson = {
    "type": "FeatureCollection",
    "features": features_list
}

with open("output.geojson", "w") as f:
    json.dump(geojson, f, indent=2)

print("Done!")