-- ============================================================
-- BetNova — Rol "Agente" (ej. el primo)
-- Pégalo COMPLETO en Supabase → SQL Editor → Run.
-- El agente: crea jugadores, les carga/quita saldo (descontando de SU saldo),
-- y solo ve/gestiona los jugadores que él creó.
-- ============================================================

-- 1) Columnas nuevas en profiles
alter table public.profiles add column if not exists is_agent   boolean not null default false;
alter table public.profiles add column if not exists created_by uuid references auth.users(id);
alter table public.profiles add column if not exists username   text;
-- can_create_agents: solo el "Administrador" (ej. Dario) puede crear agentes.
alter table public.profiles add column if not exists can_create_agents boolean not null default false;
create index if not exists profiles_created_by_idx on public.profiles(created_by);

-- 2) ¿El que llama es agente?
create or replace function public.is_agent_caller()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_agent from public.profiles where id = auth.uid()), false);
$$;

-- 3) RLS — el agente puede LEER los perfiles/movimientos de SUS jugadores
drop policy if exists "agent reads own players" on public.profiles;
create policy "agent reads own players" on public.profiles
  for select using (created_by = auth.uid());

drop policy if exists "agent reads own players tx" on public.transactions;
create policy "agent reads own players tx" on public.transactions
  for select using (exists (
    select 1 from public.profiles p where p.id = transactions.user_id and p.created_by = auth.uid()
  ));

drop policy if exists "agent reads own players bets" on public.bets;
create policy "agent reads own players bets" on public.bets
  for select using (exists (
    select 1 from public.profiles p where p.id = bets.user_id and p.created_by = auth.uid()
  ));

-- 4) Vincular un jugador recién creado (signUp) a este agente.
--    El front hace el signUp (email = usuario@dominio interno) y luego llama a esto.
drop function if exists public.agent_create_player(text, text, text);
create or replace function public.agent_create_player(p_email text, p_username text, p_name text, p_as_agent boolean default false)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_agent_caller() then
    raise exception 'Solo un agente o administrador puede crear usuarios.';
  end if;
  -- Crear AGENTES solo lo permite quien tiene can_create_agents (el Administrador).
  if p_as_agent and not coalesce((select can_create_agents from public.profiles where id = auth.uid()), false) then
    raise exception 'No tenés permiso para crear agentes.';
  end if;
  update public.profiles
     set created_by = auth.uid(),
         username   = p_username,
         name       = coalesce(nullif(p_name, ''), name),
         is_agent   = (coalesce(is_agent, false) or p_as_agent)
   where lower(email) = lower(p_email)
     and created_by is null
     and coalesce(is_admin, false) = false;
  if not found then
    raise exception 'No se pudo vincular el usuario (ya existe o no está disponible).';
  end if;
end; $$;

-- 5) Cargar (+) o quitar (-) saldo a un jugador propio, moviendo el float del agente.
--    p_amount > 0 carga (descuenta del agente); p_amount < 0 quita (devuelve al agente).
create or replace function public.agent_set_balance(p_player uuid, p_amount numeric)
returns numeric language plpgsql security definer set search_path = public as $$
declare v_agent uuid := auth.uid(); v_owner uuid; v_player_bal numeric; v_agent_bal numeric;
begin
  if not public.is_agent_caller() then
    raise exception 'No autorizado.';
  end if;
  select created_by into v_owner from public.profiles where id = p_player;
  if v_owner is null or v_owner <> v_agent then
    raise exception 'Ese jugador no es tuyo.';
  end if;

  if p_amount > 0 then
    update public.profiles set balance = balance - p_amount where id = v_agent returning balance into v_agent_bal;
    if v_agent_bal < 0 then raise exception 'Saldo insuficiente en tu cuenta de agente.'; end if;
    update public.profiles set balance = balance + p_amount where id = p_player returning balance into v_player_bal;
    insert into public.transactions (user_id, type, method, amount) values (p_player, 'deposit', 'Agente', p_amount);
  elsif p_amount < 0 then
    update public.profiles set balance = balance + p_amount where id = p_player returning balance into v_player_bal;
    if v_player_bal < 0 then raise exception 'El jugador no tiene saldo suficiente.'; end if;
    update public.profiles set balance = balance - p_amount where id = v_agent returning balance into v_agent_bal;
    insert into public.transactions (user_id, type, method, amount) values (p_player, 'withdraw', 'Agente', p_amount);
  else
    raise exception 'Monto inválido.';
  end if;

  return v_player_bal;
end; $$;

-- 6) Permisos
revoke all on function public.agent_create_player(text, text, text, boolean) from public;
revoke all on function public.agent_set_balance(uuid, numeric)              from public;
grant execute on function public.agent_create_player(text, text, text, boolean) to authenticated;
grant execute on function public.agent_set_balance(uuid, numeric)              to authenticated;

-- ============================================================
-- 7) Roles (cambiá los emails). El saldo/float se da con "Cargar" desde el panel de arriba.
-- DUEÑOS (control total, panel /admin):
-- update public.profiles set is_admin = true where email in ('axel@...','alejoromanhernandez@gmail.com','candelava2018@gmail.com','beli@...');
-- ADMINISTRADOR (Dario: agente + puede crear agentes):
-- update public.profiles set is_agent = true, can_create_agents = true where email = 'dariobet@gmail.com';
-- AGENTE: lo crea Dario desde su panel (no hace falta SQL).
-- ============================================================
