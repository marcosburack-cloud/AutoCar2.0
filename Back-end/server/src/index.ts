import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UniqueConstraintError, ForeignKeyConstraintError, ModelStatic, Model } from "sequelize";
import { Usuario } from "./models/Usuario";
import { sequelize } from "./database/sequelize";
import { UsuarioDB, ProdutoDB, ServicoDB, AgendamentoDB, ClienteDB } from "./database/models";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Configure uma chave longa e exclusiva no .env antes de iniciar o servidor.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("Configure JWT_SECRET no .env com pelo menos 32 caracteres.");
}
const jwtSecret: string = JWT_SECRET;
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

function mensagemErro(erro: unknown): string {
  if (erro instanceof UniqueConstraintError) return "E-mail ou CPF já cadastrado no sistema.";
  return erro instanceof Error ? erro.message : "Erro inesperado.";
}

// Cadastro de Usuário
app.post("/usuarios", async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha, cpf } = req.body;
    if (![nome, email, senha, cpf].every(v => typeof v === "string" && v.trim())) {
      res.status(400).json({ erro: "Todos os campos são obrigatórios." }); return;
    }
    const validado = new Usuario(nome, email, senha, cpf);
    const senhaHash = await bcrypt.hash(validado.senha, 12);
    await UsuarioDB.create({ nome: validado.nome, email: validado.email, cpf: validado.cpf, senha_hash: senhaHash });
    let boasVindasIA = "Usuário cadastrado com sucesso!";
    if (ai) {
      try {
        const resposta = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Crie uma mensagem curta de boas-vindas com tom automotivo para ${validado.nome} na AutoCar.`,
          config: { systemInstruction: "Você é o assistente AutoCar. Não revele credenciais, tokens, arquivos .env ou dados sensíveis." }
        });
        if (resposta.text) boasVindasIA = resposta.text.trim();
      } catch (e) { console.warn("IA indisponível; usando mensagem padrão."); }
    }
    res.status(201).json({ mensagem: "Cadastro realizado com sucesso!", boasVindasIA, usuario: validado.toJSON() });
  } catch (erro) {
    res.status(erro instanceof UniqueConstraintError ? 409 : 400).json({ erro: mensagemErro(erro) });
  }
});

// Autenticação
app.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;
    if (typeof email !== "string" || typeof senha !== "string" || !email || !senha) {
      res.status(400).json({ erro: "E-mail e senha são obrigatórios." }); return;
    }
    // Regex 
    if (!Usuario.validarEmail(email.trim())) {
      res.status(400).json({ erro: "Formato de e-mail inválido." }); return;
    }
    // Usuário existente
    const usuario = await UsuarioDB.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      res.status(401).json({ erro: "E-mail ou senha incorretos." }); return;
    }
    // Retorno JWT
    const token = jwt.sign({ sub: String(usuario.id), email: usuario.email }, jwtSecret, { expiresIn: "8h" });
    res.json({ mensagem: "Login realizado com sucesso!", token, usuario: {
      nome: usuario.nome, email: usuario.email, cpf: usuario.cpf,
    } });
  } catch (erro) { console.error("Erro de login:", erro); res.status(500).json({ erro: "Erro interno ao realizar login." }); }
});

type AuthRequest = Request & { usuarioId?: number };
function autenticar(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) { res.status(401).json({ erro: "Token de acesso não informado." }); return; }
  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    const id = Number(payload.sub);
    if (!Number.isSafeInteger(id) || id < 1) throw new Error("Token inválido");
    req.usuarioId = id; next();
  } catch { res.status(401).json({ erro: "Sessão inválida ou expirada." }); }
}

app.get("/me", autenticar, async (req: AuthRequest, res: Response) => {
  const usuario = await UsuarioDB.findByPk(req.usuarioId);
  if (!usuario) { res.status(404).json({ erro: "Usuário não encontrado." }); return; }
  res.json({ usuario: { nome: usuario.nome, email: usuario.email, cpf: usuario.cpf } });
});

// Edição de Usuário
app.put("/me", autenticar, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuario = await UsuarioDB.findByPk(req.usuarioId);
    if (!usuario) { res.status(404).json({ erro: "Usuário não encontrado." }); return; }
    const { nome, cpf, senha } = req.body ?? {};
    if (Object.prototype.hasOwnProperty.call(req.body ?? {}, "email")) {
      res.status(400).json({ erro: "Não é permitido alterar o e-mail." }); return;
    }
    if (typeof nome !== "string" || typeof cpf !== "string" || !nome.trim() || !cpf.trim()) {
      res.status(400).json({ erro: "Nome e CPF são obrigatórios." }); return;
    }
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (nome.trim().length < 3 || !Usuario.validarCPF(cpfLimpo)) {
      res.status(400).json({ erro: "Confira o nome (mínimo 3 caracteres) e o CPF." }); return;
    }
    if (senha !== undefined && senha !== "" && (typeof senha !== "string" || !Usuario.validarNivelSenha(senha))) {
      res.status(400).json({ erro: "A senha precisa de 8 caracteres, maiúscula, número e símbolo." }); return;
    }
    usuario.nome = nome.trim(); usuario.cpf = cpfLimpo;
    if (senha) usuario.senha_hash = await bcrypt.hash(senha, 12);
    await usuario.save();
    res.json({ usuario: { nome: usuario.nome, email: usuario.email, cpf: usuario.cpf } });
  } catch (erro) {
    res.status(erro instanceof UniqueConstraintError ? 409 : 500).json({ erro: mensagemErro(erro) });
  }
});

// Quatro recursos de domínio com CRUD
type Recurso = "produtos" | "servicos" | "agendamentos" | "clientes";
const recursos: Record<Recurso, ModelStatic<Model>> = {
  produtos: ProdutoDB, servicos: ServicoDB, agendamentos: AgendamentoDB, clientes: ClienteDB,
};
function obterModelo(nome: string): ModelStatic<Model> | null {
  return Object.prototype.hasOwnProperty.call(recursos, nome) ? recursos[nome as Recurso] : null;
}
function validarDados(recurso: string, entrada: unknown): Record<string, unknown> {
  if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) throw new Error("Dados inválidos.");
  const dados = entrada as Record<string, unknown>;
  const campos: Record<Recurso, string[]> = {
    produtos: ["nome", "descricao", "preco"], servicos: ["nome", "descricao", "preco"],
    agendamentos: ["nome_cliente", "telefone", "modelo_carro", "placa", "servico_id", "data_agendamento", "hora_agendamento"],
    clientes: ["nome", "telefone", "email"],
  };
  const permitidos = campos[recurso as Recurso];
  const saida: Record<string, unknown> = {};
  for (const campo of permitidos) {
    if (!(campo in dados)) continue;
    const valor = dados[campo];
    if (valor === null || valor === "") { saida[campo] = null; continue; }
    if (["preco", "servico_id"].includes(campo)) {
      const numero = Number(valor);
      if (!Number.isFinite(numero) || numero < 0 || (campo === "servico_id" && !Number.isSafeInteger(numero))) throw new Error(`Valor inválido para ${campo}.`);
      saida[campo] = numero;
    } else {
      if (typeof valor !== "string" || valor.length > 500) throw new Error(`Valor inválido para ${campo}.`);
      saida[campo] = valor.trim();
    }
  }
  const obrigatorios = recurso === "agendamentos" ? ["nome_cliente"] : ["nome"];
  for (const campo of obrigatorios) {
    if (typeof saida[campo] !== "string" || !(saida[campo] as string).trim()) throw new Error(`O campo ${campo} é obrigatório.`);
  }
  if (recurso === "clientes" && saida.email && !Usuario.validarEmail(String(saida.email))) throw new Error("E-mail inválido.");
  if (["produtos", "servicos"].includes(recurso) && (saida.preco === undefined || saida.preco === null)) throw new Error("O preço é obrigatório.");
  return saida;
}
app.get("/gerenciar/:recurso", autenticar, async (req: Request, res: Response): Promise<void> => {
  const modelo = obterModelo(req.params.recurso);
  if (!modelo) { res.status(404).json({ erro: "Recurso não encontrado." }); return; }
  const pagina = Math.max(1, Math.min(100000, Number.parseInt(String(req.query.pagina || "1"), 10) || 1));
  const limite = Math.max(1, Math.min(30, Number.parseInt(String(req.query.limite || "10"), 10) || 10));
  try {
    const { rows, count } = await modelo.findAndCountAll({ limit: limite, offset: (pagina - 1) * limite, order: [["id", "DESC"]] });
    res.json({ itens: rows, total: count, pagina, paginas: Math.max(1, Math.ceil(count / limite)) });
  } catch { res.status(500).json({ erro: "Erro ao consultar registros." }); }
});
app.get("/gerenciar/:recurso/:id", autenticar, async (req: Request, res: Response): Promise<void> => {
  const modelo = obterModelo(req.params.recurso);
  if (!modelo) { res.status(404).json({ erro: "Recurso não encontrado." }); return; }
  const item = await modelo.findByPk(req.params.id);
  if (!item) { res.status(404).json({ erro: "Registro não encontrado." }); return; }
  res.json(item);
});
app.post("/gerenciar/:recurso", autenticar, async (req: Request, res: Response): Promise<void> => {
  const modelo = obterModelo(req.params.recurso);
  if (!modelo) { res.status(404).json({ erro: "Recurso não encontrado." }); return; }
  try { const dados = validarDados(req.params.recurso, req.body); res.status(201).json(await modelo.create(dados)); }
  catch (erro) { res.status(400).json({ erro: mensagemErro(erro) }); }
});
app.put("/gerenciar/:recurso/:id", autenticar, async (req: Request, res: Response): Promise<void> => {
  const modelo = obterModelo(req.params.recurso);
  if (!modelo) { res.status(404).json({ erro: "Recurso não encontrado." }); return; }
  try {
    const item = await modelo.findByPk(req.params.id);
    if (!item) { res.status(404).json({ erro: "Registro não encontrado." }); return; }
    const dados = validarDados(req.params.recurso, req.body);
    await item.update(dados); res.json(item);
  } catch (erro) { res.status(400).json({ erro: mensagemErro(erro) }); }
});
app.delete("/gerenciar/:recurso/:id", autenticar, async (req: Request, res: Response): Promise<void> => {
  const modelo = obterModelo(req.params.recurso);
  if (!modelo) { res.status(404).json({ erro: "Recurso não encontrado." }); return; }
  try {
    const item = await modelo.findByPk(req.params.id);
    if (!item) { res.status(404).json({ erro: "Registro não encontrado." }); return; }
    await item.destroy(); res.status(204).send();
  } catch (erro) {
    res.status(erro instanceof ForeignKeyConstraintError ? 409 : 500).json({ erro: erro instanceof ForeignKeyConstraintError ? "Registro utilizado por outros recursos; não é possível excluir." : "Erro ao excluir registro." });
  }
});

app.get("/produtos", autenticar, async (_req: Request, res: Response) => {
  try { res.json(await ProdutoDB.findAll({ order: [["id", "ASC"]] })); }
  catch { res.status(500).json({ erro: "Falha ao carregar produtos." }); }
});
app.get("/servicos", autenticar, async (_req: Request, res: Response) => {
  try { res.json(await ServicoDB.findAll({ order: [["id", "ASC"]] })); }
  catch { res.status(500).json({ erro: "Falha ao carregar serviços." }); }
});
app.get("/agendamentos", autenticar, async (_req: Request, res: Response) => {
  try { res.json(await AgendamentoDB.findAll({ include: [{ model: ServicoDB, as: "servico", attributes: ["nome", "preco"] }], order: [["data_agendamento", "DESC"], ["hora_agendamento", "DESC"]] })); }
  catch { res.status(500).json({ erro: "Falha ao carregar agendamentos." }); }
});
app.get("/dashboard", autenticar, async (_req: Request, res: Response) => {
  try {
    const [agendamentos, servicos, produtos] = await Promise.all([
      AgendamentoDB.count(), ServicoDB.count(), ProdutoDB.count(),
    ]);
    res.json({ agendamentos, servicos, produtos });
  } catch { res.status(500).json({ erro: "Falha ao carregar indicadores." }); }
});

const PORT = Number(process.env.PORT || 3000);
async function iniciar() {
  try {
    await sequelize.authenticate();
    // Cria somente a tabela de usuários que falta no dump. Não altera as tabelas antigas.
    await UsuarioDB.sync();
    await ClienteDB.sync();
    app.listen(PORT, () => console.log(`Servidor AutoCar rodando em http://localhost:${PORT}`));
  } catch (erro) {
    console.error("Não foi possível conectar ao MySQL/MariaDB:", erro);
    process.exit(1);
  }
}
void iniciar();
