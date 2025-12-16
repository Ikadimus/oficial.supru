
import React from 'react';
import Button from './ui/Button';

const DatabaseSetup: React.FC = () => {
  const sqlScript = `-- =================================================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO DO BANCO DE DADOS
-- Copie todo este conteúdo e execute no SQL Editor do Supabase
-- =================================================================

-- 1. Tabela de Setores
CREATE TABLE IF NOT EXISTS public.sectors (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text
);

-- 2. Tabela de Usuários
CREATE TABLE IF NOT EXISTS public.users (
  id bigint PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  role text NOT NULL,
  sector text
);

-- 3. Tabela de Solicitações
CREATE TABLE IF NOT EXISTS public.requests (
  id bigint PRIMARY KEY,
  "orderNumber" text NOT NULL,
  "requestDate" text,
  requester text,
  sector text,
  supplier text,
  description text,
  "purchaseOrderDate" text,
  "deliveryDate" text,
  status text,
  responsible text,
  items jsonb DEFAULT '[]'::jsonb,
  "customFields" jsonb DEFAULT '{}'::jsonb,
  history jsonb DEFAULT '[]'::jsonb
);

-- 4. Tabela de Campos do Formulário
CREATE TABLE IF NOT EXISTS public.form_fields (
  id text PRIMARY KEY,
  label text NOT NULL,
  type text NOT NULL,
  "isActive" boolean DEFAULT true,
  required boolean DEFAULT false,
  "isStandard" boolean DEFAULT false,
  "isVisibleInList" boolean DEFAULT true,
  "orderIndex" integer DEFAULT 99
);

-- 5. Tabela de Status
CREATE TABLE IF NOT EXISTS public.statuses (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text
);

-- 6. Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS public.suppliers (
  id text PRIMARY KEY,
  name text NOT NULL,
  "contactName" text,
  email text,
  phone text,
  category text,
  rating integer DEFAULT 0,
  notes text
);

-- 7. Tabela de Configurações Globais (Metas)
CREATE TABLE IF NOT EXISTS public.app_config (
  id bigint PRIMARY KEY,
  sla_excellent integer DEFAULT 5,
  sla_good integer DEFAULT 10
);

-- =================================================================
-- VERIFICAÇÃO E CORREÇÃO DE COLUNAS FALTANTES
-- =================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='history') THEN
        ALTER TABLE public.requests ADD COLUMN "history" JSONB DEFAULT '[]'::JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='description') THEN
        ALTER TABLE public.requests ADD COLUMN "description" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='requester') THEN
        ALTER TABLE public.requests ADD COLUMN "requester" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='purchaseOrderDate') THEN
        ALTER TABLE public.requests ADD COLUMN "purchaseOrderDate" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='form_fields' AND column_name='isVisibleInList') THEN
        ALTER TABLE public.form_fields ADD COLUMN "isVisibleInList" BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='form_fields' AND column_name='orderIndex') THEN
        ALTER TABLE public.form_fields ADD COLUMN "orderIndex" INTEGER DEFAULT 99;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='contactName') THEN
        ALTER TABLE public.suppliers ADD COLUMN "contactName" text;
    END IF;
END $$;

UPDATE public.requests SET history = '[]'::JSONB WHERE history IS NULL;

-- =================================================================
-- GARANTIR QUE OS CAMPOS PADRÃO EXISTAM EM form_fields
-- =================================================================

INSERT INTO public.form_fields (id, label, type, "isActive", required, "isStandard", "isVisibleInList", "orderIndex")
VALUES ('purchaseOrderDate', 'Data da OC', 'date', true, false, true, false, 7)
ON CONFLICT (id) DO UPDATE 
SET label = EXCLUDED.label, 
    type = EXCLUDED.type, 
    "isStandard" = true;

-- Seed da configuração inicial se não existir
INSERT INTO public.app_config (id, sla_excellent, sla_good)
VALUES (1, 5, 10)
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- PERMISSÕES DE ACESSO (RLS)
-- =================================================================

ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for all users" ON public.sectors;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.requests;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.form_fields;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.statuses;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.app_config;

CREATE POLICY "Enable all access for all users" ON public.sectors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.form_fields FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.statuses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.app_config FOR ALL USING (true) WITH CHECK (true);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    alert('SQL copiado para a área de transferência!');
  };

  return (
    <div className="max-w-4xl w-full bg-[#1c1c1c] p-8 rounded-xl shadow-2xl border border-gray-700 my-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Configuração Inicial do Banco de Dados</h2>
        <p className="text-gray-400">
          Utilize o script abaixo para criar as tabelas e colunas necessárias no Supabase.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6 text-sm text-blue-200">
        <p className="font-bold mb-2">Instruções:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Copie o código SQL abaixo.</li>
          <li>Acesse seu projeto no <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline hover:text-white">Dashboard do Supabase</a>.</li>
          <li>Vá até a seção <strong>SQL Editor</strong> no menu lateral esquerdo.</li>
          <li>Cole o código e clique em <strong>Run</strong>.</li>
          <li>Se houver sucesso, volte aqui e recarregue a página (F5).</li>
        </ol>
      </div>

      <div className="relative">
        <textarea 
          readOnly 
          value={sqlScript} 
          className="w-full h-96 bg-zinc-950 text-green-400 font-mono text-xs p-4 rounded-md border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button 
          onClick={copyToClipboard}
          className="absolute top-2 right-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1 rounded border border-zinc-600 transition-colors"
        >
          Copiar SQL
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={() => window.location.reload()}>
          Recarregar Aplicação
        </Button>
      </div>
    </div>
  );
};

export default DatabaseSetup;
