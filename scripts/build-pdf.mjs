// 이력서 PDF 를 headless Chrome 으로 만든다 — 브라우저 인쇄 설정과 무관하게 항상 같은 결과.
// GitHub Actions(.github/workflows/resume-pdf.yml)가 resume/ 가 바뀔 때마다 돌린다.
//
//   npm install --no-save playwright@1.48.2 && npx playwright install chromium
//   node scripts/build-pdf.mjs            → resume/pdf/resume.pdf · resume/pdf/resume-only.pdf
//
// CHROME_PATH 로 이미 깔린 Chromium 을 쓸 수 있다.
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = join(root, 'resume', 'pdf');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };

// 저장소 루트를 그대로 서빙하는 최소 정적 서버 (fetch('data.json') 이 동작하도록)
const server = http.createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(root, path.endsWith('/') ? path + 'index.html' : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => errors.push('요청 실패 ' + r.url()));
  await page.goto(base + '/resume/', { waitUntil: 'networkidle' });
  await page.waitForSelector('header.profile');
  await page.evaluate(() => document.fonts.ready);
  const fontOk = await page.evaluate(() => document.fonts.check('16px Pretendard'));
  if (!fontOk || errors.length) throw new Error('페이지를 제대로 그리지 못했다: ' + (fontOk ? '' : 'Pretendard 미로딩 ') + errors.join(', '));

  await mkdir(outDir, { recursive: true });
  // 인쇄 CSS(@page A4·여백·쪽 번호)를 그대로 쓴다 — 설정은 여기서 고정된다
  const opts = { preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false };
  await page.pdf({ ...opts, path: join(outDir, 'resume.pdf') });
  await page.evaluate(() => document.body.classList.add('no-portfolio'));
  await page.pdf({ ...opts, path: join(outDir, 'resume-only.pdf') });
  console.log('✓ resume/pdf/resume.pdf · resume/pdf/resume-only.pdf');
} finally {
  await browser.close();
  server.close();
}
