// สนามแข่ง: สร้างจากสมการโค้งต่อเนื่อง (โค้งนุ่ม ไม่ทับกัน)
// เพิ่มสนามใหม่ = เพิ่มรายการใน TRACKS (แล้วให้ race.js เลือกใช้)
export const TRACKS = {
  neonLoop: {
    name: 'Neon Loop', world: { w: 7000, h: 4400 }, n: 600,
    shape: { cx: 3500, cy: 2200, a: 2840.92, b: 1739.99,
      ak: [17.77, 272.09, 121.65, 77.13, 100.65], pk: [2.2656, 3.6904, 0.5524, 5.4371, 3.7322],
      bk: [400.04, 97.35, 219.86, 169.07, 84.66], qk: [2.8382, 1.2943, 1.2107, 6.032, 1.2242] },
  },
};

export const wrapA = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

export function buildTrack(def) {
  const { shape: S, n } = def, pts = [];
  for (let i = 0; i < n; i++) {
    const u = 2 * Math.PI * i / n;
    let A = S.a, B = S.b;
    [2, 3, 4, 5, 6].forEach((k, j) => { A += S.ak[j] * Math.cos(k * u + S.pk[j]); B += S.bk[j] * Math.cos(k * u + S.qk[j]); });
    pts.push({ x: S.cx + A * Math.sin(u), y: S.cy + B * Math.cos(u) });
  }
  const head = pts.map((p, i) => { const q = pts[(i + 1) % n]; return Math.atan2(q.y - p.y, q.x - p.x); });
  let len = 0;
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; len += Math.hypot(q.x - p.x, q.y - p.y); }
  return { name: def.name, world: def.world, pts, head, n, len, step: len / n };
}

// โค้งข้างหน้า: คืน {dir: -1 ซ้าย / 1 ขวา, dist} หรือ null
export function nextCorner(t, i) {
  for (let j = 0; j < 45; j++) {
    const a = (i + j) % t.n, d = wrapA(t.head[(a + 14) % t.n] - t.head[a]);
    if (Math.abs(d) > 0.5) return { dir: d > 0 ? 1 : -1, dist: j * t.step };
  }
  return null;
}
