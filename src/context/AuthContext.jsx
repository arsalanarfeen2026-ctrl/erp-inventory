import React, { createContext, useContext, useState } from 'react';

// Default users stored in localStorage (simulate DB for now)
const DEFAULT_USERS = [
  {
    id: 'USR-0001', username: 'admin', password: 'admin123',
    name: 'Administrator', role: 'Administrator', status: 'Active',
    permissions: {
      dashboard:  { view: true,  create: true,  edit: true,  delete: true,  approve: true  },
      items:      { view: true,  create: true,  edit: true,  delete: true,  approve: true  },
      demand:     { view: true,  create: true,  edit: true,  delete: true,  approve: true  },
      opening:    { view: true,  create: true,  edit: true,  delete: true,  approve: true  },
      receiving:  { view: true,  create: true,  edit: true,  delete: true,  approve: true  },
      issuance:   { view: true,  create: true,  edit: true,  delete: true,  approve: true  },
      adjustment: { view: true,  create: true,  edit: true,  delete: true,  approve: true  },
      reports:    { view: true,  create: true,  edit: true,  delete: true,  approve: true  },
      kpi:        { view: true,  create: true,  edit: true,  delete: true,  approve: true  },
      users:      { view: true,  create: true,  edit: true,  delete: true,  approve: true  },
    },
    createdAt: '2026-01-01', createdBy: 'system',
  },
  {
    id: 'USR-0002', username: 'manager', password: 'manager123',
    name: 'Inventory Manager', role: 'Manager', status: 'Active',
    permissions: {
      dashboard:  { view: true,  create: false, edit: false, delete: false, approve: false },
      items:      { view: true,  create: true,  edit: true,  delete: false, approve: false },
      demand:     { view: true,  create: true,  edit: true,  delete: false, approve: false },
      opening:    { view: true,  create: true,  edit: true,  delete: false, approve: false },
      receiving:  { view: true,  create: true,  edit: true,  delete: false, approve: false },
      issuance:   { view: true,  create: true,  edit: true,  delete: false, approve: false },
      adjustment: { view: true,  create: true,  edit: true,  delete: false, approve: false },
      reports:    { view: true,  create: false, edit: false, delete: false, approve: false },
      kpi:        { view: true,  create: false, edit: false, delete: false, approve: false },
      users:      { view: false, create: false, edit: false, delete: false, approve: false },
    },
    createdAt: '2026-01-01', createdBy: 'admin',
  },
  {
    id: 'USR-0003', username: 'viewer', password: 'view123',
    name: 'Viewer', role: 'Viewer', status: 'Active',
    permissions: {
      dashboard:  { view: true,  create: false, edit: false, delete: false, approve: false },
      items:      { view: true,  create: false, edit: false, delete: false, approve: false },
      demand:     { view: true,  create: false, edit: false, delete: false, approve: false },
      opening:    { view: true,  create: false, edit: false, delete: false, approve: false },
      receiving:  { view: true,  create: false, edit: false, delete: false, approve: false },
      issuance:   { view: true,  create: false, edit: false, delete: false, approve: false },
      adjustment: { view: true,  create: false, edit: false, delete: false, approve: false },
      reports:    { view: true,  create: false, edit: false, delete: false, approve: false },
      kpi:        { view: true,  create: false, edit: false, delete: false, approve: false },
      users:      { view: false, create: false, edit: false, delete: false, approve: false },
    },
    createdAt: '2026-01-01', createdBy: 'admin',
  },
];

function loadUsers() {
  try {
    const stored = localStorage.getItem('erp_users');
    return stored ? JSON.parse(stored) : DEFAULT_USERS;
  } catch { return DEFAULT_USERS; }
}

function saveUsers(users) {
  localStorage.setItem('erp_users', JSON.stringify(users));
}

function loadAuditLog() {
  try {
    const stored = localStorage.getItem('erp_audit');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveAuditLog(log) {
  localStorage.setItem('erp_audit', JSON.stringify(log));
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(loadUsers);
  const [auditLog, setAuditLog] = useState(loadAuditLog);

  function addAuditEntry(entry) {
    const newLog = [{ ...entry, id: 'AUD-' + Date.now(), timestamp: new Date().toISOString() }, ...auditLog].slice(0, 500);
    setAuditLog(newLog);
    saveAuditLog(newLog);
  }

  function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { ok: false, error: 'Invalid username or password.' };
    if (user.status === 'Inactive') return { ok: false, error: 'Your account is inactive. Contact administrator.' };
    setCurrentUser(user);
    addAuditEntry({ type: 'LOGIN', module: 'Auth', user: username, details: 'User logged in' });
    return { ok: true };
  }

  function logout() {
    addAuditEntry({ type: 'LOGOUT', module: 'Auth', user: currentUser?.username, details: 'User logged out' });
    setCurrentUser(null);
  }

  function can(module, action) {
    if (!currentUser) return false;
    return currentUser.permissions?.[module]?.[action] === true;
  }

  function isAdmin() {
    return currentUser?.role === 'Administrator';
  }

  function createUser(data) {
    const existing = users.find(u => u.username === data.username);
    if (existing) return { ok: false, error: 'Username already exists.' };
    const newUser = {
      ...data,
      id: 'USR-' + String(users.length + 1).padStart(4, '0'),
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: currentUser?.username,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    addAuditEntry({ type: 'USER_CREATED', module: 'Users', user: currentUser?.username, details: `Created user: ${data.username}` });
    return { ok: true };
  }

  function updateUser(id, data) {
    const updated = users.map(u => u.id === id ? { ...u, ...data } : u);
    setUsers(updated);
    saveUsers(updated);
    if (currentUser?.id === id) setCurrentUser(prev => ({ ...prev, ...data }));
    addAuditEntry({ type: 'USER_UPDATED', module: 'Users', user: currentUser?.username, details: `Updated user: ${data.username || id}` });
  }

  function deleteUser(id) {
    const user = users.find(u => u.id === id);
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
    addAuditEntry({ type: 'USER_DELETED', module: 'Users', user: currentUser?.username, details: `Deleted user: ${user?.username}` });
  }

  return (
    <AuthContext.Provider value={{ currentUser, users, auditLog, login, logout, can, isAdmin, createUser, updateUser, deleteUser, addAuditEntry }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }

export const ALL_MODULES = [
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'items',      label: 'Item Master' },
  { id: 'demand',     label: 'Monthly Demand' },
  { id: 'opening',    label: 'Stock Opening' },
  { id: 'receiving',  label: 'Stock Receiving' },
  { id: 'issuance',   label: 'Stock Issuance' },
  { id: 'adjustment', label: 'Stock Adjustment' },
  { id: 'reports',    label: 'Reports' },
  { id: 'kpi',        label: 'KPI & Alerts' },
  { id: 'users',      label: 'User Management' },
];

export const ALL_PERMISSIONS = ['view', 'create', 'edit', 'delete', 'approve'];

export function defaultPermissions(role = 'Viewer') {
  const perm = {};
  ALL_MODULES.forEach(m => {
    perm[m.id] = {
      view:    true,
      create:  role !== 'Viewer',
      edit:    role !== 'Viewer',
      delete:  role === 'Administrator',
      approve: role === 'Administrator',
    };
  });
  if (role !== 'Administrator') perm['users'] = { view: false, create: false, edit: false, delete: false, approve: false };
  return perm;
}
