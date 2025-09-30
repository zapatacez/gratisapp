import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface UploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

// Get environment from command line args or default to local
const getEnv = () => {
  const env = process.env.DB_ENV || 'local';
  return env;
};

const getBucketName = () => {
  const env = getEnv();
  if (env === 'preview') return 'gratisapp-events-preview';
  if (env === 'prod') return 'gratisapp-events-prod';
  return 'gratisapp-events-local'; // For local testing
};

const getPublicUrl = (key: string): string => {
  const env = getEnv();

  // R2 public URLs for each environment
  if (env === 'preview') {
    return `https://pub-9034f13a4b974b5f81b636e728d55d6b.r2.dev/${key}`;
  }

  if (env === 'prod') {
    // TODO: Replace with your production R2 public URL when you enable public access
    return `https://YOUR_PROD_BUCKET_URL/${key}`;
  }

  // Local environment - placeholder URL
  return `/local-images/${key}`;
};

/**
 * Upload an image to R2 bucket
 * @param imagePath Local path to the image file
 * @param key The key/path to use in R2 (e.g., "events/barranco/yoga-2025-10.jpg")
 * @returns Upload result with public URL
 */
export async function uploadImageToR2(imagePath: string, key: string): Promise<UploadResult> {
  try {
    const env = getEnv();
    const bucketName = getBucketName();

    // For local environment, we'll skip R2 upload and return a placeholder URL
    if (env === 'local') {
      console.log(`  ⚠️  Local mode: Skipping R2 upload (would upload to: ${bucketName}/${key})`);
      return {
        success: true,
        publicUrl: `/local-images/${key}`, // Placeholder for local
      };
    }

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return {
        success: false,
        error: `File not found: ${imagePath}`,
      };
    }

    // Determine content type
    const ext = path.extname(imagePath).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';

    // Upload to R2 using wrangler
    const remoteFlag = env !== 'local' ? '--remote' : '';
    const command = `wrangler r2 object put ${bucketName}/${key} --file="${imagePath}" ${remoteFlag}`;

    execSync(command, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });

    // Generate public URL based on environment
    const publicUrl = getPublicUrl(key);

    return {
      success: true,
      publicUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error uploading to R2',
    };
  }
}

/**
 * Generate a clean key for R2 storage
 * @param districtName District name (e.g., "barranco")
 * @param filename Original filename
 * @param eventId Event ID for uniqueness
 * @returns Clean R2 key (e.g., "events/barranco/123-yoga-gratis.jpg")
 */
export function generateR2Key(districtName: string, filename: string, eventId?: number): string {
  // Clean the filename
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes

  // Add timestamp for uniqueness
  const timestamp = Date.now();

  // Format: events/{district}/{timestamp}-{basename}.{ext}
  const key = `events/${districtName.toLowerCase()}/${timestamp}-${basename}${ext}`;

  return key;
}
