// ===== ค่าตั้งต้นของเกม: แก้ตัวเลขที่นี่ที่เดียว =====
export const CONFIG = {
  gameName: 'OVERDRIVE 89',
  // --- ระบบออนไลน์ (Supabase) ปล่อยว่างไว้ = ยังปิดอยู่ ---
  // ใส่ค่าจาก Supabase > Project Settings > API   (ใช้ anon public key เท่านั้น ห้ามใส่ service_role)
  supabaseUrl: '',
  supabaseKey: '',
  // --- ชื่อที่ใช้เก็บข้อมูลในเครื่อง ---
  saveKey: 'overdrive89_save',
  emailKey: 'overdrive89_email',
};

export const VIEW = { W: 1600, H: 900 };   // ขนาดภาพเกม (ย่อให้พอดีจออัตโนมัติ)
export const ROAD = 190;                   // ความกว้างถนน

// ฟิสิกส์รถ: ปรับความรู้สึกการขับที่นี่
export const CAR = {
  topBase: 330, topPerEngine: 45,          // ความเร็วสูงสุด = topBase + topPerEngine * เลเวลเครื่องยนต์
  accelBase: 230, accelPerEngine: 30,      // แรงเร่ง
  brake: 360, coast: 110,                  // แรงเบรก / แรงหน่วงตอนปล่อยคันเร่ง
  turn: 2.5,                               // ความไวพวงมาลัย
  steerIn: 5, steerOut: 9,                 // พวงมาลัยหมุนเข้า / คืนตรง (สูง = ไวขึ้น)
  gripNormal: 10,                          // แรงเกาะข้างปกติ (สูง = ไม่ไถล)
  gripDrift: 1.3,                          // แรงเกาะข้างตอนดริฟต์ (ต่ำ = ไถลมาก)
  driftTurnBoost: 1.45,                    // ดริฟต์แล้วเลี้ยวได้แคบขึ้นกี่เท่า
  driftMinSpeed: 140,                      // ความเร็วต่ำสุดที่ดริฟต์ได้
  boostMul: 1.35,                          // เทอร์โบแรงขึ้นกี่เท่า
  offroadDrag: 1.6, offroadMinSpeed: 90,   // ออกนอกถนนช้าลง แต่ไม่ต่ำกว่านี้
};

// รางวัลต่อรอบ และราคาอัปเกรด
export const REWARD = { minLapSec: 20, expBase: 300, expPerSec: 3, expMin: 30, coins: 150 };
export const UPGRADE = { engineCostPerLevel: 100 };
