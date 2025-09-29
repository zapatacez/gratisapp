import { drizzle } from 'drizzle-orm/d1';
import { eq, gte } from 'drizzle-orm';
import { events as eventsTable, cities as citiesTable, districts as districtsTable } from '../../db/schema';

export async function GET(...args: any[]) {
  try {
    // Support both shapes:
    // 1) GET(context) where context.env exists (some adapters)
    // 2) GET(request, env) where env is the second positional argument (Cloudflare Workers)
    const maybeContext = args[0];
    const maybeEnv = args[1];

    const env = maybeEnv ?? (maybeContext && (maybeContext.env ?? maybeContext.context)) ?? undefined;

      // Helper to safely get nested values
      const get = (obj: any, path: string[]) => {
        try {
          return path.reduce((acc: any, k: string) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
        } catch {
          return undefined;
        }
      };

      // Probe several locations where Astro/Cloudflare might expose bindings
      const probes: Array<{ where: string; value: any }> = [
        { where: 'maybeEnv.DB', value: get(env, ['DB']) },
        { where: 'maybeContext.env.DB', value: get(maybeContext, ['env', 'DB']) },
        { where: 'maybeContext.context.env.DB', value: get(maybeContext, ['context', 'env', 'DB']) },
        { where: 'maybeContext.Astro.locals.runtime.env.DB', value: get(maybeContext, ['Astro', 'locals', 'runtime', 'env', 'DB']) },
        { where: 'maybeContext.locals.runtime.env.DB', value: get(maybeContext, ['locals', 'runtime', 'env', 'DB']) },
        { where: 'maybeContext.request.cf.bindings.DB', value: get(maybeContext, ['request', 'cf', 'bindings', 'DB']) },
        { where: 'globalThis.DB', value: (globalThis as any)?.DB }
      ];

      const found = probes.find(p => !!p.value);
      const DBbinding = found ? found.value : undefined;

      if (!DBbinding) {
        const debug = probes.map(p => ({ where: p.where, present: !!p.value }));
        return new Response(JSON.stringify({ error: 'D1 binding `DB` not found in known locations', debug }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }


    // D1 binding is configured as DB in wrangler.jsonc
    const db = drizzle(DBbinding);

    const now = new Date();

    // Select upcoming events (eventDate is stored as timestamp_ms -> mapped to Date in Drizzle)
    const res = await db
      .select()
      .from(eventsTable)
      .where(gte(eventsTable.eventDate, now))
      .orderBy(eventsTable.eventDate);

    // For each event, fetch city/district names (simple approach)
    const events = await Promise.all(res.map(async (row: any) => {
      let cityName = null;
      let districtName = null;
      try {
        if (row.cityId) {
          const c = await db.select().from(citiesTable).where(eq(citiesTable.id, row.cityId)).limit(1);
          if (c && c[0]) cityName = c[0].name;
        }
        if (row.districtId) {
          const d = await db.select().from(districtsTable).where(eq(districtsTable.id, row.districtId)).limit(1);
          if (d && d[0]) districtName = d[0].name;
        }
      } catch (e) {
        // ignore lookup errors
      }
      return { ...row, cityName, districtName };
    }));

    return new Response(JSON.stringify({ events }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
