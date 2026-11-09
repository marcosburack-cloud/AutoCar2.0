import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { editarPerfil } from '../services/api';
import './Perfil.css';
import './Gerenciar.css';

export default function Perfil() {
  const { usuario, token, atualizarUsuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [cpf, setCpf] = useState(usuario?.cpf ?? '');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);
  async function salvar(event: FormEvent) {
    event.preventDefault(); setErro(''); setSucesso('');
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return; }
    if (!token) return;
    setSalvando(true);
    try {
      const resposta = await editarPerfil({ nome, cpf, ...(senha ? { senha } : {}) }, token);
      atualizarUsuario(resposta.usuario); setSenha(''); setConfirmar(''); setSucesso('Perfil atualizado com sucesso.');
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao atualizar perfil.'); }
    finally { setSalvando(false); }
  }
  return <section className="profile-panel">
    <div className="profile-title"><div className="profile-avatar">{usuario?.nome.charAt(0).toUpperCase() ?? 'U'}</div><div><h2>Meu perfil</h2><p>Edite os dados da sua conta AutoCar</p></div></div>
    <form className="edit-profile" onSubmit={salvar}>
      <label>Nome completo<input value={nome} onChange={e => setNome(e.target.value)} minLength={3} required /></label>
      <label>E-mail (não pode ser alterado)<input value={usuario?.email ?? ''} disabled /></label>
      <label>CPF<input value={cpf} onChange={e => setCpf(e.target.value)} required /></label>
      <label>Nova senha (deixe vazio para manter)<input type="password" value={senha} onChange={e => setSenha(e.target.value)} autoComplete="new-password" /></label>
      <label>Confirmar nova senha<input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} autoComplete="new-password" /></label>
      {erro && <p role="alert" className="form-error">{erro}</p>}
      {sucesso && <p role="status" className="form-success">{sucesso}</p>}
      <button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
    </form>
  </section>;
}
