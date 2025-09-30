# Event Import Scripts

Scripts to automatically parse event flyers and import them to the database.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get OCR API Key

1. Go to https://ocr.space/ocrapi
2. Sign up for free (no credit card required)
3. Get your free API key (500 requests/day)

### 3. Install Ollama (if not installed)

```bash
brew install ollama
ollama pull llama3.2:3b
```

### 4. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local and add your OCR_SPACE_API_KEY
```

### 5. Run Database Migration

```bash
npm run db:migrate:local
```

## Usage

### 1. Add Event Images

Save event flyer images to district folders:

```
images/
├── barranco/
│   ├── yoga-gratis.png
│   └── concierto-libre.jpg
└── sjm/
    └── taller-ceramica.png
```

### 2. Run Import Script

**Interactive mode** (review each event):
```bash
npm run import-events
```

**Auto mode** (import all without confirmation):
```bash
npm run import-events:auto
```

### 3. Review Output

The script will:
1. Extract text from each image (OCR)
2. Parse event details with Ollama
3. Show you the extracted data
4. Ask for confirmation (unless --auto)
5. Import to database
6. Move processed images to `images/processed/`

## Example Output

```
🔍 Scanning for images...
Found 2 images to process

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📷 Processing: images/barranco/yoga-gratis.png
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔤 Extracting text with OCR...
✓ Text extracted

🤖 Parsing with Ollama...
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

## Troubleshooting

### "OCR_SPACE_API_KEY not found"
- Make sure you created `.env.local` from `.env.local.example`
- Add your API key to `.env.local`

### "District not found in database"
- District folder name must match a district in your database
- Check your districts table for exact names
- Supported: `barranco`, `sjm`

### "Ollama API error"
- Make sure Ollama is running: `ollama serve`
- Check you have the model: `ollama list`
- Pull the model if needed: `ollama pull llama3.2:3b`

### Poor OCR Results
- Use high-resolution images (at least 1000px wide)
- Ensure text is clear and readable
- Avoid heavily stylized fonts
- Try different image formats (PNG usually better than JPG)

## Cost

- **OCR.space**: Free (500 requests/day)
- **Ollama**: Free (runs locally)
- **Total**: $0 ✅
