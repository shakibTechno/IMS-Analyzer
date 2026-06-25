# Fiber Network KMZ — Analysis Report

**File**: `fiber_network_multiple_district.kmz`
**Inner file**: `fiber_network_multiple_district.kml` (9.4 MB)
**Document name**: Fiber Network - All Districts
**Analysis date**: 2026-05-17

---

## 1. File Structure

| Property | Value |
|----------|-------|
| Archive format | KMZ (ZIP containing single KML) |
| KML namespace | `http://www.opengis.net/kml/2.2` (standard) |
| Folder/layer hierarchy | **None** — all 27,269 placemarks are flat direct children of `<Document>` |
| Styles / StyleMaps | **None** — zero Style, StyleMap, or styleUrl elements |
| ExtendedData / Schema | **None** — zero attribute fields of any kind |
| Z values | All 0.0 — 2D only |

---

## 2. Feature Counts

| Geometry Type | Count |
|---------------|------:|
| Point | 19,096 |
| LineString | 8,173 |
| Polygon | 0 |
| MultiGeometry | 0 |
| **Total Placemarks** | **27,269** |

---

## 3. Point Features (19,096)

### Bounding Box
- Latitude: 20.875039 – 26.630549
- Longitude: 88.095814 – 92.480610

### Classification by Name

| Type | Count |
|------|------:|
| Unnamed / empty | 1,925 (10.1%) |
| Hand Hole (HH) | 2,987 |
| T-Joint / Splice Point | 2,726 |
| BTCL Node | 1,206 |
| Union Parishad (UP) | 782 |
| Telephone Exchange | 615 |
| Robi Tower / Node | 606 |
| Sadar (District Center) | 397 |
| Bazar / Market | 345 |
| Tower (generic) | 319 |
| Road Junction | 244 |
| CP (Cable Point) | 182 |
| MOTN Node | 101 |
| Bridge | 54 |
| Upazila | 50 |
| Other | 6,557 |

### Operator Mentions in Point Names

| Operator | Count |
|----------|------:|
| GP / Grameenphone | 1,403 |
| BTCL | 1,314 |
| Robi | 1,135 |
| MOTN | 345 |
| Bangladesh Railway | 142 |
| BL / Banglalink | 137 |
| BSCCL / BSCPLC | 11 |

### Sample Points

| Name | Longitude | Latitude |
|------|-----------|---------|
| Ghatail Exchange | 89.972833 | 24.476554 |
| Modhupur Exchange | 90.031175 | 24.602828 |
| Khagrachari Exchange | 91.980052 | 23.117062 |
| Dighinala Exchange | 92.067547 | 23.249479 |
| Matiranga Exchange | 91.873522 | 23.044700 |

### Duplicates
- Unique point names: 8,788 of 19,096 (heavy reuse — same physical node is endpoint of multiple routes)
- 4,390 coordinate pairs shared by 2+ points
- Top duplicated name: "CP" (182 occurrences), "Bagerhat BTCL" (38)

---

## 4. LineString Features (8,173)

### Bounding Box
- Latitude: 20.874476 – 26.630549
- Longitude: 88.095814 – 92.486493

### Vertex Statistics

| Metric | Value |
|--------|-------|
| Total vertices (all lines) | 244,803 |
| Min vertices per line | 1 (10 degenerate lines) |
| Max vertices per line | 1,251 |
| Median vertices per line | 13 |
| Coordinate precision | 7 decimal places |

### Distance Statistics (extracted from names)

| Metric | Value |
|--------|-------|
| Total stated fiber length | **32,163.7 km** |
| Median segment length | 2.0 km |
| Min stated distance | 0.01 km |
| Max stated distance | 850.0 km (data error) |

### Name Pattern
- **99.9% follow**: `"Origin - Destination (X Km)"`
- **7 lines**: negative distances (data entry errors)
- **0 lines**: empty name

### Operator Mentions in Line Names

| Operator | Segments |
|----------|--------:|
| GP / Grameenphone | 1,155 |
| Robi | 915 |
| BTCL | 819 |
| MOTN | 292 |
| BL / Banglalink | 129 |
| BSCCL | 7 |
| No operator tag | ~4,856 |

### Duplicate Lines
- 154 lines with identical names — same route digitized multiple times (likely operators sharing same physical fiber path)

---

## 5. Geographic Coverage

| Metric | Value |
|--------|-------|
| Overall lat range | 20.874 – 26.631 |
| Overall lon range | 88.096 – 92.487 |
| Approximate center | lat 23.75, lon 90.29 (near Dhaka) |
| Divisions covered | All 8 (Dhaka, Chittagong, Khulna, Rajshahi, Barisal, Sylhet, Rangpur, Mymensingh) |
| Out-of-Bangladesh coordinates | **0** |

### Division Mentions in Names

| Division | Mentions |
|----------|--------:|
| Khulna | 407 |
| Dhaka | 390 |
| Rajshahi | 227 |
| Chittagong | 223 |
| Barisal | 183 |
| Rangpur | 171 |
| Mymensingh | 108 |
| Sylhet | 98 |

### Top Districts by Line Segment Count

| District | Segments |
|----------|--------:|
| Kushtia | 55 |
| Bagerhat | 54 |
| Chuadanga | 51 |
| Madaripur | 49 |
| Shariatpur | 42 |
| Rajbari | 39 |
| Faridpur / Gopalganj | 37 |
| Barguna | 37 |
| Patuakhali / Khulna / Bogura / Dhaka | 30–35 each |

---

## 6. Data Quality Issues

| Issue | Count | Notes |
|-------|------:|-------|
| Unnamed points | 1,925 | Intermediate waypoints / splice boxes — coordinates valid |
| Negative stated distances in line names | 7 | Data entry errors |
| Degenerate lines (1 vertex only) | 10 | Incomplete digitization, mostly Cox's Bazar area |
| Implausible distances (>200 km for local segments) | 2 | 850.0 km and 250.0 km — clear data errors |
| Duplicate line names | 154 | Same route digitized per operator — may be intentional |
| Out-of-Bangladesh coordinates | 0 | All clean |
| Attribute fields | 0 | No ExtendedData, Schema, or SimpleData anywhere |
| Styles / colors | 0 | No visual differentiation between features |

---

## 7. Critical Findings

1. **No attributes whatsoever.** All semantic information — operator, distance, node type, origin, destination — is encoded only in the `<name>` string. Map integration requires name parsing to derive any structured data.

2. **No styles.** All 27,269 features would render identically without external symbology applied. Color by operator, line weight by fiber tier, icon by node type must all be applied via post-processing.

3. **Multi-operator shared infrastructure view.** This is NOT a BTCL-only dataset. It covers Grameenphone (largest by segment count), Robi, BTCL, Banglalink, MOTN, and BSCCL on the same physical routes. It represents the full national fiber backbone shared among operators.

4. **32,163 km total fiber** across 8,173 segments — significantly larger coverage than the existing BTCL GeoJSON (584 lines). This is a much more comprehensive dataset.

5. **Flat structure.** No folder hierarchy to separate operators, network tiers, or geographic regions. All 27,269 features are undifferentiated.

6. **Suitable for 2D rendering only.** All Z values are 0.0.

---

## 8. Comparison with Existing GeoJSON Data

| Metric | This KMZ | btcl-nttn-line.geojson |
|--------|----------|----------------------|
| Lines | 8,173 | 584 |
| Points | 19,096 | 29,795 |
| Operators | 6 (multi-operator) | 1 (BTCL only) |
| Total fiber km | 32,163 km | ~4,270 km (estimated) |
| Attributes | None (name only) | 33 properties per feature |
| Admin codes | None | Placeholder ("xx") |
| Styles | None | None (applied in app) |
| Coverage | All 8 divisions | Primarily Chittagong/Barisal/Dhaka 2022 |

This KMZ provides **14× more line segments** than the existing BTCL GeoJSON and covers all operators — it is a materially different and much broader dataset.
