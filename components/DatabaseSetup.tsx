
import React from 'react';
import Button from './ui/Button';

const DatabaseSetup: React.FC = () => {
  const sqlScript = `-- =================================================================
-- SCRIPT DE CRIAÇÃO E CORREÇÃO DO BANCO DE DADOS (SUPRIMENTOS)
-- Copie e cole este código no SQL Editor do Supabase e clique em RUN.
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
-- A coluna 'history' é do tipo JSONB para armazenar o array de logs de alteração.
CREATE TABLE IF NOT EXISTS public.requests (
  id bigint PRIMARY KEY,
  "orderNumber" text NOT NULL,
  "requestDate" text,
  requester text,
  sector text,
  supplier text,
  description text,
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

-- =================================================================
-- CORREÇÕES DE COLUNAS FALTANTES (Para bancos já criados)
-- =================================================================

-- Adiciona a coluna HISTORY se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='history') THEN
        ALTER TABLE public.requests ADD COLUMN "history" JSONB DEFAULT '[]'::JSONB;
    END IF;
END $$;

-- Garante que o histórico antigo não seja NULL (evita erro no React)
UPDATE public.requests SET history = '[]'::JSONB WHERE history IS NULL;

-- Adiciona outras colunas essenciais se faltarem
DO $$
BEGIN
    -- Campos na tabela requests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='description') THEN
        ALTER TABLE public.requests ADD COLUMN "description" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='requester') THEN
        ALTER TABLE public.requests ADD COLUMN "requester" TEXT;
    END IF;

    -- Campos na tabela form_fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='form_fields' AND column_name='isVisibleInList') THEN
        ALTER TABLE public.form_fields ADD COLUMN "isVisibleInList" BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='form_fields' AND column_name='orderIndex') THEN
        ALTER TABLE public.form_fields ADD COLUMN "orderIndex" INTEGER DEFAULT 99;
    END IF;
END $$;

-- =================================================================
-- POLÍTICAS DE SEGURANÇA (RLS) - Permite acesso público para o app funcionar
-- =================================================================
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for all users" ON public.sectors;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.requests;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.form_fields;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.statuses;

CREATE POLICY "Enable all access for all users" ON public.sectors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.form_fields FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.statuses FOR ALL USING (true) WITH CHECK (true);
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
          className="w-full h-64 bg-zinc-950 text-green-400 font-mono text-xs p-4 rounded-md border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
