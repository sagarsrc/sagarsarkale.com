import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'og', 'blog');

const SECTIONS = [
  { subsection: 'genai', dir: 'blog/genai' },
  { subsection: 'seq', dir: 'blog/seq' },
  { subsection: 'web', dir: 'blog/web' },
];

function loadInterFont() {
  const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'Inter', 'Inter-SemiBold.ttf');
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Inter font not found at ${fontPath}. Run: curl -L "https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip" -o /tmp/inter.zip && unzip -j /tmp/inter.zip "extras/ttf/Inter-SemiBold.ttf" -d public/fonts/Inter/`);
  }
  return fs.readFileSync(fontPath);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const lines = match[1].split('\n');
  const fm = {};
  for (const line of lines) {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (m) {
      let val = m[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      fm[m[1]] = val;
    }
  }
  return fm;
}

function getMdFiles(dir) {
  const fullDir = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
}

async function generateOgImage(title, description, outputPath) {
  const fontData = loadInterFont();
  
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#121215',
          padding: '64px',
          position: 'relative',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { position: 'absolute', top: 0, left: 0, right: 0, height: '6px', backgroundColor: '#22d3ee' },
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: { fontSize: '64px', fontWeight: 600, color: '#ededf0', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 },
                    children: title,
                  },
                },
                description && {
                  type: 'p',
                  props: {
                    style: { fontSize: '28px', color: '#85858f', lineHeight: 1.4, margin: 0, maxWidth: '800px' },
                    children: description,
                  },
                },
              ].filter(Boolean),
            },
          },
          {
            type: 'div',
            props: {
              style: { position: 'absolute', bottom: '48px', left: '64px', right: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
              children: [
                {
                  type: 'span',
                  props: { style: { fontSize: '22px', color: '#22d3ee', fontWeight: 500, letterSpacing: '-0.01em' }, children: 'sagarsarkale.com' },
                },
                {
                  type: 'span',
                  props: { style: { fontSize: '18px', color: '#85858f' }, children: 'blog' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Inter', data: fontData, weight: 600, style: 'normal' }],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const pngData = resvg.render();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, pngData.asPng());
  console.log(`Generated OG image: ${outputPath}`);
}

async function main() {
  const posts = [];
  for (const { subsection, dir } of SECTIONS) {
    const files = getMdFiles(dir);
    for (const file of files) {
      const filePath = path.join(CONTENT_DIR, dir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const fm = parseFrontmatter(raw);
      const slug = file.replace(/\.(md|mdx)$/, '');
      
      if (fm.cover) continue; // Skip posts with explicit cover images
      
      posts.push({
        subsection,
        slug,
        title: fm.title || slug,
        description: fm.description || fm.summary || '',
      });
    }
  }

  console.log(`Generating OG images for ${posts.length} posts without covers...`);
  
  for (const post of posts) {
    const outputPath = path.join(OUTPUT_DIR, post.subsection, `${post.slug}.png`);
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping (exists): ${outputPath}`);
      continue;
    }
    await generateOgImage(post.title, post.description, outputPath);
  }
  
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
