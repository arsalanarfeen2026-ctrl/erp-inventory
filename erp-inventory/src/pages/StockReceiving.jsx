import React, { useState } from 'react';
import { useItems } from '../context/ItemContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ExcelToolbar from '../components/ExcelToolbar';
import { exportStockReceiving, downloadReceivingTemplate, parseReceivingImport } from '../utils/excelUtils';
import { MONTHS, CURRENT_MONTH, TODAY } from '../data/items';
import { DeleteAllConfirm } from './MonthlyDemand';

export default function StockReceiving({ state, dispatch, setTopbarActions, showToast }) {
  const { activeItems, items } = useItems();
  const { can, isAdmin, addAuditEntry, currentUser } = useAuth();
  const [modal, setModal]               = useState(null);
  const [importing, setImporting]       = useState(false);
  const [deleteConfirm, setDeleteConfirm]       = useState(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [filterSection, setFilterSection] = useState('All');
  const [filterCat, setFilterCat]         = useState('All');

  React.useEffect(() => {
    setTopbarActions(
      can('receiving', 'create') ? (
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin() && (
            <button className="btn" onClick={() => setDeleteAllConfirm(true)}
              style={{ color: '#e34948', borderColor: 'rgba(227,73,72,0.3)' }}>
              <i className="ti ti-trash" /> Delete all
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
            <i className="ti ti-plus" /> Add receiving
          </button>
        </div>
      ) : null
    );
  }, []);

  function getLastRate(itemId) {
    const e = [...state.receiving].filter(r => r.itemId === itemId && r.rate).sort((a,b) => b.date.localeCompare(a.date));
    return e[0]?.rate || 0;
  }

  function handleSave(entry) {
    dispatch({ type: 'ADD_RECEIVING', entry });
    addAuditEntry({ type: 'CREATE', module: 'Stock Receiving', user: currentUser?.username, details: `Added: ${entry.id} — ${entry.itemId} Qty:${entry.qty} Rate:${entry.rate}` });
    showToast('Receiving entry added');
    setModal(null);
  }

  function confirmDelete() {
    dispatch({ type: 'DELETE_RECEIVING', id: deleteConfirm.id });
    addAuditEntry({ type: 'DELETE', module: 'Stock Receiving', user: currentUser?.username, details: `Deleted: ${deleteConfirm.id}` });
    showToast('Entry deleted', 'danger');
    setDeleteConfirm(null);
  }

  function handleDeleteAll() {
    dispatch({ type: 'DELETE_ALL_RECEIVING' });
    addAuditEntry({ type: 'DELETE', module: 'Stock Receiving', user: currentUser?.username, details: 'Deleted all receiving records' });
    showToast('All receiving records deleted', 'danger');
    setDeleteAllConfirm(false);
  }

  async function handleImport(file) {
    setImporting(true);
    try {
      const entries = await parseReceivingImport(file);
      if (!entries.length) { showToast('No valid rows', 'warning'); setImporting(false); return; }
      entries.forEach(entry => dispatch({ type: 'ADD_RECEIVING', entry }));
      showToast(`${entries.length} entries imported`);
    } catch { showToast('Import failed', 'danger'); }
    setImporting(false);
  }

  // Enrich entries with section/cat from items
  const enriched = state.receiving.map(r => {
    const meta = items.find(i => i.id === r.itemId) || {};
    return { ...r, section: meta.section || '—', cat: meta.cat || '—', itemName: meta.name || r.itemId };
  }).sort((a,b) => b.date.localeCompare(a.date));

  const sections = ['All', ...new Set(enriched.map(r => r.section).filter(s => s !== '—'))];
  const cats     = ['All', ...new Set(enriched.map(r => r.cat).filter(c => c !== '—'))];

  let list = enriched;
  if (filterSection !== 'All') list = list.filter(r => r.section === filterSection);
  if (filterCat !== 'All')     list = list.filter(r => r.cat === filterCat);

  return (
    <>
      {can('receiving', 'create') && (
        <ExcelToolbar
          onExport={() => { exportStockReceiving(state.receiving); showToast('Exported'); }}
          onTemplate={() => { downloadReceivingTemplate(); showToast('Template downloaded'); }}
          onImport={handleImport} importing={importing}
        />
      )}

      <div className="filter-row">
        <span style={{ fontSize: 12, color: 'var(--txtm)', fontWeight: 500 }}>Section:</span>
        {sections.map(s => (
          <button key={s} className={`btn btn-sm ${filterSection === s ? 'btn-primary' : ''}`}
            onClick={() => setFilterSection(s)}>{s}</button>
        ))}
      </div>
      <div className="filter-row">
        <span style={{ fontSize: 12, color: 'var(--txtm)', fontWeight: 500 }}>Category:</span>
        {cats.map(c => (
          <button key={c} className={`btn btn-sm ${filterCat === c ? 'btn-primary' : ''}`}
            onClick={() => setFilterCat(c)}>{c}</button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Date</th><th>Month</th><th>GIN/JC</th><th>Type</th><th>Item</th><th>Section</th><th>Category</th><th>Qty</th><th>Rate (PKR)</th><th>Value (PKR)</th>{isAdmin() && <th>Del</th>}</tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={12} className="empty">No receiving entries yet</td></tr>
            ) : list.map(r => {
              const value = (r.rate || 0) * r.qty;
              return (
                <tr key={r.id}>
                  <td style={{ fontSize: 11, color: 'var(--txtm)' }}>{r.id}</td>
                  <td>{r.date}</td><td>{r.month}</td>
                  <td style={{ fontSize: 12 }}>{r.gin || '—'}</td>
                  <td><span className="badge badge-info">{r.type}</span></td>
                  <td>{r.itemName}</td>
                  <td><span className="badge badge-purple">{r.section}</span></td>
                  <td><span className="badge badge-info">{r.cat}</span></td>
                  <td style={{ color: '#1baf7a', fontWeight: 500 }}>+{r.qty}</td>
                  <td style={{ fontWeight: 500 }}>{r.rate ? `PKR ${Number(r.rate).toLocaleString()}` : '—'}</td>
                  <td style={{ color: '#2a78d6' }}>{value ? `PKR ${value.toLocaleString()}` : '—'}</td>
                  {isAdmin() && (
                    <td>
                      <button className="btn btn-sm" onClick={() => setDeleteConfirm(r)} style={{ color: '#e34948' }}>
                        <i className="ti ti-trash" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pagination"><span>{list.length} entries</span></div>
      </div>

      {modal?.type === 'add' && (
        <ReceivingModal activeItems={activeItems} getLastRate={getLastRate} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {deleteAllConfirm && <DeleteAllConfirm module="Stock Receiving" onConfirm={handleDeleteAll} onCancel={() => setDeleteAllConfirm(false)} />}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><span className="modal-title" style={{ color: '#e34948' }}><i className="ti ti-alert-triangle" /> Confirm Delete</span></div>
            <div className="alert alert-danger"><i className="ti ti-trash" /><div><b>Permanently delete this entry?</b><br /><span style={{ fontSize: 12 }}>{deleteConfirm.id} — {deleteConfirm.itemId} — Qty: {deleteConfirm.qty}</span></div></div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}><i className="ti ti-trash" /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ReceivingModal({ activeItems, getLastRate, onSave, onClose }) {
  const [form, setForm] = useState({
    date: TODAY, gin: '', type: 'Purchase', month: CURRENT_MONTH,
    itemId: activeItems[0]?.id || '', qty: 1, rate: 0,
  });
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  function handleItemChange(e) {
    const itemId = e.target.value;
    setForm(p => ({ ...p, itemId, rate: getLastRate(itemId) }));
  }

  function save() {
    if (!parseInt(form.qty)) { alert('Qty must be > 0'); return; }
    onSave({ ...form, qty: parseInt(form.qty), rate: parseFloat(form.rate) || 0, id: 'RCV-' + Date.now() });
  }

  const value = (parseFloat(form.rate) || 0) * (parseInt(form.qty) || 0);

  return (
    <Modal title="Add stock receiving" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}><i className="ti ti-plus" /> Add</button></>}>
      <div className="form-row">
        <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={f('date')} /></div>
        <div className="form-group"><label>GIN / JC No.</label><input value={form.gin} onChange={f('gin')} placeholder="GIN-001" /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Type</label>
          <select value={form.type} onChange={f('type')}>{['Purchase','Transfer In','Return'].map(t=><option key={t}>{t}</option>)}</select>
        </div>
        <div className="form-group"><label>Month</label>
          <select value={form.month} onChange={f('month')}>{MONTHS.map(m=><option key={m}>{m}</option>)}</select>
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}><label>Item</label>
        <select value={form.itemId} onChange={handleItemChange}>
          {activeItems.map(i=><option key={i.id} value={i.id}>{i.id} – {i.name}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Qty</label><input type="number" value={form.qty} min="1" onChange={f('qty')} /></div>
        <div className="form-group"><label>Purchase rate (PKR per unit)</label><input type="number" value={form.rate} min="0" onChange={f('rate')} /></div>
      </div>
      {value > 0 && (
        <div className="alert alert-success" style={{ marginTop: 8 }}>
          <i className="ti ti-calculator" />
          <span>Total value: <b>PKR {value.toLocaleString()}</b></span>
        </div>
      )}
    </Modal>
  );
}
