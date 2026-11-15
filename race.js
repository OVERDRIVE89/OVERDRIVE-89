// ฉากแข่งรถ (Phaser): วาดสนาม, ขับรถ, นับรอบ, กล้องตามรถ
import { VIEW, ROAD } from './config.js';
import { TRACKS, buildTrack, nextCorner } from './track.js';
import { createCar, stepCar, applyOffroad } from './car.js';
import { readInput } from './input.js';
import { save, addLapReward } from './save.js';
import { refreshHud, createMinimap, setLapText, setWarn, setState } from './ui.js';

export class Race extends Phaser.Scene {
  constructor() { super('Race'); this.track = buildTrack(TRACKS.neonLoop); }

  create() {
    const t = this.track, W = t.world.w, H = t.world.h;
    const g = this.add.graphics();
    g.fillStyle(0x0d0221).fillRect(0, 0, W, H);
    g.lineStyle(2, 0x1b0d3a);
    for (let x = 0; x <= W; x += 200) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 200) g.lineBetween(0, y, W, y);
    g.lineStyle(ROAD + 16, 0x05d9e8).strokePoints(t.pts, true, true);   // ขอบนีออน
    g.lineStyle(ROAD, 0x261447).strokePoints(t.pts, true, true);        // ผิวถนน
    const a = t.pts[0], ang = t.head[0];
    const nx = -Math.sin(ang) * ROAD / 2, ny = Math.cos(ang) * ROAD / 2;
    g.lineStyle(8, 0xffffff).lineBetween(a.x - nx, a.y - ny, a.x + nx, a.y + ny);   // เส้นสตาร์ท

    this.c = createCar(t);
    this.car = this.add.rectangle(this.c.x, this.c.y, 48, 24, 0xf9c80e).setStrokeStyle(3, 0xff2a6d);
    this.trail = [];
    for (let i = 0; i < 24; i++) this.trail.push(this.add.circle(0, 0, 9, 0xff2a6d, 0).setDepth(-1));
    this.ti = 0;

    const cam = this.cameras.main;
    cam.setBounds(0, 0, W, H); cam.setZoom(0.8);
    cam.startFollow(this.car, true, 0.09, 0.09);

    this.idx = 0; this.half = false; this.started = false; this.lapStart = 0; this.mmT = 0;
    this.mini = createMinimap(t);
    refreshHud();
  }

  update(_, dt) {
    const t = this.track, c = this.c, s = Math.min(dt, 50) / 1000, inp = readInput();
    if (inp.gas && !this.started) { this.started = true; this.lapStart = this.time.now; }
    stepCar(c, inp, s, save.engine);

    // ตำแหน่งบนสนาม: ใกล้จุดไหนของสนามที่สุด (ใช้เช็คนอกถนนและนับรอบ)
    let best = 0, bd = Infinity;
    for (let i = 0; i < t.n; i++) {
      const d = (t.pts[i].x - c.x) ** 2 + (t.pts[i].y - c.y) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    if (Math.sqrt(bd) > ROAD / 2) applyOffroad(c, s);
    const prev = this.idx; this.idx = best;
    if (best > t.n * 0.4 && best < t.n * 0.6) this.half = true;
    if (this.half && prev > t.n * 0.9 && best < t.n * 0.1) {            // ข้ามเส้นสตาร์ทหลังผ่านครึ่งทาง
      if (this.started && addLapReward((this.time.now - this.lapStart) / 1000)) refreshHud();
      this.lapStart = this.time.now; this.half = false;
    }

    this.car.setPosition(c.x, c.y).setRotation(c.rot);
    this.car.setFillStyle(c.boostT > 0 ? 0x05d9e8 : c.sliding ? 0xff9f1c : 0xf9c80e);
    if (c.sliding) {                                                    // รอยไถลท้ายรถ
      const p = this.trail[this.ti++ % this.trail.length];
      p.setPosition(c.x - Math.cos(c.rot) * 22, c.y - Math.sin(c.rot) * 22).setAlpha(0.7);
    }
    this.trail.forEach(p => { if (p.alpha > 0) p.setAlpha(Math.max(0, p.alpha - 1.4 * s)); });

    const cam = this.cameras.main, sp = Math.hypot(c.vx, c.vy);         // กล้องมองนำหน้า ซูมออกเมื่อเร็ว
    cam.setZoom(cam.zoom + ((0.85 - 0.3 * Math.min(1, sp / 520)) - cam.zoom) * Math.min(1, 2 * s));
    cam.setFollowOffset(-c.vx * 0.3, -c.vy * 0.3);

    if (this.started) setLapText((this.time.now - this.lapStart) / 1000);
    this.mmT += dt;
    if (this.mmT > 90) { this.mmT = 0; this.mini.draw(c, this.idx); setWarn(nextCorner(t, this.idx), t.step); }
    setState(c.boostT > 0 ? 'BOOST!' : c.sliding ? 'DRIFT ' + c.driftT.toFixed(1) + 's' : '');
  }
}

export const gameConfig = () => ({
  type: Phaser.AUTO, parent: 'game', width: VIEW.W, height: VIEW.H, backgroundColor: '#0d0221',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: Race,
});
