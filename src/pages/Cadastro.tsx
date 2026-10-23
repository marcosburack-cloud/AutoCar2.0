
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cadastrarUsuario } from '../services/api';
import './Cadastro.css';

function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, '');

  if (numeros.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(numeros)) {
    return false;
  }

  const calcularDigito = (base: string, pesoInicial: number) => {
    let soma = 0;

    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }

    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const primeiroDigito = calcularDigito(
    numeros.substring(0, 9),
    10
  );

  if (primeiroDigito !== Number(numeros[9])) {
    return false;
  }

  const segundoDigito = calcularDigito(
    numeros.substring(0, 10),
    11
  );

  return segundoDigito === Number(numeros[10]);
}

function formatarCPF(valor: string): string {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function Cadastro() {
  const navegar = useNavigate();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  async function handleCadastro(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErro('');

    if (!validarCPF(cpf)) {
      setErro('CPF inválido. Confira os números digitados.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      await cadastrarUsuario({
        nome,
        email,
        senha,
        cpf: cpf.replace(/\D/g, ''),
      });

      navegar('/login');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o cadastro.'
      );
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErro('Digite um e-mail válido.');
         return;
    }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="cadastro-container">
      <section className="cadastro-card">
        <h1>Crie sua conta</h1>
        <p>Preencha seus dados para começar.</p>

        <form
          className="cadastro-form"
          onSubmit={handleCadastro}
        >
          <label htmlFor="nome">Nome completo</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            type="text"
            value={cpf}
           onChange={(e) => setCpf(formatarCPF(e.target.value))}
            placeholder="000.000.000-00"
            required
          />
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <label htmlFor="confirmarSenha">Confirmar senha</label>
          <input
            id="confirmarSenha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
            {erro && (
            <p className="mensagem-erro" role="alert">
              {erro}
            </p>
            )}
          <button type="submit" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Cadastro;
