
import React from 'react';
import Button from './ui/Button';

const DatabaseSetup: React.FC = () => {
  const sqlScript = `-- SCRIPT DE CONFIGURAÇÃO DAS COLUNAS DE DATA
-- Execute no SQL Editor do Supabase para garantir que os campos existam.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='forecastDate') THEN
        ALTER TABLE public.requests ADD COLUMN "forecastDate" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='deliveryDate') THEN
        ALTER TABLE public.requests ADD COLUMN "deliveryDate" TEXT;
    END IF;
END $$;

INSERT INTO public.form_fields (id, label, type, "isActive", required, "isStandard", "isVisibleInList", "orderIndex")
VALUES 
('forecastDate', 'Previsão de Entrega', 'date', true, false, true, false, 9),
('deliveryDate', 'Data de Entrega', 'date', true, false, true, false, 10)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    alert('SQL copiado! Execute-o no SQL Editor do Supabase.');
  };

  return (
    <div className="max-w-4xl w-full bg-[#1c1c1c] p-8 rounded-xl shadow-2xl border border-gray-700 my-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Ajuste de Colunas de Data</h2>
        <p className="text-gray-400">Execute o script abaixo para garantir a compatibilidade dos campos.</p>
      </div>
      <div className="relative">
        <textarea readOnly value={sqlScript} className="w-full h-48 bg-zinc-950 text-green-400 font-mono text-xs p-4 rounded-md border border-zinc-700 focus:outline-none" />
        <button onClick={copyToClipboard} className="absolute top-2 right-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1 rounded border border-zinc-600 transition-colors">
          Copiar SQL
        </button>
      </div>
      <div className="mt-6 flex justify-center">
        <Button onClick={() => window.location.reload()}>Recarregar Aplicação</Button>
      </div>
    </div>
  );
};

export default DatabaseSetup;
