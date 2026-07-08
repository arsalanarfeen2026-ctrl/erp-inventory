import React, { useState } from 'react';
import { useItems } from '../context/ItemContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { getStock } from '../utils/stockCalc';
import { DEFAULT_SECTIONS, DEFAULT_CATEGORIES, DEFAULT_UOMS } from '../data/items';
import { DeleteAllConfirm } from './MonthlyDemand';

// Combo input — type OR select from list
function ComboInput({ label, value, onChange, options, required }) {
  const id = 'dl-' + label.replace(/\s+/g, '-');
  return (
    <div className="form-group">
      <label>{label}{required ? ' *' : ''}</label>
      <input
        list={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Type or select…`}
        style={{ width: '100%', padding: '7px 10px', border: '0.5px solid var(--bd)', borderRadius: 6, background: 'var(--sur2)', fontSize: 13 }}
      />
      <datalist id={id}>
        {options.map(o => <option key={o} value={o} />)}
      </datalist>
    </div>
  );
}

export default function ItemMaster({ state, dispatch, setTopbarActions, showToast }) {
  const { items, addItem, updateItem, toggleItemStatus } = useItems();
  const { can, isAdmin, addAuditEntry, currentUser } = useAuth();
  const [search, setSearch]             = useState('');
  const [filterSection, setFilterSection] = useState('All');
  const [filterCat, setFilterCat]       = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modal, setModal]               = useState(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);

  React.useEffect(() => {
    setTopbarActions(
      <div style={{ display: 'flex', gap: 8 }}>
        {isAdmin() && (
          <button className="btn" onClick={() => setDeleteAllConfirm(true)}
            style={{ color: '#e34948', borderColor: 'rgba(227,73,72,0.3)' }}>
            <i className="ti ti-trash" /> Delete all
          </button>
        )}
        {can('items', 'create') && (
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
            <i className="ti ti-plus" /> Add item
          </button>
        )}
      </div>
    );
  }, []);

  const sections = ['All', ...new Set(items.map(i => i.section).filter(Boolean))];
  const cats     = ['All', ...new Set(items.map(i => i.cat).filter(Boolean))];

  let list = items;
  if (filterSection !== 'All') list = list.filter(i => i.section === filterSection);
  if (filterCat !== 'All')     list = list.filter(i => i.cat === filterCat);
  if (filterStatus !== 'All')  list = list.filter(i => i.status === filterStatus);
  if (search) list = list.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.id.toLowerCase().includes(search.toLowerCase())
  );

  function handleSave(data) {
    if (modal.type === 'add') {
      const id = addItem(data);
      addAuditEntry({ type: 'ITEM_CREATED', module: 'Items', user: currentUser?.username, details: `Created: ${id} - ${data.name}` });
      showToast(`Item ${id} created`);
    } else {
      updateItem(modal.item.id, data);
      addAuditEntry({ type: 'ITEM_UPDATED', module: 'Items', user: currentUser?.username, details: `Updated: ${modal.item.id}` });
      showToast('Item updated');
    }
    setModal(null);
  }

  function handleDeleteAll() {
    addAuditEntry({ type: 'DELETE', module: 'Items', user: currentUser?.username, details: 'Deleted all item records' });
    showToast('All item records deleted', 'danger');
    setDeleteAllConfirm(false);
  }

  return (
    <>
      <div className="search-bar">
        <i className="ti ti-search" style={{ color: 'var(--txtm)' }} />
        <input placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Section filter */}
      <div className="filter-row">
        <span style={{ fontSize: 12, color: 'var(--txtm)', fontWeight: 500 }}>Section:</span>
        {sections.map(s => (
          <button key={s} className={`btn btn-sm ${filterSection === s ? 'btn-primary' : ''}`}
            onClick={() => setFilterSection(s)}>{s}</button>
        ))}
      </div>

      {/* Category filter */}
      <div className="filter-row">
        <span style={{ fontSize: 12, color: 'var(--txtm)', fontWeight: 500 }}>Category:</span>
        {cats.map(c => (
          <button key={c} className={`btn btn-sm ${filterCat === c ? 'btn-primary' : ''}`}
            onClick={() => setFilterCat(c)}>{c}</button>
        ))}
        <span style={{ fontSize: 12, color: 'var(--txtm)', fontWeight: 500, marginLeft: 12 }}>Status:</span>
        {['All', 'Active', 'Inactive'].map(s => (
          <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : ''}`}
            onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item ID</th><th>Item Name</th><th>Section</th><th>Category</th>
              <th>UOM</th><th>Packing</th><th>Closing</th>
              <th>Lead Time</th><th>Safety Stock</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(item => {
              const { close } = getStock(item.id, state.opening, state.receiving, state.issuance, state.adjustments);
              return (
                <tr key={item.id} style={{ opacity: item.status === 'Inactive' ? 0.6 : 1 }}>
                  <td style={{ fontSize: 12, color: 'var(--txtm)', fontWeight: 500 }}>{item.id}</td>
                  <td>{item.name}</td>
                  <td><span className="badge badge-purple">{item.section || '—'}</span></td>
                  <td><span className="badge badge-info">{item.cat || '—'}</span></td>
                  <td>{item.uom}</td>
                  <td>{item.packing}</td>
                  <td style={{ fontWeight: 500 }}>{close}</td>
                  <td>
                    <input type="number" className="inline-input" value={state.leadTime[item.id] || 7} min="1"
                      onChange={e => dispatch({ type: 'SET_LEAD_TIME', itemId: item.id, value: parseInt(e.target.value) || 7 })} />
                  </td>
                  <td>
                    <input type="number" className="inline-input" value={state.safetyStock[item.id] || 0} min="0"
                      onChange={e => dispatch({ type: 'SET_SAFETY_STOCK', itemId: item.id, value: parseInt(e.target.value) || 0 })} />
                  </td>
                  <td><span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{item.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {can('items', 'edit') && (
                        <button className="btn btn-sm" onClick={() => setModal({ type: 'edit', item })} title="Edit">
                          <i className="ti ti-edit" />
                        </button>
                      )}
                      {can('items', 'edit') && (
                        <button className="btn btn-sm"
                          onClick={() => toggleItemStatus(item.id)}
                          style={{ color: item.status === 'Active' ? '#e34948' : '#1baf7a' }}
                          title={item.status === 'Active' ? 'Deactivate' : 'Activate'}>
                          <i className={`ti ${item.status === 'Active' ? 'ti-ban' : 'ti-check'}`} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pagination">
          <span>{list.length} items ({items.filter(i => i.status === 'Active').length} active)</span>
        </div>
      </div>

      {modal && (
        <ItemModal type={modal.type} item={modal.item} allItems={items}
          onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {deleteAllConfirm && (
        <DeleteAllConfirm module="Item Master" onConfirm={handleDeleteAll} onCancel={() => setDeleteAllConfirm(false)} />
      )}
    </>
  );
}

function ItemModal({ type, item, allItems, onSave, onClose }) {
  const existingSections = [...new Set([...DEFAULT_SECTIONS, ...allItems.map(i => i.section).filter(Boolean)])];
  const existingCats     = [...new Set([...DEFAULT_CATEGORIES, ...allItems.map(i => i.cat).filter(Boolean)])];
  const existingUoms     = [...new Set([...DEFAULT_UOMS, ...allItems.map(i => i.uom).filter(Boolean)])];

  const [form, setForm] = useState({
    name:    item?.name    || '',
    section: item?.section || '',
    cat:     item?.cat     || '',
    uom:     item?.uom     || '',
    packing: item?.packing || 100,
    status:  item?.status  || 'Active',
  });
  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  function save() {
    if (!form.name)    { alert('Item name is required');  return; }
    if (!form.section) { alert('Section is required');    return; }
    if (!form.cat)     { alert('Category is required');   return; }
    if (!form.uom)     { alert('UOM is required');        return; }
    onSave(form);
  }

  return (
    <Modal title={type === 'add' ? 'Add new item' : `Edit — ${item?.id}`} onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}><i className="ti ti-check" /> Save</button>
        </>
      }>

      {/* Item Name */}
      <div className="form-group" style={{ marginBottom: 14 }}>
        <label>Item name *</label>
        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="e.g. Art Paper 128 GSM 25×36"
          style={{ width: '100%', padding: '7px 10px', border: '0.5px solid var(--bd)', borderRadius: 6, background: 'var(--sur2)', fontSize: 13 }} />
      </div>

      {/* Section — full width */}
      <div style={{ marginBottom: 14 }}>
        <ComboInput label="Section" required value={form.section} onChange={set('section')} options={existingSections} />
      </div>

      {/* Category — full width */}
      <div style={{ marginBottom: 14 }}>
        <ComboInput label="Category" required value={form.cat} onChange={set('cat')} options={existingCats} />
      </div>

      {/* UOM + Packing */}
      <div className="form-row">
        <ComboInput label="UOM" required value={form.uom} onChange={set('uom')} options={existingUoms} />
        <div className="form-group">
          <label>Sheet packing (pcs)</label>
          <input type="number" value={form.packing} min="1"
            onChange={e => setForm(p => ({ ...p, packing: parseInt(e.target.value) || 1 }))}
            style={{ width: '100%', padding: '7px 10px', border: '0.5px solid var(--bd)', borderRadius: 6, background: 'var(--sur2)', fontSize: 13 }} />
        </div>
      </div>

      {/* Status */}
      <div className="form-group">
        <label>Status</label>
        <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
          style={{ width: '100%', padding: '7px 10px', border: '0.5px solid var(--bd)', borderRadius: 6, background: 'var(--sur2)', fontSize: 13 }}>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>
    </Modal>
  );
}
