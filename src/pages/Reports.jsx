import React, { useState } from 'react';
import { ITEMS, MONTHS } from '../data/items';

export default function Reports({ state, setTopbarActions }) {
  const [tab, setTab] = useState(0);
  const { receiving, issuance, opening } = state;

  React.useEffect(() => { setTopbarActions(null); }, []);

  const tabs = ['Item-wise consumption', 'Month-wise consumption'];

  function ItemWise() {
    const rows = ITEMS.map(i => {
      const rcv = receiving.filter(r => r.itemId === i.id).reduce((a, r) => a + r.qty, 0);
      const iss = issuance.filter(r => r.itemId === i.id).reduce((a, r) => a + r.qty, 0);
      const avg = ((opening[i.id] || 0) + rcv) / 2;
      const turnover = avg > 0 ? (iss / avg).toFixed(2) : '—';
      return { i, rcv, iss, turnover };
    }).sort((a, b) => b.iss - a.iss);

    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Item ID</th><th>Item</th><th>UOM</th><th>Received</th><th>Issued</th><th>Turnover</th><th>Trend</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.i.id}>
                <td style={{ fontSize: 12, color: 'var(--txtm)' }}>{r.i.id}</td>
                <td>{r.i.name}</td>
                <td>{r.i.uom}</td>
                <td style={{ color: '#1baf7a' }}>{r.rcv}</td>
                <td style={{ color: '#e34948' }}>{r.iss}</td>
                <td>{r.turnover}{typeof r.turnover === 'string' ? '' : 'x'}</td>
                <td>
                  <div style={{ width: 80, background: 'var(--sur1)', borderRadius: 4, height: 14, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(r.iss * 8, 100)}%`, height: '100%', background: '#2a78d6', borderRadius: 4 }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function MonthWise() {
    const data = MONTHS.map(m => ({
      m,
      rcv: receiving.filter(r => r.month === m).reduce((a, r) => a + r.qty, 0),
      iss: issuance.filter(r => r.month === m).reduce((a, r) => a + r.qty, 0),
    }));
    const maxV = Math.max(...data.flatMap(x => [x.rcv, x.iss]), 1);

    return (
      <div className="chart-wrap">
        <div className="chart-title">Monthly receiving vs issuance</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, background: '#1baf7a', borderRadius: 2, display: 'inline-block' }} />Received
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, background: '#e34948', borderRadius: 2, display: 'inline-block' }} />Issued
          </span>
        </div>
        {data.map(x => (
          <div key={x.m} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--txtm)', marginBottom: 4 }}>{x.m} 2026</div>
            <div className="bar-row">
              <div style={{ width: 80, fontSize: 12, color: '#1baf7a' }}>Received</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(x.rcv / maxV * 100)}%`, background: '#1baf7a' }} /></div>
              <div className="bar-val">{x.rcv}</div>
            </div>
            <div className="bar-row">
              <div style={{ width: 80, fontSize: 12, color: '#e34948' }}>Issued</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(x.iss / maxV * 100)}%`, background: '#e34948' }} /></div>
              <div className="bar-val">{x.iss}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="tab-bar">
        {tabs.map((t, i) => (
          <button key={i} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>
      {tab === 0 ? <ItemWise /> : <MonthWise />}
    </>
  );
}
