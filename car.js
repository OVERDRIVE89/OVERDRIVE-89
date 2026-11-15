// ฟิสิกส์รถ: เลี้ยวนุ่ม, ดริฟต์ (ไถลข้าง), เทอร์โบหลังดริฟต์
import { CAR } from './config.js';

export function createCar(track) {
  const a = track.pts[0], ang = track.head[0];
  return { x: a.x + Math.cos(ang) * 60, y: a.y + Math.sin(ang) * 60, rot: ang, vx: 0, vy: 0,
    steer: 0, driftT: 0, boostT: 0, sliding: false };
}

// inp = {gas, brk, left, right, drift}   s = วินาทีต่อเฟรม   engine = เลเวลเครื่องยนต์
export function stepCar(c, inp, s, engine) {
  const top = CAR.topBase + engine * CAR.topPerEngine, topNow = top * (c.boostT > 0 ? CAR.boostMul : 1);
  const target = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  c.steer += (target - c.steer) * Math.min(1, (target === 0 ? CAR.steerOut : CAR.steerIn) * s);

  let spd = Math.hypot(c.vx, c.vy);
  const drifting = inp.drift && spd > CAR.driftMinSpeed;
  const grip = Math.min(1, spd / 120) * (1 - 0.4 * spd / topNow);
  c.rot += c.steer * CAR.turn * grip * (drifting ? CAR.driftTurnBoost : 1) * s;   // หมุนหัวรถก่อน

  const fx = Math.cos(c.rot), fy = Math.sin(c.rot), rx = -fy, ry = fx;
  let vf = c.vx * fx + c.vy * fy, vl = c.vx * rx + c.vy * ry;
  const accel = (CAR.accelBase + engine * CAR.accelPerEngine) * (1 - 0.5 * spd / topNow);
  if (inp.gas) vf += accel * s; else if (inp.brk) vf -= CAR.brake * s; else vf -= CAR.coast * s;
  if (c.boostT > 0) vf += 450 * s;
  if (drifting) vf -= 25 * s;
  vf = Math.max(0, vf);
  vl *= Math.exp(-(drifting ? CAR.gripDrift : CAR.gripNormal) * s);               // ดริฟต์ = แรงเกาะข้างต่ำ
  c.vx = vf * fx + vl * rx; c.vy = vf * fy + vl * ry;

  spd = Math.hypot(c.vx, c.vy);
  if (spd > topNow) { c.vx *= topNow / spd; c.vy *= topNow / spd; }

  c.sliding = drifting && Math.abs(vl) > 60;
  if (c.sliding) c.driftT += s;
  else if (!inp.drift) { if (c.driftT > 1) c.boostT = 0.6 + Math.min(c.driftT, 3) * 0.3; c.driftT = 0; }
  if (c.boostT > 0) c.boostT -= s;

  c.x += c.vx * s; c.y += c.vy * s;
}

// ออกนอกถนน = ช้าลงแต่ไม่ค้าง
export function applyOffroad(c, s) {
  const sp = Math.hypot(c.vx, c.vy);
  if (sp <= 0) return;
  const ns = Math.max(sp * Math.exp(-CAR.offroadDrag * s), Math.min(sp, CAR.offroadMinSpeed));
  c.vx *= ns / sp; c.vy *= ns / sp;
}
