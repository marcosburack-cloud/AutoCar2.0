
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navegar = useNavigate();
  const [nome, setNome] = useState('Usuário');

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');

    if (!token) {
      navegar('/login');
      return;
    }

    if (usuarioSalvo) {
      try {
        const usuario = JSON.parse(usuarioSalvo);
        setNome(usuario.nome || 'Usuário');
      } catch {
        localStorage.removeItem('usuario');
      }
    }
  }, [navegar]);

  function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navegar('/login');
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="dashboard-brand">
          <div className="brand-icon">A</div>
          <h2>AUTO<span>CAR</span></h2>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">MENU PRINCIPAL</p>

          <a className="nav-item active" href="/dashboard"> 
            <span>▦</span> Dashboard
          </a>
          <a className="nav-item" href="/agendamentos">
            <span>▣</span> Agendamentos
          </a>
          <a className="nav-item" href="/servicos">
            <span>⚙</span> Serviços
          </a>
          <a className="nav-item" href="/produtos">
            <span>▤</span> Produtos
          </a>
          <a className="nav-item" href="/clientes">
            <span>♙</span> Clientes
          </a>
        </nav>

        <button className="logout-button" onClick={sair}>
          ↪ Sair da conta
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="header-subtitle">VISÃO GERAL</p>
            <h1>Dashboard</h1>
          </div>

          <div className="user-info">
            <div className="user-avatar">{nome.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{nome}</strong>
              <span>Administrador</span>
            </div>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <p>Bem-vindo de volta,</p>
            <h2>{nome}!</h2>
            <span>Acompanhe o desempenho da sua gestão automotiva.</span>
          </div>
          <div className="welcome-icon">🚘</div>
        </section>

        <section className="dashboard-cards">
          <article className="stat-card">
            <div className="stat-icon blue">▣</div>
            <p>Agendamentos</p>
            <h2>--</h2>
            <span>Dados em integração</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon cyan">⚙</div>
            <p>Serviços realizados</p>
            <h2>--</h2>
            <span>Dados em integração</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon purple">▤</div>
            <p>Produtos cadastrados</p>
            <h2>--</h2>
            <span>Dados em integração</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">R$</div>
            <p>Faturamento</p>
            <h2>--</h2>
            <span>Dados em integração</span>
          </article>
        </section>

        <section className="dashboard-bottom">
          <div className="dashboard-panel">
            <h3>Atividade recente</h3>
            <p>Os agendamentos e serviços aparecerão aqui.</p>
            <div className="empty-state">
              <span>▤</span>
              <p>Nenhuma atividade carregada ainda.</p>
            </div>
          </div>

          <div className="dashboard-panel">
            <h3>Acesso rápido</h3>
            <p>Gerencie as principais áreas do AutoCar.</p>

            <div className="quick-links">
              <button onClick={() => navegar('/agendamentos')}>
                + Novo agendamento
              </button>
              <button onClick={() => navegar('/produtos')}>
                + Ver produtos
              </button>
              <button onClick={() => navegar('/servicos')}>
                + Ver serviços
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
