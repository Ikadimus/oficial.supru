
import React from 'react';
import Button from './ui/Button';

const DatabaseSetup: React.FC = () => {
  const sqlScript = `
-- 1. Tabela de Setores
create table if not exists public.sectors (
  id text primary key,
  name text not null,
  description text
);

-- 2. Tabela de Usuários
create table if not exists public.users (
  id bigint primary key,
  name text not null,
  email text not null,
  password text not null,
  role text not null,
  sector text
);

-- 3. Tabela de Solicitações
create table if not exists public.requests (
  id bigint primary key,
  "orderNumber" text not null,
  "requestDate" text,
  requester text,
  sector text,
  supplier text,
  description text,
  "deliveryDate" text,
  status text,
  responsible text,
  items jsonb default '[]'::jsonb,
  "customFields" jsonb default '{}'::jsonb,
  history jsonb default '[]'::jsonb
);

-- 4. Tabela de Campos do Formulário
create table if not exists public.form_fields (
  id text primary key,
  label text not null,
  type text not null,
  "isActive" boolean default true,
  required boolean default false,
  "isStandard" boolean default false,
  "isVisibleInList" boolean default true,
  "orderIndex" integer
);

-- 5. Tabela de Status
create table if not exists public.statuses (
  id text primary key,
  name text not null,
  color text
);

-- 6. Configuração de Permissões (Público para este App de demonstração)
alter table public.sectors enable row level security;
alter table public.users enable row level security;
alter table public.requests enable row level security;
alter table public.form_fields enable row level security;
alter table public.statuses enable row level security;

create policy "Enable all access for all users" on public.sectors for all using (true) with check (true);
create policy "Enable all access for all users" on public.users for all using (true) with check (true);
create policy "Enable all access for all users" on public.requests for all using (true) with check (true);
create policy "Enable all access for all users" on public.form_fields for all using (true) with check (true);
create policy "Enable all access for all users" on public.statuses for all using (true) with check (true);

-- 7. ATUALIZAÇÕES (Execute para migrar bancos existentes)

-- Adiciona coluna de visibilidade
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='form_fields' and column_name='isVisibleInList') then 
    alter table public.form_fields add column "isVisibleInList" boolean default true; 
  end if; 
end $$;

-- Adiciona coluna de ordem
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='form_fields' and column_name='orderIndex') then 
    alter table public.form_fields add column "orderIndex" integer; 
  end if; 
end $$;

-- Adiciona coluna de Descrição na tabela de Solicitações
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='requests' and column_name='description') then 
    alter table public.requests add column "description" text; 
  end if; 
end $$;

-- Adiciona coluna de Solicitante (Requester) na tabela de Solicitações
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='requests' and column_name='requester') then 
    alter table public.requests add column "requester" text; 
  end if; 
end $$;

-- Adiciona coluna de Histórico na tabela de Solicitações
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='requests' and column_name='history') then 
    alter table public.requests add column "history" jsonb default '[]'::jsonb; 
  end if; 
end $$;

-- Insere o campo 'description' se não existir
insert into public.form_fields (id, label, type, "isActive", required, "isStandard", "isVisibleInList", "orderIndex")
select 'description', 'Descrição', 'text', true, false, true, true, 5
where not exists (select 1 from public.form_fields where id = 'description');

-- Insere o campo 'requester' se não existir
insert into public.form_fields (id, label, type, "isActive", required, "isStandard", "isVisibleInList", "orderIndex")
select 'requester', 'Solicitante', 'select', true, true, true, true, 3
where not exists (select 1 from public.form_fields where id = 'requester');

-- Atualiza o rótulo do Responsável para ficar mais claro
update public.form_fields set label = 'Responsável (Atendimento)' where id = 'responsible';

-- Insere setores especiais se não existirem
insert into public.sectors (id, name, description)
select 'sector-manager', 'Gerente', 'Gerência Geral - Visão Global'
where not exists (select 1 from public.sectors where name = 'Gerente');

insert into public.sectors (id, name, description)
select 'sector-director', 'Diretor', 'Diretoria - Visão Global'
where not exists (select 1 from public.sectors where name = 'Diretor');

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
          O sistema conectou ao Supabase, mas as tabelas ainda não existem ou precisam de atualização.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6 text-sm text-blue-200">
        <p className="font-bold mb-2">Instruções:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Copie o código SQL abaixo.</li>
          <li>Acesse seu projeto no <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline hover:text-white">Dashboard do Supabase</a>.</li>
          <li>Vá até a seção <strong>SQL Editor</strong> no menu lateral esquerdo.</li>
          <li>Clique em <strong>+ New Query</strong>.</li>
          <li>Cole o código e clique em <strong>Run</strong>.</li>
          <li>Volte aqui e recarregue a página.</li>
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
          Já executei o SQL, Recarregar Página
        </Button>
      </div>
    </div>
  );
};

export default DatabaseSetup;