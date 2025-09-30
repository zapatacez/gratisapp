import { drizzle } from 'drizzle-orm/d1';
import { events as eventsTable, cities, districts } from '../db/schema';
import { eq, gte, and } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';

export async function getEvents(DB: D1Database, cityId?: number, districtId?: number) {
  const db = drizzle(DB);
  
  const allConditions = [gte(eventsTable.eventDate, new Date())];
  if (cityId) allConditions.push(eq(eventsTable.cityId, cityId));
  if (districtId) allConditions.push(eq(eventsTable.districtId, districtId));
  
  return await db
    .select({
      ...getTableColumns(eventsTable),
      cityName: cities.name,
      districtName: districts.name,
    })
    .from(eventsTable)
    .leftJoin(cities, eq(eventsTable.cityId, cities.id))
    .leftJoin(districts, eq(eventsTable.districtId, districts.id))
    .where(and(...allConditions))
    .orderBy(eventsTable.eventDate);
}

export async function getEventById(DB: D1Database, eventId: number) {
  const db = drizzle(DB);
  
  const event = await db
    .select({
      ...getTableColumns(eventsTable),
      cityName: cities.name,
      districtName: districts.name,
    })
    .from(eventsTable)
    .leftJoin(cities, eq(eventsTable.cityId, cities.id))
    .leftJoin(districts, eq(eventsTable.districtId, districts.id))
    .where(eq(eventsTable.id, eventId))
    .limit(1)
    .then(rows => rows[0] || null);
  
  return event;
}

export async function getLocations(DB: D1Database) {
  const db = drizzle(DB);
  
  const [citiesData, districtsData] = await Promise.all([
    db.select().from(cities).orderBy(cities.name),
    db.select().from(districts).orderBy(districts.name)
  ]);
  
  return { cities: citiesData, districts: districtsData };
}