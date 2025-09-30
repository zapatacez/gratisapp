# R2 Bucket Setup for Event Images

Event flyer images are now uploaded to Cloudflare R2 for efficient storage and delivery.

## Setup Required

### 1. Create R2 Buckets

You need to create R2 buckets for each environment:

```bash
# Production bucket
wrangler r2 bucket create gratisapp-events-prod

# Preview/staging bucket
wrangler r2 bucket create gratisapp-events-preview --env preview
```

### 2. Enable Public Access (Optional)

For direct public access to images, you can enable R2 public buckets:

**Option A: Public R2 Domain (Simplest)**

1. Go to Cloudflare Dashboard → R2
2. Select your bucket (`gratisapp-events-prod`)
3. Go to Settings → Public Access
4. Click "Allow Access"
5. Copy the public bucket URL (e.g., `https://pub-xxxxx.r2.dev`)

Update [`scripts/lib/r2.ts`](scripts/lib/r2.ts) line 55:
```typescript
const publicUrl = `https://pub-xxxxx.r2.dev/${key}`;
```

**Option B: Custom Domain (Better branding)**

1. Go to R2 bucket settings
2. Add custom domain: `images.gratisapp.pe`
3. Update DNS in Cloudflare Dashboard
4. Update [`scripts/lib/r2.ts`](scripts/lib/r2.ts):
```typescript
const publicUrl = `https://images.gratisapp.pe/${key}`;
```

**Option C: Through Cloudflare Worker (Most control)**

Serve images through your main worker with caching, auth, resizing, etc.
(More complex, implement later if needed)

### 3. Run Database Migration

Add the `image_url` column to events table:

```bash
# Local database
npm run db:migrate:local

# Preview database
npm run db:migrate:preview

# Production database
npm run db:migrate:prod
```

### 4. Test Local Upload

For local testing, R2 uploads are skipped and a placeholder URL is used:

```bash
npm run import-events
```

You'll see:
```
⚠️  Local mode: Skipping R2 upload (would upload to: gratisapp-events-local/events/...)
```

### 5. Test Preview/Production Upload

To test actual R2 uploads:

```bash
# Preview environment
npm run import-events:preview

# Production environment
npm run import-events:prod
```

## Image Structure in R2

Images are stored with this structure:

```
events/
├── barranco/
│   ├── 1727724000-yoga-gratis.jpg
│   ├── 1727810400-concierto-libre.jpg
│   └── ...
├── sjm/
│   ├── 1727896800-taller-ceramica.jpg
│   └── ...
└── ...
```

Format: `events/{district}/{timestamp}-{slug}.{ext}`

## Cost

R2 is very affordable:

- **Storage**: $0.015/GB/month
- **Class A operations** (writes): $4.50 / million
- **Class B operations** (reads): $0.36 / million
- **Egress to Cloudflare Workers**: **FREE** ✅

**Example monthly cost:**
- 1,000 images (~100MB): **$0.0015 storage** + **$0.0045 writes** = **~$0.01/month**

Essentially free for your use case!

## Verification

After setup, verify images are accessible:

1. Import an event with an image
2. Check the event detail page
3. Verify the flyer image displays correctly
4. Check R2 bucket in Cloudflare Dashboard to see uploaded images

## Troubleshooting

### "Error: Unknown bucket"

→ Create the bucket: `wrangler r2 bucket create gratisapp-events-prod`

### Images not displaying

→ Check R2 public access is enabled
→ Verify the public URL format in `scripts/lib/r2.ts`
→ Check browser console for CORS errors

### "Permission denied" on upload

→ Make sure you're logged in: `wrangler login`
→ Verify bucket name matches wrangler.jsonc

## Next Steps

1. ✅ Create R2 buckets (production + preview)
2. ✅ Enable public access and get public URL
3. ✅ Update `scripts/lib/r2.ts` with your public URL
4. ✅ Run migrations
5. ✅ Test image import and display
