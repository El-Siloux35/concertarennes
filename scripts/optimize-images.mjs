#!/usr/bin/env node
/**
 * Convert PNG/JPG assets to WebP for smaller file sizes.
 * Run: node scripts/optimize-images.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "src", "assets");

// Try sharp (optional dep)
async function convertWithSharp(inputPath, outputPath) {
  try {
    const sharp = (await import("sharp")).default;
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const catPng = join(assetsDir, "cat.png");
  const catWebp = join(assetsDir, "cat.webp");

  if (existsSync(catPng)) {
    const ok = await convertWithSharp(catPng, catWebp);
    if (ok) {
      console.log("✓ cat.webp generated from cat.png");
    } else {
      console.log("Skip cat.webp (install sharp: npm i -D sharp)");
    }
  }
}

main().catch(console.error);
