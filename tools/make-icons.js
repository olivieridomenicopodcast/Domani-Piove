#!/usr/bin/env node
/* Genera icon-192.png e icon-512.png (icone PWA) con Playwright.
   Uso: NODE_PATH=/opt/node-tools/node_modules node tools/make-icons.js */
'use strict';
const { chromium } = require('playwright'); const path = require('path');
require('../js/cards.js'); require('../js/data.js'); require('../js/ui/sprites.js');
const S = globalThis.FF.Sprites;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  for (const size of [192, 512]) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<body style="margin:0;background:#24445f;display:flex;align-items:center;justify-content:center;height:${size}px"><div style="width:${size * 0.7}px;height:${size * 0.7}px;background:#e7edf3;border-radius:50%;display:flex;align-items:center;justify-content:center">${S.logo().replace('<svg ', '<svg style="width:84%;height:84%" ')}</div></body>`);
    await p.screenshot({ path: path.join(__dirname, '..', `icon-${size}.png`) });
    await p.close();
  }
  await b.close(); console.log('icone create');
})();
