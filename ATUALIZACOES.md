# AutoCar2.0 — Atualização de funcionalidades

## Incluído
- Edição autenticada do próprio perfil em `PUT /me`, com nome, CPF e senha opcional; e-mail imutável.
- CRUD autenticado para produtos, serviços, agendamentos e clientes em `/gerenciar/:recurso`, com paginação (10 por página), consulta individual, criação, edição e exclusão.
- Interface React de listagem, paginação, cadastro e edição para os quatro recursos.
- Navegação lateral atualizada e acesso rápido pelo Dashboard.
- Criação automática apenas da nova tabela `clientes` e da tabela `usuarios`, se ainda não existirem. As tabelas legadas permanecem preservadas.

## Como testar
1. Faça backup do projeto e do banco antes de substituir os arquivos.
2. Mantenha seu `.env` **local** na pasta `Back-end/server`; não compartilhe nem substitua o arquivo. Não há `.env` dentro deste ZIP.
3. Ligue o MySQL/MariaDB do XAMPP.
4. Em `Back-end/server`: `npm install` e `npm run dev`.
5. Na raiz do Front-end: `npm install` e `npm run dev`.
6. Faça login novamente, acesse Meu perfil e as quatro opções de gerenciamento no menu.
7. Verifique também `npm run build` na raiz e, se necessário, `npx tsc --noEmit` na pasta do servidor.

## Limitações e atenção
- **Não foi possível executar o build nem testar contra seu MySQL local neste ambiente.** Valide antes de entregar.
- O recurso `clientes` é uma tabela nova, distinta de `usuarios` (contas de login).
- A tabela legada `agendamentos` possui trigger que impede novos agendamentos com datas anteriores ao dia atual.
- Produtos e serviços podem ter referências em outras tabelas; o banco pode impedir a exclusão por integridade referencial.
- Esta versão não implementa Docker, Nginx, DevOps nem os itens avançados de Tech Forge.
- Como não há controle de permissões por função, qualquer usuário autenticado pode administrar os quatro recursos; para produção seria necessário definir papéis/permissões.
