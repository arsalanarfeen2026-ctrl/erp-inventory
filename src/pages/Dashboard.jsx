import React from 'react';
import { ITEMS } from '../data/items';
import { getStock, getKPI } from '../utils/stockCalc';
import BarChart from '../components/BarChart';

export default function Dashboard({ state, onNav, openModal, setTopbarActions }) {
  const { opening, receiving, issuance, adjustments, monthlyDemand, leadTime, safetyStock, maxStock } = state;

  React.useEffect(() => {
    setTopbarActions(
      <button className="btn btn-primary" onClick={() => openModal('add-receiving')}>
        <i className="ti ti-plus" aria-hidden="true" /> Add receiving
      </button>
    );
  }, []);

  const all = ITEMS.map(item => ({
    item,
    ...getStock(item.id, opening, receiving, issuance, adjustments),
    kpi: getKPI(item.id, opening, receiving, issuance, adjustments, monthlyDemand, leadTime, safetyStock, maxStock),
  }));

  const totalRcv   = all.reduce((a, x) => a + x.rcv, 0);
  const totalIss   = all.reduce((a, x) => a + x.iss, 0);
  const totalClose = all.reduce((a, x) => a + x.close, 0);
  const stockouts  = all.filter(x => x.kpi.stockout).length;
  const reorders   = all.filter(x => x.kpi.reorder && !x.kpi.stockout).length;
  const overstock  = all.filter(x => x.kpi.overstock).length;

  const alertItems = all.filter(x => x.kpi.stockout || x.kpi.reorder);

  const topIss = [...all].sort((a, b) => b.iss - a.iss).slice(0, 6).map(x => ({
    label: x.item.name, value: x.iss, unit: x.item.uom,
  }));

  const cats = [...new Set(ITEMS.map(i => i.cat))];
  const catRows = cats.map(c => {
    const total = all.filter(x => x.item.cat === c).reduce((a, x) => a + x.close, 0);
    return { label: c, value: total };
  }).sort((a, b) => b.value - a.value);

  function statusBadge(kpi) {
    if (kpi.stockout)  return <span className="badge badge-danger">Stockout</span>;
    if (kpi.reorder)   return <span className="badge badge-warning">Reorder</span>;
    if (kpi.overstock) return <span className="badge badge-info">Overstock</span>;
    return <span className="badge badge-success">OK</span>;
  }

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Total items</div><div className="kpi-value">{ITEMS.length}</div><div className="kpi-sub">active SKUs</div></div>
        <div className="kpi-card success"><div className="kpi-label">Total receiving</div><div className="kpi-value">{totalRcv}</div><div className="kpi-sub">this period</div></div>
        <div className="kpi-card"><div className="kpi-label">Total issuance</div><div className="kpi-value">{totalIss}</div><div className="kpi-sub">this period</div></div>
        <div className="kpi-card"><div className="kpi-label">Closing stock</div><div className="kpi-value">{totalClose}</div><div className="kpi-sub">all items</div></div>
        <div className="kpi-card danger"><div className="kpi-label">Stockouts</div><div className="kpi-value">{stockouts}</div><div className="kpi-sub">items</div></div>
        <div className="kpi-card warning"><div className="kpi-label">Reorder alerts</div><div className="kpi-value">{reorders}</div><div className="kpi-sub">items</div></div>
        <div className="kpi-card"><div className="kpi-label">Overstock</div><div className="kpi-value">{overstock}</div><div className="kpi-sub">items</div></div>
        <div className="kpi-card"><div className="kpi-label">Inventory accuracy</div><div className="kpi-value">100%</div><div className="kpi-sub">system vs physical</div></div>
      </div>

      {alertItems.length > 0 && (
        <>
          <div className="section-header"><span className="section-title"><i className="ti ti-bell" style={{ color: '#eda100' }} /> Active alerts</span></div>
          {alertItems.slice(0, 5).map(x => (
            <div key={x.item.id} className={`alert ${x.kpi.stockout ? 'alert-danger' : 'alert-warning'}`}>
              <i className={`ti ${x.kpi.stockout ? 'ti-alert-circle' : 'ti-bell'}`} />
              {x.kpi.stockout
                ? `Stockout — ${x.item.name} has zero stock`
                : `Reorder needed — ${x.item.name} (closing: ${x.close}, ROP: ${x.kpi.rop})`}
            </div>
          ))}
        </>
      )}

      <div className="two-col">
        <BarChart title="Top items by issuance" rows={topIss} color="#2a78d6" />
        <BarChart title="Closing stock by category" rows={catRows} color="#1baf7a" />
      </div>

      <div className="section-header">
        <span className="section-title">Stock summary — all items</span>
        <button className="btn" onClick={() => onNav('reports')}>
          <i className="ti ti-report" aria-hidden="true" /> Full report
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item ID</th><th>Item</th><th>UOM</th>
              <th>Opening</th><th>Received</th><th>Issued</th><th>Adj</th>
              <th>Closing</th><th>ROP</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {all.map(x => (
              <tr key={x.item.id} onClick={() => openModal('item-detail', x.item.id)} style={{ cursor: 'pointer' }}>
                <td style={{ fontSize: 12, color: 'var(--txtm)' }}>{x.item.id}</td>
                <td>{x.item.name}</td>
                <td>{x.item.uom}</td>
                <td>{x.open}</td>
                <td style={{ color: '#1baf7a' }}>{x.rcv}</td>
                <td style={{ color: '#e34948' }}>{x.iss}</td>
                <td style={{ color: '#eda100' }}>{x.adj >= 0 ? '+' + x.adj : x.adj}</td>
                <td style={{ fontWeight: 500 }}>{x.close}</td>
                <td style={{ fontSize: 12 }}>{x.kpi.rop}</td>
                <td>{statusBadge(x.kpi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
