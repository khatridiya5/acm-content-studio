/**
 * Bulk Card Generator
 *
 * Generates multiple ID cards from a user-selected SVG template and user-provided CSV/image data.
 * No database or hardcoded defaults required.
 *
 * Compulsory CSV Columns: roll_no, name, department, role
 * If template contains {{photo}}, the photo column is also compulsory.
 *
 * Usage via CLI:
 *   node scripts/bulk_card_generator.js <template.svg> <people.csv> [photos_dir] [out_dir]
 *
 * Usage as a module:
 *   const { hydrateCard, generateBulkCards, generateFromFiles } = require('./bulk_card_generator');
 */

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const sharp = require('sharp');
const Papa = require('papaparse');

const DEFAULT_DPI = 600;

// Escape XML special characters so text doesn't break SVG syntax
function escapeXml(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[char] || char));
}

// Adjust font size dynamically for long names to prevent overflow
function fitFont(text, base = 4.6, maxChars = 18) {
  return text.length <= maxChars ? base : Math.max(2.8, (base * maxChars) / text.length);
}

// Embed a local photo file as a base64 data URI
async function photoToDataUri(filePath) {
  const image = await fs.readFile(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  return `data:image/${mime};base64,${image.toString('base64')}`;
}

// Fetch a remote photo URL and convert to base64 data URI with a timeout
async function fetchUrlToDataUri(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } finally {
    clearTimeout(timer);
  }
}

// Load default fallback photo
async function loadDefaultPhoto() {
  const defaultPaths = [
    path.join(__dirname, '../public/people/img_3.jpg'),
    path.join(process.cwd(), 'public/people/img_3.jpg'),
    path.join(__dirname, 'public/people/img_3.jpg'),
  ];
  for (const p of defaultPaths) {
    if (fsSync.existsSync(p)) {
      try {
        return await photoToDataUri(p);
      } catch {
        // Continue searching
      }
    }
  }
  // Fallback 1x1 neutral transparent GIF data URI if image file missing
  return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
}

/**
 * Hydrates an SVG template with person data and event info.
 */
function hydrateCard(templateSvg, person, info = {}, options = {}) {
  let svg = templateSvg;
  const name = String(person.name ?? '').trim();
  const photo = person.photo || options.defaultPhoto || '';

  // Dynamically scale font-size for name
  const nameFontRegex = /font-size="([0-9.]+)"([^>]*>[^<]*\{\{name\}\})/i;
  const match = svg.match(nameFontRegex);
  if (match) {
    const originalSize = parseFloat(match[1]) || 4.6;
    const newSize = fitFont(name, originalSize).toFixed(2);
    svg = svg.replace(nameFontRegex, `font-size="${newSize}"$2`);
  } else {
    svg = svg.replace('font-size="4.6"', `font-size="${fitFont(name).toFixed(2)}"`);
  }

  // Replace text placeholders
  const replacements = {
    name: escapeXml(name),
    position: escapeXml(person.position || person.role || ''),
    role: escapeXml(person.role || person.position || ''),
    roll_no: escapeXml(person.roll_no || person.id || ''),
    id: escapeXml(person.id || person.roll_no || ''),
    department: escapeXml(person.department || person.dept || ''),
    year: escapeXml(person.year || ''),
    event: escapeXml(info.name || ''),
    event_name: escapeXml(info.name || ''),
    date: escapeXml(info.date || ''),
    venue: escapeXml(info.venue || ''),
    tagline: escapeXml(info.tagline || ''),
  };

  for (const [key, val] of Object.entries(replacements)) {
    svg = svg.replaceAll(`{{${key}}}`, val);
  }

  // Replace photo placeholder
  if (photo) {
    svg = svg.replaceAll('{{photo}}', photo);
  }

  return svg;
}

/**
 * Bulk generates cards from in-memory objects.
 */
function generateBulkCards(templateSvg, people, info = {}, options = {}) {
  return people.map((person) => ({
    person,
    svg: hydrateCard(templateSvg, person, info, options),
  }));
}

/**
 * Bulk generates cards from user files (SVG template + CSV + photos directory).
 */
async function generateFromFiles({
  templatePath,
  csvPath,
  photosDir = null,
  outDir = 'result',
  dpi = DEFAULT_DPI,
  info = {},
}) {
  if (!fsSync.existsSync(templatePath)) {
    throw new Error(`Template file not found at: ${templatePath}`);
  }
  if (!fsSync.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  const templateSvg = await fs.readFile(templatePath, 'utf8');
  const csvContent = await fs.readFile(csvPath, 'utf8');

  // Parse CSV
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/[\s-]+/g, '_'),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    console.warn('[Bulk Generator] CSV parse warnings:', parsed.errors);
  }

  const headers = parsed.meta.fields ?? [];
  const compulsoryCols = ['roll_no', 'name', 'department', 'role'];

  // Check compulsory columns
  for (const col of compulsoryCols) {
    const hasCol = headers.some((h) => {
      if (col === 'roll_no') return ['roll_no', 'rollno', 'roll', 'id', 'enrollment'].includes(h);
      if (col === 'department') return ['department', 'dept', 'branch'].includes(h);
      if (col === 'role') return ['role', 'position'].includes(h);
      if (col === 'name') return ['name', 'full_name'].includes(h);
      return h === col;
    });
    if (!hasCol) {
      throw new Error(`CSV is missing compulsory column: "${col}". Required: roll_no, name, department, role.`);
    }
  }

  // If card template contains {{photo}}, photo column is compulsory
  const templateHasPhoto = templateSvg.includes('{{photo}}');
  const hasPhotoColumn = headers.some((h) => ['photo', 'image', 'image_url'].includes(h));
  if (templateHasPhoto && !hasPhotoColumn) {
    throw new Error(`Template contains {{photo}}, but the CSV is missing the compulsory "photo" column.`);
  }

  await fs.mkdir(outDir, { recursive: true });
  const defaultPhotoUri = await loadDefaultPhoto();

  const results = [];
  const missingPhotos = [];
  let successCount = 0;

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const rollNo = String(row.roll_no || row.id || row.rollno || `row_${i + 2}`).trim();
    const name = String(row.name || row.full_name || '').trim();
    const department = String(row.department || row.dept || row.branch || '').trim();
    const role = String(row.role || row.position || 'participant').trim();

    if (!rollNo || !name || !department) {
      console.warn(`[Row ${i + 2}] Skipped due to missing compulsory fields (roll_no: "${rollNo}", name: "${name}", department: "${department}")`);
      continue;
    }

    try {
      let photoDataUri = '';
      const photoRef = String(row.photo || row.image || row.image_url || '').trim();

      if (photoRef.startsWith('data:image')) {
        photoDataUri = photoRef;
      } else if (photoRef.startsWith('http://') || photoRef.startsWith('https://')) {
        try {
          photoDataUri = await fetchUrlToDataUri(photoRef);
        } catch (fetchErr) {
          photoDataUri = defaultPhotoUri;
          missingPhotos.push({ rollNo, name, reason: `URL inaccessible (${photoRef}): ${fetchErr.message}` });
          console.warn(`[Warning] Photo URL inaccessible for Roll No: ${rollNo} (${name}). Embedded default photo.`);
        }
      } else if (photoRef) {
        // Local file matching
        const candidatePaths = [];
        if (photosDir) {
          candidatePaths.push(path.join(photosDir, photoRef));
          candidatePaths.push(path.join(photosDir, path.basename(photoRef)));
        }
        candidatePaths.push(photoRef);

        let found = false;
        for (const p of candidatePaths) {
          if (fsSync.existsSync(p)) {
            photoDataUri = await photoToDataUri(p);
            found = true;
            break;
          }
        }

        if (!found) {
          // Check by roll number fallback
          if (photosDir) {
            for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
              const rollPath = path.join(photosDir, `${rollNo}${ext}`);
              if (fsSync.existsSync(rollPath)) {
                photoDataUri = await photoToDataUri(rollPath);
                found = true;
                break;
              }
            }
          }
        }

        if (!found) {
          photoDataUri = defaultPhotoUri;
          missingPhotos.push({ rollNo, name, reason: `File not found ("${photoRef}")` });
          console.warn(`[Warning] Photo file not found for Roll No: ${rollNo} (${name}) [${photoRef}]. Embedded default photo.`);
        }
      } else {
        // Photo cell empty
        if (templateHasPhoto) {
          photoDataUri = defaultPhotoUri;
          missingPhotos.push({ rollNo, name, reason: 'Empty photo column value' });
          console.warn(`[Warning] Photo value missing for Roll No: ${rollNo} (${name}). Embedded default photo.`);
        }
      }

      const person = {
        name,
        role,
        position: role,
        id: rollNo,
        roll_no: rollNo,
        department,
        year: String(row.year || '').trim(),
        photo: photoDataUri || defaultPhotoUri,
      };

      const svg = hydrateCard(templateSvg, person, info, { defaultPhoto: defaultPhotoUri });
      const svgPath = path.join(outDir, `${rollNo}.svg`);
      const jpgPath = path.join(outDir, `${rollNo}.jpg`);

      await fs.writeFile(svgPath, svg, 'utf8');

      await sharp(Buffer.from(svg), { density: dpi })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
        .withMetadata({ density: dpi })
        .toFile(jpgPath);

      successCount++;
      console.log(`[${successCount}/${parsed.data.length}] Generated: ${rollNo}.jpg`);
      results.push({ rollNo, svgPath, jpgPath, success: true });
    } catch (err) {
      console.error(`Failed to generate card for ${rollNo} (${name}):`, err.message);
      results.push({ rollNo, success: false, error: err.message });
    }
  }

  console.log(`\n========================================`);
  console.log(`Generated ${successCount}/${parsed.data.length} cards in "${outDir}/".`);
  if (missingPhotos.length > 0) {
    console.log(`\nDefault photo embedded for ${missingPhotos.length} attendee(s) with missing or inaccessible photos:`);
    for (const m of missingPhotos) {
      console.log(`  - Roll No: ${m.rollNo} (${m.name}) -> ${m.reason}`);
    }
  }
  console.log(`========================================\n`);

  return { successCount, total: parsed.data.length, missingPhotos, results };
}

// CLI Runner
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log(`Usage: node scripts/bulk_card_generator.js <template.svg> <people.csv> [photos_dir] [out_dir]`);
    process.exit(1);
  }

  const [templatePath, csvPath, photosDir, outDir] = args;
  generateFromFiles({
    templatePath,
    csvPath,
    photosDir: photosDir || null,
    outDir: outDir || 'result',
  }).catch((err) => {
    console.error('Bulk generation error:', err.message);
    process.exit(1);
  });
}

module.exports = {
  escapeXml,
  fitFont,
  photoToDataUri,
  fetchUrlToDataUri,
  loadDefaultPhoto,
  hydrateCard,
  generateBulkCards,
  generateFromFiles,
};