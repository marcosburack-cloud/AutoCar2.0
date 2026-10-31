
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
