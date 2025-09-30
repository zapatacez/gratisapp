# Event Import System - Setup Guide

Automated system to parse event flyers from Facebook/social media and import them to your database.

## What Was Created

```
gratisapp/
├── scripts/                          ✨ NEW
│   ├── import-events.ts             # Main import script
│   ├── README.md                     # Detailed usage guide
│   └── lib/
│       ├── ocr.ts                    # OCR.space API wrapper
│       ├── ollama.ts                 # Ollama local LLM integration
│       └── db.ts                     # D1 database operations
│
├── images/                           ✨ NEW (gitignored)
│   ├── barranco/                    # Drop Barranco event images here
│   ├── sjm/                         # Drop SJM event images here
│   └── processed/                   # Processed images moved here
│
├── migrations/
│   └── 0003_add_organizer_image_source.sql  ✨ NEW
│
├── .env.local.example               ✨ NEW
└── package.json                     ✅ Updated with new scripts
```

## Setup Steps

### 1. Install New Dependencies

```bash
cd /Users/cesarzapata/gratisapp
npm install
```

New packages added:
- `dotenv` - Environment variable management
- `form-data` - For OCR API file uploads
- `tsx` - TypeScript execution

### 2. Run Database Migration

Add `organizer` and `image_source` fields to events table:

```bash
npm run db:migrate:local
```

### 3. Get Free OCR API Key

1. Visit: https://ocr.space/ocrapi
2. Sign up (no credit card required)
3. Copy your free API key (500 requests/day)

### 4. Setup Ollama

If not already installed:

```bash
brew install ollama
```

Pull the model (one-time):

```bash
ollama pull llama3.2:3b
```

Make sure Ollama is running:

```bash
ollama serve
```

### 5. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your OCR API key:

```bash
OCR_SPACE_API_KEY=your_actual_api_key_here
OLLAMA_HOST=http://localhost:11434
```

## How to Use

### Step 1: Save Event Images

Download/screenshot event flyers from Facebook and save them to district folders:

```bash
# For Barranco events
images/barranco/yoga-gratis.png
images/barranco/concierto-libre.jpg

# For San Juan de Miraflores events
images/sjm/taller-ceramica.png
images/sjm/festival-verano.jpg
```

**Image Tips:**
- Use PNG or JPG format
- Higher resolution is better (at least 1000px wide)
- Clear, readable text
- Good lighting/contrast

### Step 2: Run Import Script

**Interactive mode** (recommended - review each event):

```bash
npm run import-events
```

**Auto mode** (import all without confirmation):

```bash
npm run import-events:auto
```

### Step 3: What Happens

1. **OCR extracts text** from each image using OCR.space API
2. **Ollama parses** the text into structured event data
3. **Script shows** you the extracted details
4. **You confirm** (y/n) - or auto-import in auto mode
5. **Event imported** to your D1 database
6. **Image moved** to `images/processed/district-name/`

## Example Run

```bash
$ npm run import-events

🔍 Scanning for images...
Found 2 images to process

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📷 Processing: images/barranco/yoga-gratis.png
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔤 Extracting text with OCR...
✓ Text extracted

🤖 Parsing with Ollama (llama3.2)...
✓ Event parsed

Extracted Event:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Title:       Taller de Yoga Gratis
  Date:        2025-10-15 18:00
  Location:    Parque Municipal de Barranco
  District:    Barranco
  City:        Lima
  Organizer:   Municipalidad de Barranco
  Description: Sesión de yoga al aire libre...
  Source:      images/barranco/yoga-gratis.png

Import this event? [y/N]: y

✅ Event imported successfully!
📦 Image moved to: images/processed/barranco/yoga-gratis.png

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary: 2 processed, 2 imported, 0 skipped
```

## Workflow for Facebook Events

### Municipalidad de Barranco
- URL: https://www.facebook.com/munidebarranco/
- Check 2-3x per week
- Screenshot event posts/flyers
- Save to `images/barranco/`

### Municipalidad de San Juan de Miraflores
- URL: https://www.facebook.com/MuniDeSJM
- Check 2-3x per week
- Screenshot event posts/flyers
- Save to `images/sjm/`

### Then Run
```bash
npm run import-events
```

## Troubleshooting

### "OCR_SPACE_API_KEY not found"
→ Create `.env.local` from `.env.local.example` and add your API key

### "District 'barranco' not found in database"
→ District folder name must match database. Check your districts table.

### "Ollama API error"
→ Make sure Ollama is running: `ollama serve`
→ Check model is installed: `ollama list`

### Poor parsing results
→ Use higher resolution images
→ Ensure text is clear and readable
→ Try different image formats (PNG usually better)

## Cost Breakdown

- **OCR.space**: FREE (500 requests/day)
- **Ollama**: FREE (runs locally on your Mac)
- **Total monthly cost**: **$0** ✅

With a few events per week, you'll stay well within the free tier.

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Run migration: `npm run db:migrate:local`
3. ✅ Get OCR API key from ocr.space
4. ✅ Setup `.env.local` with your API key
5. ✅ Pull Ollama model: `ollama pull llama3.2:3b`
6. ✅ Save some event images to `images/barranco/` or `images/sjm/`
7. ✅ Run: `npm run import-events`

## Documentation

Full usage details: [scripts/README.md](scripts/README.md)
