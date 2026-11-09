-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 08/11/2026 às 17:10
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `autocar`
--

DELIMITER $$
--
-- Procedimentos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_agendamentos` (IN `p_limite` INT, IN `p_offset` INT, IN `p_servico` VARCHAR(100))   SELECT
    id_agendamento,
    nome_cliente,
    telefone,
    modelo_carro,
    placa,
    id_servico,
    nome_servico,
    preco_servico,
    data_agendamento,
    hora_agendamento
FROM vw_agendamentos_completos
WHERE
    p_servico IS NULL
    OR p_servico = ''
    OR nome_servico = p_servico
ORDER BY data_agendamento DESC, hora_agendamento DESC
LIMIT p_offset, p_limite$$

--
-- Funções
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_preco_servico` (`p_id_servico` INT) RETURNS DECIMAL(10,2) DETERMINISTIC RETURN (
    SELECT preco
    FROM servicos
    WHERE id = p_id_servico
)$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendamentos`
--

CREATE TABLE `agendamentos` (
  `id` int(11) NOT NULL,
  `nome_cliente` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `modelo_carro` varchar(100) DEFAULT NULL,
  `placa` varchar(10) DEFAULT NULL,
  `servico_id` int(11) DEFAULT NULL,
  `data_agendamento` date DEFAULT NULL,
  `hora_agendamento` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `agendamentos`
--

INSERT INTO `agendamentos` (`id`, `nome_cliente`, `telefone`, `modelo_carro`, `placa`, `servico_id`, `data_agendamento`, `hora_agendamento`) VALUES
(1, 'Marcos Paulo', '(44)99999-9999', 'Gol G6', 'ABC1D23', 1, '2026-06-20', '14:30:00'),
(2, 'João Silva', '(44)98888-7777', 'Honda Civic', 'DEF4G56', 3, '2026-06-22', '09:00:00'),
(3, 'Ana Souza', '(44)97777-6666', 'Toyota Corolla', 'GHI7J89', 2, '2026-06-23', '10:30:00'),
(4, 'Carlos Pereira', '4496666-5555', 'Onix', 'JKL1M23', 4, '2026-06-24', '15:00:00'),
(5, 'Pedro Martins', '44991419607', 'Palio', 'DNS1D12', 2, '2026-09-19', '11:10:00'),
(7, 'Marcos Paulo Burack', '44991419608', 'Fiesta', 'ASD1F12', 4, '2026-09-10', '12:30:00');

--
-- Acionadores `agendamentos`
--
DELIMITER $$
CREATE TRIGGER `trg_validar_agendamento` BEFORE INSERT ON `agendamentos` FOR EACH ROW BEGIN
    IF NEW.data_agendamento < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Não é permitido agendar para uma data anterior à atual.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome`, `descricao`, `preco`) VALUES
(1, 'Shampoo Automotivo', 'Limpeza de automotivos', 29.90),
(2, 'Cera Protetora', 'Aspecto de brilho, deixa o carro um espelho', 39.90),
(3, 'Pretinho para Pneus', 'Protetor e acabamento para os Pneus', 19.90);

-- --------------------------------------------------------

--
-- Estrutura para tabela `produto_servico`
--

CREATE TABLE `produto_servico` (
  `produto_id` int(11) NOT NULL,
  `servico_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produto_servico`
--

INSERT INTO `produto_servico` (`produto_id`, `servico_id`) VALUES
(1, 1),
(1, 2),
(1, 4),
(2, 1),
(2, 3),
(3, 2),
(3, 3);

-- --------------------------------------------------------

--
-- Estrutura para tabela `servicos`
--

CREATE TABLE `servicos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `servicos`
--

INSERT INTO `servicos` (`id`, `nome`, `descricao`, `preco`) VALUES
(1, 'Troca de óleo', 'Troca completa de óleo e filtro', 200.00),
(2, 'Alinhamento e balanceamento', 'Correção da direção', 80.00),
(3, 'Revisão completa', 'Revisão geral do veículo', 250.00),
(4, 'Troca de freios', 'Troca de pastilhas', 180.00),
(5, 'Troca de Pneu', 'Realizar a troca de um Pneu velho ou furado por um novo em otimo estado.', 150.00);

--
-- Acionadores `servicos`
--
DELIMITER $$
CREATE TRIGGER `trg_padroniza_preco_servico` BEFORE UPDATE ON `servicos` FOR EACH ROW BEGIN
    IF NEW.preco < 0 THEN
        SET NEW.preco = OLD.preco;
    END IF;
END
$$
DELIMITER ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `servico_id` (`servico_id`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `produto_servico`
--
ALTER TABLE `produto_servico`
  ADD PRIMARY KEY (`produto_id`,`servico_id`),
  ADD KEY `servico_id` (`servico_id`);

--
-- Índices de tabela `servicos`
--
ALTER TABLE `servicos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `servicos`
--
ALTER TABLE `servicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD CONSTRAINT `agendamentos_ibfk_1` FOREIGN KEY (`servico_id`) REFERENCES `servicos` (`id`);

--
-- Restrições para tabelas `produto_servico`
--
ALTER TABLE `produto_servico`
  ADD CONSTRAINT `produto_servico_ibfk_1` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`),
  ADD CONSTRAINT `produto_servico_ibfk_2` FOREIGN KEY (`servico_id`) REFERENCES `servicos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
