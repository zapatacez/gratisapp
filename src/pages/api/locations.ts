import type { APIRoute } from 'astro';
import { drizzle } from 'drizzle-orm/d1';
import { cities as citiesTable, districts as districtsTable } from '../../db/schema';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const runtime = locals.runtime;
    if (!runtime?.env?.DB) {
      return new Response(JSON.stringify({ error: 'D1 binding `DB` not found.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = drizzle(runtime.env.DB);

    const [cities, districts] = await Promise.all([
      db.select().from(citiesTable).orderBy(citiesTable.name),
      db.select().from(districtsTable).orderBy(districtsTable.name),
    ]);

    return new Response(JSON.stringify({ cities, districts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};