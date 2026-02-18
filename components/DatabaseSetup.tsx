
import React from 'react';
import Button from './ui/Button';

const DatabaseSetup: React.FC = () => {
  const sqlScript = `-- SCRIPT COMPLETO DE CONFIGURAÇÃO DA TABELA REQUESTS
-- Execute no SQL Editor do Supabase (botão "New Query")

-- 1. Garante que a tabela de solicitações tenha todas as colunas necessárias
DO $$
BEGIN
    -- Colunas de Data (Texto para compatibilidade facilitada)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='forecastDate') THEN
        ALTER TABLE public.requests ADD COLUMN "forecastDate" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='deliveryDate') THEN
        ALTER TABLE public.requests ADD COLUMN "deliveryDate" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='purchaseOrderDate') THEN
        ALTER TABLE public.requests ADD COLUMN "purchaseOrderDate" TEXT;
    END IF;

    -- Colunas de Objetos Complexos (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='items') THEN
        ALTER TABLE public.requests ADD COLUMN "items" JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='history') THEN
        ALTER TABLE public.requests ADD COLUMN "history" JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='customFields') THEN
        ALTER TABLE public.requests ADD COLUMN "customFields" JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Garante que os campos padrão existam na configuração do formulário
INSERT INTO public.form_fields (id, label, type, "isActive", required, "isStandard", "isVisibleInList", "orderIndex")
VALUES 
('forecastDate', 'Previsão de Entrega', 'date', true, false, true, false, 9),
('deliveryDate', 'Data de Entrega', 'date', true, false, true, false, 10),
('purchaseOrderDate', 'Data da OC', 'date', true, false, true, false, 8)
ON CONFLICT (id) DO UPDATE SET 
  label = EXCLUDED.label,
  "isStandard" = true;

-- 3. Habilita o Realtime para a tabela de solicitações (opcional mas recomendado)
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    alert('SQL copiado! Vá ao dashboard do Supabase, clique em SQL Editor, cole este código e clique em RUN.');
  };

  return (
    <div className="max-w-4xl w-full bg-[#1c1c1c] p-8 rounded-xl shadow-2xl border border-gray-700 my-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Ajuste Estrutural do Banco</h2>
        <p className="text-gray-400">Para salvar solicitações, o banco precisa das colunas de itens, histórico e datas adicionais.</p>
      </div>
      <div className="relative">
        <textarea readOnly value={sqlScript} className="w-full h-64 bg-zinc-950 text-green-400 font-mono text-xs p-4 rounded-md border border-zinc-700 focus:outline-none" />
        <button onClick={copyToClipboard} className="absolute top-2 right-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1 rounded border border-zinc-600 transition-colors">
          Copiar SQL
        </button>
      </div>
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg text-sm text-blue-200 w-full">
            <strong>Instrução:</strong> Copie o código acima, cole no <strong>SQL Editor</strong> do seu projeto no Supabase e execute. Após isso, clique no botão abaixo.
        </div>
        <Button onClick={() => window.location.reload()}>Recarregar Aplicação</Button>
      </div>
    </div>
  );
};

export default DatabaseSetup;
