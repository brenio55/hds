-- Criar tabela para registro de horas trabalhadas por funcionário
CREATE TABLE IF NOT EXISTS hh_registros (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    obra_id INTEGER NOT NULL, -- Referência ao ID da proposta/obra
    data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    horas_normais DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Quantidade de horas normais
    horas_60 DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Quantidade de horas com adicional de 60%
    horas_100 DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Quantidade de horas com adicional de 100%
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_hh_registros_funcionario ON hh_registros(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_hh_registros_obra ON hh_registros(obra_id);
CREATE INDEX IF NOT EXISTS idx_hh_registros_data ON hh_registros(data_registro);

-- Comentários para documentação
COMMENT ON TABLE hh_registros IS 'Tabela para armazenar registros de horas trabalhadas (HH) por funcionário em cada obra';
COMMENT ON COLUMN hh_registros.id IS 'Identificador único do registro';
COMMENT ON COLUMN hh_registros.funcionario_id IS 'ID do funcionário que trabalhou';
COMMENT ON COLUMN hh_registros.obra_id IS 'ID da obra/proposta onde o trabalho foi realizado';
COMMENT ON COLUMN hh_registros.data_registro IS 'Data em que o trabalho foi realizado';
COMMENT ON COLUMN hh_registros.horas_normais IS 'Quantidade de horas trabalhadas com valor normal';
COMMENT ON COLUMN hh_registros.horas_60 IS 'Quantidade de horas trabalhadas com adicional de 60%';
COMMENT ON COLUMN hh_registros.horas_100 IS 'Quantidade de horas trabalhadas com adicional de 100%';
COMMENT ON COLUMN hh_registros.observacao IS 'Observações adicionais sobre o registro';
COMMENT ON COLUMN hh_registros.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN hh_registros.updated_at IS 'Data da última atualização do registro'; 