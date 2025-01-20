-- Criar função para executar SQL
create or replace function public.run_sql(sql_query text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  execute sql_query;
end;
$$;

-- Dar permissão para usuário anônimo executar
grant execute on function public.run_sql(text) to anon; 