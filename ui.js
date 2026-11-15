// ส่วนแสดงผลบนหน้าจอ: HUD, แผนที่ย่อ, ป้ายเตือนโค้ง, เต็มจอ
import { save, expNeeded, engineCost, buyEngine } from './save.js';

export const $ = id => document.getElementById(id);

export function refreshHud() {
  $('lv').textContent = save.level;
  $('exp').textContent = save.exp + '/' + expNeeded(save.level);
  $('coin').textContent = save.coins;
  $('up').textContent = `เครื่องยนต์ Lv${save.engine} (${engineCost()}¢)`;
}
export const setLapText = sec => { $('lap').textContent = sec == null ? '-' : sec.toFixed(1) + 's'; };
export const setState = t => { $('state').textContent = t; };
export const showHud = on => document.body.classList.toggle('playing', on);

export function setWarn(cn, step) {
  const w = $('warn');
  if (!cn) { w.textContent = ''; return; }
  const arrow = cn.dir < 0 ? '◀ โค้งซ้าย' : 'โค้งขวา ▶';
  w.textContent = cn.dist < step ? arrow : arrow + ' ' + Math.round(cn.dist / 10) * 10 + 'm';
  w.classList.toggle('hot', cn.dist < 450);
}

// ----- เต็มจอ + ล็อกแนวนอน (ต้องเรียกจากการแตะของผู้เล่น) -----
export function goFullscreen() {
  const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
  try {
    const r = req && req.call(el, { navigationUI: 'hide' });
    const lock = () => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (_) {} };
    if (r && r.then) r.then(lock).catch(() => {}); else lock();
  } catch (_) {}
}

export function initUi() {
  $('up').addEventListener('pointerdown', () => { if (buyEngine()) refreshHud(); });
  $('fs').addEventListener('pointerdown', e => {
    e.preventDefault();
    if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else goFullscreen();
  });
  refreshHud();
}

// ----- แผนที่ย่อ -----
export function createMinimap(track) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  track.pts.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); });
  const cw = 400, ch = 240, pad = 22, sc = Math.min((cw - 2 * pad) / (x1 - x0), (ch - 2 * pad) / (y1 - y0));
  const ox = (cw - (x1 - x0) * sc) / 2 - x0 * sc, oy = (ch - (y1 - y0) * sc) / 2 - y0 * sc;
  const P = p => [p.x * sc + ox, p.y * sc + oy];
  const base = document.createElement('canvas'); base.width = cw; base.height = ch;
  const b = base.getContext('2d');
  b.lineWidth = 7; b.strokeStyle = '#05d9e8'; b.lineJoin = 'round'; b.beginPath();
  track.pts.forEach((p, i) => (i ? b.lineTo(...P(p)) : b.moveTo(...P(p))));
  b.closePath(); b.stroke();

  return { draw(car, idx) {
    const c = $('mm').getContext('2d');
    c.clearRect(0, 0, cw, ch); c.drawImage(base, 0, 0);
    c.lineWidth = 8; c.strokeStyle = '#ff2a6d'; c.beginPath();            // ช่วงถนนข้างหน้า
    for (let j = 0; j <= 75; j++) { const q = P(track.pts[(idx + j) % track.n]); j ? c.lineTo(...q) : c.moveTo(...q); }
    c.stroke();
    const s0 = P(track.pts[0]); c.fillStyle = '#fff'; c.fillRect(s0[0] - 3, s0[1] - 3, 6, 6);
    const cp = P(car); c.fillStyle = '#f9c80e'; c.beginPath(); c.arc(cp[0], cp[1], 7, 0, 7); c.fill();
  } };
}
