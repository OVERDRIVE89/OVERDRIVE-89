// การควบคุม: แผ่นซ้าย = เลี้ยว (โปร่งใส) / แผ่นขวา = เร่ง ดริฟต์ เบรก (นิ้วเดียวเลื่อนได้) + คีย์บอร์ด
const $ = id => document.getElementById(id);
const touch = { left: false, right: false, gas: false, brk: false, drift: false };
const kb = { left: false, right: false, gas: false, brk: false, drift: false };

// ผูกแผ่นสัมผัสหนึ่งแผ่น: zoneOf(x, y) บอกว่าตำแหน่งนิ้วอยู่โซนไหน, apply(zones) อัปเดตสถานะ
function bindPad(pad, zoneOf, apply) {
  const ptrs = new Map();
  const upd = e => { const r = pad.getBoundingClientRect(); ptrs.set(e.pointerId, zoneOf((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)); apply([...ptrs.values()]); };
  pad.addEventListener('pointerdown', e => { e.preventDefault(); try { pad.setPointerCapture(e.pointerId); } catch (_) {} upd(e); });
  pad.addEventListener('pointermove', e => { if (ptrs.has(e.pointerId)) upd(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t =>
    pad.addEventListener(t, e => { ptrs.delete(e.pointerId); apply([...ptrs.values()]); }));
}

export function setupInput() {
  // ซ้าย: ครึ่งซ้าย = เลี้ยวซ้าย / ครึ่งขวา = เลี้ยวขวา
  bindPad($('l'), x => (x < 0.5 ? 'left' : 'right'), z => {
    touch.left = z.includes('left') && !z.includes('right');
    touch.right = z.includes('right') && !z.includes('left');
    $('left').classList.toggle('on', z.includes('left'));
    $('right').classList.toggle('on', z.includes('right'));
  });
  // ขวา: วางนิ้วที่ GAS แล้วเลื่อนซ้าย = ดริฟต์ (เร่งต่อ) / เลื่อนขึ้น = เบรก
  bindPad($('r'), (x, y) => (y < 0.34 ? 'brk' : x < 0.4 ? 'drift' : 'gas'), z => {
    touch.brk = z.includes('brk');
    touch.drift = z.includes('drift') && !touch.brk;
    touch.gas = (z.includes('gas') || z.includes('drift')) && !touch.brk;
    $('brk').classList.toggle('on', touch.brk);
    $('drift').classList.toggle('on', touch.drift);
    $('gas').classList.toggle('on', touch.gas);
  });
  // คีย์บอร์ด (ไว้ทดสอบบนคอม)
  const map = { ArrowUp: 'gas', w: 'gas', ArrowDown: 'brk', s: 'brk', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ' ': 'drift' };
  const on = v => e => { const k = map[e.key]; if (k) { kb[k] = v; e.preventDefault(); } };
  addEventListener('keydown', on(true)); addEventListener('keyup', on(false));
}

export const readInput = () => ({
  gas: touch.gas || kb.gas, brk: touch.brk || kb.brk,
  left: touch.left || kb.left, right: touch.right || kb.right, drift: touch.drift || kb.drift,
});
