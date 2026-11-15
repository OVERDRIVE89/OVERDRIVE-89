// เชื่อมอีเมล (Supabase Auth แบบลิงก์ยืนยันทางอีเมล) เปิดใช้งานเมื่อใส่ค่าใน config.js
import { CONFIG } from './config.js';

export const onlineEnabled = () => !!(CONFIG.supabaseUrl && CONFIG.supabaseKey);
let client = null;

async function getClient() {
  if (client || !onlineEnabled()) return client;
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
  client = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth: { persistSession: true, detectSessionInUrl: true } });
  return client;
}

// ผู้ใช้ที่ล็อกอินอยู่ (หรือ null)
export async function getUser() {
  try {
    const c = await getClient(); if (!c) return null;
    const { data } = await c.auth.getSession();
    return (data.session && data.session.user) || null;
  } catch (e) { return null; }
}

// ส่งลิงก์ยืนยันเข้าอีเมล: คืน {ok, reason}
export async function sendMagicLink(email) {
  try {
    const c = await getClient(); if (!c) return { ok: false, reason: 'offline' };
    const { error } = await c.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
    return error ? { ok: false, reason: error.message } : { ok: true };
  } catch (e) { return { ok: false, reason: String(e && e.message || e) }; }
}

export async function signOut() {
  try { const c = await getClient(); if (c) await c.auth.signOut(); } catch (e) {}
}
