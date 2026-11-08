
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

  let resultado: any = null;

  try {
    resultado = texto ? JSON.parse(texto) : null;
  } catch {
    resultado = null;
  }

  if (!resposta.ok) {
    const mensagem =
      resultado?.message ||
      resultado?.error ||
      resultado?.erro ||
      (typeof resultado === 'string' ? resultado : null) ||
      texto ||
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