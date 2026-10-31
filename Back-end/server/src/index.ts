import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Usuario } from "./models/Usuario";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
        });
        if (response.text) {
          mensagemBoasVindasIA = response.text.trim();
        }
      } catch (err) {
        console.warn("Aviso: Não foi possível gerar mensagem via IA.", err);
      }
    }

    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso!",
      boasVindasIA: mensagemBoasVindasIA,
      usuario: novoUsuario.toJSON(),
    });
  } catch (error: any) {
    res.status(400).json({ erro: error.message || "Erro ao realizar o cadastro." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Back-end rodando em http://localhost:${PORT}`);
});