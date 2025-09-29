import { drizzle, } from 'drizzle-orm/d1';
import { events as eventsTable, cities, districts } from '../../db/schema';
import { eq, gte, and,getTableColumns } from 'drizzle-orm'; // Keep general operators from drizzle-orm


export async function GET(...args: any[]) {
  try {
    // Support both shapes:
    // 1) GET(context) where context.env exists (some adapters)
    // 2) GET(request, env) where env is the second positional argument (Cloudflare Workers)
    const maybeContext = args[0];
    const url = new URL(maybeContext.request.url);
    const cityId = url.searchParams.get('city');
    const districtId = url.searchParams.get('district');


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

    // Base conditions: always filter for upcoming events
    const allConditions = [gte(eventsTable.eventDate, new Date())];

    // Dynamically add filters if they exist
    if (cityId) allConditions.push(eq(eventsTable.cityId, Number(cityId)));
    if (districtId) allConditions.push(eq(eventsTable.districtId, Number(districtId)));

    // Build the query with joins to get all data in one go
    const query = db
      .select({
        // Select all fields from events, and specific fields from cities/districts
        ...getTableColumns(eventsTable),
         cityName: cities.name,
        districtName: districts.name,
      })
      .from(eventsTable)
      .leftJoin(cities, eq(eventsTable.cityId, cities.id))
      .leftJoin(districts, eq(eventsTable.districtId, districts.id))
      .where(and(...allConditions)) // Apply all conditions together
      .orderBy(eventsTable.eventDate);

    const events = await query;

    return new Response(JSON.stringify({ events }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
