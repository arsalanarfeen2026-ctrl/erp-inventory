import React, { useRef } from 'react';

export default function ExcelToolbar({ onExport, onImport, onTemplate, importing }) {
  const fileRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) onImport(file);
    e.target.value = '';
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--sur2)', border: '0.5px solid var(--bd)',
      borderRadius: 8, padding: '8px 14px', marginBottom: 16,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 12, color: 'var(--txtm)', fontWeight: 500, marginRight: 4 }}>
        <i className="ti ti-file-spreadsheet" style={{ color: '#1baf7a', marginRight: 4 }} />
        Excel:
      </span>

      {/* Export */}
      <button className="btn btn-sm" onClick={onExport} style={{ color: '#1baf7a', borderColor: 'rgba(27,175,122,0.3)' }}>
        <i className="ti ti-download" /> Export
      </button>

      {/* Template */}
      <button className="btn btn-sm" onClick={onTemplate} style={{ color: '#2a78d6', borderColor: 'rgba(42,120,214,0.3)' }}>
        <i className="ti ti-file-download" /> Download template
      </button>

      {/* Import */}
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <button
        className="btn btn-sm"
        onClick={() => fileRef.current.click()}
        disabled={importing}
        style={{ color: '#eda100', borderColor: 'rgba(237,161,0,0.3)' }}
      >
        {importing
          ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Importing…</>
          : <><i className="ti ti-upload" /> Import from Excel</>
        }
      </button>

      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--txtm)' }}>
        Import using the downloaded template
      </span>
    </div>
  );
}
