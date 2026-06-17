import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8085';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${GATEWAY}/api/auth/login`,
        { username, password },
        { withCredentials: true }
      );

      const data = response.data;

      const rol = data.rol || data.role || '';
      const isProfesor = rol === 'ROLE_PROFESOR' || rol === 'profesor';
      if (!isProfesor) {
        enqueueSnackbar('Acceso denegado. Esta plataforma es solo para profesores.', { variant: 'error' });
        return;
      }

      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
      }

      setUser(data);
      enqueueSnackbar(`Bienvenido, ${data.username}!`, { variant: 'success' });
      navigate('/');
    } catch (error) {
      const msg = error.response?.data?.message || 'Credenciales inválidas';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            EduQuiz <span className="text-blue-500 font-normal">Profesor</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Panel docente</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 px-8 py-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-1.5">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition-shadow duration-150"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition-shadow duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold
                         hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors duration-150 shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} eduLLM &mdash; Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
