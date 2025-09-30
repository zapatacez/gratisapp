import fs from 'fs';
import path from 'path';

const OCR_API_URL = 'https://api.ocr.space/parse/image';

interface OCRResult {
  text: string;
  success: boolean;
  error?: string;
}

export async function extractTextFromImage(imagePath: string, apiKey: string): Promise<OCRResult> {
  try {
    // Read file as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const filename = path.basename(imagePath);
    const fileExtension = path.extname(imagePath).toLowerCase();

    // Determine content type
    let contentType = 'image/jpeg';
    if (fileExtension === '.png') {
      contentType = 'image/png';
    } else if (fileExtension === '.gif') {
      contentType = 'image/gif';
    }

    // Create data URL
    const base64DataUrl = `data:${contentType};base64,${base64Image}`;

    // Create form body
    const formBody = new URLSearchParams({
      base64Image: base64DataUrl,
      language: 'spa',
      isOverlayRequired: 'false',
      detectOrientation: 'true',
      scale: 'true',
      OCREngine: '2',
    });

    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    });

    const result = await response.json();

    // Debug: log the result for troubleshooting
    if (result.OCRExitCode !== 1) {
      console.error('OCR API Response:', JSON.stringify(result, null, 2));
    }

    if (result.OCRExitCode !== 1) {
      return {
        text: '',
        success: false,
        error: result.ErrorMessage?.[0] || 'OCR failed',
      };
    }

    const extractedText = result.ParsedResults?.[0]?.ParsedText || '';

    return {
      text: extractedText.trim(),
      success: true,
    };
  } catch (error) {
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
