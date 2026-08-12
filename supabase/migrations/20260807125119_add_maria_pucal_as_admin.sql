do $$
declare
  function_definition text;
  old_check constant text := 'lower(admin_user.email) = ''jeniabortnic@gmail.com''';
  new_check constant text := 'lower(admin_user.email) in (''jeniabortnic@gmail.com'', ''pucalmaria@gmail.com'')';
begin
  select pg_get_functiondef('public.get_admin_dashboard()'::regprocedure)
  into function_definition;

  if position(old_check in function_definition) = 0 then
    raise exception 'Expected administrator check was not found';
  end if;

  execute replace(function_definition, old_check, new_check);
end;
$$;

;
