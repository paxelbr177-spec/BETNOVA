-- ============================================================
-- BetNova — panel de administrador (rol admin + carga manual de saldo)
-- Pégalo COMPLETO en Supabase: Dashboard -> SQL Editor -> Run.
-- (Ejecutar DESPUÉS de schema.sql)
-- ============================================================

-- 1) Añadir email (para listar usuarios) y bandera de admin a los perfiles
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 2) Que el trigger de registro guarde también el email
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
          new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

-- 3) Rellenar el email de los usuarios ya existentes
update public.profiles p set email = u.email
from auth.users u where u.id = p.id and (p.email is null or p.email = '');

-- 4) ¿El usuario actual es admin? (security definer => puede leer la bandera sin recursión RLS)
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 5) Políticas: el admin puede LEER todos los perfiles, transacciones y apuestas
drop policy if exists "admin read profiles" on public.profiles;
create policy "admin read profiles" on public.profiles for select using (public.is_admin());

drop policy if exists "admin read tx" on public.transactions;
create policy "admin read tx" on public.transactions for select using (public.is_admin());

drop policy if exists "admin read bets" on public.bets;
create policy "admin read bets" on public.bets for select using (public.is_admin());

-- 6) Cargar / devolver saldo a un usuario (SOLO admin).
--    p_amount: positivo = carga (depósito), negativo = devolución (retiro).
create or replace function public.admin_adjust_balance(p_user uuid, p_amount numeric, p_type text, p_note text)
returns numeric language plpgsql security definer set search_path = public as $$
declare v_balance numeric;
begin
  if not public.is_admin() then raise exception 'no autorizado'; end if;
  if p_type not in ('deposit','withdraw') then raise exception 'tipo inválido'; end if;
  update public.profiles set balance = balance + p_amount where id = p_user returning balance into v_balance;
  if v_balance is null then raise exception 'usuario no encontrado'; end if;
  if v_balance < 0 then raise exception 'saldo insuficiente'; end if;
  insert into public.transactions (user_id, type, method, amount) values (p_user, p_type, p_note, p_amount);
  return v_balance;
end; $$;
revoke all on function public.admin_adjust_balance(uuid,numeric,text,text) from public;
grant execute on function public.admin_adjust_balance(uuid,numeric,text,text) to authenticated;

-- 7) Endurecer wallet_apply: los usuarios SOLO pueden mover saldo jugando (apuesta/premio).
--    Los depósitos/retiros pasan a ser exclusivos del admin (paso 6).
create or replace function public.wallet_apply(p_type text, p_method text, p_amount numeric)
returns numeric language plpgsql security definer set search_path = public as $$
declare v_balance numeric;
begin
  if p_type not in ('bet','win') then raise exception 'tipo no permitido'; end if;
  update public.profiles set balance = balance + p_amount where id = auth.uid() returning balance into v_balance;
  if v_balance is null then raise exception 'perfil no encontrado'; end if;
  if v_balance < 0 then raise exception 'saldo insuficiente'; end if;
  insert into public.transactions (user_id, type, method, amount) values (auth.uid(), p_type, p_method, p_amount);
  return v_balance;
end; $$;

-- ============================================================
-- 8) HAZTE ADMIN: cambia el email por el de TU cuenta de BetNova y ejecútalo.
--    (Regístrate primero en la app con ese email.)
-- ============================================================
-- update public.profiles set is_admin = true where email = 'TU-EMAIL@ejemplo.com';
