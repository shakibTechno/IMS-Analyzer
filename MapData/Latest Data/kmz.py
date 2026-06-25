import zipfile
import os

kmz_file = "fiber_network_multiple_district.kmz"
extract_folder = "extracted_kmz"

with zipfile.ZipFile(kmz_file, 'r') as kmz:
    kmz.extractall(extract_folder)

print("Extracted successfully!")
print(os.listdir(extract_folder))