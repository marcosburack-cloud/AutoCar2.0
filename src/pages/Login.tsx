
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUsuario } from '../services/api';
import './Login.css';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navegar = useNavigate();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro('Digite um e-mail válido.');
      return;
    }

    if (!senha) {
      setErro('Digite sua senha.');
      return;
    }

    setCarregando(true);

    try {
      const resultado = await loginUsuario({
        email: email.trim(),
        senha,
      });

      entrar({ token: resultado.token, usuario: resultado.usuario });

      navegar('/dashboard');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o login.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-form-section">
        <div className="login-content">
          <div className="login-brand">
            <div className="login-brand-icon">A</div>
            <strong>AUTO<span>CAR</span></strong>
          </div>

          <h1>Bem-vindo de volta!</h1>
          <p className="login-subtitle">
            Entre com seus dados para acessar sua conta.
          </p>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@exemplo.com"
              required
            />

            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              required
            />

            {erro && <div className="login-error" role="alert">{erro}</div>}

            <button className="login-button" type="submit" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar na minha conta'}
            </button>
          </form>

          <p className="login-register">
            Ainda não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </section>

      <aside className="login-visual">
        <div className="login-car-icon">🚘</div>
        <h2>Seu veículo merece o <span>melhor cuidado.</span></h2>
        <p>
          Gerencie seus serviços automotivos com praticidade,
          organização e tecnologia em um só lugar.
        </p>
        <div className="login-visual-tag">
          ✦ Gestão inteligente automotiva
        </div>
      </aside>
    </main>
  );
}

export default Login;
