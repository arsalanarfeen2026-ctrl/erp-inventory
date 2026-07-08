import React, { useState } from 'react';
import { useItems } from '../context/ItemContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ExcelToolbar from '../components/ExcelToolbar';
import { exportStockIssuance, downloadIssuanceTemplate, parseIssuanceImport } from '../utils/excelUtils';
import { getStock } from '../utils/stockCalc';
import { MONTHS, CURRENT_MONTH, TODAY } from '../data/items';
import { DeleteAllConfirm } from './MonthlyDemand';

export default function StockIssuance({ state, dispatch, setTopbarActions, showToast }) {
  const { activeItems } = useItems();
  const { can, isAdmin, addAuditEntry, currentUser } = useAuth();
  const [modal, setModal] = useState(null);
  const [importing, setImporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);

  React.useEffect(() => {
    setTopbarActions(
      can('issuance', 'create') ? (
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin() && (
            <button className="btn" onClick={() => setDeleteAllConfirm(true)} style={{ color: '#e34948', borderColor: 'rgba(227,73,72,0.3)' }}>
              <i className="ti ti-trash" /> Delete all
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
            <i className="ti ti-plus" /> Add issuance
          </button>
        </div>
      ) : null
    );
  }, []);

  function handleSave(entry) {
    dispatch({ type: 'ADD_ISSUANCE', entry });
    addAuditEntry({ type: 'CREATE', module: 'Stock Issuance', user: currentUser?.username, details: `Added issuance: ${entry.id} — ${entry.itemId} Qty: ${entry.qty}` });
    showToast('Issuance entry added');
    setModal(null);
  }

  function confirmDelete() {
    dispatch({ type: 'DELETE_ISSUANCE', id: deleteConfirm.id });
    addAuditEntry({ type: 'DELETE', module: 'Stock Issuance', user: currentUser?.username, details: `Deleted: ${deleteConfirm.id} — ${deleteConfirm.itemId} Qty: ${deleteConfirm.qty}` });
    showToast('Entry deleted', 'danger');
    setDeleteConfirm(null);
  }

  async function handleImport(file) {
    setImporting(true);
    try {
      const entries = await parseIssuanceImport(file);
      if (!entries.length) { showToast('No valid rows', 'warning'); setImporting(false); return; }
      entries.forEach(entry => dispatch({ type: 'ADD_ISSUANCE', entry }));
      showToast(`${entries.length} entries imported`);
    } catch { showToast('Import failed', 'danger'); }
    setImporting(false);
  }

  function handleDeleteAll() {
    dispatch({ type: 'DELETE_ALL_ISSUANCE' });
    addAuditEntry({ type: 'DELETE', module: 'Stock Issuance', user: currentUser?.username, details: 'Deleted all issuance records' });
    showToast('All issuance records deleted', 'danger');
    setDeleteAllConfirm(false);
  }

  const entries = [...state.issuance].sort((a, b) => b.date.localeCompare(a.date));

  // Get rate from receiving for this item (FIFO - most recent rate)
  function getItemRate(itemId) {
    const rcv = [...state.receiving].filter(r => r.itemId === itemId && r.rate).sort((a, b) => b.date.localeCompare(a.date));
    return rcv[0]?.rate || 0;
  }

  return (
    <>
      {can('issuance', 'create') && (
        <ExcelToolbar
          onExport={() => { exportStockIssuance(state.issuance); showToast('Exported'); }}
          onTemplate={() => { downloadIssuanceTemplate(); showToast('Template downloaded'); }}
          onImport={handleImport}
          importing={importing}
        />
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Date</th><th>Month</th><th>JC No.</th><th>Type</th><th>Item</th><th>Qty</th><th>Rate (PKR)</th><th>Value (PKR)</th>{isAdmin() && <th>Action</th>}</tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={10} className="empty">No issuance entries yet</td></tr>
            ) : entries.map(r => {
              const item = activeItems.find(i => i.id === r.itemId) || { name: r.itemId };
              const rate = getItemRate(r.itemId);
              const value = rate * r.qty;
              return (
                <tr key={r.id}>
                  <td style={{ fontSize: 11, color: 'var(--txtm)' }}>{r.id}</td>
                  <td>{r.date}</td><td>{r.month}</td>
                  <td style={{ fontSize: 12 }}>{r.jc || '—'}</td>
                  <td><span className="badge badge-purple">{r.type}</span></td>
                  <td>{item.name}</td>
                  <td style={{ color: '#e34948', fontWeight: 500 }}>-{r.qty}</td>
                  <td>{rate ? `PKR ${Number(rate).toLocaleString()}` : '—'}</td>
                  <td style={{ color: '#e34948' }}>{value ? `PKR ${value.toLocaleString()}` : '—'}</td>
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
        <div className="pagination"><span>{entries.length} entries</span></div>
      </div>

      {modal?.type === 'add' && (
        <IssuanceModal activeItems={activeItems} state={state} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {deleteAllConfirm && <DeleteAllConfirm module="Stock Issuance" onConfirm={handleDeleteAll} onCancel={() => setDeleteAllConfirm(false)} />}
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

function IssuanceModal({ activeItems, state, onSave, onClose }) {
  const [form, setForm] = useState({ date: TODAY, jc: '', type: 'Production', month: CURRENT_MONTH, itemId: activeItems[0]?.id || '', qty: 1 });
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  function save() {
    const qty = parseInt(form.qty) || 0;
    if (!qty) { alert('Qty must be > 0'); return; }
    const { close } = getStock(form.itemId, state.opening, state.receiving, state.issuance, state.adjustments);
    if (qty > close) { alert(`Insufficient stock. Closing balance: ${close}`); return; }
    onSave({ ...form, qty, id: 'ISS-' + Date.now() });
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
          <select value={form.type} onChange={f('type')}>{['Production','Transfer Out','Sample'].map(t => <option key={t}>{t}</option>)}</select>
        </div>
        <div className="form-group"><label>Month</label>
          <select value={form.month} onChange={f('month')}>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}><label>Item</label>
        <select value={form.itemId} onChange={f('itemId')}>{activeItems.map(i => <option key={i.id} value={i.id}>{i.id} – {i.name}</option>)}</select>
      </div>
      <div className="form-group"><label>Qty</label><input type="number" value={form.qty} min="1" onChange={f('qty')} /></div>
    </Modal>
  );
}
