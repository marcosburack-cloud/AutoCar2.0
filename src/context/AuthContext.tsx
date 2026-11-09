import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Usuario } from '../services/api';

type Sessao = { token: string; usuario: Usuario };
type AuthContextType = {
  usuario: Usuario | null;
  token: string | null;
  entrar: (sessao: Sessao) => void;
  sair: () => void;
  atualizarUsuario: (usuario: Usuario) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function tokenValido(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function recuperarSessao(): Sessao | null {
  try {
    const token = localStorage.getItem('token');
    const dados = localStorage.getItem('usuario');
    if (!token || !dados || !tokenValido(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      return null;
    }
    const usuario: unknown = JSON.parse(dados);
    if (!usuario || typeof usuario !== 'object' || !('nome' in usuario) || !('email' in usuario) || !('cpf' in usuario) ||
      typeof usuario.nome !== 'string' || typeof usuario.email !== 'string' || typeof usuario.cpf !== 'string') return null;
    return { token, usuario: usuario as Usuario };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(recuperarSessao);
  function entrar(novaSessao: Sessao) {
    localStorage.setItem('token', novaSessao.token);
    localStorage.setItem('usuario', JSON.stringify(novaSessao.usuario));
    setSessao(novaSessao);
  }
  function atualizarUsuario(usuario: Usuario) {
    setSessao(atual => atual ? { ...atual, usuario } : atual);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
  function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setSessao(null);
  }
  return <AuthContext.Provider value={{ usuario: sessao?.usuario ?? null, token: sessao?.token ?? null, entrar, sair, atualizarUsuario }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return contexto;
}
