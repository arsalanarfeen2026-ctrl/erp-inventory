import React, { useState } from 'react';
import { ITEMS } from '../data/items';
import { useItems } from '../context/ItemContext';
import ExcelToolbar from '../components/ExcelToolbar';
import { useAuth } from '../context/AuthContext';
import { exportStockOpening, downloadOpeningTemplate, parseOpeningImport } from '../utils/excelUtils';
import { DeleteAllConfirm } from './MonthlyDemand';

export default function StockOpening({ state, dispatch, openModal, setTopbarActions, showToast }) {
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
        <button className="btn btn-primary" onClick={() => openModal('edit-opening')}>
          <i className="ti ti-edit" /> Edit opening
        </button>
      </div>
    );
  }, []);

  async function handleImport(file) {
    setImporting(true);
    try {
      const data = await parseOpeningImport(file);
      // data = { itemId: { qty, valuation, section, cat } }
      const qtyUpdate = {};
      const valUpdate = {};
      Object.entries(data).forEach(([id, v]) => {
        qtyUpdate[id] = v.qty;
        valUpdate[id] = v.valuation;
      });
      dispatch({ type: 'SET_OPENING_BULK',      data: { ...state.opening,          ...qtyUpdate } });
      dispatch({ type: 'SET_OPENING_VALUATION', data: { ...state.openingValuation, ...valUpdate } });
      showToast(`Imported — ${Object.keys(data).length} items updated`);
    } catch (e) {
      showToast(e.message || 'Import failed — check template fields', 'danger');
    }
    setImporting(false);
  }

  function handleDeleteAll() {
    const reset = Object.fromEntries(ITEMS.map(i => [i.id, 0]));
    dispatch({ type: 'SET_OPENING_BULK', data: reset });
    addAuditEntry({ type: 'DELETE', module: 'Stock Opening', user: currentUser?.username, details: 'Reset all opening stock to 0' });
    showToast('All opening stock reset', 'danger');
    setDeleteAllConfirm(false);
  }

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
        onExport={() => { exportStockOpening(state.opening, state.openingValuation || {}, list); showToast('Exported'); }}
        onTemplate={() => { downloadOpeningTemplate(list); showToast('Template downloaded'); }}
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
            <tr><th>Sr</th><th>Item ID</th><th>Item</th><th>Section</th><th>Category</th><th>UOM</th><th>Sheet packing</th><th>Opening qty</th><th>Valuation (PKR)</th></tr>
          </thead>
          <tbody>
            {list.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ color: 'var(--txtm)' }}>{idx + 1}</td>
                <td style={{ fontSize: 12, color: 'var(--txtm)' }}>{item.id}</td>
                <td>{item.name}</td>
                <td><span className="badge badge-purple">{item.section || '—'}</span></td>
                <td><span className="badge badge-info">{item.cat || '—'}</span></td>
                <td>{item.uom}</td>
                <td>{item.packing}</td>
                <td style={{ fontWeight: 500 }}>{state.opening[item.id] || 0}</td>
                <td style={{ color: '#2a78d6' }}>
                  {state.openingValuation?.[item.id]
                    ? `PKR ${Number(state.openingValuation[item.id]).toLocaleString()}`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination"><span>{list.length} items</span></div>
      </div>

      {deleteAllConfirm && <DeleteAllConfirm module="Stock Opening" onConfirm={handleDeleteAll} onCancel={() => setDeleteAllConfirm(false)} />}
    </>
  );
}
