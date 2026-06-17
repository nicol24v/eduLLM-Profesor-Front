import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../features/dashboard/DashboardPage';
import CuestionarioListPage from '../features/cuestionarios/CuestionarioListPage';
import CuestionarioEditorPage from '../features/cuestionarios/CuestionarioEditorPage';
import HistorialPartidasPage from '../features/partidas/HistorialPartidasPage';
import CursosPage from '../features/cursos/CursosPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/cuestionarios" element={<CuestionarioListPage />} />
    <Route path="/cuestionarios/nuevo" element={<CuestionarioEditorPage />} />
    <Route path="/cuestionarios/:id/editar" element={<CuestionarioEditorPage />} />
    <Route path="/historial" element={<HistorialPartidasPage />} />
    <Route path="/cursos" element={<CursosPage />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default AppRoutes;
