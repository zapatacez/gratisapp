import { drizzle } from 'drizzle-orm/d1';
import { events as eventsTable, cities, districts } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';

export async function GET(...args: any[]) {
  console.log('[Event API] Called with args length:', args.length);
  
  try {
    // Get the ID from the route params (we ignore any slug after it)
    const maybeContext = args[0];
    console.log('[Event API] maybeContext.params:', maybeContext?.params);
    
    const id = maybeContext.params?.id;
    console.log('[Event API] Extracted ID:', id);

    if (!id) {
      console.error('[Event API] No ID parameter found');
      return new Response(
        JSON.stringify({ error: 'ID parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const eventId = parseInt(id, 10);
    console.log('[Event API] Parsed eventId:', eventId);
    
    if (isNaN(eventId)) {
      console.error('[Event API] Invalid event ID (NaN)');
      return new Response(
        JSON.stringify({ error: 'Invalid event ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get env binding (same logic as your events API)
    const maybeEnv = args[1];
    const env = maybeEnv ?? (maybeContext && (maybeContext.env ?? maybeContext.context)) ?? undefined;

    const get = (obj: any, path: string[]) => {
      try {
        return path.reduce((acc: any, k: string) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
      } catch {
        return undefined;
      }
    };

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
      console.error('[Event API] DB binding not found. Debug:', debug);
      return new Response(
        JSON.stringify({ error: 'D1 binding `DB` not found in known locations', debug }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Event API] DB binding found:', found?.where);
    const db = drizzle(DBbinding);

    console.log('[Event API] Querying for event ID:', eventId);
    
    // Query the event by ID only
    const result = await db
      .select({
        ...getTableColumns(eventsTable),
        cityName: cities.name,
        districtName: districts.name,
      })
      .from(eventsTable)
      .leftJoin(cities, eq(eventsTable.cityId, cities.id))
      .leftJoin(districts, eq(eventsTable.districtId, districts.id))
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    console.log('[Event API] Query result length:', result.length);

    if (result.length === 0) {
      console.log('[Event API] Event not found for ID:', eventId);
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Event API] Event found:', result[0].id, result[0].title);
    return new Response(
      JSON.stringify({ event: result[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Event API] Error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}