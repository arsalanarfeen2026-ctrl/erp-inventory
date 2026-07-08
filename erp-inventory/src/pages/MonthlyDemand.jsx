import React, { useState } from 'react';
import { ITEMS } from '../data/items';
import { useItems } from '../context/ItemContext';
import ExcelToolbar from '../components/ExcelToolbar';
import { useAuth } from '../context/AuthContext';
import { exportMonthlyDemand, downloadDemandTemplate, parseDemandImport } from '../utils/excelUtils';

export function DeleteAllConfirm({ module, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <span className="modal-title" style={{ color: '#e34948' }}>
            <i className="ti ti-alert-triangle" /> Delete All — {module}
          </span>
        </div>
        <div className="alert alert-danger">
          <i className="ti ti-trash" />
          <div>
            <b>Permanently delete ALL records in {module}?</b><br />
            <span style={{ fontSize: 12 }}>This cannot be undone and will be logged in the audit trail.</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}><i className="ti ti-trash" /> Delete all</button>
        </div>
      </div>
    </div>
  );
}

export default function MonthlyDemand({ state, dispatch, openModal, setTopbarActions, showToast }) {
  const { items } = useItems();
  const [importing, setImporting] = useState(false);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [filterSection, setFilterSection] = useState('All');
  const [filterCat, setFilterCat] = useState('All');
  const { isAdmin, addAuditEntry, currentUser } = useAuth();

  React.useEffect(() => {
    setTopbarActions(
      <div style={{ display: 'flex', gap: 8 }}>
        {isAdmin() && (
          <button className="btn" onClick={() => setDeleteAllConfirm(true)}
            style={{ color: '#e34948', borderColor: 'rgba(227,73,72,0.3)' }}>
            <i className="ti ti-trash" /> Delete all
          </button>
        )}
        <button className="btn btn-primary" onClick={() => openModal('edit-demand')}>
          <i className="ti ti-edit" /> Edit demand
        </button>
      </div>
    );
  }, []);

  async function handleImport(file) {
    setImporting(true);
    try {
      const data = await parseDemandImport(file);
      // data = { itemId: { qty, section, cat } }
      const demandUpdate = {};
      Object.entries(data).forEach(([id, v]) => { demandUpdate[id] = v.qty; });
      dispatch({ type: 'SET_MONTHLY_DEMAND_BULK', data: { ...state.monthlyDemand, ...demandUpdate } });
      showToast(`Imported — ${Object.keys(data).length} items updated`);
    } catch (e) {
      showToast(e.message || 'Import failed — check template fields', 'danger');
    }
    setImporting(false);
  }

  function handleDeleteAll() {
    const reset = Object.fromEntries(ITEMS.map(i => [i.id, 0]));
    dispatch({ type: 'SET_MONTHLY_DEMAND_BULK', data: reset });
    addAuditEntry({ type: 'DELETE', module: 'Monthly Demand', user: currentUser?.username, details: 'Reset all monthly demand to 0' });
    showToast('All demand records reset', 'danger');
    setDeleteAllConfirm(false);
  }

  // Merge items with sections/categories from ItemContext
  const allItems = ITEMS.map(i => {
    const meta = items.find(x => x.id === i.id) || i;
    return { ...i, section: meta.section, cat: meta.cat };
  });

  const sections = ['All', ...new Set(allItems.map(i => i.section).filter(Boolean))];
  const cats     = ['All', ...new Set(allItems.map(i => i.cat).filter(Boolean))];

  let list = allItems;
  if (filterSection !== 'All') list = list.filter(i => i.section === filterSection);
  if (filterCat !== 'All')     list = list.filter(i => i.cat === filterCat);

  return (
    <>
      <ExcelToolbar
        onExport={() => { exportMonthlyDemand(state.monthlyDemand, list); showToast('Exported'); }}
        onTemplate={() => { downloadDemandTemplate(list); showToast('Template downloaded'); }}
        onImport={handleImport} importing={importing}
      />

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
            <tr><th>Sr</th><th>Item ID</th><th>Item</th><th>Section</th><th>Category</th><th>UOM</th><th>Sheet packing</th><th>Monthly demand</th><th>Daily demand</th></tr>
          </thead>
          <tbody>
            {list.map((item, idx) => {
              const md = state.monthlyDemand[item.id] || 0;
              return (
                <tr key={item.id}>
                  <td style={{ color: 'var(--txtm)' }}>{idx + 1}</td>
                  <td style={{ fontSize: 12, color: 'var(--txtm)' }}>{item.id}</td>
                  <td>{item.name}</td>
                  <td><span className="badge badge-purple">{item.section || '—'}</span></td>
                  <td><span className="badge badge-info">{item.cat || '—'}</span></td>
                  <td>{item.uom}</td>
                  <td>{item.packing}</td>
                  <td style={{ fontWeight: 500 }}>{md}</td>
                  <td>{(md / 30).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pagination"><span>{list.length} items</span></div>
      </div>

      {deleteAllConfirm && <DeleteAllConfirm module="Monthly Demand" onConfirm={handleDeleteAll} onCancel={() => setDeleteAllConfirm(false)} />}
    </>
  );
}
