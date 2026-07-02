import { getAppPasswordFromRequest, isValidPassword } from '../_shared/auth.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!Deno.env.get('APP_PASSWORD')) {
    return jsonResponse({ error: 'APP_PASSWORD not configured' }, 500);
  }

  const password = await getAppPasswordFromRequest(req);
  if (!isValidPassword(password)) {
    return jsonResponse({ ok: false }, 401);
  }

  return jsonResponse({ ok: true });
});
