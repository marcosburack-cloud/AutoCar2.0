import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import Gerenciar from './pages/Gerenciar';
import FormRegistro from './pages/FormRegistro';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

function Entrada() {
  const { token } = useAuth();
  return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Entrada />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/gerenciar/:recurso" element={<Gerenciar />} />
              <Route path="/gerenciar/:recurso/:id" element={<FormRegistro />} />
            </Route>
          </Route>
          <Route path="*" element={<Entrada />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
