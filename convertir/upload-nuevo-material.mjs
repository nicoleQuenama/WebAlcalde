import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(import.meta.dirname, '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const BUCKET = process.env.SUPABASE_BUCKET;

const SOURCE = 'C:\\Users\\Usuario\\Downloads\\NUEVO MATERIAL-20260908T020545Z-1-001\\NUEVO MATERIAL';
const MAX_SIZE_BYTES = 48 * 1024 * 1024;

const VIDEO_EXT = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.jfif', '.webp'];

const isVideo = (f) => VIDEO_EXT.includes(path.extname(f).toLowerCase());
const isImage = (f) => IMAGE_EXT.includes(path.extname(f).toLowerCase());

function sanitize(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // quitar acentos
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N')
    .replace(/…/g, '...')
    .replace(/[\\/:*?"<>|]/g, '_')     // caracteres bloqueados por Supabase
    .replace(/\s+/g, '_')
    .replace(/,/g, '_')
    .replace(/_+/g, '_');
}

function getRelativePath(filePath) {
  return path.relative(SOURCE, filePath);
}

function getSupabaseCategory(relativePath) {
  const parts = relativePath.split(/[\\/]/);
  if (parts.length === 1) return 'raiz';
  const sub = parts[0].toLowerCase();
  if (sub.includes('cocha antes y ahora')) {
    if (parts.length > 2 && parts[1].toLowerCase() === 'ahora') return 'cocha-antes-y-ahora/ahora';
    return 'cocha-antes-y-ahora';
  }
  if (sub.includes('premios manfred')) return 'premios-manfred';
  if (sub.includes('recursos graficos')) return 'recursos-graficos-home';
  return sub;
}

async function walkDir(dir) {
  let results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(await walkDir(full));
    else results.push(full);
  }
  return results;
}

async function uploadBuffer(buffer, storagePath, contentType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });
  if (error) throw error;
}

function getVideoDuration(filePath) {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`,
    { stdio: 'pipe' }
  ).toString().trim();
  return parseFloat(out);
}

async function main() {
  const args = process.argv.slice(2);
  const onlyImages = args.includes('--images');
  const onlyVideos = args.includes('--videos');
  const folderFilter = args.find(a => a.startsWith('--folder='))?.split('=')[1];

  console.log('=== SUBIENDO NUEVO MATERIAL A SUPABASE ===\n');

  const allFiles = await walkDir(SOURCE);
  let videos = allFiles.filter(isVideo);
  let images = allFiles.filter(isImage);

  if (onlyImages) videos = [];
  if (onlyVideos) images = [];
  if (folderFilter) {
    videos = videos.filter(v => getRelativePath(v).toLowerCase().includes(folderFilter));
    images = images.filter(i => getRelativePath(i).toLowerCase().includes(folderFilter));
  }

  console.log(`Imágenes: ${images.length} | Videos: ${videos.length}\n`);

  // ===== IMÁGENES =====
  if (images.length > 0) {
    console.log('--- IMÁGENES (convertir a WebP y subir) ---');
    let imgOk = 0, imgFail = 0;

    for (const img of images) {
      const rel = getRelativePath(img);
      const category = getSupabaseCategory(rel);
      const safeBase = sanitize(path.parse(path.basename(img)).name);
      const storagePath = `imagenes/${category}/${safeBase}.webp`;

      try {
        const buffer = await fs.readFile(img);
        const webp = await sharp(buffer).webp({ quality: 80 }).toBuffer();
        await uploadBuffer(webp, storagePath, 'image/webp');
        console.log(`  [${imgOk + 1}/${images.length}] -> ${storagePath}`);
        imgOk++;
      } catch (e) {
        console.error(`  FAIL: ${rel} - ${e.message}`);
        imgFail++;
      }
    }
    console.log(`\nImágenes: ${imgOk} OK, ${imgFail} fallidas\n`);
  }

  // ===== VIDEOS =====
  if (videos.length > 0) {
    console.log('--- VIDEOS ---');
    let vidOk = 0, vidFail = 0;
    const tmpDir = path.join(os.tmpdir(), 'supa-videos');
    await fs.mkdir(tmpDir, { recursive: true });

    for (const video of videos) {
      const rel = getRelativePath(video);
      const stat = await fs.stat(video);
      const sizeMB = (stat.size / 1024 / 1024).toFixed(1);
      const storagePath = `videos/${sanitize(path.basename(video))}`;

      console.log(`  [${vidOk + vidFail + 1}/${videos.length}] ${rel} (${sizeMB}MB)`);

      try {
        if (stat.size <= MAX_SIZE_BYTES) {
          const buffer = await fs.readFile(video);
          await uploadBuffer(buffer, storagePath, 'video/mp4');
          console.log(`    -> subido directo`);
        } else {
          console.log(`    -> comprimiendo...`);
          const tmpOut = path.join(tmpDir, `compressed_${path.basename(video)}`);
          const duration = getVideoDuration(video);
          // bitrate total objetivo en bps para caber en MAX_SIZE
          const totalBps = Math.floor((MAX_SIZE_BYTES * 8 * 0.9) / duration);
          const audioBps = 128000;
          const videoBps = Math.max(totalBps - audioBps, 100000);

          execSync(
            `ffmpeg -y -i "${video}" -c:v libx264 -preset medium -b:v ${videoBps} ` +
            `-maxrate ${videoBps} -bufsize 2M -c:a aac -b:a 128k -movflags +faststart "${tmpOut}"`,
            { stdio: 'pipe', timeout: 900000 }
          );

          const outStat = await fs.stat(tmpOut);
          const outMB = (outStat.size / 1024 / 1024).toFixed(1);
          console.log(`    -> ${outMB}MB`);

          const buffer = await fs.readFile(tmpOut);
          await uploadBuffer(buffer, storagePath, 'video/mp4');
          console.log(`    -> subido`);

          await fs.unlink(tmpOut).catch(() => {});
        }
        vidOk++;
      } catch (e) {
        console.error(`    FAIL: ${e.message}`);
        vidFail++;
      }
    }

    console.log(`\nVideos: ${vidOk} OK, ${vidFail} fallidas`);
  }

  console.log('\n=== PROCESO COMPLETADO ===');
}

main().catch(console.error);
