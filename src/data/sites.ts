import type { Site } from '@/types/site'

// ─── 58 sites across 8 Bangladesh divisions ───────────────────────
//
// Distribution:
//   Dhaka        — 9 sites  (3 MNO towers, 2 BTS, 2 NTTN PoP, 2 tower co.)
//   Chattogram   — 8 sites
//   Sylhet       — 8 sites  ← disaster zone: 4 down/degraded
//   Rajshahi     — 6 sites
//   Khulna       — 6 sites
//   Barisal      — 5 sites
//   Rangpur      — 4 sites
//   Mymensingh   — 4 sites
//   Teletalk     — 8 additional sites (one per division, BTS + towers)
//
// Status: [0-34] active, [35-42] down, [43-49] degraded
// Power:  ~50% grid, ~25% generator, ~15% battery, ~10% solar

export const SITES: Site[] = [
  // ── DHAKA DIVISION (9 sites) ──────────────────────────────────
  {
    id: 'DHK-001', name: 'Gulshan Tower North', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP', 'OP-ROBI', 'OP-TT'],
    division: 'Dhaka', district: 'Dhaka', upazila: 'Gulshan',
    lat: 23.7925, lng: 90.4078, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'DHK-002', name: 'Motijheel BTS Exchange', type: 'bts',
    operatorId: 'OP-GP', tenants: [],
    division: 'Dhaka', district: 'Dhaka', upazila: 'Motijheel',
    lat: 23.7284, lng: 90.4185, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'DHK-003', name: 'Mirpur-10 Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-BL', 'OP-ROBI'],
    division: 'Dhaka', district: 'Dhaka', upazila: 'Mirpur',
    lat: 23.8059, lng: 90.3674, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'DHK-004', name: 'Uttara NTTN PoP', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Dhaka', district: 'Dhaka', upazila: 'Uttara',
    lat: 23.8759, lng: 90.3795, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'DHK-005', name: 'Dhanmondi BTS', type: 'bts',
    operatorId: 'OP-ROBI', tenants: [],
    division: 'Dhaka', district: 'Dhaka', upazila: 'Dhanmondi',
    lat: 23.7461, lng: 90.3742, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'DHK-006', name: 'Narayanganj NTTN Hub', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Dhaka', district: 'Narayanganj', upazila: 'Narayanganj Sadar',
    lat: 23.6238, lng: 90.4996, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'DHK-007', name: 'Gazipur North Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP'],
    division: 'Dhaka', district: 'Gazipur', upazila: 'Gazipur Sadar',
    lat: 23.9999, lng: 90.4128, status: 'active', powerSource: 'generator',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:15:00+06:00', submissionStatus: 'late',
  },
  {
    id: 'DHK-008', name: 'Tongi BTS East', type: 'bts',
    operatorId: 'OP-BL', tenants: [],
    division: 'Dhaka', district: 'Gazipur', upazila: 'Tongi',
    lat: 23.8969, lng: 90.4018, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'DHK-009', name: 'Keraniganj Tower South', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP', 'OP-BL'],
    division: 'Dhaka', district: 'Dhaka', upazila: 'Keraniganj',
    lat: 23.6812, lng: 90.3851, status: 'active', powerSource: 'solar',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },

  // ── CHATTOGRAM DIVISION (8 sites) ─────────────────────────────
  {
    id: 'CTG-001', name: 'Agrabad Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP', 'OP-ROBI', 'OP-BL'],
    division: 'Chattogram', district: 'Chattogram', upazila: 'Agrabad',
    lat: 22.3237, lng: 91.8188, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'CTG-002', name: 'GEC Circle BTS', type: 'bts',
    operatorId: 'OP-GP', tenants: [],
    division: 'Chattogram', district: 'Chattogram', upazila: 'Khulshi',
    lat: 22.3716, lng: 91.8354, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'CTG-003', name: 'Hathazari NTTN Node', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Chattogram', district: 'Chattogram', upazila: 'Hathazari',
    lat: 22.4786, lng: 91.8107, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'CTG-004', name: 'Sitakund Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP'],
    division: 'Chattogram', district: 'Chattogram', upazila: 'Sitakund',
    lat: 22.6254, lng: 91.6756, status: 'active', powerSource: 'generator',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'CTG-005', name: 'Cox\'s Bazar South BTS', type: 'bts',
    operatorId: 'OP-ROBI', tenants: [],
    division: 'Chattogram', district: "Cox's Bazar", upazila: "Cox's Bazar Sadar",
    lat: 21.4272, lng: 91.9820, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'CTG-006', name: 'Comilla NTTN Hub', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Chattogram', district: 'Cumilla', upazila: 'Cumilla Sadar',
    lat: 23.4607, lng: 91.1809, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'CTG-007', name: 'Feni Tower Central', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-BL'],
    division: 'Chattogram', district: 'Feni', upazila: 'Feni Sadar',
    lat: 23.0134, lng: 91.3996, status: 'active', powerSource: 'solar',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'CTG-008', name: 'Rangamati Hill BTS', type: 'bts',
    operatorId: 'OP-BL', tenants: [],
    division: 'Chattogram', district: 'Rangamati', upazila: 'Rangamati Sadar',
    lat: 22.6500, lng: 92.1700, status: 'active', powerSource: 'solar',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:00:00+06:00', submissionStatus: 'late',
  },

  // ── SYLHET DIVISION (8 sites — DISASTER ZONE) ─────────────────
  {
    id: 'SYL-001', name: 'Sylhet City Tower A', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP', 'OP-ROBI'],
    division: 'Sylhet', district: 'Sylhet', upazila: 'Sylhet Sadar',
    lat: 24.8924, lng: 91.8687, status: 'active', powerSource: 'generator',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'SYL-002', name: 'Zindabazar BTS', type: 'bts',
    operatorId: 'OP-GP', tenants: [],
    division: 'Sylhet', district: 'Sylhet', upazila: 'Sylhet Sadar',
    lat: 24.8985, lng: 91.8721, status: 'active', powerSource: 'generator',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'SYL-003', name: 'Sylhet NTTN Central', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Sylhet', district: 'Sylhet', upazila: 'Sylhet Sadar',
    lat: 24.8837, lng: 91.8752, status: 'active', powerSource: 'battery',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:15:00+06:00', submissionStatus: 'late',
  },
  {
    id: 'SYL-004', name: 'Moulvibazar Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-BL'],
    division: 'Sylhet', district: 'Moulvibazar', upazila: 'Moulvibazar Sadar',
    lat: 24.4822, lng: 91.7774, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  // ↓ Disaster-affected sites (status: down / degraded)
  {
    id: 'SYL-005', name: 'Golapganj BTS South', type: 'bts',
    operatorId: 'OP-ROBI', tenants: [],
    division: 'Sylhet', district: 'Sylhet', upazila: 'Golapganj',
    lat: 24.7412, lng: 92.0047, status: 'down', powerSource: 'battery',
    hasActiveOutage: true, lastSubmission: '2026-04-11T05:45:00+06:00', submissionStatus: 'missing',
  },
  {
    id: 'SYL-006', name: 'Sylhet North NTTN PoP', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Sylhet', district: 'Sylhet', upazila: 'Companiganj',
    lat: 25.0271, lng: 91.9764, status: 'down', powerSource: 'battery',
    hasActiveOutage: true, lastSubmission: '2026-04-11T05:30:00+06:00', submissionStatus: 'missing',
  },
  {
    id: 'SYL-007', name: 'Bishwanath Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP'],
    division: 'Sylhet', district: 'Sylhet', upazila: 'Bishwanath',
    lat: 24.8066, lng: 91.6735, status: 'down', powerSource: 'battery',
    hasActiveOutage: true, lastSubmission: '2026-04-11T05:15:00+06:00', submissionStatus: 'missing',
  },
  {
    id: 'SYL-008', name: 'Sunamganj East BTS', type: 'bts',
    operatorId: 'OP-BL', tenants: [],
    division: 'Sylhet', district: 'Sunamganj', upazila: 'Sunamganj Sadar',
    lat: 24.8669, lng: 91.3977, status: 'degraded', powerSource: 'battery',
    hasActiveOutage: true, lastSubmission: '2026-04-13T05:30:00+06:00', submissionStatus: 'late',
  },

  // ── RAJSHAHI DIVISION (6 sites) ───────────────────────────────
  {
    id: 'RAJ-001', name: 'Rajshahi City Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP', 'OP-ROBI', 'OP-TT'],
    division: 'Rajshahi', district: 'Rajshahi', upazila: 'Rajshahi Sadar',
    lat: 24.3745, lng: 88.6042, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'RAJ-002', name: 'Bogura BTS Central', type: 'bts',
    operatorId: 'OP-GP', tenants: [],
    division: 'Rajshahi', district: 'Bogura', upazila: 'Bogura Sadar',
    lat: 24.8466, lng: 89.3773, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'RAJ-003', name: 'Natore NTTN Node', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Rajshahi', district: 'Natore', upazila: 'Natore Sadar',
    lat: 24.4203, lng: 88.9874, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'RAJ-004', name: 'Chapai Tower West', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-BL'],
    division: 'Rajshahi', district: 'Chapainawabganj', upazila: 'Chapainawabganj Sadar',
    lat: 24.5972, lng: 88.2766, status: 'active', powerSource: 'solar',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'RAJ-005', name: 'Pabna BTS South', type: 'bts',
    operatorId: 'OP-ROBI', tenants: [],
    division: 'Rajshahi', district: 'Pabna', upazila: 'Pabna Sadar',
    lat: 24.0063, lng: 89.2398, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'RAJ-006', name: 'Sirajganj River Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP'],
    division: 'Rajshahi', district: 'Sirajganj', upazila: 'Sirajganj Sadar',
    lat: 24.4525, lng: 89.7068, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },

  // ── KHULNA DIVISION (6 sites) ─────────────────────────────────
  {
    id: 'KHU-001', name: 'Khulna City Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP', 'OP-ROBI'],
    division: 'Khulna', district: 'Khulna', upazila: 'Khulna Sadar',
    lat: 22.8456, lng: 89.5403, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'KHU-002', name: 'Jessore BTS Hub', type: 'bts',
    operatorId: 'OP-BL', tenants: [],
    division: 'Khulna', district: 'Jashore', upazila: 'Jashore Sadar',
    lat: 23.1664, lng: 89.2134, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'KHU-003', name: 'Mongla NTTN Port Node', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Khulna', district: 'Bagerhat', upazila: 'Mongla',
    lat: 22.4770, lng: 89.5915, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'KHU-004', name: 'Satkhira South Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP'],
    division: 'Khulna', district: 'Satkhira', upazila: 'Satkhira Sadar',
    lat: 22.7185, lng: 89.0705, status: 'active', powerSource: 'solar',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'KHU-005', name: 'Chuadanga BTS', type: 'bts',
    operatorId: 'OP-GP', tenants: [],
    division: 'Khulna', district: 'Chuadanga', upazila: 'Chuadanga Sadar',
    lat: 23.6402, lng: 88.8417, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'KHU-006', name: 'Kushtia Tower Central', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-ROBI', 'OP-BL'],
    division: 'Khulna', district: 'Kushtia', upazila: 'Kushtia Sadar',
    lat: 23.9015, lng: 89.1202, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },

  // ── BARISAL DIVISION (5 sites) ────────────────────────────────
  {
    id: 'BAR-001', name: 'Barisal City Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP', 'OP-BL'],
    division: 'Barisal', district: 'Barishal', upazila: 'Barishal Sadar',
    lat: 22.7010, lng: 90.3533, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'BAR-002', name: 'Patuakhali NTTN Node', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Barisal', district: 'Patuakhali', upazila: 'Patuakhali Sadar',
    lat: 22.3597, lng: 90.3296, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'BAR-003', name: 'Bhola Island BTS', type: 'bts',
    operatorId: 'OP-ROBI', tenants: [],
    division: 'Barisal', district: 'Bhola', upazila: 'Bhola Sadar',
    lat: 22.6860, lng: 90.6481, status: 'active', powerSource: 'solar',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'BAR-004', name: 'Jhalokati Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP'],
    division: 'Barisal', district: 'Jhalokathi', upazila: 'Jhalokathi Sadar',
    lat: 22.6378, lng: 90.1979, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'BAR-005', name: 'Pirojpur BTS', type: 'bts',
    operatorId: 'OP-BL', tenants: [],
    division: 'Barisal', district: 'Pirojpur', upazila: 'Pirojpur Sadar',
    lat: 22.5790, lng: 89.9742, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },

  // ── RANGPUR DIVISION (4 sites) ────────────────────────────────
  {
    id: 'RNG-001', name: 'Rangpur City Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP', 'OP-ROBI', 'OP-TT'],
    division: 'Rangpur', district: 'Rangpur', upazila: 'Rangpur Sadar',
    lat: 25.7439, lng: 89.2752, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'RNG-002', name: 'Dinajpur NTTN Node', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Rangpur', district: 'Dinajpur', upazila: 'Dinajpur Sadar',
    lat: 25.6279, lng: 88.6337, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'RNG-003', name: 'Gaibandha BTS', type: 'bts',
    operatorId: 'OP-GP', tenants: [],
    division: 'Rangpur', district: 'Gaibandha', upazila: 'Gaibandha Sadar',
    lat: 25.3283, lng: 89.5440, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'RNG-004', name: 'Thakurgaon Border Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-BL'],
    division: 'Rangpur', district: 'Thakurgaon', upazila: 'Thakurgaon Sadar',
    lat: 26.0336, lng: 88.4616, status: 'active', powerSource: 'solar',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },

  // ── MYMENSINGH DIVISION (4 sites) ─────────────────────────────
  {
    id: 'MYM-001', name: 'Mymensingh City Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP', 'OP-ROBI'],
    division: 'Mymensingh', district: 'Mymensingh', upazila: 'Mymensingh Sadar',
    lat: 24.7471, lng: 90.4203, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'MYM-002', name: 'Netrokona NTTN Hub', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Mymensingh', district: 'Netrokona', upazila: 'Netrokona Sadar',
    lat: 24.8702, lng: 90.7299, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'MYM-003', name: 'Jamalpur BTS', type: 'bts',
    operatorId: 'OP-BL', tenants: [],
    division: 'Mymensingh', district: 'Jamalpur', upazila: 'Jamalpur Sadar',
    lat: 24.9001, lng: 89.9381, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'MYM-004', name: 'Sherpur Tower North', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP'],
    division: 'Mymensingh', district: 'Sherpur', upazila: 'Sherpur Sadar',
    lat: 25.0203, lng: 90.0181, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },

  // ── DOWN SITES (8) ────────────────────────────────────────────
  // Note: SYL-005, SYL-006, SYL-007 already counted above
  {
    id: 'DHK-010', name: 'Narayanganj South BTS', type: 'bts',
    operatorId: 'OP-BL', tenants: [],
    division: 'Dhaka', district: 'Narayanganj', upazila: 'Sonargaon',
    lat: 23.5741, lng: 90.6015, status: 'down', powerSource: 'battery',
    hasActiveOutage: true, lastSubmission: '2026-04-13T03:45:00+06:00', submissionStatus: 'missing',
  },
  {
    id: 'CTG-009', name: 'Teknaf Remote Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP'],
    division: 'Chattogram', district: "Cox's Bazar", upazila: 'Teknaf',
    lat: 20.8636, lng: 92.2995, status: 'down', powerSource: 'battery',
    hasActiveOutage: true, lastSubmission: '2026-04-13T01:00:00+06:00', submissionStatus: 'missing',
  },
  {
    id: 'MYM-005', name: 'Mymensingh East Power Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-ROBI', 'OP-BL'],
    division: 'Mymensingh', district: 'Mymensingh', upazila: 'Trishal',
    lat: 24.7012, lng: 90.5537, status: 'down', powerSource: 'battery',
    hasActiveOutage: true, lastSubmission: '2026-04-13T04:00:00+06:00', submissionStatus: 'missing',
  },
  {
    id: 'RNG-005', name: 'Lalmonirhat Border BTS', type: 'bts',
    operatorId: 'OP-ROBI', tenants: [],
    division: 'Rangpur', district: 'Lalmonirhat', upazila: 'Lalmonirhat Sadar',
    lat: 25.9223, lng: 89.4487, status: 'down', powerSource: 'battery',
    hasActiveOutage: true, lastSubmission: '2026-04-13T02:30:00+06:00', submissionStatus: 'missing',
  },
  {
    id: 'KHU-007', name: 'Sundarbans NTTN Remote', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Khulna', district: 'Bagerhat', upazila: 'Rampal',
    lat: 22.4012, lng: 89.7103, status: 'down', powerSource: 'solar',
    hasActiveOutage: true, lastSubmission: '2026-04-12T18:00:00+06:00', submissionStatus: 'missing',
  },

  // ── DEGRADED SITES (7) ────────────────────────────────────────
  // Note: SYL-008 already counted above
  {
    id: 'DHK-011', name: 'Demra Industrial BTS', type: 'bts',
    operatorId: 'OP-GP', tenants: [],
    division: 'Dhaka', district: 'Dhaka', upazila: 'Demra',
    lat: 23.7001, lng: 90.4789, status: 'degraded', powerSource: 'generator',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:00:00+06:00', submissionStatus: 'late',
  },
  {
    id: 'CTG-010', name: 'Sandwip Island Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP'],
    division: 'Chattogram', district: 'Chattogram', upazila: 'Sandwip',
    lat: 22.4668, lng: 91.4396, status: 'degraded', powerSource: 'battery',
    hasActiveOutage: false, lastSubmission: '2026-04-13T06:30:00+06:00', submissionStatus: 'late',
  },
  {
    id: 'BAR-006', name: 'Barguna Coast Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-BL'],
    division: 'Barisal', district: 'Barguna', upazila: 'Barguna Sadar',
    lat: 22.1468, lng: 90.1173, status: 'degraded', powerSource: 'solar',
    hasActiveOutage: false, lastSubmission: '2026-04-13T06:45:00+06:00', submissionStatus: 'late',
  },
  {
    id: 'RAJ-007', name: 'Joypurhat Remote BTS', type: 'bts',
    operatorId: 'OP-BL', tenants: [],
    division: 'Rajshahi', district: 'Joypurhat', upazila: 'Joypurhat Sadar',
    lat: 25.1004, lng: 89.0198, status: 'degraded', powerSource: 'generator',
    hasActiveOutage: false, lastSubmission: '2026-04-13T06:00:00+06:00', submissionStatus: 'late',
  },
  {
    id: 'KHU-008', name: 'Narail Rural Tower', type: 'tower',
    operatorId: 'OP-EDOTCO', tenants: ['OP-GP'],
    division: 'Khulna', district: 'Narail', upazila: 'Narail Sadar',
    lat: 23.1724, lng: 89.5113, status: 'degraded', powerSource: 'generator',
    hasActiveOutage: false, lastSubmission: '2026-04-13T06:15:00+06:00', submissionStatus: 'late',
  },
  {
    id: 'MYM-006', name: 'Kishorganj NTTN Relay', type: 'nttn_pop',
    operatorId: 'OP-BGFCL', tenants: [],
    division: 'Mymensingh', district: 'Kishoreganj', upazila: 'Kishoreganj Sadar',
    lat: 24.4449, lng: 90.7762, status: 'degraded', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:00:00+06:00', submissionStatus: 'late',
  },

  // ── TELETALK SITES (8) ────────────────────────────────────────
  // State-owned MNO — BTS sites as operator + co-tenant on tower sites.
  // One site per division for nationwide coverage representation.
  {
    id: 'TT-001', name: 'Teletalk Paltan BTS', type: 'bts',
    operatorId: 'OP-TT', tenants: [],
    division: 'Dhaka', district: 'Dhaka', upazila: 'Paltan',
    lat: 23.7368, lng: 90.4126, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'TT-002', name: 'Teletalk Nasirabad BTS', type: 'bts',
    operatorId: 'OP-TT', tenants: [],
    division: 'Chattogram', district: 'Chattogram', upazila: 'Panchlaish',
    lat: 22.3602, lng: 91.8266, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'TT-003', name: 'Teletalk Sylhet BTS', type: 'bts',
    operatorId: 'OP-TT', tenants: [],
    division: 'Sylhet', district: 'Sylhet', upazila: 'Sylhet Sadar',
    lat: 24.9045, lng: 91.8611, status: 'degraded', powerSource: 'battery',
    hasActiveOutage: true, lastSubmission: '2026-04-13T05:00:00+06:00', submissionStatus: 'late',
  },
  {
    id: 'TT-004', name: 'Teletalk Rajshahi BTS', type: 'bts',
    operatorId: 'OP-TT', tenants: [],
    division: 'Rajshahi', district: 'Rajshahi', upazila: 'Rajshahi Sadar',
    lat: 24.3665, lng: 88.6151, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'TT-005', name: 'Teletalk Khulna Tower', type: 'tower',
    operatorId: 'OP-TT', tenants: [],
    division: 'Khulna', district: 'Khulna', upazila: 'Khulna Sadar',
    lat: 22.8312, lng: 89.5547, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'TT-006', name: 'Teletalk Barisal BTS', type: 'bts',
    operatorId: 'OP-TT', tenants: [],
    division: 'Barisal', district: 'Barishal', upazila: 'Barishal Sadar',
    lat: 22.7082, lng: 90.3612, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'TT-007', name: 'Teletalk Rangpur BTS', type: 'bts',
    operatorId: 'OP-TT', tenants: [],
    division: 'Rangpur', district: 'Rangpur', upazila: 'Rangpur Sadar',
    lat: 25.7511, lng: 89.2638, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:30:00+06:00', submissionStatus: 'on_time',
  },
  {
    id: 'TT-008', name: 'Teletalk Mymensingh BTS', type: 'bts',
    operatorId: 'OP-TT', tenants: [],
    division: 'Mymensingh', district: 'Mymensingh', upazila: 'Mymensingh Sadar',
    lat: 24.7529, lng: 90.4071, status: 'active', powerSource: 'grid',
    hasActiveOutage: false, lastSubmission: '2026-04-13T07:45:00+06:00', submissionStatus: 'on_time',
  },
]

// ─── Convenience lookups ──────────────────────────────────────────

export const SITE_MAP = Object.fromEntries(
  SITES.map(s => [s.id, s])
) as Record<string, Site>

export function getSiteById(id: string): Site | undefined {
  return SITE_MAP[id]
}

export const DIVISIONS = [...new Set(SITES.map(s => s.division))].sort()

export const DISTRICTS = [...new Set(SITES.map(s => s.district))].sort()
