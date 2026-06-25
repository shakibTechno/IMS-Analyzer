"""
Generate public/data/opr-lines.geojson from Opr_Line Excel sheet.
Each route is snapped to the bd-railways.geojson track via Dijkstra.
"""
import json, re, math, heapq, sys, time, urllib.request, urllib.parse
sys.stdout.reconfigure(encoding='utf-8')

EXCEL = r"C:\Users\ASUS\Downloads\BTRC-IMS-RFP-Submission-master\BTRC-IMS-RFP-Submission-master\Demo-UI\MapData\Railway\Geo Spatial Data Structure_Template _Final_railway.xlsx"

# ── Operator colours ───────────────────────────────────────────────
OP_COLOR = {
    '1': '#ef4444',  # Summit        red
    '2': '#3b82f6',  # Bahon         blue
    '3': '#8b5cf6',  # Fiber@Home    purple
    '4': '#f59e0b',  # Banglalink    amber
    '5': '#10b981',  # Robi          green
    '6': '#06b6d4',  # Grameenphone  cyan
}

# ── Known aliases: normalised Excel name -> normalised OSM name ────
ALIASES = {
    # Chittagong/Laksam area
    'chattogram':         'chittagong',
    'chattogramjunction': 'chittagong',
    'laksam':             'laksham',
    'laksham':            'laksham',
    'noakhali':           'noakhali',
    'sholosahar':         'sholashahar',
    'sholoshara':         'sholashahar',
    'nazirhat':           'nazirhat',
    'dohazari':           'dohazari',
    # Sylhet/Northeast
    'akaura':             'akhaura',
    'akhaura':            'akhaura',
    'bbaria':             'brahmanbaria',
    'baria':              'brahmanbaria',
    'bhariv':             'brahmanbaria',
    'bhairabazar':        'bhairab bazar',
    'bhairabbazar':       'bhairab bazar',
    'bharabbazar':        'bhairab bazar',
    'narshingdi':         'narsingdi',
    'narsingdi':          'narsingdi',
    'narshin':            'narsingdi',
    'narshi':             'narsingdi',
    'tongi':              'tongi',
    'joydevpur':          'joydebpur',
    'joydebpur':          'joydebpur',
    'shaestagongj':       'shaistaganj',
    'shaestagonj':        'shaistaganj',
    'shaistagonj':        'shaistaganj',
    'kulaura':            'kulaura',
    'sylhet':             'sylhet',
    'chatakbazar':        'chatak bazar',
    # Dhaka
    'dhaka':              'dhaka',
    # Mymensingh
    'mymensingh':         'mymensingh',
    'mymensing':          'mymensingh',
    'mymensingjn':        'mymensingh',
    'goforgaon':          'gafargaon',
    'gouripur':           'gouripur',
    'kishoreganj':        'kishoreganj',
    'kishoragonj':        'kishoreganj',
    'bhairabbazarkishor': 'bhairab bazar',
    # Jamalpur/North
    'jamalpur':           'jamalpur',
    'sarishabari':        'sarishabari',
    'sharishabari':       'sarishabari',
    'sorishabari':        'sarishabari',
    'bangabandhusetu':    'bangabandhu bridge east',
    'bangabandhuseteeas': 'bangabandhu bridge east',
    # Rajshahi/West
    'rajshahi':           'rajshahi',
    'amnura':             'amnura',
    'chapainabaganj':     'chapai nawabganj',
    'chapainwabganj':     'chapai nawabganj',
    'ishurdi':            'ishwardi',
    'ishwardi':           'ishwardi',
    'paksey':             'paksey',
    'abdulpur':           'abdulpur',
    'natore':             'natore',
    'santahar':           'santahar',
    'shantahar':          'santahar',
    'bogra':              'bogra',
    'bogura':             'bogra',
    'bonarpara':          'bonarpara',
    'bonarapara':         'bonarpara',
    'pabna':              'pabna',
    'majhgram':           'majhgram',
    # Northwest
    'parbatipur':         'parbatipur',
    'parbotipur':         'parbatipur',
    'saidpur':            'saidpur',
    'dinajpur':           'dinajpur',
    'rangpur':            'rangpur',
    'kaunia':             'kaunia',
    'lalmonirhat':        'lalmonirhat',
    'lalmonirh':          'lalmonirhat',
    'panchagarh':         'panchagarh',
    'pnnchagar':          'panchagarh',
    'tista':              'tista',
    'ramnabazar':         'ramnabazar',
    # Sirajganj
    'sirajganj':          'sirajganj',
    'sirajgonj':          'sirajganj',
    'ullapara':           'ullapara',
    'ullaprara':          'ullapara',
    # Khulna/Southwest
    'uthly':              'utholy',
    'utholy':             'utholy',
    'jashore':            'jessore',
    'jessore':            'jessore',
    'khulna':             'khulna',
    'benapole':           'benapole',
    'chuadanga':          'chuadanga',
    'poradah':            'poradaha',
    'poradaha':           'poradaha',
    'kustia':             'kushtia',
    'kushtia':            'kushtia',
    'rajbari':            'rajbari',
    'pachuria':           'pachuria',
    'faridpur':           'faridpur',
    'bhanga':             'bhanga',
    'kalukhali':          'kalukhali',
    'bhatiapara':         'bhatiapara',
    'darshana':           'darshana',
    'darsna':             'darshana',
    # Gaibandha
    'gaibandha':          'gaibandha',
    # Comilla/Feni
    'feni':               'feni',
    'comilla':            'comilla',
    'chandpur':           'chandpur',
    'chadpur':            'chandpur',
    # Gopalganj/South
    'kashiani':           'kashiani',
    'gopalgonj':          'gopalganj',
    'gobra':              'gobra',
}

def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower().strip())

# ── Fetch OSM stations ─────────────────────────────────────────────
def fetch_osm_stations():
    query = '[out:json][timeout:90];(node["railway"="station"](20.3,88.0,26.7,92.7);node["railway"="halt"](20.3,88.0,26.7,92.7););out body;'
    url = 'https://overpass.kumi.systems/api/interpreter'
    req = urllib.request.Request(url,
        data=urllib.parse.urlencode({'data': query}).encode(),
        headers={'User-Agent': 'OprLine-Gen/1.0', 'Content-Type': 'application/x-www-form-urlencoded'},
        method='POST')
    data = urllib.request.urlopen(req, timeout=90).read()
    osm = json.loads(data)
    stations = {}
    for el in osm['elements']:
        tags = el.get('tags', {})
        name = tags.get('name:en', '') or tags.get('name', '')
        if name:
            key = norm(name)
            stations[key] = {'lon': el['lon'], 'lat': el['lat'], 'name': name}
    return stations

# ── Station name → coordinate ─────────────────────────────────────
def resolve_station(raw_name, osm_stations):
    key = norm(raw_name)
    # 1. direct
    if key in osm_stations: return osm_stations[key]
    # 2. alias → direct
    akey = ALIASES.get(key)
    if akey and norm(akey) in osm_stations: return osm_stations[norm(akey)]
    # 3. prefix match (min 5 chars)
    for okey, oval in osm_stations.items():
        if len(key) >= 5 and (okey.startswith(key) or key.startswith(okey)):
            return oval
    # 4. alias prefix
    if akey:
        anorm = norm(akey)
        for okey, oval in osm_stations.items():
            if len(anorm) >= 5 and (okey.startswith(anorm) or anorm.startswith(okey)):
                return oval
    return None

# ── Parse route stops from Line_Name ─────────────────────────────
def parse_stops(line_name):
    """Split 'Chattogram-Feni' or 'Akaura-Bbaria-Bhairab Bazar-Narsin' into stop list."""
    raw = str(line_name).strip().strip(',')
    # Handle double-dash (e.g. "Utholy--Jessore")
    raw = re.sub(r'-{2,}', '-', raw)
    raw = raw.rstrip('-').lstrip('-')
    # Split on ' - ' or '-' but not inside known multi-word names
    parts = [p.strip() for p in raw.split('-') if p.strip()]
    # Merge parts that look like they belong together (e.g. "Bhairab" + "Bazar")
    merged = []
    i = 0
    while i < len(parts):
        p = parts[i]
        # if very short and next part exists, likely continuation (e.g. "setu east")
        if len(p) <= 3 and merged and i + 1 < len(parts):
            merged[-1] = merged[-1] + ' ' + p
        else:
            merged.append(p)
        i += 1
    return merged

# ── Build railway graph ───────────────────────────────────────────
def haversine(a, b):
    R = 6371
    dlat = math.radians(b[1]-a[1]); dlon = math.radians(b[0]-a[0])
    x = math.sin(dlat/2)**2 + math.cos(math.radians(a[1]))*math.cos(math.radians(b[1]))*math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(x))

def build_graph(rail_gj):
    graph = {}
    rail_nodes = set()
    for feat in rail_gj['features']:
        coords = feat['geometry']['coordinates']
        geom_type = feat['geometry']['type']
        chains = coords if geom_type == 'MultiLineString' else [coords]
        for chain in chains:
            for i in range(len(chain) - 1):
                a, b = chain[i], chain[i+1]
                ka = (round(a[0], 4), round(a[1], 4))
                kb = (round(b[0], 4), round(b[1], 4))
                d = haversine(a, b)
                graph.setdefault(ka, {})[kb] = min(graph.get(ka, {}).get(kb, 9999), d)
                graph.setdefault(kb, {})[ka] = min(graph.get(kb, {}).get(ka, 9999), d)
                rail_nodes.add(ka); rail_nodes.add(kb)
    return graph, list(rail_nodes)

CELL = 0.05
def build_ngrid(rail_nodes):
    g = {}
    for node in rail_nodes:
        g.setdefault((round(node[0]/CELL), round(node[1]/CELL)), []).append(node)
    return g

def nearest_node(lon, lat, ngrid, radius=5):
    best_d, best_n = 9999, None
    cx, cy = round(lon/CELL), round(lat/CELL)
    for dc in range(-radius, radius+1):
        for dr in range(-radius, radius+1):
            for node in ngrid.get((cx+dc, cy+dr), []):
                d = haversine((lon,lat), node)
                if d < best_d:
                    best_d, best_n = d, node
    return best_d, best_n

def dijkstra(graph, start, end, max_dist=1200):
    dist = {start: 0}; prev = {start: None}
    heap = [(0, start)]; visited = set()
    while heap:
        d, u = heapq.heappop(heap)
        if u in visited: continue
        visited.add(u)
        if u == end: break
        if d > max_dist: break
        for v, w in graph.get(u, {}).items():
            nd = d + w
            if nd < dist.get(v, 9999):
                dist[v] = nd; prev[v] = u
                heapq.heappush(heap, (nd, v))
    if end not in dist: return None
    path = []; cur = end
    while cur is not None:
        path.append(cur); cur = prev[cur]
    path.reverse()
    return path

# ── Main ──────────────────────────────────────────────────────────
import openpyxl

print("Loading Excel...")
wb = openpyxl.load_workbook(EXCEL, data_only=True)
ws = wb['Opr_Line']

print("Fetching OSM stations...")
osm_stations = fetch_osm_stations()
print(f"  {len(osm_stations)} stations loaded")

print("Loading railway graph...")
with open('public/data/bd-railways.geojson', encoding='utf-8') as f:
    rail_gj = json.load(f)
graph, rail_nodes = build_graph(rail_gj)
ngrid = build_ngrid(rail_nodes)
print(f"  {len(rail_nodes)} nodes, {sum(len(v) for v in graph.values())//2} edges")

# ── Parse rows ────────────────────────────────────────────────────
rows = []
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i < 5: continue
    if not row[5]: continue  # no operator name
    op_code = str(row[4]).strip() if row[4] else '?'
    op_name = str(row[5]).strip()
    line_name = str(row[8]).strip() if row[8] else ''
    total_core = int(row[13]) if row[13] else 48
    year = int(row[2]) if row[2] else 2023
    route_km = float(row[21] or row[22] or 0)
    if line_name:
        rows.append({
            'op_code': op_code, 'op_name': op_name,
            'line_name': line_name, 'total_core': total_core,
            'year': year, 'route_km': route_km,
        })

print(f"\n{len(rows)} routes to process")

# ── Build GeoJSON features ────────────────────────────────────────
features = []
ok = skip = 0

for row in rows:
    stops = parse_stops(row['line_name'])
    if len(stops) < 2:
        skip += 1
        print(f"  SKIP (1 stop): {row['line_name']}")
        continue

    # Resolve stop coords
    resolved = []
    for stop in stops:
        st = resolve_station(stop, osm_stations)
        if st:
            resolved.append((stop, [st['lon'], st['lat']]))
        else:
            resolved.append((stop, None))

    # Build chained path through resolved stops
    full_path = None
    for i in range(len(resolved) - 1):
        a_name, a_coord = resolved[i]
        b_name, b_coord = resolved[i+1]
        if a_coord is None or b_coord is None:
            continue

        da, node_a = nearest_node(*a_coord, ngrid)
        db, node_b = nearest_node(*b_coord, ngrid)
        if da > 10 or db > 10 or node_a is None or node_b is None:
            continue
        if node_a == node_b:
            continue

        path = dijkstra(graph, node_a, node_b)
        if path is None or len(path) < 2:
            # Fallback: straight line between matched stations
            segment_coords = [a_coord, b_coord]
        else:
            segment_coords = [a_coord] + [[n[0], n[1]] for n in path] + [b_coord]

        if full_path is None:
            full_path = segment_coords
        else:
            full_path = full_path + segment_coords[1:]  # merge, drop duplicate junction

    if full_path is None or len(full_path) < 2:
        skip += 1
        unresolved = [s for s, c in resolved if c is None]
        print(f"  SKIP (no path): {row['line_name']} | unresolved: {unresolved}")
        continue

    total_len = sum(haversine(full_path[i], full_path[i+1]) for i in range(len(full_path)-1))

    feat = {
        'type': 'Feature',
        'geometry': {'type': 'LineString', 'coordinates': full_path},
        'properties': {
            'op_code':   row['op_code'],
            'op_name':   row['op_name'],
            'line_name': row['line_name'],
            'total_core': row['total_core'],
            'year':       row['year'],
            'route_km':   round(row['route_km'] or total_len, 2),
            'color':      OP_COLOR.get(row['op_code'], '#94a3b8'),
        },
    }
    features.append(feat)
    ok += 1

print(f"\nProcessed: {ok} routes OK, {skip} skipped")

gj = {'type': 'FeatureCollection', 'features': features}
with open('public/data/opr-lines.geojson', 'w', encoding='utf-8') as f:
    json.dump(gj, f, separators=(',', ':'), ensure_ascii=False)

print(f"Written public/data/opr-lines.geojson ({len(features)} features)")

# ── Summary ───────────────────────────────────────────────────────
from collections import defaultdict
by_op = defaultdict(list)
for feat in features:
    by_op[feat['properties']['op_name']].append(feat['properties']['route_km'])

print("\n=== OPERATOR SUMMARY ===")
for op, kms in by_op.items():
    print(f"  {op}: {len(kms)} routes, {sum(kms):.0f} km total")
