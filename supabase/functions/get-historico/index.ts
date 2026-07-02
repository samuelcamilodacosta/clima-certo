import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getAppPassword, isValidPassword, unauthorized } from '../_shared/auth.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';

const COLUNAS =
  'id, exported_at, funcionario, numero, titulo, cliente, cliente_doc, cliente_contato, cliente_endereco, cliente_assinatura, cliente_cargo, prazo, garantia, condicoes, obs, itens';

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!isValidPassword(getAppPassword(req))) {
    return unauthorized();
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .from('historico_exportacoes')
    .select(COLUNAS)
    .order('exported_at', { ascending: false });

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse(data ?? []);
});
