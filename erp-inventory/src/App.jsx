import React, { useReducer, useState, useCallback, useEffect } from 'react';
import { BASE_ITEMS } from './data/items';
import { generateSeedData } from './data/seedData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ItemProvider } from './context/ItemContext';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ItemMaster from './pages/ItemMaster';
import MonthlyDemand from './pages/MonthlyDemand';
import StockOpening from './pages/StockOpening';
import StockReceiving from './pages/StockReceiving';
import StockIssuance from './pages/StockIssuance';
import StockAdjustment from './pages/StockAdjustment';
import Reports from './pages/Reports';
import KPIAlerts from './pages/KPIAlerts';
import UserManagement from './pages/UserManagement';
import AuditLog from './pages/AuditLog';
import { getKPI } from './utils/stockCalc';
import {
  loadAllData, saveReceiving, saveIssuance,
  saveAdjustment, saveDemand, saveOpening,
  saveLeadTime, saveSafetyStock,
} from './utils/api';

const seed = generateSeedData();

const PAGE_TITLES = {
  dashboard: 'Dashboard', items: 'Item Master', demand: 'Monthly Demand',
  opening: 'Stock Opening', receiving: 'Stock Receiving', issuance: 'Stock Issuance',
  adjustment: 'Stock Adjustment', reports: 'Reports', kpi: 'KPI & Alerts',
  users: 'User Management', audit: 'Audit Log',
};

function initState() {
  return {
    monthlyDemand: Object.fromEntries(BASE_ITEMS.map(i => [i.id, i.uom === 'Pcs' ? 200 : i.packing <= 100 ? 5 : 3])),
    opening:       Object.fromEntries(BASE_ITEMS.map((i, idx) => [i.id, (idx % 5) + 3])),
    receiving:     seed.receiving,
    issuance:      seed.issuance,
    adjustments:   seed.adjustments,
    leadTime:      Object.fromEntries(BASE_ITEMS.map(i => [i.id, 7])),
    safetyStock:   Object.fromEntries(BASE_ITEMS.map(i => [i.id, 2])),
    maxStock:        Object.fromEntries(BASE_ITEMS.map(i => [i.id, 20])),
    openingValuation: Object.fromEntries(BASE_ITEMS.map(i => [i.id, 0])),
    dbLoaded:        false,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_FROM_DB':           return { ...state, ...action.data, dbLoaded: true };
    case 'ADD_RECEIVING':          return { ...state, receiving:   [...state.receiving,   action.entry] };
    case 'ADD_ISSUANCE':           return { ...state, issuance:    [...state.issuance,    action.entry] };
    case 'ADD_ADJUSTMENT':         return { ...state, adjustments: [...state.adjustments, action.entry] };
    case 'DELETE_RECEIVING':       return { ...state, receiving:   state.receiving.filter(r => r.id !== action.id) };
    case 'DELETE_ISSUANCE':        return { ...state, issuance:    state.issuance.filter(r => r.id !== action.id) };
    case 'DELETE_ADJUSTMENT':      return { ...state, adjustments: state.adjustments.filter(r => r.id !== action.id) };
    case 'DELETE_ALL_RECEIVING':   return { ...state, receiving:   [] };
    case 'DELETE_ALL_ISSUANCE':    return { ...state, issuance:    [] };
    case 'DELETE_ALL_ADJUSTMENT':  return { ...state, adjustments: [] };
    case 'SET_MONTHLY_DEMAND_BULK': return { ...state, monthlyDemand: action.data };
    case 'SET_OPENING_BULK':       return { ...state, opening: action.data };
    case 'SET_OPENING_VALUATION':  return { ...state, openingValuation: action.data };
    case 'SET_LEAD_TIME':          return { ...state, leadTime:    { ...state.leadTime,    [action.itemId]: action.value } };
    case 'SET_SAFETY_STOCK':       return { ...state, safetyStock: { ...state.safetyStock, [action.itemId]: action.value } };
    default: return state;
  }
}

function AppInner() {
  const { currentUser, login, logout, can, isAdmin } = useAuth();
  const [state, dispatch] = useReducer(reducer, null, initState);
  const [nav, setNav] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [topbarActions, setTopbarActionsRaw] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);

  const setTopbarActions = useCallback(el => setTopbarActionsRaw(el), []);

  useEffect(() => {
    if (!currentUser) return;
    setDbLoading(true);
    loadAllData()
      .then(db => {
        const merged = {};
        if (db.demand    && Object.keys(db.demand).length)     merged.monthlyDemand = db.demand;
        if (db.opening   && Object.keys(db.opening).length)    merged.opening       = db.opening;
        if (db.receiving && db.receiving.length)                merged.receiving     = db.receiving;
        if (db.issuance  && db.issuance.length)                 merged.issuance      = db.issuance;
        if (db.adjustment && db.adjustment.length)              merged.adjustments   = db.adjustment;
        if (db.leadtime  && Object.keys(db.leadtime).length)    merged.leadTime      = db.leadtime;
        if (db.safetystock && Object.keys(db.safetystock).length) merged.safetyStock = db.safetystock;
        dispatch({ type: 'LOAD_FROM_DB', data: merged });
      })
      .catch(() => dispatch({ type: 'LOAD_FROM_DB', data: {} }))
      .finally(() => setDbLoading(false));
  }, [currentUser]);

  if (!currentUser) return <Login onLogin={(u, p) => login(u, p)} />;

  if (dbLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1efe8' }}>
      <div style={{ textAlign: 'center' }}>
        <i className="ti ti-loader-2" style={{ fontSize: 40, color: '#2a78d6', animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 12, fontSize: 14, color: '#52514e' }}>Loading inventory data…</div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    </div>
  );

  function showToast(msg, type = 'success') { setToast({ msg, type, key: Date.now() }); }

  function dbDispatch(action) {
    dispatch(action);
    switch (action.type) {
      case 'ADD_RECEIVING':           saveReceiving(action.entry).catch(() => {}); break;
      case 'ADD_ISSUANCE':            saveIssuance(action.entry).catch(() => {}); break;
      case 'ADD_ADJUSTMENT':          saveAdjustment(action.entry).catch(() => {}); break;
      case 'SET_MONTHLY_DEMAND_BULK': saveDemand(action.data).catch(() => {}); break;
      case 'SET_OPENING_BULK':        saveOpening(action.data).catch(() => {}); break;
      case 'SET_LEAD_TIME':           saveLeadTime(action.itemId, action.value).catch(() => {}); break;
      case 'SET_SAFETY_STOCK':        saveSafetyStock(action.itemId, action.value).catch(() => {}); break;
    }
  }

  const alertCount = BASE_ITEMS.filter(i => {
    const k = getKPI(i.id, state.opening, state.receiving, state.issuance, state.adjustments,
      state.monthlyDemand, state.leadTime, state.safetyStock, state.maxStock);
    return k.stockout || k.reorder || k.overstock;
  }).length;

  const pageProps = { state, dispatch: dbDispatch, setTopbarActions, onNav: setNav, showToast };

  const PAGES = {
    dashboard:  <Dashboard     {...pageProps} />,
    items:      <ItemMaster    {...pageProps} />,
    demand:     <MonthlyDemand {...pageProps} />,
    opening:    <StockOpening  {...pageProps} />,
    receiving:  <StockReceiving {...pageProps} />,
    issuance:   <StockIssuance  {...pageProps} />,
    adjustment: <StockAdjustment {...pageProps} />,
    reports:    <Reports       {...pageProps} />,
    kpi:        <KPIAlerts     {...pageProps} />,
    users:      <UserManagement setTopbarActions={setTopbarActions} />,
    audit:      <AuditLog      setTopbarActions={setTopbarActions} />,
  };

  return (
    <div className="layout">
      <Sidebar active={nav} onNav={setNav} alertCount={alertCount} isAdmin={isAdmin()} canUsers={can('users', 'view')} />
      <div className="main">
        <div className="topbar">
          <h1>{PAGE_TITLES[nav] || ''}</h1>
          <div className="topbar-actions">
            {topbarActions}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8, paddingLeft: 12, borderLeft: '0.5px solid var(--bd)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{currentUser.name}</div>
                <div style={{ fontSize: 11, color: 'var(--txtm)' }}>{currentUser.role}</div>
              </div>
              <button className="btn" onClick={logout} title="Sign out" style={{ padding: '6px 10px' }}>
                <i className="ti ti-logout" style={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </div>
        <div className="content">{can(nav, 'view') || nav === 'dashboard' || nav === 'audit' || nav === 'users' ? (PAGES[nav] || PAGES.dashboard) : (
          <div className="empty"><i className="ti ti-lock" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />You don't have permission to view this module.</div>
        )}</div>
      </div>
      {toast && <Toast key={toast.key} message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ItemProvider>
        <AppInner />
      </ItemProvider>
    </AuthProvider>
  );
}
