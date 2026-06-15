-- ============================================================
-- BetNova — esquema de billetera persistente por usuario
-- Pégalo COMPLETO en tu proyecto Supabase: Dashboard -> SQL Editor -> Run.
-- Seguro para frontend: usa la clave anon + RLS (cada usuario solo ve lo suyo).
-- ============================================================

-- 1) Perfil por usuario: saldo y bono
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  balance     numeric(12,2) not null default 0,
  bonus       numeric(12,2) not null default 0,
  created_at  timestamptz   not null default now()
);

-- 2) Transacciones (depósitos, retiros, apuestas, premios)
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('deposit','withdraw','bet','win')),
  method      text,
  amount      numeric(12,2) not null,          -- + entra, - sale
  status      text not null default 'ok',
  created_at  timestamptz not null default now()
);
create index if not exists transactions_user_idx on public.transactions(user_id, created_at desc);

-- 3) Apuestas / historial de juego
create table if not exists public.bets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null,                   -- 'sport' | 'casino'
  event       text,
  pick        text,
  odds        numeric(8,2),
  stake       numeric(12,2) not null,
  payout      numeric(12,2),
  status      text not null,                   -- 'won' | 'lost' | 'open'
  created_at  timestamptz not null default now()
);
create index if not exists bets_user_idx on public.bets(user_id, created_at desc);

-- ============================================================
-- Seguridad: RLS — cada usuario solo accede a SUS filas
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.transactions  enable row level security;
alter table public.bets          enable row level security;

drop policy if exists "own profile select" on public.profiles;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);

drop policy if exists "own tx select" on public.transactions;
create policy "own tx select" on public.transactions for select using (auth.uid() = user_id);

drop policy if exists "own bets select" on public.bets;
create policy "own bets select" on public.bets for select using (auth.uid() = user_id);

drop policy if exists "own bets insert" on public.bets;
create policy "own bets insert" on public.bets for insert with check (auth.uid() = user_id);
-- (El saldo NO se actualiza directo desde el cliente: se hace vía la función segura de abajo.)

-- ============================================================
-- Crear el perfil automáticamente al registrarse un usuario
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Operación de dinero segura (depósito / retiro / apuesta / premio).
-- El cliente llama a esta función; no puede tocar 'balance' a mano.
-- amount: positivo (entra) o negativo (sale). Devuelve el nuevo saldo.
-- ============================================================
create or replace function public.wallet_apply(p_type text, p_method text, p_amount numeric)
returns numeric language plpgsql security definer set search_path = public as $$
declare v_balance numeric;
begin
  if p_type not in ('deposit','withdraw','bet','win') then
    raise exception 'tipo inválido';
  end if;
  update public.profiles
     set balance = balance + p_amount
   where id = auth.uid()
   returning balance into v_balance;

  if v_balance is null then
    raise exception 'perfil no encontrado';
  end if;
  if v_balance < 0 then
    raise exception 'saldo insuficiente';
  end if;

  insert into public.transactions (user_id, type, method, amount)
  values (auth.uid(), p_type, p_method, p_amount);

  return v_balance;
end; $$;

revoke all on function public.wallet_apply(text, text, numeric) from public;
grant execute on function public.wallet_apply(text, text, numeric) to authenticated;
