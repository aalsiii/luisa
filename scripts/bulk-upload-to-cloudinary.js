/**
 * Bulk upload local photos directly to Cloudinary and tag them for Luisa's portfolio.
 * Usage:
 *   node scripts/bulk-upload-to-cloudinary.js <directory_path> <category> [location]
 * Example:
 *   node scripts/bulk-upload-to-cloudinary.js "C:/Users/bijal/Pictures/Family" Family "Studio Session"
 */

const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Load environment from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[match[1]] = value.trim();
    }
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  const targetDir = process.argv[2];
  const category = process.argv[3] || 'Family';
  const location = process.argv[4] || 'Studio Session';

  if (!targetDir) {
    console.log("Usage: node scripts/bulk-upload-to-cloudinary.js <directory_path> <category> [location]");
    console.log("Categories: Family, Couple, Solos, Lifestyle, Yoga, Pet, Creative");
    process.exit(1);
  }

  const resolvedDir = path.resolve(targetDir);
  if (!fs.existsSync(resolvedDir)) {
    console.error(`Directory not found: ${resolvedDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(resolvedDir).filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
  if (files.length === 0) {
    console.log(`No images found in ${resolvedDir}`);
    process.exit(0);
  }

  console.log(`Found ${files.length} images in ${resolvedDir}`);
  console.log(`Target Cloudinary Folder: luisa_portfolio`);
  console.log(`Category: ${category} | Location: ${location}\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(resolvedDir, file);
    process.stdout.write(`[${i + 1}/${files.length}] Uploading ${file}... `);

    try {
      const result = await cloudinary.uploader.upload(fullPath, {
        folder: 'luisa_portfolio',
        tags: [category],
        context: `category=${category}|location=${location}`,
      });
      console.log(`✓ OK (${result.secure_url})`);
      success++;
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nFinished! Successfully uploaded: ${success}, Failed: ${failed}`);
}

run();
