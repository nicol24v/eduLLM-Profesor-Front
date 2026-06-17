import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Layout from './components/common/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import SalaEsperaPage from './features/partidas/SalaEsperaPage';
import JuegoPage from './features/partidas/JuegoPage';
import { useAuth } from './hooks/useAuth';
import { redirectToLogin, logoutAndRedirect } from './utils/auth';

const SKIP_VERIFY = import.meta.env.VITE_SKIP_AUTH_VERIFY === 'true';

function AuthGate() {
  const { verifyAuth, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Verificando sesión...');
  const [noSession, setNoSession] = useState(false);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (SKIP_VERIFY) { setLoading(false); return; }

    verifyAuth()
      .then((data) => {
        if (data?.authenticated) {
          setMessage(`Bienvenido, ${data.username}!`);
        } else {
          setNoSession(true);
        }
      })
      .catch(() => setNoSession(true))
      .finally(() => setLoading(false));
  }, [verifyAuth]);

  const isProfesor = SKIP_VERIFY || user?.rol === 'ROLE_PROFESOR' || user?.rol === 'profesor';
  const wrongRole = !loading && !noSession && isAuthenticated && !isProfesor;

  useEffect(() => {
    if (!loading && (noSession || (!SKIP_VERIFY && !isAuthenticated))) {
      redirectToLogin();
    }
  }, [loading, noSession, isAuthenticated]);

  useEffect(() => {
    if (wrongRole) {
      const t = setTimeout(logoutAndRedirect, 3000);
      return () => clearTimeout(t);
    }
  }, [wrongRole]);

  if (loading) return <LoadingScreen message={message} delay={300} />;

  if (noSession || (!SKIP_VERIFY && !isAuthenticated)) {
    return <LoadingScreen message="Redirigiendo al inicio de sesión..." />;
  }

  if (wrongRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-red-50 px-4">
        <div className="w-full max-w-sm text-center bg-white rounded-2xl shadow-lg border border-slate-100 px-8 py-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Acceso restringido</h2>
          <p className="text-sm text-slate-500 mb-6">
            No tienes acceso a esta pagina por favor ingresa con tu usuario y contraseña.
          </p>
          <p className="text-xs text-slate-400">Redirigiendo en 3 segundos...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sala-espera/:codigoAcceso" element={<SalaEsperaPage />} />
        <Route path="/juego/:codigoAcceso" element={<JuegoPage />} />
        <Route path="/*" element={<AuthGate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
