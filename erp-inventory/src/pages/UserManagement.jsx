import React, { useState } from 'react';
import { useAuth, ALL_MODULES, ALL_PERMISSIONS, defaultPermissions } from '../context/AuthContext';
import Modal from '../components/Modal';

const ROLES = ['Administrator', 'Manager', 'Viewer', 'Custom'];

export default function UserManagement({ setTopbarActions }) {
  const { users, currentUser, createUser, updateUser, deleteUser, can } = useAuth();
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  React.useEffect(() => {
    setTopbarActions(
      can('users', 'create') ? (
        <button className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
          <i className="ti ti-plus" /> Add user
        </button>
      ) : null
    );
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  function handleSave(data) {
    if (modal.type === 'create') {
      const res = createUser(data);
      if (!res.ok) { showToast(res.error); return; }
      showToast('User created successfully');
    } else {
      updateUser(modal.user.id, data);
      showToast('User updated successfully');
    }
    setModal(null);
  }

  function handleDelete(user) {
    if (user.id === currentUser.id) { showToast('Cannot delete your own account'); return; }
    if (window.confirm(`Delete user "${user.username}"? This cannot be undone.`)) {
      deleteUser(user.id);
      showToast('User deleted');
    }
  }

  function handleToggleStatus(user) {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    updateUser(user.id, { ...user, status: newStatus });
    showToast(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
  }

  return (
    <>
      {toast && <div className="toast" style={{ background: '#1baf7a' }}><i className="ti ti-check" /> {toast}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>User ID</th><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontSize: 12, color: 'var(--txtm)' }}>{u.id}</td>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td>{u.username}</td>
                <td><span className={`badge ${u.role === 'Administrator' ? 'badge-danger' : u.role === 'Manager' ? 'badge-info' : 'badge-gray'}`}>{u.role}</span></td>
                <td>
                  <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--txtm)' }}>{u.createdAt}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {can('users', 'edit') && (
                      <button className="btn btn-sm" onClick={() => setModal({ type: 'edit', user: u })}>
                        <i className="ti ti-edit" />
                      </button>
                    )}
                    {can('users', 'edit') && u.id !== currentUser.id && (
                      <button className="btn btn-sm" onClick={() => handleToggleStatus(u)}
                        style={{ color: u.status === 'Active' ? '#e34948' : '#1baf7a' }}>
                        <i className={`ti ${u.status === 'Active' ? 'ti-user-off' : 'ti-user-check'}`} />
                      </button>
                    )}
                    {can('users', 'delete') && u.id !== currentUser.id && (
                      <button className="btn btn-sm" onClick={() => handleDelete(u)} style={{ color: '#e34948' }}>
                        <i className="ti ti-trash" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination"><span>{users.length} users</span></div>
      </div>

      {modal && (
        <UserModal
          type={modal.type}
          user={modal.user}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

function UserModal({ type, user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: user?.password || '',
    role: user?.role || 'Viewer',
    status: user?.status || 'Active',
    permissions: user?.permissions || defaultPermissions('Viewer'),
  });
  const [tab, setTab] = useState('info');

  function handleRoleChange(role) {
    setForm(p => ({ ...p, role, permissions: role !== 'Custom' ? defaultPermissions(role) : p.permissions }));
  }

  function togglePerm(mod, perm) {
    setForm(p => ({
      ...p,
      role: 'Custom',
      permissions: {
        ...p.permissions,
        [mod]: { ...p.permissions[mod], [perm]: !p.permissions[mod]?.[perm] },
      },
    }));
  }

  function handleSave() {
    if (!form.name || !form.username || !form.password) { alert('All fields required'); return; }
    onSave(form);
  }

  return (
    <Modal
      title={type === 'create' ? 'Create new user' : `Edit user — ${user?.username}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="ti ti-check" /> {type === 'create' ? 'Create' : 'Save'}
          </button>
        </>
      }
    >
      <div className="tab-bar">
        <button className={`tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>User Info</button>
        <button className={`tab ${tab === 'perms' ? 'active' : ''}`} onClick={() => setTab('perms')}>Permissions</button>
      </div>

      {tab === 'info' && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label>Full name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="username" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Password" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => handleRoleChange(e.target.value)}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </>
      )}

      {tab === 'perms' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 10px', textAlign: 'left', background: 'var(--sur1)', borderBottom: '0.5px solid var(--bd)' }}>Module</th>
                {ALL_PERMISSIONS.map(p => (
                  <th key={p} style={{ padding: '8px 10px', textAlign: 'center', background: 'var(--sur1)', borderBottom: '0.5px solid var(--bd)', textTransform: 'capitalize' }}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_MODULES.map(m => (
                <tr key={m.id}>
                  <td style={{ padding: '7px 10px', borderBottom: '0.5px solid var(--bd)', fontWeight: 500 }}>{m.label}</td>
                  {ALL_PERMISSIONS.map(p => (
                    <td key={p} style={{ padding: '7px 10px', textAlign: 'center', borderBottom: '0.5px solid var(--bd)' }}>
                      <input
                        type="checkbox"
                        checked={form.permissions?.[m.id]?.[p] || false}
                        onChange={() => togglePerm(m.id, p)}
                        style={{ cursor: 'pointer', width: 15, height: 15 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
