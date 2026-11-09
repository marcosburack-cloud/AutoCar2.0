
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function cadastrarUsuario(dados: {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
}) {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se o back-end está ligado.'
    );
  }

  const texto = await resposta.text();

  let resultado: unknown = null;

  try {
    resultado = texto ? JSON.parse(texto) : null;
  } catch {
    resultado = null;
  }

  if (!resposta.ok) {
    const erroApi = resultado && typeof resultado === 'object' ? resultado as Record<string, unknown> : null;
    const mensagem =
      (typeof erroApi?.message === 'string' && erroApi.message) ||
      (typeof erroApi?.error === 'string' && erroApi.error) ||
      (typeof erroApi?.erro === 'string' && erroApi.erro) ||
      (typeof resultado === 'string' ? resultado : null) ||
      'Não foi possível realizar o cadastro.';

    throw new Error(mensagem);
  }

  return resultado;
}
export interface Usuario {
  nome: string;
  email: string;
  cpf: string;
}

interface RespostaLogin {
  mensagem: string;
  token: string;
  usuario: Usuario;
}

export async function loginUsuario(dados: {
  email: string;
  senha: string;
}): Promise<RespostaLogin> {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se o back-end está ligado.'
    );
  }

  const texto = await resposta.text();

  let resultado: RespostaLogin | { erro?: string } | null;

  try {
    resultado = texto ? JSON.parse(texto) : null;
  } catch {
    resultado = null;
  }

  if (!resposta.ok) {
    const mensagem =
      resultado && 'erro' in resultado && resultado.erro
        ? resultado.erro
        : 'Não foi possível realizar o login.';

    throw new Error(mensagem);
  }

  if (
    !resultado ||
    !('token' in resultado) ||
    !resultado.token ||
    !resultado.usuario
  ) {
    throw new Error('Resposta inválida recebida do servidor.');
  }

  return resultado as RespostaLogin;
}
export interface IndicadoresDashboard {
  agendamentos: number;
  servicos: number;
  produtos: number;
}
export interface Agendamento {
  id: number;
  nome_cliente: string;
  modelo_carro: string | null;
  data_agendamento: string | null;
  hora_agendamento: string | null;
  servico: { nome: string; preco: string } | null;
}

async function buscarAutenticado<T>(caminho: string, token: string): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }
  const dados: unknown = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const mensagem = dados && typeof dados === 'object' && 'erro' in dados && typeof dados.erro === 'string'
      ? dados.erro : 'Erro ao buscar dados no servidor.';
    throw new Error(mensagem);
  }
  return dados as T;
}
export function buscarIndicadores(token: string) {
  return buscarAutenticado<IndicadoresDashboard>('/dashboard', token);
}
export function buscarAgendamentos(token: string) {
  return buscarAutenticado<Agendamento[]>('/agendamentos', token);
}
export interface ItemCatalogo { id: number; nome: string; descricao: string | null; preco: string | null }
export function buscarProdutos(token: string) {
  return buscarAutenticado<ItemCatalogo[]>('/produtos', token);
}
export function buscarServicos(token: string) {
  return buscarAutenticado<ItemCatalogo[]>('/servicos', token);
}

export type Recurso = 'produtos' | 'servicos' | 'agendamentos' | 'clientes';
export type Registro = Record<string, string | number | null> & { id: number };
export interface ListaPaginada { itens: Registro[]; total: number; pagina: number; paginas: number }

export async function requisicaoAutenticada<T>(caminho: string, token: string, metodo = 'GET', corpo?: object): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: { Authorization: `Bearer ${token}`, ...(corpo ? { 'Content-Type': 'application/json' } : {}) },
      ...(corpo ? { body: JSON.stringify(corpo) } : {}),
    });
  } catch { throw new Error('Não foi possível conectar ao servidor.'); }
  const dados: unknown = resposta.status === 204 ? null : await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const mensagem = dados && typeof dados === 'object' && 'erro' in dados && typeof dados.erro === 'string'
      ? dados.erro : 'Não foi possível concluir a operação.';
    throw new Error(mensagem);
  }
  return dados as T;
}
export const listarRegistros = (recurso: Recurso, pagina: number, token: string) =>
  requisicaoAutenticada<ListaPaginada>(`/gerenciar/${recurso}?pagina=${pagina}&limite=10`, token);
export const consultarRegistro = (recurso: Recurso, id: string, token: string) =>
  requisicaoAutenticada<Registro>(`/gerenciar/${recurso}/${id}`, token);
export const salvarRegistro = (recurso: Recurso, dados: Record<string, unknown>, token: string, id?: string) =>
  requisicaoAutenticada<Registro>(`/gerenciar/${recurso}${id ? `/${id}` : ''}`, token, id ? 'PUT' : 'POST', dados);
export const excluirRegistro = (recurso: Recurso, id: number, token: string) =>
  requisicaoAutenticada<null>(`/gerenciar/${recurso}/${id}`, token, 'DELETE');
export const editarPerfil = (dados: { nome: string; cpf: string; senha?: string }, token: string) =>
  requisicaoAutenticada<{ usuario: Usuario }>('/me', token, 'PUT', dados);
