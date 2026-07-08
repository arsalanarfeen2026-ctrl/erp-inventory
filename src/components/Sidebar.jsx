import React from 'react';

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',       icon: 'ti-layout-dashboard' },
  { id: 'items',      label: 'Item master',      icon: 'ti-box' },
  null,
  { id: 'demand',     label: 'Monthly demand',   icon: 'ti-chart-line',     section: 'Inventory' },
  { id: 'opening',    label: 'Stock opening',    icon: 'ti-door-enter' },
  { id: 'receiving',  label: 'Stock receiving',  icon: 'ti-truck-delivery' },
  { id: 'issuance',   label: 'Stock issuance',   icon: 'ti-package-export' },
  { id: 'adjustment', label: 'Stock adjustment', icon: 'ti-adjustments' },
  null,
  { id: 'reports',    label: 'Reports',          icon: 'ti-report',         section: 'Analysis' },
  { id: 'kpi',        label: 'KPI & alerts',     icon: 'ti-activity' },
  null,
  { id: 'users',      label: 'User management',  icon: 'ti-users',          section: 'Admin', adminOnly: true },
  { id: 'audit',      label: 'Audit log',        icon: 'ti-clipboard-list', adminOnly: true },
];

export default function Sidebar({ active, onNav, alertCount, isAdmin, canUsers }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand" style={{ fontSize: 13, lineHeight: 1.3 }}><i className="ti ti-package" style={{ color: '#2a78d6' }} />Utopia Production</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary,#0b0b0b)', paddingLeft: 26, lineHeight: 1.3 }}>Printing Inventory</div>
        <div className="sub" style={{ paddingLeft: 26, marginTop: 4 }}>Inventory Management</div>
      </div>
      <nav>
        {NAV.map((n, i) => {
          if (!n) return <div key={i} style={{ height: 4 }} />;
          if (n.adminOnly && !isAdmin && !canUsers) return null;
          return (
            <React.Fragment key={n.id}>
              {n.section && <div className="nav-section">{n.section}</div>}
              <button className={`nav-item ${active === n.id ? 'active' : ''}`} onClick={() => onNav(n.id)}>
                <i className={`ti ${n.icon}`} aria-hidden="true" />
                <span>{n.label}</span>
                {n.id === 'kpi' && alertCount > 0 && <span className="nav-badge">{alertCount}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
}
