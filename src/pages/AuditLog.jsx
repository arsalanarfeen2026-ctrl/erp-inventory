import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const TYPE_COLORS = {
  LOGIN: 'badge-success', LOGOUT: 'badge-gray',
  USER_CREATED: 'badge-info', USER_UPDATED: 'badge-warning', USER_DELETED: 'badge-danger',
  DELETE: 'badge-danger', CREATE: 'badge-success', UPDATE: 'badge-warning',
  ITEM_CREATED: 'badge-info', ITEM_UPDATED: 'badge-warning',
};

export default function AuditLog({ setTopbarActions }) {
  const { auditLog } = useAuth();
  const [filterType, setFilterType] = useState('All');
  const [filterUser, setFilterUser] = useState('All');
  const [filterModule, setFilterModule] = useState('All');

  React.useEffect(() => { setTopbarActions(null); }, []);

  const types = ['All', ...new Set(auditLog.map(a => a.type))];
  const users = ['All', ...new Set(auditLog.map(a => a.user))];
  const modules = ['All', ...new Set(auditLog.map(a => a.module))];

  let filtered = auditLog;
  if (filterType !== 'All')   filtered = filtered.filter(a => a.type === filterType);
  if (filterUser !== 'All')   filtered = filtered.filter(a => a.user === filterUser);
  if (filterModule !== 'All') filtered = filtered.filter(a => a.module === filterModule);

  return (
    <>
      <div className="filter-row">
        <span style={{ fontSize: 12, color: 'var(--txtm)' }}>Type:</span>
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--txtm)' }}>User:</span>
        <select className="filter-select" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
          {users.map(u => <option key={u}>{u}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--txtm)' }}>Module:</span>
        <select className="filter-select" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
          {modules.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Log ID</th><th>Timestamp</th><th>User</th><th>Module</th><th>Action</th><th>Details</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="empty">No audit entries found</td></tr>
            ) : filtered.map(a => (
              <tr key={a.id}>
                <td style={{ fontSize: 11, color: 'var(--txtm)' }}>{a.id}</td>
                <td style={{ fontSize: 12 }}>{new Date(a.timestamp).toLocaleString()}</td>
                <td style={{ fontWeight: 500 }}>{a.user}</td>
                <td>{a.module}</td>
                <td><span className={`badge ${TYPE_COLORS[a.type] || 'badge-gray'}`}>{a.type}</span></td>
                <td style={{ fontSize: 12, color: 'var(--txtm)', maxWidth: 300 }}>{a.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination"><span>{filtered.length} entries</span></div>
      </div>
    </>
  );
}
