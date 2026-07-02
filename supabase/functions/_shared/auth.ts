import { corsHeaders } from './cors.ts';

export function getAppPassword(req: Request): string | null {
  const header = req.headers.get('x-app-password')?.trim();
  if (header) return header;
  return null;
}

export async function getAppPasswordFromRequest(req: Request): Promise<string | null> {
  const header = getAppPassword(req);
  if (header) return header;

  try {
    const body = await req.clone().json() as { password?: string };
    return body.password?.trim() || null;
  } catch {
    return null;
  }
}

export function isValidPassword(password: string | null): boolean {
  const expected = Deno.env.get('APP_PASSWORD');
  if (!expected || !password) return false;
  return password === expected;
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
