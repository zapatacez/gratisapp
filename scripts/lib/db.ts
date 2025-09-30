import { execSync } from 'child_process';

interface District {
  id: number;
  name: string;
  cityId: number;
}

interface City {
  id: number;
  name: string;
}

// Get environment from command line args or default to local
const getEnvFlag = () => {
  const env = process.env.DB_ENV || 'local';
  if (env === 'local') return '--local';
  if (env === 'preview') return '--remote --env preview';
  if (env === 'prod') return '--remote';
  return '--local'; // default to local for safety
};

export async function getDistrictByName(districtName: string): Promise<District | null> {
  try {
    const envFlag = getEnvFlag();
    const result = execSync(
      `wrangler d1 execute DB ${envFlag} --command "SELECT id, name, city_id as cityId FROM districts WHERE LOWER(name) = LOWER('${districtName}')" --json`,
      { encoding: 'utf-8' }
    );

    const parsed = JSON.parse(result);
    const rows = parsed[0]?.results || [];

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching district:', error);
    return null;
  }
}

export async function getCityById(cityId: number): Promise<City | null> {
  try {
    const envFlag = getEnvFlag();
    const result = execSync(
      `wrangler d1 execute DB ${envFlag} --command "SELECT id, name FROM cities WHERE id = ${cityId}" --json`,
      { encoding: 'utf-8' }
    );

    const parsed = JSON.parse(result);
    const rows = parsed[0]?.results || [];

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching city:', error);
    return null;
  }
}

export interface InsertEventData {
  title: string;
  eventDate: string;
  location: string;
  description: string;
  organizer: string;
  cityId: number;
  districtId: number;
  imageSource: string;
  imageUrl?: string;
  url: string;
}

export async function insertEvent(data: InsertEventData): Promise<boolean> {
  try {
    // Convert ISO date to timestamp in milliseconds
    const timestamp = new Date(data.eventDate).getTime();

    // Escape single quotes in strings for SQL
    const escape = (str: string) => str.replace(/'/g, "''");

    const imageUrlValue = data.imageUrl ? `'${escape(data.imageUrl)}'` : 'NULL';

    const sql = `
      INSERT INTO events (
        title, event_date, location, description,
        organizer, city_id, district_id, image_source, image_url, url, user_id
      ) VALUES (
        '${escape(data.title)}',
        ${timestamp},
        '${escape(data.location)}',
        '${escape(data.description)}',
        '${escape(data.organizer)}',
        ${data.cityId},
        ${data.districtId},
        '${escape(data.imageSource)}',
        ${imageUrlValue},
        '${escape(data.url)}',
        1
      )
    `;

    const envFlag = getEnvFlag();
    execSync(`wrangler d1 execute DB ${envFlag} --command "${sql}"`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    return true;
  } catch (error) {
    console.error('Error inserting event:', error);
    return false;
  }
}
