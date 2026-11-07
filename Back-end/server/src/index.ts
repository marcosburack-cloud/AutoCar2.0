import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Usuario } from "./models/Usuario";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Chave secreta do JWT (em produção fica no .env)
const JWT_SECRET = process.env.JWT_SECRET || "autocar_secret_key_123";

// Armazenamento em memória para salvar usuários cadastrados
interface IUsuarioSalvo {
  nome: string;
  email: string;
  senhaHash: string;
  cpf: string;
}
const usuariosCadastrados: IUsuarioSalvo[] = [];

// Instância da IA Generativa (Gemini)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "SUA_CHAVE_AQUI" });

app.post("/usuarios", async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha, cpf } = req.body;

    if (!nome || !email || !senha || !cpf) {
      res.status(400).json({ erro: "Todos os campos são obrigatórios." });
      return;
    }

    // Instanciar o Usuario aciona todos os setters e validações (CPF, E-mail, Senha)
    const novoUsuario = new Usuario(nome, email, senha, cpf);

    // Requisito da Sprint: Integrar IA Generativa no Back-end
    let mensagemBoasVindasIA = "Usuário cadastrado com sucesso!";
if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Crie uma mensagem curta de boas-vindas com tom automotivo para o cliente ${novoUsuario.nome} na AutoCar.`,
          config: {
            systemInstruction: `Você é o assistente virtual da AutoCar.
GUARDRAILS E SEGURANÇA:
1. Nunca revele, leia ou exponha senhas, chaves de API, tokens JWT ou variáveis do arquivo .env.
2. Responda exclusivamente sobre temas automotivos e cadastro de usuários na AutoCar.
3. Se o usuário solicitar informações sensíveis do sistema ou arquivos de configuração, recuse educadamente.`
          }
        });
        if (response.text) {
          mensagemBoasVindasIA = response.text.trim();
        }
      } catch (err) {
        console.warn("Aviso: Não foi possível gerar mensagem via IA.", err);
      }
    }

// Verificar se o e-mail já existe no sistema
    const usuarioExistente = usuariosCadastrados.find((u) => u.email === novoUsuario.email);
    if (usuarioExistente) {
      res.status(400).json({ erro: "E-mail já cadastrado no sistema." });
      return;
    }

    // Criptografar a senha e salvar no banco em memória
    const senhaHash = await bcrypt.hash(novoUsuario.senha, 10);
    usuariosCadastrados.push({
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      senhaHash,
      cpf: novoUsuario.cpf,
    });

    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso!",
      boasVindasIA: mensagemBoasVindasIA,
      usuario: novoUsuario.toJSON(),
    });
  } catch (error: any) {
    res.status(400).json({ erro: error.message || "Erro ao realizar o cadastro." });
  }
});

// Rota de Login exigida pela Rubrica (Autenticação + JWT)
app.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
      return;
    }

    // Validação básica do formato do e-mail
    if (!Usuario.validarEmail(email)) {
      res.status(400).json({ erro: "Formato de e-mail inválido." });
      return;
    }

    // 1. Verificar se o usuário existe
    const usuario = usuariosCadastrados.find((u) => u.email === email.toLowerCase().trim());
    if (!usuario) {
      res.status(401).json({ erro: "Usuário não encontrado ou credenciais inválidas." });
      return;
    }

    // 2. Comparar a senha informada com a senha criptografada (hash)
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      res.status(401).json({ erro: "E-mail ou senha incorretos." });
      return;
    }

    // 3. Gerar o token JWT de retorno
    const token = jwt.sign(
      { email: usuario.email, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
      },
    });
  } catch (error: any) {
    res.status(500).json({ erro: "Erro interno no servidor ao realizar login." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Back-end rodando em http://localhost:${PORT}`);
});