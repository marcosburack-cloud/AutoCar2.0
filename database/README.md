# Banco de dados AutoCar

1. Inicie o MySQL/MariaDB pelo XAMPP (ou sua instalação).
2. No phpMyAdmin ou DBeaver, crie o banco `autocar` (utf8mb4), se ainda não existir.
3. Importe `autocar-original.sql` **somente se o banco ainda não tiver essas tabelas**. Faça backup antes de importar: o dump contém comandos `CREATE TABLE`, inserts e objetos com `DEFINER=root@localhost` que podem exigir ajustes de permissões. Ele inclui agendamentos de exemplo com datas antigas; o trigger bloqueia novos agendamentos no passado.
4. Na pasta `Back-end/server`, execute `npm install` para instalar Sequelize e mysql2, copie `.env.example` para `.env` e configure suas credenciais locais e uma chave JWT forte.
5. Execute `npm run dev`. Na primeira inicialização o Sequelize cria a tabela `usuarios` se ela não existir, sem modificar as outras tabelas.
6. Em outro terminal, na raiz do projeto, rode `npm install` e `npm run dev`.

O cadastro salva os usuários em `usuarios` com senha em hash bcrypt. O login lê o mesmo banco e devolve JWT. As rotas `/me`, `/produtos`, `/servicos`, `/agendamentos` e `/dashboard` exigem `Authorization: Bearer <token>`. Não existem ainda endpoints de escrita para produtos, serviços e agendamentos. Os indicadores de faturamento e serviços realizados não são dedutíveis com segurança do dump; portanto não são exibidos como totais.

**Importante:** usuários que antes estavam apenas no array de memória do servidor precisam se cadastrar novamente. Não publique o `.env` nem bancos com dados pessoais reais no GitHub. O arquivo SQL incluído é um dump fornecido para desenvolvimento, contendo dados de exemplo, inclusive nomes e telefones; revise antes de publicar.
