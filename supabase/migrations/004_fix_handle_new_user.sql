-- Fix: signup trigger failed with "relation profiles does not exist" because
-- the SECURITY DEFINER function had no pinned search_path. Pin it and
-- schema-qualify the table so it resolves for any calling role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;
