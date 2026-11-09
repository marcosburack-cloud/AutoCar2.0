import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize";

export class UsuarioDB extends Model {
  declare id: number;
  declare nome: string;
  declare email: string;
  declare cpf: string;
  declare senha_hash: string;
}
UsuarioDB.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  cpf: { type: DataTypes.STRING(11), allowNull: false, unique: true },
  senha_hash: { type: DataTypes.STRING(255), allowNull: false },
}, { sequelize, tableName: "usuarios", modelName: "UsuarioDB" });

export class ProdutoDB extends Model {
  declare id: number; declare nome: string; declare descricao: string | null; declare preco: string | null;
}
ProdutoDB.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: DataTypes.STRING(100), descricao: DataTypes.TEXT, preco: DataTypes.DECIMAL(10, 2),
}, { sequelize, tableName: "produtos", modelName: "ProdutoDB" });

export class ServicoDB extends Model {
  declare id: number; declare nome: string; declare descricao: string | null; declare preco: string | null;
}
ServicoDB.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: DataTypes.STRING(100), descricao: DataTypes.TEXT, preco: DataTypes.DECIMAL(10, 2),
}, { sequelize, tableName: "servicos", modelName: "ServicoDB" });

export class AgendamentoDB extends Model {
  declare id: number; declare nome_cliente: string; declare telefone: string | null;
  declare modelo_carro: string | null; declare placa: string | null;
  declare servico_id: number | null; declare data_agendamento: string | null;
  declare hora_agendamento: string | null;
}
AgendamentoDB.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome_cliente: { type: DataTypes.STRING(100), allowNull: false },
  telefone: DataTypes.STRING(20), modelo_carro: DataTypes.STRING(100),
  placa: DataTypes.STRING(10), servico_id: DataTypes.INTEGER,
  data_agendamento: DataTypes.DATEONLY, hora_agendamento: DataTypes.TIME,
}, { sequelize, tableName: "agendamentos", modelName: "AgendamentoDB" });

AgendamentoDB.belongsTo(ServicoDB, { foreignKey: "servico_id", as: "servico" });
ServicoDB.hasMany(AgendamentoDB, { foreignKey: "servico_id", as: "agendamentos" });

// Novo quarto recurso, sem modificar as tabelas legadas do AutoCar.
export class ClienteDB extends Model {
  declare id: number; declare nome: string; declare telefone: string | null; declare email: string | null;
}
ClienteDB.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  telefone: DataTypes.STRING(20), email: DataTypes.STRING(150),
}, { sequelize, tableName: "clientes", modelName: "ClienteDB" });
