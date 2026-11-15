// หน้าเมนูก่อนเข้าเกม: ทดลองเล่น / เชื่อมอีเมล
import { CONFIG } from './config.js';
import { save } from './save.js';
import { session } from './session.js';
import { onlineEnabled, getUser, sendMagicLink, signOut } from './auth.js';
import { $, goFullscreen } from './ui.js';

export async function initMenu(onPlay) {
  $('menu-title').textContent = CONFIG.gameName;
  const status = $('menu-status'), emailBox = $('email-box'), msg = $('email-msg');
  let user = await getUser();

  function render() {
    const lv = `LV ${save.level} • ${save.coins}¢`;
    if (user) {
      $('btn-email').textContent = 'เล่นต่อ (' + (user.email || 'ออนไลน์') + ')';
      $('btn-logout').style.display = 'block';
      status.textContent = 'เชื่อมอีเมลแล้ว • ' + lv;
    } else {
      $('btn-email').textContent = 'เชื่อมอีเมล';
      $('btn-logout').style.display = 'none';
      const saved = localStorage.getItem(CONFIG.emailKey);
      status.textContent = (saved ? 'อีเมลที่บันทึกไว้: ' + saved + ' • ' : '') + (save.level > 1 || save.coins ? lv : '');
    }
  }
  render();

  $('btn-trial').addEventListener('click', () => {
    goFullscreen(); session.mode = 'guest'; session.user = null; onPlay();
  });

  $('btn-email').addEventListener('click', () => {
    if (user) { goFullscreen(); session.mode = 'online'; session.user = user; onPlay(); return; }
    emailBox.classList.add('open'); msg.textContent = '';
    $('email-input').value = localStorage.getItem(CONFIG.emailKey) || '';
  });
  $('email-cancel').addEventListener('click', () => emailBox.classList.remove('open'));

  $('email-send').addEventListener('click', async () => {
    const email = $('email-input').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'รูปแบบอีเมลไม่ถูกต้อง'; return; }
    try { localStorage.setItem(CONFIG.emailKey, email); } catch (e) {}
    if (!onlineEnabled()) {
      msg.textContent = 'บันทึกอีเมลไว้แล้ว ระบบออนไลน์ยังไม่เปิด (ตั้งค่า Supabase ใน config.js) ตอนนี้เล่นแบบทดลองได้เลย';
      render(); return;
    }
    msg.textContent = 'กำลังส่งลิงก์...';
    const r = await sendMagicLink(email);
    msg.textContent = r.ok ? 'ส่งลิงก์เข้าอีเมลแล้ว เปิดลิงก์เพื่อยืนยัน แล้วกลับมาหน้านี้' : 'ส่งไม่สำเร็จ: ' + r.reason;
  });

  $('btn-logout').addEventListener('click', async () => { await signOut(); user = null; render(); });
}
