const BASE = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:5000/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ── LOAD ALL DATA FROM DB ─────────────────────────────────────────────────────
export async function loadAllData() {
  const [demand, opening, receiving, issuance, adjustment, leadtime, safetystock] = await Promise.all([
    get('/demand'),
    get('/opening'),
    get('/receiving'),
    get('/issuance'),
    get('/adjustment'),
    get('/leadtime'),
    get('/safetystock'),
  ]);
  return { demand, opening, receiving, issuance, adjustment, leadtime, safetystock };
}

// ── SAVE FUNCTIONS ────────────────────────────────────────────────────────────
export const saveDemand      = (data)  => post('/demand', data);
export const saveOpening     = (data)  => post('/opening', data);
export const saveReceiving   = (entry) => post('/receiving', entry);
export const saveIssuance    = (entry) => post('/issuance', entry);
export const saveAdjustment  = (entry) => post('/adjustment', entry);
export const saveLeadTime    = (itemId, days) => post('/leadtime', { itemId, days });
export const saveSafetyStock = (itemId, qty)  => post('/safetystock', { itemId, qty });
