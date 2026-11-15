// จุดเริ่มต้น: ผูกทุกส่วนเข้าด้วยกัน
import { gameConfig } from './race.js';
import { setupInput } from './input.js';
import { initUi, showHud } from './ui.js';
import { initMenu } from './menu.js';

let game = null;
setupInput();
initUi();
initMenu(() => {                       // เมื่อกดเริ่มเล่น (ทดลอง / ออนไลน์)
  document.getElementById('menu').classList.add('hidden');
  showHud(true);
  if (!game) game = new Phaser.Game(gameConfig());
});
