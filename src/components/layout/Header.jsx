import React, { useState } from 'react';
import {
  Avatar, Box, IconButton, Menu, MenuItem,
  ListItemIcon, Divider, Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { getLoginUrl } from '../../utils/auth';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8085';

const Header = () => {
  const { logout: clearSession, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    clearSession();
    setAnchorEl(null);
    axios.post(`${GATEWAY}/api/auth/logout`, null, { withCredentials: true }).catch(() => {});
    window.location.href = '/?logout=1';
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'PR';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-white font-semibold text-base tracking-tight">
          EduQuiz <span className="text-blue-300 font-normal">Profesor</span>
        </span>
      </div>

      <Box>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#1d4ed8', fontSize: '0.8rem', fontWeight: 600, border: '2px solid rgba(255,255,255,0.25)' }}>
            {initials}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Sesión activa</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: '#1e293b' }}>{user?.username || 'Profesor'}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ mt: 0.5, color: '#dc2626', '&:hover': { bgcolor: '#fff1f2' } }}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#dc2626' }} /></ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;
