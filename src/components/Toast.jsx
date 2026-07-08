import React from 'react';

export default function Toast({ message, type = 'success', onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  const bg = type === 'success' ? '#1baf7a' : type === 'danger' ? '#e34948' : '#eda100';
  const icon = type === 'success' ? 'ti-check' : type === 'danger' ? 'ti-x' : 'ti-alert-triangle';

  return (
    <div className="toast" style={{ background: bg }}>
      <i className={`ti ${icon}`} />
      {message}
    </div>
  );
}
