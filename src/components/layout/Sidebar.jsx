import React from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, Quiz, History, School, AutoStories } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Dashboard',                    icon: <Dashboard />, path: '/' },
  { text: 'Crear cuestionario',            icon: <Quiz />,      path: '/cuestionarios' },
  { text: 'Historial de cuestionarios',   icon: <History />,   path: '/historial' },
  { text: 'Cursos',                        icon: <School />,    path: '/cursos' },
  { text: 'Cuestionario IA',               icon: <AutoStories />, path: 'http://localhost:8085/quiz', external: true },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <List disablePadding className="flex-1 pt-2">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.text}
              onClick={() => item.external ? window.location.href = item.path : navigate(item.path)}
              sx={{
                mx: 1, my: 0.25, borderRadius: '8px',
                color: active ? '#fff' : 'rgb(148 163 184)',
                backgroundColor: active ? 'rgba(59,130,246,0.25)' : 'transparent',
                '&:hover': {
                  backgroundColor: active ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                },
                transition: 'background-color 0.15s, color 0.15s',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: active ? '#60a5fa' : 'rgb(148 163 184)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400, letterSpacing: '0.01em' }}
              />
              {active && <span className="w-1.5 h-5 rounded-full bg-blue-400 ml-auto" />}
            </ListItemButton>
          );
        })}
      </List>

      <div className="px-4 py-4 border-t border-slate-700/60">
        <p className="text-xs text-slate-500">EduQuiz Profesor v1.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
