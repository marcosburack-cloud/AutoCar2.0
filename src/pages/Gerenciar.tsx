import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { excluirRegistro, listarRegistros, type ListaPaginada, type Recurso } from '../services/api';
import './Gerenciar.css';

export const recursos: Record<Recurso, { titulo: string; campos: { nome: string; rotulo: string; tipo?: string; obrigatorio?: boolean }[] }> = {
  produtos: { titulo: 'Produtos', campos: [{ nome: 'nome', rotulo: 'Nome', obrigatorio: true }, { nome: 'descricao', rotulo: 'Descrição' }, { nome: 'preco', rotulo: 'Preço', tipo: 'number', obrigatorio: true }] },
  servicos: { titulo: 'Serviços', campos: [{ nome: 'nome', rotulo: 'Nome', obrigatorio: true }, { nome: 'descricao', rotulo: 'Descrição' }, { nome: 'preco', rotulo: 'Preço', tipo: 'number', obrigatorio: true }] },
  agendamentos: { titulo: 'Agendamentos', campos: [{ nome: 'nome_cliente', rotulo: 'Nome do cliente', obrigatorio: true }, { nome: 'telefone', rotulo: 'Telefone' }, { nome: 'modelo_carro', rotulo: 'Modelo do carro' }, { nome: 'placa', rotulo: 'Placa' }, { nome: 'servico_id', rotulo: 'ID do serviço', tipo: 'number' }, { nome: 'data_agendamento', rotulo: 'Data', tipo: 'date' }, { nome: 'hora_agendamento', rotulo: 'Hora', tipo: 'time' }] },
  clientes: { titulo: 'Clientes', campos: [{ nome: 'nome', rotulo: 'Nome', obrigatorio: true }, { nome: 'telefone', rotulo: 'Telefone' }, { nome: 'email', rotulo: 'E-mail', tipo: 'email' }] },
};
export function recursoValido(nome: string | undefined): nome is Recurso { return !!nome && Object.prototype.hasOwnProperty.call(recursos, nome); }
export default function Gerenciar() {
  const { recurso } = useParams(); const { token } = useAuth();
  const [pagina, setPagina] = useState(1); const [dados, setDados] = useState<ListaPaginada | null>(null);
  const [erro, setErro] = useState(''); const [atualizar, setAtualizar] = useState(0);
  useEffect(() => { setPagina(1); }, [recurso]);
  useEffect(() => {
    if (!token || !recursoValido(recurso)) return;
    let ativo = true;
    listarRegistros(recurso, pagina, token).then(res => { if (ativo) { setDados(res); setErro(''); } })
      .catch(e => { if (ativo) setErro(e instanceof Error ? e.message : 'Erro ao consultar registros.'); });
    return () => { ativo = false; };
  }, [recurso, pagina, token, atualizar]);
  if (!recursoValido(recurso)) return <p>Recurso inválido.</p>;
  const nomeRecurso = recurso;
  async function excluir(id: number) {
    if (!token || !window.confirm('Excluir este registro definitivamente?')) return;
    try { await excluirRegistro(nomeRecurso, id, token); setAtualizar(n => n + 1); }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao excluir.'); }
  }
  return <section className="manage-panel">
    <header className="manage-heading"><div><h2>{recursos[recurso].titulo}</h2><p>Registros salvos no MySQL</p></div><Link className="manage-primary" to={`/gerenciar/${recurso}/novo`}>+ Novo registro</Link></header>
    {erro && <p role="alert" className="form-error">{erro}</p>}
    <div className="manage-table-wrap"><table className="manage-table"><thead><tr>{recursos[recurso].campos.slice(0, 4).map(c => <th key={c.nome}>{c.rotulo}</th>)}<th>Ações</th></tr></thead><tbody>
      {dados?.itens.map(item => <tr key={item.id}>{recursos[recurso].campos.slice(0, 4).map(c => <td key={c.nome}>{String(item[c.nome] ?? '—')}</td>)}<td className="manage-actions"><Link to={`/gerenciar/${recurso}/${item.id}`}>Editar</Link><button type="button" onClick={() => void excluir(item.id)}>Excluir</button></td></tr>)}
      {dados?.itens.length === 0 && <tr><td colSpan={5}>Nenhum registro encontrado.</td></tr>}
    </tbody></table></div>
    <footer className="manage-pagination"><span>{dados?.total ?? 0} registros · Página {pagina} de {dados?.paginas ?? 1}</span><div><button disabled={pagina <= 1} onClick={() => setPagina(n => n - 1)}>Anterior</button><button disabled={pagina >= (dados?.paginas ?? 1)} onClick={() => setPagina(n => n + 1)}>Próxima</button></div></footer>
  </section>;
}
