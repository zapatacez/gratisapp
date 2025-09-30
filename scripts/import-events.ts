import fs from 'fs';
import path from 'path';
import { extractTextFromImage } from './lib/ocr.js';
import { parseEventFromText } from './lib/ollama.js';
import { getDistrictByName, getCityById, insertEvent } from './lib/db.js';
import { uploadImageToR2, generateR2Key } from './lib/r2.js';
import * as readline from 'readline';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

const IMAGES_DIR = path.join(process.cwd(), 'images');
const PROCESSED_DIR = path.join(IMAGES_DIR, 'processed');

async function findImages(): Promise<Array<{ path: string; district: string }>> {
  const images: Array<{ path: string; district: string }> = [];
  const entries = fs.readdirSync(IMAGES_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'processed') {
      const districtDir = path.join(IMAGES_DIR, entry.name);
      const files = fs.readdirSync(districtDir);

      for (const file of files) {
        if (file.match(/\.(png|jpg|jpeg)$/i)) {
          images.push({
            path: path.join(districtDir, file),
            district: entry.name,
          });
        }
      }
    }
  }

  return images;
}

async function processImage(imagePath: string, districtName: string, apiKey: string, autoMode: boolean) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📷 Processing: ${path.relative(process.cwd(), imagePath)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 1: Extract text with OCR
  console.log('🔤 Extracting text with OCR...');
  const ocrResult = await extractTextFromImage(imagePath, apiKey);

  if (!ocrResult.success) {
    console.error(`❌ OCR failed: ${ocrResult.error}`);
    return false;
  }

  console.log('✓ Text extracted\n');

  // Step 2: Parse with Ollama
  console.log('🤖 Parsing with Ollama...');
  const parseResult = await parseEventFromText(ocrResult.text, districtName);

  if (!parseResult.success || !parseResult.event) {
    console.error(`❌ Parsing failed: ${parseResult.error}`);
    console.log('\nExtracted text was:');
    console.log(ocrResult.text);
    return false;
  }

  console.log('✓ Event parsed\n');

  // Step 3: Get district and city info
  const district = await getDistrictByName(districtName);
  if (!district) {
    console.error(`❌ District "${districtName}" not found in database`);
    return false;
  }

  const city = await getCityById(district.cityId);
  if (!city) {
    console.error(`❌ City for district "${districtName}" not found`);
    return false;
  }

  // Step 4: Display parsed event
  console.log('Extracted Event:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Title:       ${parseResult.event.title}`);
  console.log(`  Date:        ${parseResult.event.eventDate}`);
  console.log(`  Location:    ${parseResult.event.location}`);
  console.log(`  District:    ${district.name}`);
  console.log(`  City:        ${city.name}`);
  console.log(`  Organizer:   ${parseResult.event.organizer}`);
  console.log(`  Description: ${parseResult.event.description.slice(0, 100)}...`);
  console.log(`  Source:      ${path.relative(process.cwd(), imagePath)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 5: Confirm import
  let shouldImport = autoMode;
  if (!autoMode) {
    const answer = await question('Import this event? [y/N]: ');
    shouldImport = answer.toLowerCase() === 'y';
  }

  if (!shouldImport) {
    console.log('⏭️  Skipped\n');
    return false;
  }

  // Step 6: Upload image to R2
  console.log('☁️  Uploading image to R2...');
  const r2Key = generateR2Key(districtName, path.basename(imagePath));
  const uploadResult = await uploadImageToR2(imagePath, r2Key);

  if (!uploadResult.success) {
    console.error(`❌ Failed to upload image to R2: ${uploadResult.error}`);
    return false;
  }

  console.log(`✓ Image uploaded: ${uploadResult.publicUrl}\n`);

  // Step 7: Insert to database
  const inserted = await insertEvent({
    title: parseResult.event.title,
    eventDate: parseResult.event.eventDate,
    location: parseResult.event.location,
    description: parseResult.event.description,
    organizer: parseResult.event.organizer,
    cityId: city.id,
    districtId: district.id,
    imageSource: path.basename(imagePath),
    imageUrl: uploadResult.publicUrl,
    url: `https://gratisapp.pe/events/${path.basename(imagePath, path.extname(imagePath))}`,
  });

  if (!inserted) {
    console.error('❌ Failed to insert event to database');
    return false;
  }

  console.log('✅ Event imported successfully!\n');

  // Step 7: Move image to processed
  const processedPath = path.join(PROCESSED_DIR, districtName, path.basename(imagePath));
  fs.mkdirSync(path.dirname(processedPath), { recursive: true });
  fs.renameSync(imagePath, processedPath);
  console.log(`📦 Image moved to: ${path.relative(process.cwd(), processedPath)}\n`);

  return true;
}

async function main() {
  console.log('🔍 Scanning for images...\n');

  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    console.error('❌ OCR_SPACE_API_KEY not found in environment variables');
    console.error('Please create a .env.local file with your API key');
    process.exit(1);
  }

  const autoMode = process.argv.includes('--auto');
  if (autoMode) {
    console.log('🤖 Running in auto mode (no confirmation required)\n');
  }

  const images = await findImages();

  if (images.length === 0) {
    console.log('No images found in images/*/ folders');
    console.log('Add PNG/JPG images to images/barranco/ or images/sjm/');
    rl.close();
    return;
  }

  console.log(`Found ${images.length} image${images.length > 1 ? 's' : ''} to process\n`);

  let processed = 0;
  let imported = 0;
  let skipped = 0;

  for (const image of images) {
    try {
      const result = await processImage(image.path, image.district, apiKey, autoMode);
      processed++;
      if (result) {
        imported++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${image.path}:`, error);
      skipped++;
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Summary: ${processed} processed, ${imported} imported, ${skipped} skipped`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  rl.close();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});
