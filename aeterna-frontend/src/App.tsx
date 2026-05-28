import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ResidentesPage from './features/residentes/ResidentesPage';
import TableroTurnoPage from './features/medicacion/TableroTurnoPage';
import CuidadosTurnoPage from './features/bienestar/CuidadosTurnoPage';
import NovedadesPage from './features/novedades/NovedadesPage';
import UsuariosPage from './features/admin/UsuariosPage';
import MiFamiliarPage from './features/familiar/MiFamiliarPage';
import FamiliarMedicacionPage from './features/familiar/FamiliarMedicacionPage';
import FamiliarBienestarPage from './features/familiar/FamiliarBienestarPage';
import FamiliarNovedadesPage from './features/familiar/FamiliarNovedadesPage';

function HomeRedirect() {
  const { user } = useAuthStore();
  if (user?.rol === 'FAMILIAR') return <Navigate to="/familiar" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PERSONAL']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/residentes"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PERSONAL']}>
            <ResidentesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medicacion"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PERSONAL']}>
            <TableroTurnoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cuidados"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PERSONAL']}>
            <CuidadosTurnoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/novedades"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PERSONAL']}>
            <NovedadesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/familiar"
        element={
          <ProtectedRoute allowedRoles={['FAMILIAR']}>
            <MiFamiliarPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/familiar/medicacion"
        element={
          <ProtectedRoute allowedRoles={['FAMILIAR']}>
            <FamiliarMedicacionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/familiar/bienestar"
        element={
          <ProtectedRoute allowedRoles={['FAMILIAR']}>
            <FamiliarBienestarPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/familiar/novedades"
        element={
          <ProtectedRoute allowedRoles={['FAMILIAR']}>
            <FamiliarNovedadesPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
