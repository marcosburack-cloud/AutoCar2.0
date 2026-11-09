import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/Dashboard.css';

export default function AppLayout() {
  const { usuario, sair } = useAuth();
  const navegar = useNavigate();
  function encerrar() { sair(); navegar('/login', { replace: true }); }
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="dashboard-brand"><div className="brand-icon">A</div><h2>AUTO<span>CAR</span></h2></div>
        <nav className="sidebar-nav" aria-label="Menu principal">
          <p className="nav-label">MENU PRINCIPAL</p>
          <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to="/dashboard"><span>▦</span> Dashboard</NavLink>
          <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to="/perfil"><span>♙</span> Meu perfil</NavLink>
          <p className="nav-label nav-label-secondary">GERENCIAMENTO</p>
          <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to="/gerenciar/agendamentos"><span>▣</span> Agendamentos</NavLink>
          <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to="/gerenciar/servicos"><span>⚙</span> Serviços</NavLink>
          <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to="/gerenciar/produtos"><span>▤</span> Produtos</NavLink>
          <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to="/gerenciar/clientes"><span>♙</span> Clientes</NavLink>
        </nav>
        <button className="logout-button" onClick={encerrar}>↪ Sair da conta</button>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div><p className="header-subtitle">PAINEL AUTOCAR</p><h1>Área do usuário</h1></div>
          <div className="user-info"><div className="user-avatar">{usuario?.nome.charAt(0).toUpperCase() ?? 'U'}</div><div><strong>{usuario?.nome ?? 'Usuário'}</strong><span>Conta conectada</span></div></div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
