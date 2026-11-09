import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buscarAgendamentos, buscarIndicadores, type Agendamento, type IndicadoresDashboard } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { usuario, token } = useAuth();
  const [indicadores, setIndicadores] = useState<IndicadoresDashboard | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!token) return;
    let ativo = true;
    Promise.all([buscarIndicadores(token), buscarAgendamentos(token)])
      .then(([resumo, lista]) => {
        if (!ativo) return;
        setIndicadores(resumo);
        setAgendamentos(lista);
      })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Erro ao carregar os dados.');
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [token]);

  const cards = [
    { icone: '▣', nome: 'Agendamentos', classe: 'blue', valor: indicadores?.agendamentos },
    { icone: '⚙', nome: 'Serviços cadastrados', classe: 'cyan', valor: indicadores?.servicos },
    { icone: '▤', nome: 'Produtos cadastrados', classe: 'purple', valor: indicadores?.produtos },
  ];
  return (
    <>
      <section className="welcome-section">
        <div><p>Bem-vindo de volta,</p><h2>{usuario?.nome ?? 'Usuário'}!</h2>
          <span>Informações reais do banco de dados AutoCar.</span></div>
        <div className="welcome-icon">🚘</div>
      </section>
      {erro && <p role="alert" style={{ color: '#b91c1c', margin: '14px 0' }}>{erro}</p>}
      <section className="dashboard-cards" aria-label="Indicadores do banco de dados">
        {cards.map(item => <article className="stat-card" key={item.nome}>
          <div className={`stat-icon ${item.classe}`}>{item.icone}</div>
          <p>{item.nome}</p><h2>{carregando ? '...' : item.valor ?? '—'}</h2>
          <span>{carregando ? 'Carregando...' : 'Dados do MySQL'}</span>
        </article>)}
      </section>
      <section className="dashboard-bottom">
        <div className="dashboard-panel">
          <h3>Agendamentos cadastrados</h3>
          <p>Últimos registros do banco de dados.</p>
          {agendamentos.length ? (
            <ul style={{ paddingLeft: 20, marginTop: 16 }}>
              {agendamentos.slice(0, 6).map(a => (
                <li key={a.id} style={{ marginBottom: 12 }}>
                  <strong>{a.nome_cliente}</strong> — {a.servico?.nome ?? 'Serviço não informado'}
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {a.modelo_carro ?? 'Veículo não informado'} · {a.data_agendamento ?? 'Sem data'}
                  </div>
                </li>
              ))}
            </ul>
          ) : <div className="empty-state"><span>▤</span><p>{carregando ? 'Carregando...' : 'Nenhum agendamento disponível.'}</p></div>}
        </div>
        <div className="dashboard-panel"><h3>Acesso rápido</h3><p>Confira os dados da sua conta.</p>
          <div className="quick-links"><Link className="quick-link" to="/perfil">♙ Visualizar meu perfil</Link>
            <Link className="quick-link" to="/gerenciar/agendamentos">▣ Gerenciar agendamentos</Link>
            <Link className="quick-link" to="/gerenciar/produtos">▤ Gerenciar produtos</Link>
          </div>
        </div>
      </section>
    </>
  );
}
