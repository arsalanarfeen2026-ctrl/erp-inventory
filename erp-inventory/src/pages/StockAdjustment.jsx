import React, { useState } from 'react';
import { useItems } from '../context/ItemContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ExcelToolbar from '../components/ExcelToolbar';
import { exportStockAdjustment, downloadAdjustmentTemplate, parseAdjustmentImport } from '../utils/excelUtils';
import { MONTHS, CURRENT_MONTH, TODAY } from '../data/items';
import { DeleteAllConfirm } from './MonthlyDemand';

export default function StockAdjustment({ state, dispatch, setTopbarActions, showToast }) {
  const { activeItems } = useItems();
  const { can, isAdmin, addAuditEntry, currentUser } = useAuth();
  const [modal, setModal] = useState(null);
  const [importing, setImporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);

  React.useEffect(() => {
    setTopbarActions(
      can('adjustment', 'create') ? (
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin() && (
            <button className="btn" onClick={() => setDeleteAllConfirm(true)} style={{ color: '#e34948', borderColor: 'rgba(227,73,72,0.3)' }}>
              <i className="ti ti-trash" /> Delete all
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
            <i className="ti ti-plus" /> Add adjustment
          </button>
        </div>
      ) : null
    );
  }, []);

  function handleSave(entry) {
    dispatch({ type: 'ADD_ADJUSTMENT', entry });
    addAuditEntry({ type: 'CREATE', module: 'Stock Adjustment', user: currentUser?.username, details: `Added adjustment: ${entry.id} — ${entry.itemId} Qty: ${entry.qty} Reason: ${entry.reason}` });
    showToast('Adjustment saved');
    setModal(null);
  }

  function confirmDelete() {
    dispatch({ type: 'DELETE_ADJUSTMENT', id: deleteConfirm.id });
    addAuditEntry({ type: 'DELETE', module: 'Stock Adjustment', user: currentUser?.username, details: `Deleted: ${deleteConfirm.id} — ${deleteConfirm.itemId}` });
    showToast('Entry deleted', 'danger');
    setDeleteConfirm(null);
  }

  async function handleImport(file) {
    setImporting(true);
    try {
      const entries = await parseAdjustmentImport(file);
      if (!entries.length) { showToast('No valid rows', 'warning'); setImporting(false); return; }
      entries.forEach(entry => dispatch({ type: 'ADD_ADJUSTMENT', entry }));
      showToast(`${entries.length} entries imported`);
    } catch { showToast('Import failed', 'danger'); }
    setImporting(false);
  }

  function handleDeleteAll() {
    dispatch({ type: 'DELETE_ALL_ADJUSTMENT' });
    addAuditEntry({ type: 'DELETE', module: 'Stock Adjustment', user: currentUser?.username, details: 'Deleted all adjustment records' });
    showToast('All adjustment records deleted', 'danger');
    setDeleteAllConfirm(false);
  }

  const entries = [...state.adjustments].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      {can('adjustment', 'create') && (
        <ExcelToolbar
          onExport={() => { exportStockAdjustment(state.adjustments); showToast('Exported'); }}
          onTemplate={() => { downloadAdjustmentTemplate(); showToast('Template downloaded'); }}
          onImport={handleImport}
          importing={importing}
        />
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Date</th><th>Month</th><th>Ref</th><th>Item</th><th>Qty</th><th>Reason</th>{isAdmin() && <th>Action</th>}</tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={8} className="empty">No adjustment entries</td></tr>
            ) : entries.map(r => {
              const item = activeItems.find(i => i.id === r.itemId) || { name: r.itemId };
              return (
                <tr key={r.id}>
                  <td style={{ fontSize: 11, color: 'var(--txtm)' }}>{r.id}</td>
                  <td>{r.date}</td><td>{r.month}</td>
                  <td style={{ fontSize: 12 }}>{r.ref || '—'}</td>
                  <td>{item.name}</td>
                  <td style={{ color: r.qty >= 0 ? '#1baf7a' : '#e34948', fontWeight: 500 }}>
                    {r.qty >= 0 ? '+' + r.qty : r.qty}
                  </td>
                  <td><span className="badge badge-gray">{r.reason || '—'}</span></td>
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
        <AdjModal activeItems={activeItems} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {deleteAllConfirm && <DeleteAllConfirm module="Stock Adjustment" onConfirm={handleDeleteAll} onCancel={() => setDeleteAllConfirm(false)} />}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><span className="modal-title" style={{ color: '#e34948' }}><i className="ti ti-alert-triangle" /> Confirm Delete</span></div>
            <div className="alert alert-danger"><i className="ti ti-trash" /><div><b>Permanently delete this entry?</b><br /><span style={{ fontSize: 12 }}>{deleteConfirm.id} — {deleteConfirm.itemId}</span></div></div>
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

function AdjModal({ activeItems, onSave, onClose }) {
  const [form, setForm] = useState({ date: TODAY, ref: '', month: CURRENT_MONTH, itemId: activeItems[0]?.id || '', qty: 0, reason: 'Damage' });
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  function save() {
    const qty = parseInt(form.qty) || 0;
    if (qty === 0) { alert('Qty cannot be zero'); return; }
    onSave({ ...form, qty, id: 'ADJ-' + Date.now() });
  }

  return (
    <Modal title="Add stock adjustment" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}><i className="ti ti-plus" /> Add</button></>}>
      <div className="form-row">
        <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={f('date')} /></div>
        <div className="form-group"><label>Ref No.</label><input value={form.ref} onChange={f('ref')} placeholder="ADJ-001" /></div>
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}><label>Month</label>
        <select value={form.month} onChange={f('month')}>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}><label>Item</label>
        <select value={form.itemId} onChange={f('itemId')}>{activeItems.map(i => <option key={i.id} value={i.id}>{i.id} – {i.name}</option>)}</select>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Qty (+/−)</label><input type="number" value={form.qty} onChange={f('qty')} /></div>
        <div className="form-group"><label>Reason</label>
          <select value={form.reason} onChange={f('reason')}>{['Damage','Count Correction','Expiry','Return','Other'].map(r => <option key={r}>{r}</option>)}</select>
        </div>
      </div>
    </Modal>
  );
}
