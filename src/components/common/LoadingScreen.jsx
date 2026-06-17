import React, { useEffect, useState } from 'react';

function LoadingScreen({ message = 'Cargando...', delay = 500 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5 bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      {show && <p className="text-slate-500 text-sm">{message}</p>}
    </div>
  );
}

export default LoadingScreen;
