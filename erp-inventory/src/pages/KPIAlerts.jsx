import React from 'react';
import { ITEMS } from '../data/items';
import { getKPI, getABCClass } from '../utils/stockCalc';

export default function KPIAlerts({ state, setTopbarActions }) {
  React.useEffect(() => { setTopbarActions(null); }, []);

  const { opening, receiving, issuance, adjustments, monthlyDemand, leadTime, safetyStock, maxStock } = state;

  const all = ITEMS.map(item => ({
    item,
    kpi: getKPI(item.id, opening, receiving, issuance, adjustments, monthlyDemand, leadTime, safetyStock, maxStock),
  }));

  const abcMap = getABCClass(ITEMS, issuance);

  const stockouts  = all.filter(x => x.kpi.stockout);
  const reorders   = all.filter(x => x.kpi.reorder && !x.kpi.stockout);
  const overstocks = all.filter(x => x.kpi.overstock);
  const deads      = all.filter(x => x.kpi.deadStock);
  const slow       = all.filter(x => x.kpi.fsn === 'Slow');
  const nonMoving  = all.filter(x => x.kpi.fsn === 'Non-Moving');

  function AlertTable({ title, color, icon, items, extraCol, extraVal }) {
    if (!items.length) {
      return <div className="alert alert-success"><i className="ti ti-check" /><b>{title}:</b> None</div>;
    }
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className={`ti ${icon}`} />{title} ({items.length})
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Closing</th><th>ROP</th><th>Daily demand</th><th>{extraCol}</th></tr>
            </thead>
            <tbody>
              {items.map(x => (
                <tr key={x.item.id}>
                  <td>{x.item.name}</td>
                  <td style={{ color, fontWeight: 500 }}>{x.kpi.close}</td>
                  <td>{x.kpi.rop}</td>
                  <td>{x.kpi.dd.toFixed(2)}</td>
                  <td>{extraVal(x.kpi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Build ABC table
  const abcData = ITEMS.map(item => {
    const iss = issuance.filter(r => r.itemId === item.id).reduce((a, r) => a + r.qty, 0);
    return { item, iss, cls: abcMap[item.id] || 'C' };
  }).sort((a, b) => b.iss - a.iss);

  const totalIss = abcData.reduce((a, x) => a + x.iss, 0);
  let cumPct = 0;
  const abcRows = abcData.map(x => {
    cumPct += totalIss > 0 ? x.iss / totalIss : 0;
    const kpi = getKPI(x.item.id, opening, receiving, issuance, adjustments, monthlyDemand, leadTime, safetyStock, maxStock);
    const fsnColor = kpi.fsn === 'Fast' ? 'badge-success' : kpi.fsn === 'Slow' ? 'badge-warning' : 'badge-gray';
    const clsColor = x.cls === 'A' ? 'badge-danger' : x.cls === 'B' ? 'badge-warning' : 'badge-gray';
    return { ...x, cumPct, fsnColor, clsColor, fsn: kpi.fsn };
  });

  return (
    <>
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card danger"><div className="kpi-label">Stockouts</div><div className="kpi-value">{stockouts.length}</div></div>
        <div className="kpi-card warning"><div className="kpi-label">Reorder alerts</div><div className="kpi-value">{reorders.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Overstock</div><div className="kpi-value">{overstocks.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Dead stock</div><div className="kpi-value">{deads.length}</div></div>
        <div className="kpi-card warning"><div className="kpi-label">Slow moving</div><div className="kpi-value">{slow.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Non-moving</div><div className="kpi-value">{nonMoving.length}</div></div>
      </div>

      <AlertTable title="Stockout alerts"  color="#e34948" icon="ti-alert-circle" items={stockouts}
        extraCol="Days left" extraVal={k => k.dd > 0 ? Math.floor(k.close / k.dd) + 'd' : '—'} />
      <AlertTable title="Reorder alerts"   color="#eda100" icon="ti-bell"         items={reorders}
        extraCol="Days left" extraVal={k => k.dd > 0 ? Math.floor(k.close / k.dd) + 'd' : '—'} />
      <AlertTable title="Overstock alerts" color="#2a78d6" icon="ti-archive"      items={overstocks}
        extraCol="FSN"  extraVal={k => k.fsn} />

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>ABC classification — by issuance volume</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Issued qty</th><th>Cumulative %</th><th>Class</th><th>FSN</th></tr>
            </thead>
            <tbody>
              {abcRows.map(x => (
                <tr key={x.item.id}>
                  <td>{x.item.name}</td>
                  <td>{x.iss}</td>
                  <td>{Math.round(x.cumPct * 100)}%</td>
                  <td><span className={`badge ${x.clsColor}`}>Class {x.cls}</span></td>
                  <td><span className={`badge ${x.fsnColor}`}>{x.fsn}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
