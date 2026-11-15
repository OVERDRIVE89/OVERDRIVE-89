// ข้อมูลผู้เล่น (ตอนนี้เก็บในเครื่อง; ภายหลังซิงก์ขึ้นเซิร์ฟเวอร์ได้ที่ persist())
import { CONFIG, REWARD, UPGRADE } from './config.js';

export const save = { level: 1, exp: 0, coins: 0, engine: 1 };
try { Object.assign(save, JSON.parse(localStorage.getItem(CONFIG.saveKey) || '{}')); } catch (e) {}

export const persist = () => { try { localStorage.setItem(CONFIG.saveKey, JSON.stringify(save)); } catch (e) {} };
export const expNeeded = lv => 100 + lv * 50;
export const engineCost = () => UPGRADE.engineCostPerLevel * save.engine;

export function buyEngine() {
  if (save.coins < engineCost()) return false;
  save.coins -= engineCost(); save.engine++; persist(); return true;
}

// เรียกตอนขับครบรอบ คืน true ถ้านับรอบ
export function addLapReward(sec) {
  if (sec < REWARD.minLapSec) return false;
  save.exp += Math.max(REWARD.expMin, Math.round(REWARD.expBase - sec * REWARD.expPerSec));
  save.coins += REWARD.coins;
  while (save.exp >= expNeeded(save.level)) { save.exp -= expNeeded(save.level); save.level++; }
  persist(); return true;
}
