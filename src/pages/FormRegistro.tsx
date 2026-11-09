import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { consultarRegistro, salvarRegistro } from '../services/api';
import { recursoValido, recursos } from './Gerenciar';
import './Gerenciar.css';

export default function FormRegistro() {
  const { recurso, id } = useParams(); const { token } = useAuth(); const navegar = useNavigate();
  const [valores, setValores] = useState<Record<string, string>>({});
  const [erro, setErro] = useState(''); const [salvando, setSalvando] = useState(false);
  useEffect(() => {
    if (!token || !recursoValido(recurso) || !id || id === 'novo') return;
    let ativo = true;
    consultarRegistro(recurso, id, token).then(item => {
      if (ativo) setValores(Object.fromEntries(Object.entries(item).map(([k, v]) => [k, v == null ? '' : String(v)])));
    }).catch(e => { if (ativo) setErro(e instanceof Error ? e.message : 'Registro não encontrado.'); });
    return () => { ativo = false; };
  }, [recurso, id, token]);
  if (!recursoValido(recurso)) return <p>Recurso inválido.</p>;
  const nomeRecurso = recurso;
  async function salvar(e: FormEvent) {
    e.preventDefault(); if (!token) return;
    setErro(''); setSalvando(true);
    try {
      await salvarRegistro(nomeRecurso, valores, token, id === 'novo' ? undefined : id);
      navegar(`/gerenciar/${nomeRecurso}`);
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar registro.'); }
    finally { setSalvando(false); }
  }
  return <section className="manage-panel"><h2>{id === 'novo' ? 'Cadastrar' : 'Editar'} {recursos[recurso].titulo.toLowerCase()}</h2>
    <form className="manage-form" onSubmit={salvar}>{recursos[recurso].campos.map(c => <label key={c.nome}>{c.rotulo}<input type={c.tipo ?? 'text'} required={c.obrigatorio} step={c.tipo === 'number' ? '0.01' : undefined} min={c.tipo === 'number' ? 0 : undefined} value={valores[c.nome] ?? ''} onChange={e => setValores(atual => ({ ...atual, [c.nome]: e.target.value }))} /></label>)}
      {erro && <p role="alert" className="form-error">{erro}</p>}
      <div className="manage-form-actions"><Link to={`/gerenciar/${recurso}`}>Cancelar</Link><button disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar registro'}</button></div>
    </form></section>;
}
