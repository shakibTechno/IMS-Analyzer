# BTCL Data Diff — Excel vs GeoJSON

**Excel source**: `MapData/Latest Data/GEO SPIRAL DATA STRUCTURE_TEMPLE_FINAL_BTCL.xlsx`
**GeoJSON sources**: `MapData/BTCL/btcl-nttn-line.geojson`, `MapData/BTCL/btcl-ponts.geojson`
**Analysis date**: 2026-05-17

---

## 1. File & Sheet Overview

The Excel file contains 3 sheets:

| Sheet | Rows | Columns | Purpose |
|-------|------|---------|---------|
| `Opr_Line` | 585 | 19 | Fiber line routes |
| `Opr_Point` | 26,643 | 11 | Network point locations |
| `Dictionary` | — | — | Field definitions |

> Rows 0–3 in the Excel are a title/label block. Actual data headers start at row 4 (0-indexed). All counts above reflect clean data rows only.

---

## 2. Record Count Comparison

| Dataset | Excel | GeoJSON | Delta |
|---------|------:|--------:|-------|
| Fiber Lines | 585 | 584 | Excel has **+1** |
| Network Points | 26,643 | 29,795 | GeoJSON has **+3,152** |

Despite similar line counts, only ~9% of line names overlap. The two line datasets are largely non-overlapping. Points share ~47% overlap by name.

---

## 3. Schema Comparison

### 3.1 Fiber Lines

**Excel columns** (19): `FID`, `Line_id`, `Year`, `Month`, `Operator_Code`, `Operator_Name`, `Infra_type`, `Line_Type`, `Line_Name`, `Path_Along`, `Nof of Duct`, `Duct_Use`, `No's of cable`, `Total_core`, `Core_used`, `Core_unused`, `Route_length(KM)`, `Cable_length(KM)`, `Feature_code`

**GeoJSON properties** (33): `gid`, `uid`, `divcode`, `distcode`, `upzcode`, `unicode`, `mozcode`, `oprcode`, `featcode`, `mm`, `yyyy`, `slnn`, `oprname`, `linename`, `linetype`, `pathalong`, `ductno`, `ductuse`, `cablenum`, `corenum`, `coreuse`, `coreready`, `routelenkm`, `cablelenkm`, `netcap`, `capuse`, `capready`, `startlat`, `startlon`, `endlat`, `endlon`, `orig_fid`, `shape_leng`

**In Excel only (not in GeoJSON)**:
- `Infra_type` — Own / Leased / Swap. Absent from GeoJSON entirely.
- `Line_id` — mostly empty in Excel; no GeoJSON equivalent.
- `FID` — entirely blank in all Excel data rows.

**In GeoJSON only (not in Excel)**:
- `netcap` — network capacity type (STM-4, DWDM, GPON, STM-16, etc.)
- `capuse` / `capready` — capacity utilisation and ready capacity
- `startlat`, `startlon`, `endlat`, `endlon` — endpoint coordinates
- `shape_leng` — computed GIS polyline length
- `divcode`, `distcode`, `upzcode`, `unicode`, `mozcode` — administrative codes (all placeholder `"xx"`, never populated)
- `gid`, `slnn`, `orig_fid`, `uid` — internal GIS identifiers
- `mm` — month (Excel has `Month` but it is 88% null for lines)

---

### 3.2 Network Points

**Excel columns** (11): `FID`, `Point_id`, `Year`, `Month`, `Operator_Code`, `Operator_Name`, `Point_Type`, `Point_Name`, `Latitude`, `Longitude`, `Feature_code`

**GeoJSON properties** (17): `gid`, `uid`, `slnn`, `oprname`, `pointname`, `pointtype`, `latdd`, `londd`, `division`, `district`, `upazila`, `union`, `mouza`, `oprcode`, `featcode`, `mm`, `yyyy`

**In GeoJSON only (not in Excel)**:
- `division`, `district`, `upazila`, `union`, `mouza` — full administrative hierarchy, **populated and accurate** in GeoJSON. Excel has none of this.
- `gid`, `slnn`, `uid` — internal GIS identifiers.

**In Excel only**:
- `Point_id` — 78% null; not reliable as a join key.
- `FID` — 100% null.

> The Excel point schema is effectively a strict subset of the GeoJSON point schema, except for the administrative fields which GeoJSON has and Excel does not.

---

## 4. Record Overlap Analysis

### 4.1 Fiber Lines

| Category | Count |
|----------|------:|
| Unique line names in Excel | 573 |
| Unique line names in GeoJSON | 544 |
| Matched by name (in both) | **51 (~9%)** |
| Excel-only line names | 522 |
| GeoJSON-only line names | 493 |

**Excel-only lines** cover broad geographic areas:
- Khulna division: Khulna–Jashore, Khulna–Bagerhat, Khulna–Satkhira, etc.
- Rajshahi division: Naogaon, Chapai, Pabna, Sirajganj routes
- Mymensingh and Sylhet division routes
- 3 Radio Link entries
- Year span: 2000–2026 (clusters at 2016–2017, 2022–2025)

**GeoJSON-only lines** are primarily:
- Rural Union Parishad-level last-mile distribution routes
- Year 2022 bulk (451 of 532 GeoJSON-only features)
- Named with UP-level detail (e.g., `"1 NO BIJOYPUR UP - 4 NO. BAROPARA UP (EX. HH-1/12)"`)

### 4.2 Network Points

| Category | Count |
|----------|------:|
| Unique point names in Excel | 13,960 |
| Unique point names in GeoJSON | 20,132 |
| Matched by name (in both) | **9,386 (~47%)** |
| Excel-only point names | 4,574 (15,865 rows) |
| GeoJSON-only point names | 10,746 |

---

## 5. Value Discrepancies in Matched Records

### 5.1 Line Attribute Conflicts (6 of 51 matched lines)

| Line Name | Field | Excel Value | GeoJSON Value |
|-----------|-------|-------------|---------------|
| Bogura Microwave to Natore BTCL | Route length | 70 km | 67.5 km |
| Bogura Microwave to Natore BTCL | Total_core | 48 | 24 |
| Bogura Microwave to Natore BTCL | Core_used | 12 | 20 |
| Faridpur–Bhanga | Route length | 35 km | 0 km (data error in GeoJSON) |
| Kushtia–Bheramara | Route length | 34 km | 24 km |
| Kushtia–Bheramara | Total_core | 48 | 24 |
| Meherpur–Chuadanga | Route length | 32 km | 0 km (data error in GeoJSON) |
| Natore BTCL to Rajshahi BTCL | Route length | 56 km | 50.2 km |
| Natore BTCL to Rajshahi BTCL | Total_core | 48 | 24 |
| Natore BTCL to Rajshahi BTCL | Core_used | 8 | 18 |
| Sirajgonj BTCL to Shahjadpur BTCL | Route length | 53 km | 50 km |
| Sirajgonj BTCL to Shahjadpur BTCL | Total_core | 48 | 42 |
| Sirajgonj BTCL to Shahjadpur BTCL | Core_used | 15 | 10 |

> Excel values are likely more current. GeoJSON has stale or incorrect attributes for these 6 routes.

### 5.2 Point Discrepancies (matched records)

| Type | Count |
|------|------:|
| Coordinate mismatches (>0.001° offset, same name) | 241 |
| Point_Type reclassifications | 554 |

The 554 type mismatches follow a consistent pattern: Excel records "HH" or "CP" while GeoJSON records the same point as "HOP" (Handhole/Duct Opening Point). This indicates a reclassification occurred between data collection rounds.

---

## 6. Data Quality Issues

### 6.1 Excel Lines

| Issue | Detail |
|-------|--------|
| `Line_Type` inconsistent casing | "Underground", "UG", "UNDERGROUND", "OH", "Aerial", "UG+OH", "Radio Link" — 7 variants for ~3 concepts |
| `Infra_type` inconsistent casing | "Own" (543 rows) vs "OWN" (42 rows) |
| `Month` | 88% null for lines; mixed text/number format |
| `FID` | 100% null — not usable as a key |
| `Line_id` | 84% null — not usable as a key |
| `Total_core` | 10 nulls |
| `Route_length(KM)` | 25 nulls |
| `Feature_code` | Only 122 of 585 rows populated |

### 6.2 Excel Points

| Issue | Detail |
|-------|--------|
| Invalid coordinates | 2,499 rows with missing or out-of-range lat/lon (e.g., longitude value `90,323,330`) |
| `Point_Type` | 3,432 unique values — extreme inconsistency. Core types (CP, HOP, HH) have dozens of numbered and cased variants |
| `Year` | 13,409 nulls (50% of rows) |
| `Month` | 4,310 nulls; one row with value `2016` (data entry error) |
| `FID` | 100% null |
| `Point_id` | 78% null |

### 6.3 GeoJSON Lines

| Issue | Detail |
|-------|--------|
| `uid` | All rows contain `"xxxxxxxxxxxxxxxxxxxxxxx"` — placeholder, never populated |
| `divcode`, `distcode`, `upzcode`, `unicode`, `mozcode` | All `"xx"` — placeholder codes, never populated |
| `capuse` | 437 nulls (75% of features) |
| 2 features | Route length = 0 km (Faridpur–Bhanga, Meherpur–Chuadanga) — geometry exists but attribute is wrong |

---

## 7. New Data in Excel Not Yet in GeoJSON

### 7.1 New Lines (532 Excel-only routes)
- All have attribute data but **no geometry** (no coordinate path in Excel)
- Actual polyline geometry would need to be sourced from a shapefile or traced
- Year distribution: 2016 (89), 2017 (122), 2018 (87), 2022 (57), 2023 (38), 2025 (25), older (2000–2015)

### 7.2 New Points (14,256 with valid coordinates)
- Ready to render immediately — lat/lon are valid Bangladesh coordinates
- Primary types: CP (3,560), HOP (3,455), HH (869), POP (56), MH variants
- Geographic focus: Khulna and Rajshahi divisions (largely absent from GeoJSON)
- Feature codes: 1 (6,782), 3 (4,951), ONM-2 (566), Ctg tx (402)
- **1,609 rows have invalid/missing coordinates** — need correction before plotting

---

## 8. Data in GeoJSON Not in Excel

### 8.1 GeoJSON-only Lines (532 features)
- Primarily 2022 UP-level last-mile distribution routes
- Have full polyline geometry (traceable paths)
- Names reference Union Parishad administrative units
- **These should be preserved** — Excel has no equivalent

### 8.2 GeoJSON-only Points (10,746 unique names)
- Have full administrative hierarchy (division → district → upazila → union → mouza)
- All coordinates are valid Bangladesh range
- Mix of rural UP-level access points and some numeric-named serial entries
- **Investigate**: were these excluded from Excel intentionally, or are they a separate collection batch?

### 8.3 GeoJSON Capacity Fields (would be lost if replaced by Excel)
- `netcap` — network capacity (STM-4 X1: 164 lines, STM-4: 132, STM-16: 75, GPON: 65, DWDM: 20)
- `capuse` — capacity in use
- `capready` — capacity ready for use
- **These fields do not exist in Excel and must not be overwritten**

---

## 9. Action Plan

| Priority | Action | Rows Affected |
|----------|--------|--------------|
| 🔴 High | Add 14,256 new Excel-only points (valid coords) to `btcl-ponts.geojson` | 14,256 |
| 🔴 High | Fix 1,609 Excel point rows with missing/invalid coordinates before import | 1,609 |
| 🔴 High | Normalize `Line_Type` in Excel (7 variants → 3 canonical values) | 585 |
| 🔴 High | Normalize `Infra_type` in Excel ("Own"/"OWN" → "Own") | 42 |
| 🟡 Medium | Update 6 matched lines with corrected attribute values from Excel | 6 |
| 🟡 Medium | Update 554 matched points where Point_Type was reclassified | 554 |
| 🟡 Medium | Add `Infra_type` field to GeoJSON line schema (all "Own" for now) | 584 |
| 🟡 Medium | Source polyline geometry for 532 Excel-only routes (shapefile needed) | 532 |
| 🟢 Low | Spatially join admin hierarchy to 14,256 new Excel points | 14,256 |
| 🟢 Low | Investigate 10,746 GeoJSON-only points — newer data or retired? | 10,746 |
| 🟢 Low | Populate placeholder `uid`, `divcode`, `distcode`, etc. in GeoJSON lines | 584 |
| 🟢 Low | Fix 2 GeoJSON lines with route_length = 0 (Faridpur–Bhanga, Meherpur–Chuadanga) | 2 |

---

## 10. Join Key Warning

Neither `FID` nor `Point_id`/`Line_id` is reliable as a unique key — both are largely null in the Excel. **Name-based matching is the only available join key**, but point names are not unique (a single name can appear up to 306 times). Coordinate proximity matching will be required for accurate deduplication and updates when merging the datasets.
