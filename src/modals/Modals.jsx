import React, { useState } from 'react';
import Modal from '../components/Modal';
import { ITEMS, MONTHS, CURRENT_MONTH, TODAY } from '../data/items';
import { getStock, getKPI } from '../utils/stockCalc';

// ── Receiving ────────────────────────────────────────────────────────────────
export function ModalReceiving({ onClose, onSave, showToast }) {
  const [form, setForm] = useState({ date: TODAY, gin: '', type: 'Purchase', month: CURRENT_MONTH, itemId: ITEMS[0].id, qty: 1 });
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  function save() {
    const qty = parseInt(form.qty) || 0;
    if (!qty) { showToast('Qty must be greater than 0', 'danger'); return; }
    onSave({ ...form, qty, id: 'RCV-' + Date.now() });
    showToast('Receiving entry added');
    onClose();
  }

  return (
    <Modal title="Add stock receiving" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}><i className="ti ti-plus" /> Add</button></>}>
      <div className="form-row">
        <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={f('date')} /></div>
        <div className="form-group"><label>GIN / JC No.</label><input value={form.gin} onChange={f('gin')} placeholder="GIN-001" /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Type</label>
          <select value={form.type} onChange={f('type')}>
            {['Purchase','Transfer In','Return'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Month</label>
          <select value={form.month} onChange={f('month')}>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}><label>Item</label>
        <select value={form.itemId} onChange={f('itemId')}>
          {ITEMS.map(i => <option key={i.id} value={i.id}>{i.id} – {i.name}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Qty (Pkt / Rim / Pcs)</label><input type="number" value={form.qty} min="1" onChange={f('qty')} /></div>
    </Modal>
  );
}

// ── Issuance ─────────────────────────────────────────────────────────────────
export function ModalIssuance({ state, onClose, onSave, showToast }) {
  const [form, setForm] = useState({ date: TODAY, jc: '', type: 'Production', month: CURRENT_MONTH, itemId: ITEMS[0].id, qty: 1 });
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const { opening, receiving, issuance, adjustments } = state;

  function save() {
    const qty = parseInt(form.qty) || 0;
    if (!qty) { showToast('Qty must be greater than 0', 'danger'); return; }
    const { close } = getStock(form.itemId, opening, receiving, issuance, adjustments);
    if (qty > close) { showToast(`Insufficient stock. Closing balance: ${close}`, 'danger'); return; }
    onSave({ ...form, qty, id: 'ISS-' + Date.now() });
    showToast('Issuance entry added');
    onClose();
  }

  return (
    <Modal title="Add stock issuance" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}><i className="ti ti-plus" /> Add</button></>}>
      <div className="form-row">
        <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={f('date')} /></div>
        <div className="form-group"><label>JC No.</label><input value={form.jc} onChange={f('jc')} placeholder="JC-001" /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Type</label>
          <select value={form.type} onChange={f('type')}>
            {['Production','Transfer Out','Sample'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Month</label>
          <select value={form.month} onChange={f('month')}>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}><label>Item</label>
        <select value={form.itemId} onChange={f('itemId')}>
          {ITEMS.map(i => <option key={i.id} value={i.id}>{i.id} – {i.name}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Qty (Pkt / Rim / Pcs)</label><input type="number" value={form.qty} min="1" onChange={f('qty')} /></div>
    </Modal>
  );
}

// ── Adjustment ───────────────────────────────────────────────────────────────
export function ModalAdjustment({ onClose, onSave, showToast }) {
  const [form, setForm] = useState({ date: TODAY, ref: '', month: CURRENT_MONTH, itemId: ITEMS[0].id, qty: 0, reason: 'Damage' });
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  function save() {
    const qty = parseInt(form.qty) || 0;
    if (qty === 0) { showToast('Qty cannot be zero', 'danger'); return; }
    onSave({ ...form, qty, id: 'ADJ-' + Date.now() });
    showToast('Adjustment saved');
    onClose();
  }

  return (
    <Modal title="Add stock adjustment" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}><i className="ti ti-plus" /> Add</button></>}>
      <div className="form-row">
        <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={f('date')} /></div>
        <div className="form-group"><label>Ref No.</label><input value={form.ref} onChange={f('ref')} placeholder="ADJ-001" /></div>
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}><label>Month</label>
        <select value={form.month} onChange={f('month')}>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}><label>Item</label>
        <select value={form.itemId} onChange={f('itemId')}>
          {ITEMS.map(i => <option key={i.id} value={i.id}>{i.id} – {i.name}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Qty (+/−)</label><input type="number" value={form.qty} onChange={f('qty')} /></div>
        <div className="form-group"><label>Reason</label>
          <select value={form.reason} onChange={f('reason')}>
            {['Damage','Count Correction','Expiry','Return','Other'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}

// ── Edit Demand ───────────────────────────────────────────────────────────────
export function ModalDemand({ state, dispatch, onClose, showToast }) {
  const [local, setLocal] = useState({ ...state.monthlyDemand });

  function save() {
    dispatch({ type: 'SET_MONTHLY_DEMAND_BULK', data: local });
    showToast('Monthly demand updated');
    onClose();
  }

  return (
    <Modal title="Edit monthly demand" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
      <div className="table-wrap" style={{ maxHeight: 400, overflowY: 'auto' }}>
        <table>
          <thead><tr><th>Item ID</th><th>Item</th><th>UOM</th><th>Monthly demand</th></tr></thead>
          <tbody>
            {ITEMS.map(i => (
              <tr key={i.id}>
                <td style={{ fontSize: 12, color: 'var(--txtm)' }}>{i.id}</td>
                <td style={{ fontSize: 12 }}>{i.name}</td>
                <td>{i.uom}</td>
                <td><input type="number" min="0" value={local[i.id] || 0}
                  onChange={e => setLocal(p => ({ ...p, [i.id]: parseInt(e.target.value) || 0 }))}
                  style={{ width: 80, padding: '3px 6px', border: '0.5px solid var(--bd)', borderRadius: 4, background: 'var(--sur2)', fontSize: 12 }}
                /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

// ── Edit Opening ──────────────────────────────────────────────────────────────
export function ModalOpening({ state, dispatch, onClose, showToast }) {
  const [local, setLocal] = useState({ ...state.opening });

  function save() {
    dispatch({ type: 'SET_OPENING_BULK', data: local });
    showToast('Opening stock updated');
    onClose();
  }

  return (
    <Modal title="Edit opening stock" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
      <div className="table-wrap" style={{ maxHeight: 400, overflowY: 'auto' }}>
        <table>
          <thead><tr><th>Item ID</th><th>Item</th><th>Opening qty</th></tr></thead>
          <tbody>
            {ITEMS.map(i => (
              <tr key={i.id}>
                <td style={{ fontSize: 12, color: 'var(--txtm)' }}>{i.id}</td>
                <td style={{ fontSize: 12 }}>{i.name}</td>
                <td><input type="number" min="0" value={local[i.id] || 0}
                  onChange={e => setLocal(p => ({ ...p, [i.id]: parseInt(e.target.value) || 0 }))}
                  style={{ width: 80, padding: '3px 6px', border: '0.5px solid var(--bd)', borderRadius: 4, background: 'var(--sur2)', fontSize: 12 }}
                /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

// ── Item Detail ───────────────────────────────────────────────────────────────
export function ModalItemDetail({ itemId, state, onClose }) {
  const item = ITEMS.find(i => i.id === itemId);
  const { opening, receiving, issuance, adjustments, monthlyDemand, leadTime, safetyStock, maxStock } = state;
  const { open, rcv, iss, adj, close } = getStock(itemId, opening, receiving, issuance, adjustments);
  const kpi = getKPI(itemId, opening, receiving, issuance, adjustments, monthlyDemand, leadTime, safetyStock, maxStock);

  const fsnColor = kpi.fsn === 'Fast' ? 'badge-success' : kpi.fsn === 'Slow' ? 'badge-warning' : 'badge-gray';

  return (
    <Modal title={`${item.id} — ${item.name}`} onClose={onClose}
      footer={<button className="btn btn-primary" onClick={onClose}>Close</button>}>
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className={`kpi-card ${close <= 0 ? 'danger' : kpi.reorder ? 'warning' : ''}`}>
          <div className="kpi-label">Closing stock</div>
          <div className="kpi-value">{close}</div>
          <div className="kpi-sub">{item.uom}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Daily demand</div>
          <div className="kpi-value">{kpi.dd.toFixed(1)}</div>
          <div className="kpi-sub">units/day</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Reorder point</div>
          <div className="kpi-value">{kpi.rop}</div>
          <div className="kpi-sub">units</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Forecast days</div>
          <div className="kpi-value">{kpi.forecastDays !== null ? kpi.forecastDays : '—'}</div>
          <div className="kpi-sub">remaining</div>
        </div>
      </div>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <tbody>
          <tr><td style={{ padding: '6px 0', color: 'var(--txtm)' }}>Opening</td><td style={{ textAlign: 'right' }}>{open}</td></tr>
          <tr><td style={{ padding: '6px 0', color: 'var(--txtm)' }}>+ Receiving</td><td style={{ textAlign: 'right', color: '#1baf7a' }}>+{rcv}</td></tr>
          <tr><td style={{ padding: '6px 0', color: 'var(--txtm)' }}>− Issuance</td><td style={{ textAlign: 'right', color: '#e34948' }}>-{iss}</td></tr>
          <tr><td style={{ padding: '6px 0', color: 'var(--txtm)' }}>± Adjustment</td><td style={{ textAlign: 'right', color: '#eda100' }}>{adj >= 0 ? '+' + adj : adj}</td></tr>
          <tr style={{ borderTop: '0.5px solid var(--bd)' }}>
            <td style={{ padding: '8px 0', fontWeight: 500 }}>= Closing</td>
            <td style={{ textAlign: 'right', fontWeight: 500 }}>{close}</td>
          </tr>
        </tbody>
      </table>
      <div className="tag-row">
        <span className={`badge ${fsnColor}`}>{kpi.fsn}-Moving</span>
        {kpi.stockout && <span className="badge badge-danger"><i className="ti ti-alert-circle" /> Stockout</span>}
        {kpi.reorder && !kpi.stockout && <span className="badge badge-warning"><i className="ti ti-bell" /> Reorder</span>}
        {kpi.overstock && <span className="badge badge-info">Overstock</span>}
        {kpi.deadStock && <span className="badge badge-gray">Dead stock</span>}
      </div>
    </Modal>
  );
}
