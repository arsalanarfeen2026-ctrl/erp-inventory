const express = require('express');
const router = express.Router();
const { pool } = require('./db');

// ── MONTHLY DEMAND ────────────────────────────────────────────────────────────
router.get('/demand', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT item_id, qty FROM monthly_demand');
    const data = {};
    rows.forEach(r => data[r.item_id] = r.qty);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/demand', async (req, res) => {
  try {
    const data = req.body;
    for (const [itemId, qty] of Object.entries(data)) {
      await pool.query(
        `INSERT INTO monthly_demand (item_id, qty) VALUES ($1, $2)
         ON CONFLICT (item_id) DO UPDATE SET qty = $2`,
        [itemId, qty]
      );
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── STOCK OPENING ─────────────────────────────────────────────────────────────
router.get('/opening', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT item_id, qty FROM stock_opening');
    const data = {};
    rows.forEach(r => data[r.item_id] = r.qty);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/opening', async (req, res) => {
  try {
    const data = req.body;
    for (const [itemId, qty] of Object.entries(data)) {
      await pool.query(
        `INSERT INTO stock_opening (item_id, qty) VALUES ($1, $2)
         ON CONFLICT (item_id) DO UPDATE SET qty = $2`,
        [itemId, qty]
      );
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── STOCK RECEIVING ───────────────────────────────────────────────────────────
router.get('/receiving', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM stock_receiving ORDER BY created_at DESC');
    res.json(rows.map(r => ({ id: r.id, date: r.date, month: r.month, gin: r.gin, itemId: r.item_id, qty: r.qty, type: r.type })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/receiving', async (req, res) => {
  try {
    const { id, date, month, gin, itemId, qty, type } = req.body;
    await pool.query(
      `INSERT INTO stock_receiving (id, date, month, gin, item_id, qty, type) VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO NOTHING`,
      [id, date, month, gin, itemId, qty, type]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── STOCK ISSUANCE ────────────────────────────────────────────────────────────
router.get('/issuance', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM stock_issuance ORDER BY created_at DESC');
    res.json(rows.map(r => ({ id: r.id, date: r.date, month: r.month, jc: r.jc, itemId: r.item_id, qty: r.qty, type: r.type })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/issuance', async (req, res) => {
  try {
    const { id, date, month, jc, itemId, qty, type } = req.body;
    await pool.query(
      `INSERT INTO stock_issuance (id, date, month, jc, item_id, qty, type) VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO NOTHING`,
      [id, date, month, jc, itemId, qty, type]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── STOCK ADJUSTMENT ──────────────────────────────────────────────────────────
router.get('/adjustment', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM stock_adjustment ORDER BY created_at DESC');
    res.json(rows.map(r => ({ id: r.id, date: r.date, month: r.month, ref: r.ref, itemId: r.item_id, qty: r.qty, reason: r.reason })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/adjustment', async (req, res) => {
  try {
    const { id, date, month, ref, itemId, qty, reason } = req.body;
    await pool.query(
      `INSERT INTO stock_adjustment (id, date, month, ref, item_id, qty, reason) VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO NOTHING`,
      [id, date, month, ref, itemId, qty, reason]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── LEAD TIME ─────────────────────────────────────────────────────────────────
router.get('/leadtime', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT item_id, days FROM lead_time');
    const data = {};
    rows.forEach(r => data[r.item_id] = r.days);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/leadtime', async (req, res) => {
  try {
    const { itemId, days } = req.body;
    await pool.query(
      `INSERT INTO lead_time (item_id, days) VALUES ($1, $2)
       ON CONFLICT (item_id) DO UPDATE SET days = $2`,
      [itemId, days]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SAFETY STOCK ──────────────────────────────────────────────────────────────
router.get('/safetystock', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT item_id, qty FROM safety_stock');
    const data = {};
    rows.forEach(r => data[r.item_id] = r.qty);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/safetystock', async (req, res) => {
  try {
    const { itemId, qty } = req.body;
    await pool.query(
      `INSERT INTO safety_stock (item_id, qty) VALUES ($1, $2)
       ON CONFLICT (item_id) DO UPDATE SET qty = $2`,
      [itemId, qty]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
router.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = router;
