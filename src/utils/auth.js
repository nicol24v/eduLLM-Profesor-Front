export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.rol || decoded?.role || null;
};

export const getUserId = () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.idUsuario || decoded?.userId || null;
};

export const isTokenValid = () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) return false;
  try {
    const decoded = decodeToken(token);
    return decoded?.exp && decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8085';

export const getLoginUrl = () =>
  import.meta.env.VITE_AUTH_URL || `${GATEWAY_URL}/login`;

export const redirectToLogin = () => {
  window.location.href = getLoginUrl();
};

export const logoutAndRedirect = async () => {
  try {
    await fetch(`${GATEWAY_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch {
    // ignorar error de red, redirigir de todas formas
  }
  localStorage.removeItem('jwtToken');
  window.location.href = getLoginUrl();
};
