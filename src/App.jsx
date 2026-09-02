import { useState, useEffect, Fragment } from "react";
import { supabase } from "./supabase";
import { translations } from "./translations";

const PAYMENT_APPS = [
  { id: "bankily", name: "Bankily", color: "#00A651" },
  { id: "masrvi", name: "Masrvi", color: "#FF6B00" },
  { id: "sedad", name: "SEDAD", color: "#0066CC" },
  { id: "click", name: "Click", color: "#FF0000" },
  { id: "bimbank", name: "Bimbank", color: "#6B21A8" },
  { id: "moov", name: "Moov Money", color: "#FFD700" },
];

const ALL_HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
const today = new Date().toISOString().split("T")[0];
// âš ï¸ Ø±Ù‚Ù… Ø§Ù„ØªÙˆØ§ØµÙ„ â€” ØºÙŠÙ‘Ø±Ù‡ Ø¥Ø°Ø§ Ø£Ø±Ø¯Øª Ø±Ù‚Ù…Ø§Ù‹ Ù…ÙˆØ±ÙŠØªØ§Ù†ÙŠØ§Ù‹ (222...)
const WHATSAPP_NUM = "21654542791";

const COLORS = {
  bg: "#0B0E08", card: "#0D1424", border: "#1A2540",
  accent: "#80D030", accent2: "#80D030", text: "#ffffff", muted: "#8892A4",
};

const STADIUM_IMAGES = [
  "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1551958219-acbc595b9b5c?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=200&fit=crop",
];

// ðŸ” Ø§Ø³ØªØ¯Ø¹Ø§Ø¡ Ø¯Ø§Ù„Ø© Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© Ø§Ù„Ø®Ø§Ø¯Ù…ÙŠØ© â€” Ø¬Ø¯ÙˆÙ„ users Ù…Ù‚ÙÙ„ Ø£Ù…Ø§Ù… Ø§Ù„Ù…ØªØµÙØ­
const authApi = async (action, payload = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke("auth-api", {
      body: { action, ...payload },
    });
    if (error) {
      // Ù†Ø­Ø§ÙˆÙ„ Ù‚Ø±Ø§Ø¡Ø© Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ø®Ø·Ø£ Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© Ù…Ù† Ø§Ù„Ø¯Ø§Ù„Ø©
      let code = "network";
      try { code = (await error.context?.json())?.error || "network"; } catch (_e) { /* ØªØ¬Ø§Ù‡Ù„ */ }
      return { error: code };
    }
    return data ?? { error: "network" };
  } catch (_e) {
    return { error: "network" };
  }
};

// ðŸŸ Ø§Ø³ØªØ¯Ø¹Ø§Ø¡ Ø¯Ø§Ù„Ø© Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨ Ø§Ù„Ø®Ø§Ø¯Ù…ÙŠØ© â€” Ø£ÙƒÙˆØ§Ø¯ Ø§Ù„Ù…Ø§Ù„ÙƒÙŠÙ† ÙˆØ§Ù„Ù…Ø³ØªØ­Ù‚Ø§Øª Ù„Ø§ ØªÙ…Ø± Ø¨Ø§Ù„Ù…ØªØµÙØ­
const stadiumApi = async (action, payload = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke("stadium-api", {
      body: { action, ...payload },
    });
    if (error) {
      let code = "network";
      try { code = (await error.context?.json())?.error || "network"; } catch (_e) { /* ØªØ¬Ø§Ù‡Ù„ */ }
      return { error: code };
    }
    return data ?? { error: "network" };
  } catch (_e) {
    return { error: "network" };
  }
};

// ðŸ–¼ ØµÙˆØ± Ø§Ø­ØªÙŠØ§Ø·ÙŠØ© Ù…Ù† Ù…ØµØ¯Ø± Ù…Ø®ØªÙ„Ù (ØªÙØ³ØªØ¹Ù…Ù„ Ø¥Ø°Ø§ ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø£ØµÙ„ÙŠØ©)
const FALLBACK_IMAGES = [
  "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/54567/football-stadium-arena-crowd-54567.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=400",
];

// ðŸŽ² Ø§Ø®ØªÙŠØ§Ø± ØµÙˆØ±Ø© Ø£Ù‚Ù„ Ø§Ø³ØªØ¹Ù…Ø§Ù„Ø§Ù‹ Ø­ØªÙ‰ Ù„Ø§ ØªØªÙƒØ±Ø± Ø§Ù„ØµÙˆØ± Ø¨ÙŠÙ† Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨
const pickImage = (existing = []) => {
  const counts = STADIUM_IMAGES.map(u => existing.filter(s => s.image === u).length);
  const min = Math.min(...counts);
  const pool = STADIUM_IMAGES.filter((u, i) => counts[i] === min);
  return pool[Math.floor(Math.random() * pool.length)];
};

// ðŸ–¼ ØµÙˆØ±Ø© Ø§Ù„Ù…Ù„Ø¹Ø¨: Ø§Ù„Ù…Ø®Ø²Ù‘Ù†Ø©ØŒ ÙˆØ¥Ù„Ø§ ÙˆØ§Ø­Ø¯Ø© Ø«Ø§Ø¨ØªØ© Ø­Ø³Ø¨ Ø±Ù‚Ù…Ù‡
const stadiumImage = (s) => s.image || STADIUM_IMAGES[(s.id || 0) % STADIUM_IMAGES.length];

// ðŸ›Ÿ Ø¥Ø°Ø§ ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙˆØ±Ø©ØŒ Ù†Ø¬Ø±Ø¨ Ø§Ù„Ø¨Ø¯Ø§Ø¦Ù„ Ø«Ù… Ù†Ø®ÙÙŠÙ‡Ø§ Ù„ÙŠØ¸Ù‡Ø± Ø§Ù„ØªØ¯Ø±Ø¬ Ø§Ù„Ù„ÙˆÙ†ÙŠ
const onImgError = (e, seed = 0) => {
  const tried = parseInt(e.target.dataset.try || "0", 10);
  if (tried < FALLBACK_IMAGES.length) {
    e.target.dataset.try = String(tried + 1);
    e.target.src = FALLBACK_IMAGES[(seed + tried) % FALLBACK_IMAGES.length];
  } else {
    e.target.style.display = "none";
  }
};

// ðŸ” Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø³Ø±ÙŠØ© Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±
const SECURITY_QUESTIONS = [
  { id:"q1", ar:"Ù…Ø§ Ø§Ø³Ù… Ø§Ù„Ø­ÙŠ Ø§Ù„Ø°ÙŠ Ù†Ø´Ø£Øª ÙÙŠÙ‡ØŸ", fr:"Dans quel quartier avez-vous grandi ?", en:"Which neighborhood did you grow up in?" },
  { id:"q2", ar:"Ù…Ø§ Ø§Ø³Ù… Ø£ÙˆÙ„ Ù…Ù„Ø¹Ø¨ Ù„Ø¹Ø¨Øª ÙÙŠÙ‡ØŸ", fr:"Nom du premier terrain oÃ¹ vous avez jouÃ© ?", en:"Name of the first field you played on?" },
  { id:"q3", ar:"Ù…Ø§ Ø§Ø³Ù… ÙØ±ÙŠÙ‚Ùƒ Ø§Ù„Ù…ÙØ¶Ù„ØŸ", fr:"Quelle est votre Ã©quipe prÃ©fÃ©rÃ©e ?", en:"What is your favorite team?" },
  { id:"q4", ar:"Ù…Ø§ Ø§Ø³Ù… Ø£Ø³ØªØ§Ø°Ùƒ Ø§Ù„Ù…ÙØ¶Ù„ØŸ", fr:"Nom de votre professeur prÃ©fÃ©rÃ© ?", en:"Your favorite teacher's name?" },
  { id:"q5", ar:"Ù…Ø§ Ø§Ø³Ù… ØµØ¯ÙŠÙ‚ Ø·ÙÙˆÙ„ØªÙƒØŸ", fr:"Nom de votre ami d'enfance ?", en:"Your childhood friend's name?" },
];
const qText = (id, lang) => SECURITY_QUESTIONS.find(q => q.id === id)?.[lang] || "";

// ðŸ“ž Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ù…ÙˆØ±ÙŠØªØ§Ù†ÙŠØ©: 8 Ø£Ø±Ù‚Ø§Ù… ØªØ¨Ø¯Ø£ Ø¨Ù€ 2 Ø£Ùˆ 3 Ø£Ùˆ 4
const PHONE_PREFIXES = ["2","3","4"];
const cleanPhone = (v) => {
  let d = v.replace(/\D/g, "");
  while (d && !PHONE_PREFIXES.includes(d[0])) d = d.slice(1);
  return d.slice(0, 8);
};
const isValidPhone = (p) => /^[234]\d{7}$/.test(p);

// ðŸ“ Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ø®Ø±Ø§Ø¦Ø·
const mapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;
const directionsLink = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
const hasLocation = (s) => s && s.latitude != null && s.longitude != null;

// ðŸ“ Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø³Ø§ÙØ© Ø¨Ø§Ù„ÙƒÙŠÙ„ÙˆÙ…ØªØ± Ø¨ÙŠÙ† Ù†Ù‚Ø·ØªÙŠÙ† (ØµÙŠØºØ© Haversine)
const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const aboutText = {
  ar: "Ù…Ù„Ø§Ø¹Ø¨ÙŠ Ù‡Ùˆ Ø£ÙˆÙ„ ØªØ·Ø¨ÙŠÙ‚ Ù…ÙˆØ±ÙŠØªØ§Ù†ÙŠ Ù…ØªØ®ØµØµ ÙÙŠ Ø­Ø¬Ø² Ù…Ù„Ø§Ø¹Ø¨ ÙƒØ±Ø© Ø§Ù„Ù‚Ø¯Ù… Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Ù‹ØŒ ÙŠØ¬Ù…Ø¹ Ø¨ÙŠÙ† Ø§Ù„Ø²Ø¨Ø§Ø¦Ù† ÙˆØ£ØµØ­Ø§Ø¨ Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨ ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯ Ø¨Ø·Ø±ÙŠÙ‚Ø© Ø³Ø±ÙŠØ¹Ø© ÙˆØ¢Ù…Ù†Ø© ÙˆØ¨Ù„Ø§ ØªØ¹Ù‚ÙŠØ¯.\n\nØªØµÙÙ‘Ø­ Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨ Ø§Ù„Ù‚Ø±ÙŠØ¨Ø© Ù…Ù†ÙƒØŒ Ø§Ø·Ù‘Ù„Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø³Ø¹Ø§Ø± ÙˆØ§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ù…ØªØ§Ø­Ø© Ù„Ø­Ø¸ÙŠØ§Ù‹ØŒ ÙˆØ§Ø­Ø¬Ø² Ù…ÙˆØ¹Ø¯Ùƒ ÙÙŠ Ø¯Ù‚Ø§Ø¦Ù‚ Ù…Ø¹Ø¯ÙˆØ¯Ø©. Ø§Ø¯ÙØ¹ Ø¨Ø³Ù‡ÙˆÙ„Ø© Ø¹Ø¨Ø± ØªØ·Ø¨ÙŠÙ‚Ø§Øª Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ù…Ø­Ù„ÙŠØ©ØŒ ÙˆØ§Ø­ÙØ¸ Ù…Ù„Ø§Ø¹Ø¨Ùƒ Ø§Ù„Ù…ÙØ¶Ù‘Ù„Ø© Ù„Ù„Ø±Ø¬ÙˆØ¹ Ø¥Ù„ÙŠÙ‡Ø§ Ø¨Ø³Ø±Ø¹Ø© Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø©. ØªØµÙ„Ùƒ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª ÙÙˆØ±ÙŠØ© Ø¨Ø­Ø§Ù„Ø© Ø­Ø¬Ø²ÙƒØŒ ÙˆØªØ¨Ù‚Ù‰ ÙƒÙ„ ØªÙØ§ØµÙŠÙ„ Ù…Ù„Ø§Ø¹Ø¨Ùƒ ÙˆØ­Ø¬ÙˆØ²Ø§ØªÙƒ ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯ØŒ Ø¨Ù„Ø§ Ù…ÙƒØ§Ù„Ù…Ø§Øª Ù‡Ø§ØªÙÙŠØ© ÙˆØ¨Ù„Ø§ Ø§Ù†ØªØ¸Ø§Ø±.",
  fr: "Malaabi est la premiÃ¨re application mauritanienne dÃ©diÃ©e Ã  la rÃ©servation de terrains de football en ligne, rÃ©unissant clients et propriÃ©taires de terrains en un seul endroit, de faÃ§on rapide, sÃ©curisÃ©e et sans complications.\n\nParcourez les terrains proches de vous, consultez les prix et les crÃ©neaux disponibles en temps rÃ©el, et rÃ©servez en quelques minutes seulement. Payez facilement via les applications de paiement locales, et enregistrez vos terrains favoris pour les retrouver rapidement. Recevez des notifications instantanÃ©es sur l'Ã©tat de votre rÃ©servation, et gardez tous les dÃ©tails de vos terrains et rÃ©servations au mÃªme endroit, sans appels tÃ©lÃ©phoniques ni attente.",
  en: "Malaabi is Mauritania's first app dedicated to booking football fields online, bringing clients and field owners together in one place â€” quickly, securely, and without hassle.\n\nBrowse fields near you, check live prices and available time slots, and book in just a few minutes. Pay easily through local payment apps, and save your favorite fields for quick access whenever you need them. Get instant notifications on your booking status, and keep all your field and booking details in one place â€” no phone calls, no waiting.",
};

const TXT = {
  ownerLogin: { ar:"ØµØ§Ø­Ø¨ Ù…Ù„Ø¹Ø¨", fr:"PropriÃ©taire", en:"Owner" },
  ownerCode: { ar:"ÙƒÙˆØ¯ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ù„Ø¹Ø¨", fr:"Code propriÃ©taire", en:"Owner code" },
  enterCode: { ar:"Ø§Ø¯Ø®Ù„ Ø§Ù„ÙƒÙˆØ¯", fr:"Entrez le code", en:"Enter code" },
  wrongCode: { ar:"Ø§Ù„ÙƒÙˆØ¯ ØºÙŠØ± ØµØ­ÙŠØ­", fr:"Code incorrect", en:"Wrong code" },
  suspended: { ar:"Ù…Ù„Ø¹Ø¨Ùƒ Ù…Ø¹Ù„Ù‚ØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©", fr:"Terrain suspendu", en:"Stadium suspended" },
  dueAmount: { ar:"Ø§Ù„Ù…Ø¨Ù„Øº Ø§Ù„Ù…Ø³ØªØ­Ù‚ Ø¹Ù„ÙŠÙƒ", fr:"Montant dÃ»", en:"Amount due" },
  commission: { ar:"Ù†Ø³Ø¨Ø© Ø§Ù„ØªØ·Ø¨ÙŠÙ‚", fr:"Commission", en:"Commission" },
  dues: { ar:"Ø§Ù„Ù…Ø³ØªØ­Ù‚Ø§Øª", fr:"DÃ»s", en:"Dues" },
  totalDues: { ar:"Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø³ØªØ­Ù‚Ø§Øª", fr:"Total dÃ»", en:"Total due" },
  resetDue: { ar:"ØªØµÙÙŠØ± Ø§Ù„Ù…Ø¨Ù„Øº", fr:"RÃ©initialiser", en:"Reset" },
  suspend: { ar:"ØªØ¹Ù„ÙŠÙ‚", fr:"Suspendre", en:"Suspend" },
  activate: { ar:"ØªÙØ¹ÙŠÙ„", fr:"Activer", en:"Activate" },
  handledBy: { ar:"ØªÙ…Øª Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ù…Ù† Ø·Ø±Ù", fr:"TraitÃ© par", en:"Handled by" },
  owner: { ar:"ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ù„Ø¹Ø¨", fr:"PropriÃ©taire", en:"Owner" },
  proof: { ar:"Ø¥Ø«Ø¨Ø§Øª Ø§Ù„Ø¯ÙØ¹ (ØµÙˆØ±Ø©)", fr:"Preuve de paiement", en:"Payment proof" },
  uploadProof: { ar:"ðŸ“· Ø§Ø±ÙØ¹ Ù„Ù‚Ø·Ø© Ø§Ù„Ø´Ø§Ø´Ø©", fr:"ðŸ“· TÃ©lÃ©charger", en:"ðŸ“· Upload" },
  viewProof: { ar:"ðŸ“· Ø¹Ø±Ø¶ Ø§Ù„Ø¥Ø«Ø¨Ø§Øª", fr:"ðŸ“· Voir preuve", en:"ðŸ“· View proof" },
  proofRequired: { ar:"ÙŠØ±Ø¬Ù‰ Ø±ÙØ¹ Ø¥Ø«Ø¨Ø§Øª Ø§Ù„Ø¯ÙØ¹", fr:"Preuve requise", en:"Proof required" },
  uploading: { ar:"Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø±ÙØ¹...", fr:"Envoi...", en:"Uploading..." },
  ownerCodeIs: { ar:"ÙƒÙˆØ¯ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ù„Ø¹Ø¨", fr:"Code propriÃ©taire", en:"Owner code" },
  active: { ar:"Ù†Ø´Ø·", fr:"Actif", en:"Active" },
  suspendedS: { ar:"Ù…Ø¹Ù„Ù‚", fr:"Suspendu", en:"Suspended" },
  allBookings: { ar:"ÙƒÙ„ Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª", fr:"RÃ©servations", en:"All bookings" },
  viewOnly: { ar:"Ù„Ù„Ù…Ø´Ø§Ù‡Ø¯Ø© ÙÙ‚Ø·", fr:"Lecture seule", en:"View only" },
  waiting: { ar:"Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±", fr:"En attente", en:"Pending" },
  accepted2: { ar:"ØªÙ… Ø§Ù„Ù‚Ø¨ÙˆÙ„", fr:"AcceptÃ©", en:"Accepted" },
  rejected2: { ar:"ØªÙ… Ø§Ù„Ø±ÙØ¶", fr:"RefusÃ©", en:"Rejected" },
  newBooking: { ar:"Ø­Ø¬Ø² Ø¬Ø¯ÙŠØ¯", fr:"Nouvelle rÃ©servation", en:"New booking" },
  bookingAccepted: { ar:"ØªÙ… Ù‚Ø¨ÙˆÙ„ Ø­Ø¬Ø²Ùƒ", fr:"RÃ©servation confirmÃ©e", en:"Booking confirmed" },
  bookingRejected: { ar:"ØªÙ… Ø±ÙØ¶ Ø­Ø¬Ø²Ùƒ", fr:"RÃ©servation refusÃ©e", en:"Booking rejected" },
  // ðŸ“ Ù†ØµÙˆØµ Ø§Ù„Ù…ÙˆÙ‚Ø¹
  location: { ar:"Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù…Ù„Ø¹Ø¨", fr:"Localisation du terrain", en:"Field location" },
  myLocation: { ar:"ðŸ“ Ù…ÙˆÙ‚Ø¹ÙŠ Ø§Ù„Ø­Ø§Ù„ÙŠ", fr:"ðŸ“ Ma position", en:"ðŸ“ My location" },
  checkLocation: { ar:"ðŸ—º ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹", fr:"ðŸ—º VÃ©rifier", en:"ðŸ—º Check on map" },
  locating: { ar:"ðŸ“ Ø¬Ø§Ø±ÙŠ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹...", fr:"ðŸ“ Localisation...", en:"ðŸ“ Locating..." },
  locationSet: { ar:"âœ… ØªÙ… ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹", fr:"âœ… Position dÃ©finie", en:"âœ… Location set" },
  locationFailed: { ar:"ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹", fr:"Ã‰chec de localisation", en:"Location failed" },
  locationDenied: { ar:"Ø±ÙØ¶Øª Ø¥Ø°Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹ â€” ÙØ¹Ù‘Ù„Ù‡ Ù…Ù† Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¬Ù‡Ø§Ø²", fr:"Permission refusÃ©e â€” activez la localisation dans les rÃ©glages", en:"Permission denied â€” enable location in device settings" },
  locationTimeout: { ar:"Ø§Ù†ØªÙ‡Øª Ø§Ù„Ù…Ù‡Ù„Ø© â€” Ø¬Ø±Ù‘Ø¨ ÙÙŠ Ù…ÙƒØ§Ù† Ù…ÙØªÙˆØ­", fr:"DÃ©lai dÃ©passÃ© â€” essayez en extÃ©rieur", en:"Timed out â€” try in an open area" },
  locationUnavailable: { ar:"ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ¯ Ù…ÙˆÙ‚Ø¹Ùƒ Ø§Ù„Ø¢Ù†ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹", fr:"Position indisponible, rÃ©essayez", en:"Position unavailable, try again" },
  noGeo: { ar:"Ø§Ù„Ù…ØªØµÙØ­ Ù„Ø§ ÙŠØ¯Ø¹Ù… ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹", fr:"GÃ©olocalisation non supportÃ©e", en:"Geolocation not supported" },
  directions: { ar:"ðŸ“ Ø§Ù„Ù…ÙˆÙ‚Ø¹", fr:"ðŸ“ Localisation", en:"ðŸ“ Location" },
  nearestBtn: { ar:"ðŸŽ¯ Ø§Ù„Ø£Ù‚Ø±Ø¨ Ù„ÙŠ", fr:"ðŸŽ¯ Le plus proche", en:"ðŸŽ¯ Nearest to me" },
  showAllBtn: { ar:"Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„", fr:"Tout afficher", en:"Show all" },
  noNearby: { ar:"Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù„Ø§Ø¹Ø¨ Ø¨Ù…ÙˆØ§Ù‚Ø¹ Ù…Ø­Ø¯Ø¯Ø© Ù‚Ø±ÙŠØ¨Ø© Ù…Ù†Ùƒ", fr:"Aucun terrain gÃ©olocalisÃ©", en:"No located fields nearby" },
  showOnMap: { ar:"ðŸ“ Ø¹Ø±Ø¶ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø±ÙŠØ·Ø©", fr:"ðŸ“ Voir sur la carte", en:"ðŸ“ View on map" },
  noLocation: { ar:"Ù„Ù… ÙŠØ­Ø¯Ø¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø¨Ø¹Ø¯", fr:"Position non dÃ©finie", en:"No location yet" },
  sortNearest: { ar:"Ø§Ù„Ø£Ù‚Ø±Ø¨ Ø¥Ù„ÙŠÙ‘", fr:"Le plus proche", en:"Nearest to me" },
  kmAway: { ar:"ÙƒÙ… Ù…Ù†Ùƒ", fr:"km de vous", en:"km away" },
  enableLocation: { ar:"ÙØ¹Ù‘Ù„ Ù…ÙˆÙ‚Ø¹Ùƒ Ù„Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø³Ø§ÙØ©", fr:"Activez votre position", en:"Enable location for distance" },
  // ðŸ”‘ Ø´Ø§Ø´Ø© Ø§Ù„Ø¯Ø®ÙˆÙ„
  forgotPass: { ar:"Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±ØŸ", fr:"Mot de passe oubliÃ© ?", en:"Forgot password?" },
  createNewAccount: { ar:"Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯", fr:"CrÃ©er un nouveau compte", en:"Create new account" },
  haveAccount: { ar:"Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ØŸ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„", fr:"DÃ©jÃ  un compte ? Se connecter", en:"Have an account? Log in" },
  ownerEntry: { ar:"ðŸŸ Ø¯Ø®ÙˆÙ„ Ø£ØµØ­Ø§Ø¨ Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨", fr:"ðŸŸ Espace propriÃ©taires", en:"ðŸŸ Field owners" },
  backToLogin: { ar:"â† Ø±Ø¬ÙˆØ¹ Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„", fr:"â† Retour Ã  la connexion", en:"â† Back to log in" },
  forgotTitle: { ar:"Ø§Ø³ØªØ¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±", fr:"RÃ©cupÃ©rer le mot de passe", en:"Recover password" },
  forgotStep1: { ar:"Ø£Ø¯Ø®Ù„ Ø±Ù‚Ù… Ù‡Ø§ØªÙÙƒ Ø§Ù„Ù…Ø³Ø¬Ù„", fr:"Entrez votre numÃ©ro enregistrÃ©", en:"Enter your registered phone" },
  next2: { ar:"Ø§Ù„ØªØ§Ù„ÙŠ", fr:"Suivant", en:"Next" },
  phoneNotFound: { ar:"Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø­Ø³Ø§Ø¨ Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø±Ù‚Ù…", fr:"Aucun compte avec ce numÃ©ro", en:"No account with this number" },
  noQuestionSet: { ar:"Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù„Ù… ÙŠØ­Ø¯Ø¯ Ø³Ø¤Ø§Ù„Ø§Ù‹ Ø³Ø±ÙŠØ§Ù‹. ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨.", fr:"Aucune question secrÃ¨te dÃ©finie. Contactez-nous.", en:"No security question set. Contact us." },
  yourAnswer: { ar:"Ø¬ÙˆØ§Ø¨Ùƒ", fr:"Votre rÃ©ponse", en:"Your answer" },
  wrongAnswer: { ar:"Ø§Ù„Ø¬ÙˆØ§Ø¨ ØºÙŠØ± ØµØ­ÙŠØ­", fr:"RÃ©ponse incorrecte", en:"Wrong answer" },
  verify: { ar:"ØªØ­Ù‚Ù‚", fr:"VÃ©rifier", en:"Verify" },
  newPass: { ar:"ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© (4 Ø£Ø±Ù‚Ø§Ù…)", fr:"Nouveau mot de passe (4 chiffres)", en:"New password (4 digits)" },
  confirmPass: { ar:"ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±", fr:"Confirmer le mot de passe", en:"Confirm password" },
  passMismatch: { ar:"ÙƒÙ„Ù…ØªØ§ Ø§Ù„Ø³Ø± ØºÙŠØ± Ù…ØªØ·Ø§Ø¨Ù‚ØªÙŠÙ†", fr:"Les mots de passe ne correspondent pas", en:"Passwords don't match" },
  savePass: { ar:"Ø­ÙØ¸ ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±", fr:"Enregistrer", en:"Save password" },
  passChanged: { ar:"âœ… ØªÙ… ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±ØŒ ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¢Ù†", fr:"âœ… Mot de passe modifiÃ©", en:"âœ… Password changed" },
  securityQ: { ar:"Ø§Ù„Ø³Ø¤Ø§Ù„ Ø§Ù„Ø³Ø±ÙŠ", fr:"Question secrÃ¨te", en:"Security question" },
  chooseQ: { ar:"Ø§Ø®ØªØ± Ø³Ø¤Ø§Ù„Ø§Ù‹", fr:"Choisissez une question", en:"Choose a question" },
  answerHint: { ar:"Ø§Ø­ÙØ¸ Ø¬ÙˆØ§Ø¨Ùƒ Ø¬ÙŠØ¯Ø§Ù‹ â€” Ø³ØªØ­ØªØ§Ø¬Ù‡ Ø¥Ø°Ø§ Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±", fr:"Retenez bien votre rÃ©ponse", en:"Remember your answer well" },
  setupQTitle: { ar:"Ø§Ø­Ù…Ù Ø­Ø³Ø§Ø¨Ùƒ", fr:"ProtÃ©gez votre compte", en:"Protect your account" },
  setupQDesc: { ar:"Ø­Ø¯Ø¯ Ø³Ø¤Ø§Ù„Ø§Ù‹ Ø³Ø±ÙŠØ§Ù‹ Ø­ØªÙ‰ ØªØªÙ…ÙƒÙ† Ù…Ù† Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø­Ø³Ø§Ø¨Ùƒ Ø¨Ù†ÙØ³Ùƒ Ø¥Ø°Ø§ Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±.", fr:"DÃ©finissez une question secrÃ¨te pour rÃ©cupÃ©rer votre compte.", en:"Set a security question so you can recover your account yourself." },
  saveQ: { ar:"Ø­ÙØ¸ Ø§Ù„Ø³Ø¤Ø§Ù„", fr:"Enregistrer", en:"Save question" },
  later: { ar:"Ù„Ø§Ø­Ù‚Ø§Ù‹", fr:"Plus tard", en:"Later" },
  qSaved: { ar:"âœ… ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø³Ø¤Ø§Ù„ Ø§Ù„Ø³Ø±ÙŠ", fr:"âœ… Question enregistrÃ©e", en:"âœ… Question saved" },
  uploadImage: { ar:"ðŸ“· Ø§Ø®ØªØ± ØµÙˆØ±Ø© Ù…Ù† Ù…Ù„ÙØ§ØªÙƒ", fr:"ðŸ“· Choisir une image", en:"ðŸ“· Choose an image" },
  imageUploaded: { ar:"âœ… ØªÙ… Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©", fr:"âœ… Image envoyÃ©e", en:"âœ… Image uploaded" },
  removeImage: { ar:"ðŸ—‘ Ø­Ø°Ù Ø§Ù„ØµÙˆØ±Ø©", fr:"ðŸ—‘ Supprimer l\'image", en:"ðŸ—‘ Remove image" },
  imageTooBig: { ar:"Ø§Ù„ØµÙˆØ±Ø© ÙƒØ¨ÙŠØ±Ø© Ø¬Ø¯Ø§Ù‹ (Ø§Ù„Ø­Ø¯ 5 Ù…ÙŠØºØ§)", fr:"Image trop volumineuse (max 5 Mo)", en:"Image too large (max 5MB)" },
  uploadFailed: { ar:"ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©", fr:"Ã‰chec de l\'envoi", en:"Upload failed" },
  orPasteLink: { ar:"Ø£Ùˆ Ø§Ù„ØµÙ‚ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø©", fr:"Ou collez un lien", en:"Or paste an image link" },
  imageUrl: { ar:"Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„Ù…Ù„Ø¹Ø¨ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)", fr:"Lien de l\'image (optionnel)", en:"Image URL (optional)" },
  imageHint: { ar:"Ø§ØªØ±ÙƒÙ‡ ÙØ§Ø±ØºØ§Ù‹ Ù„Ø§Ø®ØªÙŠØ§Ø± ØµÙˆØ±Ø© ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹", fr:"Laissez vide pour une image automatique", en:"Leave empty for an automatic image" },
  adminTitle: { ar:"Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…", fr:"Panneau d\'administration", en:"Admin panel" },
  adminPassLabel: { ar:"ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±", fr:"Mot de passe", en:"Password" },
  adminEnter: { ar:"Ø¯Ø®ÙˆÙ„", fr:"Entrer", en:"Enter" },
  wrongPass: { ar:"ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± Ø®Ø§Ø·Ø¦Ø©", fr:"Mot de passe incorrect", en:"Wrong password" },
  commanderWelcome: { ar:"Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ Ø£ÙŠÙ‡Ø§ Ø§Ù„Ù‚Ø§Ø¦Ø¯ ðŸ‘‘", fr:"Bienvenue Commandant ðŸ‘‘", en:"Welcome Commander ðŸ‘‘" },
  checking: { ar:"Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù‚Ù‚...", fr:"VÃ©rification...", en:"Checking..." },
  pickSlots: { ar:"Ø§Ø®ØªØ± Ù…ÙˆØ§Ø¹ÙŠØ¯Ùƒ", fr:"Choisissez vos crÃ©neaux", en:"Pick your slots" },
  myCart: { ar:"Ù…ÙˆØ§Ø¹ÙŠØ¯Ùƒ", fr:"Vos crÃ©neaux", en:"Your slots" },
  cartEmpty: { ar:"Ù„Ù… ØªØ®ØªØ± Ø£ÙŠ Ù…ÙˆØ¹Ø¯ Ø¨Ø¹Ø¯", fr:"Aucun crÃ©neau choisi", en:"No slots picked yet" },
  maxSlots: { ar:"Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 70 Ù…ÙˆØ¹Ø¯Ø§Ù‹", fr:"Maximum 70 crÃ©neaux", en:"Max 70 slots" },
  copied: { ar:"âœ… ØªÙ… Ù†Ø³Ø® Ø§Ù„Ø±Ù‚Ù…", fr:"âœ… NumÃ©ro copiÃ©", en:"âœ… Number copied" },
  copyNum: { ar:"Ù†Ø³Ø®", fr:"Copier", en:"Copy" },
  blockHours: { ar:"ðŸš« Ø¥ØºÙ„Ø§Ù‚ Ù…ÙˆØ§Ø¹ÙŠØ¯", fr:"ðŸš« Fermer des crÃ©neaux", en:"ðŸš« Block slots" },
  pickDate: { ar:"Ø§Ø®ØªØ± Ø§Ù„ØªØ§Ø±ÙŠØ®", fr:"Choisissez la date", en:"Pick a date" },
  pickHours: { ar:"Ø§Ø®ØªØ± Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ø±Ø§Ø¯ Ø¥ØºÙ„Ø§Ù‚Ù‡Ø§", fr:"Choisissez les heures", en:"Pick hours to block" },
  saveBlock: { ar:"Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©", fr:"Fermer les crÃ©neaux", en:"Block selected" },
  blockedList: { ar:"Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ù…ØºÙ„Ù‚Ø©", fr:"CrÃ©neaux fermÃ©s", en:"Blocked slots" },
  noBlocked: { ar:"Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…ØºÙ„Ù‚Ø©", fr:"Aucun crÃ©neau fermÃ©", en:"No blocked slots" },
  blockDone: { ar:"ðŸš« ØªÙ… Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯", fr:"ðŸš« CrÃ©neaux fermÃ©s", en:"ðŸš« Slots blocked" },
  unblockDone: { ar:"âœ… ØªÙ… ÙØªØ­ Ø§Ù„Ù…ÙˆØ¹Ø¯", fr:"âœ… CrÃ©neau rouvert", en:"âœ… Slot reopened" },
  allTaken: { ar:"ÙƒÙ„ Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ø­Ø¯Ø¯Ø© Ù…Ø­Ø¬ÙˆØ²Ø©", fr:"Toutes ces heures sont rÃ©servÃ©es", en:"All selected hours are booked" },
  bookedHour: { ar:"Ù…Ø­Ø¬ÙˆØ²", fr:"RÃ©servÃ©", en:"Booked" },
  repeat: { ar:"ðŸ” ÙƒØ±Ù‘Ø± Ø£Ø³Ø¨ÙˆØ¹ÙŠØ§Ù‹", fr:"ðŸ” RÃ©pÃ©ter chaque semaine", en:"ðŸ” Repeat weekly" },
  weeks: { ar:"Ø£Ø³Ø§Ø¨ÙŠØ¹", fr:"semaines", en:"weeks" },
  totalAmount: { ar:"Ø§Ù„Ù…Ø¨Ù„Øº Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ", fr:"Montant total", en:"Total amount" },
  sessions: { ar:"Ù…ÙˆØ§Ø¹ÙŠØ¯", fr:"crÃ©neaux", en:"sessions" },
  slotBusy: { ar:"Ù…Ø­Ø¬ÙˆØ²", fr:"occupÃ©", en:"busy" },
  noSlotsLeft: { ar:"ÙƒÙ„ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…Ø­Ø¬ÙˆØ²Ø© â€” Ø§Ø®ØªØ± ÙˆÙ‚ØªØ§Ù‹ Ø¢Ø®Ø±", fr:"Tous occupÃ©s â€” choisissez un autre horaire", en:"All busy â€” pick another time" },
  groupBooking: { ar:"Ø­Ø¬Ø² Ù…ØªÙƒØ±Ø±", fr:"RÃ©servation rÃ©currente", en:"Recurring booking" },
  acceptAll: { ar:"Ù‚Ø¨ÙˆÙ„ Ø§Ù„ÙƒÙ„", fr:"Tout accepter", en:"Accept all" },
  rejectAll: { ar:"Ø±ÙØ¶ Ø§Ù„ÙƒÙ„", fr:"Tout refuser", en:"Reject all" },
  rateTitle: { ar:"ÙƒÙŠÙ ÙƒØ§Ù†Øª ØªØ¬Ø±Ø¨ØªÙƒØŸ", fr:"Comment Ã©tait votre expÃ©rience ?", en:"How was your experience?" },
  rateSend: { ar:"Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…", fr:"Envoyer l\'avis", en:"Send rating" },
  rateComment: { ar:"ØªØ¹Ù„ÙŠÙ‚ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)", fr:"Commentaire (optionnel)", en:"Comment (optional)" },
  rateThanks: { ar:"â­ Ø´ÙƒØ±Ø§Ù‹ Ù„ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ù…Ù„Ø¹Ø¨", fr:"â­ Merci d\'avoir Ã©valuÃ© le terrain", en:"â­ Thanks for rating the field" },
  yourRating: { ar:"ØªÙ‚ÙŠÙŠÙ…Ùƒ", fr:"Votre note", en:"Your rating" },
  rateTooEarly: { ar:"Ù„Ù… ÙŠÙ†ØªÙ‡ Ù…ÙˆØ¹Ø¯ Ø§Ù„Ø­Ø¬Ø² Ø¨Ø¹Ø¯", fr:"La rÃ©servation n\'est pas terminÃ©e", en:"Booking not finished yet" },
  alreadyRated: { ar:"Ù‚ÙŠÙ‘Ù…Øª Ù‡Ø°Ø§ Ø§Ù„Ø­Ø¬Ø² Ù…Ø³Ø¨Ù‚Ø§Ù‹", fr:"DÃ©jÃ  Ã©valuÃ©", en:"Already rated" },
  pickStars: { ar:"Ø§Ø®ØªØ± Ø¹Ø¯Ø¯ Ø§Ù„Ù†Ø¬ÙˆÙ…", fr:"Choisissez les Ã©toiles", en:"Pick stars" },
  ratings: { ar:"Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª", fr:"Avis", en:"Ratings" },
  noRatings: { ar:"Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø¨Ø¹Ø¯", fr:"Aucun avis", en:"No ratings yet" },
  sortRating: { ar:"Ø§Ù„Ø£Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ…Ø§Ù‹", fr:"Mieux notÃ©s", en:"Top rated" },
  delWilaya: { ar:"Ø­Ø°Ù Ø§Ù„ÙˆÙ„Ø§ÙŠØ©", fr:"Supprimer la wilaya", en:"Delete wilaya" },
  wilayaEmpty: { ar:"Ø­Ø°Ù Ø§Ù„ÙˆÙ„Ø§ÙŠØ© Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹ØŸ", fr:"Supprimer dÃ©finitivement ?", en:"Delete permanently?" },
  wilayaHasStadiums: { ar:"Ù…Ù„Ø§Ø¹Ø¨ â€” Ø³ÙŠÙØ­Ø°ÙÙˆÙ† Ù‡Ù… ÙˆØ­Ø¬ÙˆØ²Ø§ØªÙ‡Ù… Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹! Ù…ØªØ£ÙƒØ¯ØŸ", fr:"terrains seront supprimÃ©s avec leurs rÃ©servations ! Confirmer ?", en:"fields will be deleted with their bookings! Sure?" },
  wilayaDeleted: { ar:"ØªÙ… Ø­Ø°Ù Ø§Ù„ÙˆÙ„Ø§ÙŠØ©", fr:"Wilaya supprimÃ©e", en:"Wilaya deleted" },
  myCode: { ar:"ÙƒÙˆØ¯ÙŠ", fr:"Mon code", en:"My code" },
  bookingCode: { ar:"ÙƒÙˆØ¯ Ø§Ù„Ø­Ø¬Ø²", fr:"Code rÃ©servation", en:"Booking code" },
  changeCode: { ar:"ðŸ”„ ØªØºÙŠÙŠØ± Ø§Ù„ÙƒÙˆØ¯", fr:"ðŸ”‘ Changer le code", en:"ðŸ”‘ Change code" },
  newCodeIs: { ar:"ÙƒÙˆØ¯Ùƒ Ø§Ù„Ø¬Ø¯ÙŠØ¯", fr:"Votre nouveau code", en:"Your new code" },
  confirmChangeCode: { ar:"Ø³ÙŠØªÙˆÙ‚Ù ÙƒÙˆØ¯Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ Ø¹Ù† Ø§Ù„Ø¹Ù…Ù„. Ù…ØªØ£ÙƒØ¯ØŸ", fr:"Votre code actuel cessera de fonctionner. Confirmer ?", en:"Your current code will stop working. Sure?" },
  netError: { ar:"ØªØ¹Ø°Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù…ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹", fr:"Connexion au serveur impossible", en:"Server connection failed" },
  confirmIdentity: { ar:"Ø£Ø¯Ø®Ù„ ÙƒÙ„Ù…Ø© Ø³Ø±Ùƒ Ù„Ù„ØªØ£ÙƒÙŠØ¯", fr:"Entrez votre mot de passe", en:"Enter your password to confirm" },
  invalidPhone: { ar:"Ø§Ù„Ø±Ù‚Ù… ØºÙŠØ± ØµØ­ÙŠØ­", fr:"NumÃ©ro invalide", en:"Invalid number" },
  tooManyTries: { ar:"Ù…Ø­Ø§ÙˆÙ„Ø§Øª ÙƒØ«ÙŠØ±Ø©ØŒ Ø­Ø§ÙˆÙ„ Ù„Ø§Ø­Ù‚Ø§Ù‹", fr:"Trop de tentatives", en:"Too many attempts" },
  // ðŸ”’ Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ø­Ø¬Ø² Ø§Ù„Ø®Ø§Ø¯Ù…ÙŠ
  slotTakenNow: { ar:"âš ï¸ Ø£Ø­Ø¯ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø­ÙØ¬Ø² Ù„Ù„ØªÙˆ â€” Ø§Ø®ØªØ± ÙˆÙ‚ØªØ§Ù‹ Ø¢Ø®Ø±", fr:"âš ï¸ Un crÃ©neau vient d\'Ãªtre pris", en:"âš ï¸ A slot was just taken" },
  closedHour: { ar:"Ù‡Ø°Ù‡ Ø§Ù„Ø³Ø§Ø¹Ø© Ø®Ø§Ø±Ø¬ Ø£ÙˆÙ‚Ø§Øª Ø¹Ù…Ù„ Ø§Ù„Ù…Ù„Ø¹Ø¨", fr:"Heure hors service", en:"Hour outside working hours" },
  pastDate: { ar:"Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„Ø­Ø¬Ø² ÙÙŠ ÙˆÙ‚Øª Ù…Ø¶Ù‰", fr:"CrÃ©neau dÃ©jÃ  passÃ©", en:"That time has passed" },
  needRelogin: { ar:"ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹ Ù„Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ø­Ø¬Ø²", fr:"Reconnectez-vous pour rÃ©server", en:"Please log in again to book" },
  badPayment: { ar:"Ù‡Ø°Ø§ Ø§Ù„Ù…Ù„Ø¹Ø¨ Ù„Ø§ ÙŠÙ‚Ø¨Ù„ ÙˆØ³ÙŠÙ„Ø© Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©", fr:"Moyen de paiement non acceptÃ©", en:"Payment method not accepted" },
  rateNow: { ar:"â­ Ù‚ÙŠÙ‘Ù… Ù‡Ø°Ø§ Ø§Ù„Ø­Ø¬Ø²", fr:"â­ Ã‰valuer cette rÃ©servation", en:"â­ Rate this booking" },
  // â­ Ø§Ù„Ù…ÙØ¶Ù„Ø©
  favorites: { ar:"Ø§Ù„Ù…ÙØ¶Ù„Ø©", fr:"Favoris", en:"Favorites" },
  addedFav: { ar:"â­ Ø£ÙØ¶ÙŠÙ Ù„Ù„Ù…ÙØ¶Ù„Ø©", fr:"â­ AjoutÃ© aux favoris", en:"â­ Added to favorites" },
  removedFav: { ar:"Ø£ÙØ²ÙŠÙ„ Ù…Ù† Ø§Ù„Ù…ÙØ¶Ù„Ø©", fr:"RetirÃ© des favoris", en:"Removed from favorites" },
  noFavorites: { ar:"Ù„Ù… ØªÙØ¶Ù Ø£ÙŠ Ù…Ù„Ø¹Ø¨ Ù„Ù„Ù…ÙØ¶Ù„Ø© Ø¨Ø¹Ø¯", fr:"Aucun terrain ajoutÃ© aux favoris", en:"No favorite fields yet" },
  noFavoritesHint: { ar:"Ø§Ø¶ØºØ· Ø¹Ù„Ù‰ â™¡ Ø¯Ø§Ø®Ù„ Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ù„Ø¹Ø¨ Ù„Ø¥Ø¶Ø§ÙØªÙ‡ Ù‡Ù†Ø§", fr:"Appuyez sur â™¡ sur une carte pour l'ajouter ici", en:"Tap â™¡ on a field card to add it here" },
  // ðŸ‘‹ Ø§Ù„ØªØ±Ø­ÙŠØ¨ Ø§Ù„Ø´Ø®ØµÙŠ
  findField: { ar:"Ø£ÙŠÙ† ØªØ±ÙŠØ¯ Ø§Ù„Ù„Ø¹Ø¨ØŸ", fr:"OÃ¹ voulez-vous jouer ?", en:"Where do you want to play?" },
};

// (ÙƒÙ„ Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†Ø§Øª Ù‡Ù†Ø§ Ù…ÙØ¹Ø±ÙŽÙ‘ÙØ© Ø®Ø§Ø±Ø¬ App Ø¹Ù…Ø¯Ø§Ù‹ â€” Ù„Ù†ÙØ³ Ø³Ø¨Ø¨ BrandName ÙˆLogo Ø£Ø¯Ù†Ø§Ù‡: Ù…Ù†Ø¹ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªØ±ÙƒÙŠØ¨ Ø¹Ù†Ø¯ ÙƒÙ„ Ø¶ØºØ·Ø©)
function EyeIcon({ open }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12z"/>
      <circle cx="12" cy="12" r="3.2"/>
      {!open && <line x1="3" y1="21" x2="21" y2="3"/>}
    </svg>
  );
}
function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5"/>
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9.5"/>
    </svg>
  );
}
function HeartIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 1.5 : 1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-10-9.4C.5 7.8 2.3 4.5 5.7 4c2.2-.3 4.2.8 6.3 3 2.1-2.2 4.1-3.3 6.3-3 3.4.5 5.2 3.8 3.7 7.1-2.5 4.8-10 9.4-10 9.4z"/>
    </svg>
  );
}
function PersonIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4.5 20.5c1.2-4 4-6 7.5-6s6.3 2 7.5 6"/>
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z"/>
      <path d="M10 20a2 2 0 0 0 4 0"/>
    </svg>
  );
}
function CalendarIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.9} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="16" rx="2"/>
      <path d="M3.5 9.5h17"/>
      <path d="M8 3v4M16 3v4"/>
    </svg>
  );
}

// ðŸ”’ Ø®ØµØ§Ø¦Øµ ØªÙ…Ù†Ø¹ Ø­ÙØ¸/Ù†Ø³Ø® Ø§Ù„Ø´Ø¹Ø§Ø± Ø¹Ø¨Ø± Ø§Ù„Ø¶ØºØ· Ø§Ù„Ù…Ø·ÙˆÙ‘Ù„ Ø£Ùˆ ÙƒÙ„ÙŠÙƒ ÙŠÙ…ÙŠÙ† Ø£Ùˆ Ø§Ù„Ø³Ø­Ø¨
const noCopyImgProps = { draggable: false, onContextMenu: (e) => e.preventDefault() };
const noCopyStyle = { WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" };

// ðŸŽ¨ Ø§Ø³Ù… Ø§Ù„Ø¹Ù„Ø§Ù…Ø© Ø¨Ù„ÙˆÙ†ÙŠÙ† â€” Ù…ÙØ¹Ø±ÙŽÙ‘Ù Ø®Ø§Ø±Ø¬ App Ø¹Ù…Ø¯Ø§Ù‹ (ÙƒØ§Ù† ÙŠÙØ¹Ø§Ø¯ "ØªØ±ÙƒÙŠØ¨Ù‡" Ø¹Ù†Ø¯ ÙƒÙ„ Ø¶ØºØ·Ø© Ø­Ø±ÙØŒ ÙÙŠØ³Ø¨Ø¨ ÙˆÙ…ÙŠØ¶ Ø§Ù„ÙƒØ±Ø© Ø§Ù„Ù…ØµØ§Ø­Ø¨Ø© Ù„Ù‡)
function BrandName({ text, size = "32px" }) {
  const upper = text.toUpperCase();
  const greenLen = Math.min(3, Math.max(1, Math.floor(upper.length / 2)));
  const head = upper.slice(0, upper.length - greenLen);
  const tail = upper.slice(upper.length - greenLen);
  return (
    <span style={{fontSize:size, fontWeight:"800", userSelect:"none", WebkitUserSelect:"none", MozUserSelect:"none", msUserSelect:"none", letterSpacing:"0.5px"}}>
      <span style={{color:"#ffffff"}}>{head}</span><span style={{color:"#80D030"}}>{tail}</span>
    </span>
  );
}

// âš½ Ø§Ù„Ø´Ø¹Ø§Ø± â€” Ù…ÙØ¹Ø±ÙŽÙ‘Ù Ø®Ø§Ø±Ø¬ App Ø¹Ù…Ø¯Ø§Ù‹Ø› Ù‡Ø°Ø§ Ù‡Ùˆ Ø§Ù„Ø¥ØµÙ„Ø§Ø­ Ø§Ù„Ø­Ø§Ø³Ù… Ù„Ù…Ø´ÙƒÙ„Ø© "Ø§Ù„ÙƒØ±Ø© ØªØªØ­Ø±Ùƒ Ø¹Ù†Ø¯ ÙƒÙ„ Ø¶ØºØ·Ø©"
function Logo({ size = 84, glow = 0.22, margin = "0 auto" }) {
  return (
    <div style={{position:"relative", width:size, height:size, margin}}>
      {glow > 0 && (
        <div style={{position:"absolute", inset:`-${Math.round(size*0.35)}px`, background:`radial-gradient(circle, #80D030${Math.round(glow*255).toString(16).padStart(2,"0")} 0%, transparent 68%)`, pointerEvents:"none"}}/>
      )}
      <div role="img" aria-label="malaabi" {...noCopyImgProps} style={{position:"relative", width:"100%", height:"100%", backgroundImage:"url(/logo.png)", backgroundSize:"contain", backgroundRepeat:"no-repeat", backgroundPosition:"center", ...noCopyStyle}}/>
    </div>
  );
}

// ðŸŸ Ø¨Ø·Ø§Ù‚Ø© Ù…Ù„Ø¹Ø¨ â€” Ù…ÙØ¹Ø±ÙŽÙ‘ÙØ© Ø®Ø§Ø±Ø¬ App Ø¹Ù…Ø¯Ø§Ù‹ Ø­ØªÙ‰ Ù„Ø§ ÙŠÙØ¹Ø§Ø¯ "ØªØ±ÙƒÙŠØ¨Ù‡Ø§" Ù…Ù† Ø¬Ø¯ÙŠØ¯ Ø¹Ù†Ø¯ ÙƒÙ„ Ø¥Ø¹Ø§Ø¯Ø© Ø±Ø³Ù… Ù„Ù„ØªØ·Ø¨ÙŠÙ‚
// (ÙˆÙ‡Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ø³Ø¨Ø¨ ÙÙŠ Ø§Ù‡ØªØ²Ø§Ø²/Ø§Ø®ØªÙØ§Ø¡ ØµÙˆØ± Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨ ÙˆØ´Ø¹Ø§Ø± "Ø§Ù„ÙƒØ±Ø©" Ù„Ø­Ø¸ÙŠØ§Ù‹ Ø¹Ù†Ø¯ Ø£ÙŠ Ø¶ØºØ·Ø© ÙÙŠ Ø£ÙŠ Ù…ÙƒØ§Ù† Ø¨Ø§Ù„ØªØ·Ø¨ÙŠÙ‚)
function StadiumCardView({ s, wide, lang, t, L, bookings, myPos, favorites, user, toggleFavorite, ratingsMap, onBook }) {
  const isBooked = (sid, d, h) => bookings.some(b => b.stadium_id === sid && b.date === d && b.hour === h && b.status !== "rejected");
  const stadiumDistance = (st) => (myPos && hasLocation(st)) ? distanceKm(myPos.lat, myPos.lng, st.latitude, st.longitude) : null;

  const hrs = s.working_hours || ALL_HOURS;
  const free = hrs.filter(h => !isBooked(s.id, today, h)).length;
  const dist = stadiumDistance(s);
  const isFav = favorites.includes(s.id);
  return (
    <div style={{background:COLORS.card, borderRadius:"20px", border:`1px solid ${COLORS.border}`, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.3)", width: wide ? "250px" : "auto", flexShrink: wide ? 0 : undefined}}>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute", inset:0, background:`linear-gradient(135deg, ${s.color}44, ${COLORS.card})`}}></div>
        <img src={stadiumImage(s)} alt={s.name} loading="lazy" onError={e => onImgError(e, s.id || 0)} style={{width:"100%", height:"140px", objectFit:"cover", display:"block", position:"relative"}}/>
        <div style={{position:"absolute", inset:0, background:`linear-gradient(to bottom, transparent 50%, ${COLORS.card} 100%)`}}></div>
        {/* â¤ï¸ Ø²Ø± Ø§Ù„Ù…ÙØ¶Ù„Ø© */}
        {user && (
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(s.id); }} style={{position:"absolute", top:"10px", insetInlineEnd:"10px", width:"30px", height:"30px", borderRadius:"50%", background:"rgba(0,0,0,0.55)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", backdropFilter:"blur(4px)", zIndex:2}}>
            {isFav ? "â¤ï¸" : "ðŸ¤"}
          </button>
        )}
        {/* ðŸ“ Ø´Ø§Ø±Ø© Ø§Ù„Ù…Ø³Ø§ÙØ© */}
        {dist != null && (
          <div style={{position:"absolute", top:"10px", insetInlineStart:"10px", background:"rgba(0,0,0,0.65)", color:COLORS.accent, padding:"4px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"800", backdropFilter:"blur(4px)"}}>
            ðŸ“ {dist < 1 ? Math.round(dist*1000) + " m" : dist.toFixed(1) + " " + L("kmAway")}
          </div>
        )}
        {ratingsMap[s.id] && (
          <div style={{position:"absolute", top: user ? "48px" : "10px", insetInlineEnd:"10px", background:"rgba(0,0,0,0.65)", color:"#FFD700", padding:"4px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"800", backdropFilter:"blur(4px)"}}>
            â­ {ratingsMap[s.id].avg_stars}
          </div>
        )}
        <div style={{position:"absolute", bottom:"10px", right:"12px", left:"12px"}}>
          <div style={{fontWeight:"800", fontSize:"18px", color:"#fff", textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>{s.name}</div>
          <div style={{color:"#ffffffaa", fontSize:"12px"}}>ðŸ“ {s.wilaya} â€” {s.hood}</div>
        </div>
      </div>
      <div style={{padding:"12px 16px 16px"}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}>
          <div style={{background:`${s.color}22`, borderRadius:"10px", padding:"8px 12px", textAlign:"center"}}>
            <div style={{color:s.color, fontWeight:"800", fontSize:"16px"}}>{s.price}</div>
            <div style={{color:COLORS.muted, fontSize:"10px"}}>{t.pricePerHour}</div>
          </div>
          <div style={{background:"#80D03022", borderRadius:"10px", padding:"8px 12px", textAlign:"center"}}>
            <div style={{color:COLORS.accent, fontWeight:"800", fontSize:"16px"}}>{free}</div>
            <div style={{color:COLORS.muted, fontSize:"10px"}}>{t.hourAvailable}</div>
          </div>
        </div>
        <div style={{display:"flex", gap:"8px"}}>
          <button onClick={onBook} style={{flex:2, padding:"11px", background:`linear-gradient(135deg, ${s.color}, ${s.color}BB)`, border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{t.bookNow}</button>
          {hasLocation(s) && (
            <button onClick={() => window.open(directionsLink(s.latitude, s.longitude), "_blank")} style={{flex:1, padding:"11px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"12px", fontWeight:"700", fontSize:"13px", cursor:"pointer", fontFamily:"inherit"}}>{L("directions")}</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // (noCopyImgProps ÙˆnoCopyStyle Ø§Ù†ØªÙ‚Ù„Ø§ Ù„Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ÙˆØ­Ø¯Ø© Ø£Ø³ÙÙ„ Ø§Ù„Ù…Ù„Ù)
  const [lang, setLang] = useState(() => localStorage.getItem("malaabi_lang") || "ar");
  const t = translations[lang];
  const L = (k) => TXT[k][lang];
  const isRTL = lang === "ar";
  const [showAbout, setShowAbout] = useState(false);
  const [showRateNotifs, setShowRateNotifs] = useState(false);   // ðŸ”” Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„ØªÙ‚ÙŠÙŠÙ… ÙÙ‚Ø·ØŒ Ù…Ù†ÙØµÙ„Ø© Ø¹Ù† Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª
  const [bottomTab, setBottomTab] = useState("stadiums");
  // ðŸ”” Ù…Ø¹Ø±Ù‘ÙØ§Øª Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„ØªÙŠ Ø´Ø§Ù‡Ø¯Ù‡Ø§ Ø§Ù„Ø²Ø¨ÙˆÙ† Ø¨Ø§Ù„ÙØ¹Ù„ â€” Ù…Ø­ÙÙˆØ¸Ø© Ù…Ø­Ù„ÙŠØ§Ù‹ØŒ ØªØ¨Ù‚Ù‰ Ø­ØªÙ‰ Ø¨Ø¹Ø¯ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ ÙˆØ§Ù„Ø¯Ø®ÙˆÙ„
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("malaabi_read_notifs") || "[]"); }
    catch (_e) { return []; }
  });

  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [owner, setOwner] = useState(null);
  const [ownerCodeInput, setOwnerCodeInput] = useState("");
  const [tab, setTab] = useState("client");
  const [adminTab, setAdminTab] = useState("bookings");
  const [logoClicks, setLogoClicks] = useState(0);
  const [wilayas, setWilayas] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [filterWilaya, setFilterWilaya] = useState("Ø§Ù„ÙƒÙ„");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selected, setSelected] = useState(null);
  const [bookDate, setBookDate] = useState(today);
  const [step, setStep] = useState(1);
  const [selectedPayApp, setSelectedPayApp] = useState(null);
  const [transactionNum, setTransactionNum] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newName, setNewName] = useState("");
  const [newWilaya, setNewWilaya] = useState("");
  const [newWilayaSelect, setNewWilayaSelect] = useState("");
  const [newHood, setNewHood] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newPayments, setNewPayments] = useState({});
  const [newOwnerPhone, setNewOwnerPhone] = useState("");
  const [newImage, setNewImage] = useState("");    // ðŸ–¼ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ù…Ø®ØµØµ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
  const [uploadingImg, setUploadingImg] = useState(false);  // ðŸ–¼ Ø­Ø§Ù„Ø© Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©
  const [newLat, setNewLat] = useState("");        // ðŸ“ Ø§Ù„Ù…ÙˆÙ‚Ø¹
  const [newLng, setNewLng] = useState("");        // ðŸ“ Ø§Ù„Ù…ÙˆÙ‚Ø¹
  const [newWorkingHours, setNewWorkingHours] = useState([...ALL_HOURS]);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [editStadium, setEditStadium] = useState(null);
  const [editName, setEditName] = useState("");
  const [editWilaya, setEditWilaya] = useState("");
  const [editHood, setEditHood] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOwnerPhone, setEditOwnerPhone] = useState("");
  const [editImage, setEditImage] = useState("");  // ðŸ–¼ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ù…Ø®ØµØµ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
  const [editLat, setEditLat] = useState("");      // ðŸ“ Ø§Ù„Ù…ÙˆÙ‚Ø¹
  const [editLng, setEditLng] = useState("");      // ðŸ“ Ø§Ù„Ù…ÙˆÙ‚Ø¹
  const [editPayments, setEditPayments] = useState({});
  const [editWorkingHours, setEditWorkingHours] = useState([...ALL_HOURS]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [rateEdit, setRateEdit] = useState({});
  const [myPos, setMyPos] = useState(null);        // ðŸ“ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø²Ø¨ÙˆÙ† Ø§Ù„Ø­Ø§Ù„ÙŠ
  const [showForgot, setShowForgot] = useState(false);   // ðŸ”‘ Ù†Ø§ÙØ°Ø© Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±
  const [forgotPhone, setForgotPhone] = useState("");     // ðŸ”‘ Ø±Ù‚Ù… Ø§Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø©
  const [forgotStep, setForgotStep] = useState(1);        // ðŸ”‘ Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø©
  const [forgotUser, setForgotUser] = useState(null);     // ðŸ”‘ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø³ØªÙ‡Ø¯Ù
  const [forgotAnswer, setForgotAnswer] = useState("");   // ðŸ”‘ Ø¬ÙˆØ§Ø¨ Ø§Ù„Ø³Ø¤Ø§Ù„ Ø§Ù„Ø³Ø±ÙŠ
  const [forgotTries, setForgotTries] = useState(0);      // ðŸ”‘ Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª
  const [newPass1, setNewPass1] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [regQuestion, setRegQuestion] = useState("");     // ðŸ” Ø³Ø¤Ø§Ù„ Ø§Ù„ØªØ³Ø¬ÙŠÙ„
  const [regAnswer, setRegAnswer] = useState("");         // ðŸ” Ø¬ÙˆØ§Ø¨ Ø§Ù„ØªØ³Ø¬ÙŠÙ„
  const [showSetupQ, setShowSetupQ] = useState(true);     // ðŸ” Ù†Ø§ÙØ°Ø© Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù‚Ø¯ÙŠÙ…Ø©
  const [setupQuestion, setSetupQuestion] = useState("");
  const [setupAnswer, setSetupAnswer] = useState("");
  const [setupPass, setSetupPass] = useState("");   // ðŸ” ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù‡ÙˆÙŠØ© Ù‚Ø¨Ù„ Ø­ÙØ¸ Ø§Ù„Ø³Ø¤Ø§Ù„
  const [showAdminLogin, setShowAdminLogin] = useState(false);  // ðŸ‘‘ Ù†Ø§ÙØ°Ø© Ø¯Ø®ÙˆÙ„ Ø§Ù„Ù„ÙˆØ­Ø©
  const [adminPassInput, setAdminPassInput] = useState("");     // ðŸ‘‘ ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± Ø§Ù„Ù…Ø¯Ø®Ù„Ø©
  const [adminPass, setAdminPass] = useState("");               // ðŸ‘‘ Ù…Ø­ÙÙˆØ¸Ø© ÙÙŠ Ø§Ù„Ø°Ø§ÙƒØ±Ø© ÙÙ‚Ø·
  const [adminChecking, setAdminChecking] = useState(false);
  const [showOwnerCode, setShowOwnerCode] = useState(false);   // ðŸ”‘ Ø¥Ø¸Ù‡Ø§Ø± ÙƒÙˆØ¯ Ø§Ù„Ù…Ø§Ù„Ùƒ
  const [ratingsMap, setRatingsMap] = useState({});      // â­ Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨ Ø§Ù„Ø¹Ø§Ù…Ø©
  const [myRatings, setMyRatings] = useState([]);        // â­ Ù…Ø§ Ù‚ÙŠÙ‘Ù…Ù‡ Ø§Ù„Ø²Ø¨ÙˆÙ†
  const [rateBooking, setRateBooking] = useState(null);  // â­ Ø§Ù„Ø­Ø¬Ø² Ø§Ù„Ø¬Ø§Ø±ÙŠ ØªÙ‚ÙŠÙŠÙ…Ù‡
  const [rateStars, setRateStars] = useState(0);
  const [rateText, setRateText] = useState("");
  const [ownerRatings, setOwnerRatings] = useState([]);  // â­ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ù…Ù„Ø¹Ø¨ Ø§Ù„Ù…Ø§Ù„Ùƒ
  const [adminRatings, setAdminRatings] = useState([]);  // â­ ÙƒÙ„ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ù„Ù„Ù…Ø´Ø±Ù
  const [blockedList, setBlockedList] = useState([]);    // ðŸš« Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ù…ØºÙ„Ù‚Ø©
  const [blockDate, setBlockDate] = useState(today);     // ðŸš« ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥ØºÙ„Ø§Ù‚
  const [blockHoursSel, setBlockHoursSel] = useState([]);// ðŸš« Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
  const [cart, setCart] = useState([]);                  // ðŸ›’ Ø³Ù„Ø© Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯
  const [showPass, setShowPass] = useState({});          // ðŸ‘ Ø¥Ø¸Ù‡Ø§Ø± ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ø³Ø±
  const [sessionPass, setSessionPass] = useState(() => sessionStorage.getItem("mb_sp") || "");   // ðŸ”’ ØªÙÙ…Ø­Ù‰ Ø¨Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„ØªØ¨ÙˆÙŠØ¨
  const [myBookingsList, setMyBookingsList] = useState([]);   // ðŸ”’ Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„Ø²Ø¨ÙˆÙ† Ø§Ù„ÙƒØ§Ù…Ù„Ø©
  const [favorites, setFavorites] = useState([]);             // â­ Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨ Ø§Ù„Ù…ÙØ¶Ù„Ø© Ù„Ù„Ø²Ø¨ÙˆÙ†

  const changeLang = (l) => { setLang(l); localStorage.setItem("malaabi_lang", l); };
  const langLabel = lang === "ar" ? "ðŸŒ Ø¹" : lang === "fr" ? "ðŸŒ FR" : "ðŸŒ EN";

  const notify = (title, body) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") new Notification(title, { body, icon: "/icon.png" });
  };

  // (ÙƒÙ„ Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†Ø§Øª â€” Ø§Ù„Ø¹ÙŠÙ†ØŒ Ø§Ù„Ø¨ÙŠØªØŒ Ø§Ù„Ù‚Ù„Ø¨ØŒ Ø§Ù„Ø´Ø®ØµØŒ Ø§Ù„Ø¬Ø±Ø³ØŒ Ø§Ù„ØªÙ‚ÙˆÙŠÙ… â€” Ø§Ù†ØªÙ‚Ù„Øª Ù„Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ÙˆØ­Ø¯Ø© Ø£Ø³ÙÙ„ Ø§Ù„Ù…Ù„Ù)

  // (BrandName ÙˆLogo Ø§Ù†ØªÙ‚Ù„Ø§ Ù„Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ÙˆØ­Ø¯Ø© Ø£Ø³ÙÙ„ Ø§Ù„Ù…Ù„Ù â€” Ø§Ù†Ø¸Ø± Ø§Ù„Ø³Ø¨Ø¨ ÙÙŠ ØªØ¹Ù„ÙŠÙ‚ StadiumCardView)

  // ðŸ”’ Ø­Ù‚Ù„ ÙƒÙ„Ù…Ø© Ø³Ø± Ø¨Ø²Ø± Ø¥Ø¸Ù‡Ø§Ø± â€” Ø¯Ø§Ù„Ø© Ù„Ø§ Ù…ÙƒÙˆÙ‘Ù†ØŒ Ø­ØªÙ‰ Ù„Ø§ ÙŠÙÙ‚Ø¯ Ø§Ù„ØªØ±ÙƒÙŠØ² Ø¹Ù†Ø¯ Ø§Ù„ÙƒØªØ§Ø¨Ø©
  const passField = ({ id, value, onChange, placeholder, maxLength = 4, onEnter, extra }) => (
    <div style={{position:"relative", marginBottom:"16px"}}>
      <input
        type={showPass[id] ? "text" : "password"}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={e => e.key === "Enter" && onEnter && onEnter()}
        style={{...inp, marginBottom:0, paddingInlineEnd:"46px", ...extra}}
      />
      <button type="button" onClick={() => setShowPass(p => ({ ...p, [id]: !p[id] }))}
        style={{position:"absolute", insetInlineEnd:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color: showPass[id] ? COLORS.accent : COLORS.muted, padding:"4px", display:"flex", alignItems:"center"}}>
        <EyeIcon open={!!showPass[id]}/>
      </button>
    </div>
  );

  // ðŸ“‹ Ù†Ø³Ø® Ù†Øµ Ø¥Ù„Ù‰ Ø§Ù„Ø­Ø§ÙØ¸Ø©
  const copyText = async (txt) => {
    try {
      await navigator.clipboard.writeText(String(txt));
      showToast(L("copied"));
    } catch (_e) {
      const el = document.createElement("textarea");
      el.value = String(txt); document.body.appendChild(el);
      el.select(); document.execCommand("copy"); document.body.removeChild(el);
      showToast(L("copied"));
    }
  };

  const LangButton = () => (
    <div style={{position:"relative"}}>
      <button onClick={() => setShowLangMenu(!showLangMenu)} style={{padding:"6px 12px", borderRadius:"8px", border:`1px solid ${COLORS.border}`, cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"12px", background:COLORS.card, color:COLORS.accent}}>{langLabel}</button>
      {showLangMenu && (
        <div style={{position:"absolute", top:"110%", left:0, background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:"10px", overflow:"hidden", zIndex:200, minWidth:"80px"}}>
          {[["ar","ðŸ‡²ðŸ‡· Ø¹"],["fr","ðŸ‡«ðŸ‡· FR"],["en","ðŸ´ EN"]].map(([l, label]) => (
            <button key={l} onClick={() => { changeLang(l); setShowLangMenu(false); }} style={{display:"block", width:"100%", padding:"8px 16px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"12px", background: lang===l?`${COLORS.accent}22`:COLORS.card, color: lang===l?COLORS.accent:COLORS.muted, textAlign:"right"}}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );

  const loadData = async () => {
    const [w, s, b, r, u] = await Promise.all([
      supabase.from("wilayas").select("*").order("id"),
      supabase.from("stadiums_public").select("*").order("id"),
      supabase.from("bookings_slots").select("*"),   // ðŸ”’ Ø§Ù„Ø³Ø§Ø¹Ø§Øª ÙÙ‚Ø· â€” Ø¨Ù„Ø§ Ø£Ø³Ù…Ø§Ø¡ ÙˆÙ„Ø§ Ø£Ø±Ù‚Ø§Ù…
      supabase.from("stadium_ratings").select("*"),  // â­ Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª (Ø«Ù„Ø§Ø«Ø© ØªÙ‚ÙŠÙŠÙ…Ø§Øª ÙØ£ÙƒØ«Ø±)
      supabase.from("users_count").select("*").maybeSingle(),   // ðŸ” Ø¹Ø±Ø¶ Ø¹Ø§Ù… ÙŠÙØ±Ø¬Ø¹ Ø§Ù„Ø¹Ø¯Ø¯ ÙÙ‚Ø·
    ]);
    if (w.data) setWilayas(w.data.map(x => x.name));
    if (s.data) setStadiums(s.data);
    if (b.data) setBookings(b.data);
    if (u.data?.total != null) setUsersCount(u.data.total);
    if (r.data) setRatingsMap(Object.fromEntries(r.data.map(x => [x.stadium_id, x])));
  };

  useEffect(() => {
    // ðŸ›Ÿ Ù‚Ø±Ø§Ø¡Ø© Ø¢Ù…Ù†Ø© â€” Ù„Ùˆ ÙƒØ§Ù†Øª Ø§Ù„Ù‚ÙŠÙ…Ø© ØªØ§Ù„ÙØ© Ù†Ù…Ø³Ø­Ù‡Ø§ Ø¨Ø¯Ù„ Ø£Ù† ÙŠÙ†Ù‡Ø§Ø± Ø§Ù„ØªØ·Ø¨ÙŠÙ‚
    const readSaved = (k) => {
      try {
        const v = localStorage.getItem(k);
        if (!v || v === "undefined" || v === "null") return null;
        const parsed = JSON.parse(v);
        return parsed && parsed.phone ? parsed : null;
      } catch (_e) { localStorage.removeItem(k); return null; }
    };
    const saved = readSaved("malaabi_user");
    const savedOwner = readSaved("malaabi_owner");
    if (saved) {
      setUser(saved); setScreen("app");
      // ðŸ”’ Ù†Ø¹ÙŠØ¯ Ø¬Ù„Ø¨ Ø­Ø¬ÙˆØ²Ø§ØªÙ‡ Ø¥Ù† ÙƒØ§Ù†Øª ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± Ù…Ø§ Ø²Ø§Ù„Øª ÙÙŠ Ø¬Ù„Ø³Ø© Ø§Ù„ØªØ¨ÙˆÙŠØ¨
      const sp = sessionStorage.getItem("mb_sp");
      if (sp) {
        stadiumApi("client-bookings", { payload: { phone: saved.phone, password: sp } })
          .then(r => { if (r.bookings) setMyBookingsList(r.bookings); });
        stadiumApi("my-ratings", { payload: { phone: saved.phone, password: sp } })
          .then(r => { if (r.ratings) setMyRatings(r.ratings); });
        stadiumApi("my-favorites", { payload: { phone: saved.phone, password: sp } })
          .then(r => { if (r.favorites) setFavorites(r.favorites); });
      }
    } else if (savedOwner?.owner_code) {
      setOwner(savedOwner); setScreen("owner");
      stadiumApi("owner-blocked", { ownerCode: savedOwner.owner_code })
        .then(r => { if (r.blocked) setBlockedList(r.blocked); });
      stadiumApi("owner-bookings", { ownerCode: savedOwner.owner_code }).then(r => {
        if (r.bookings) setMyBookingsList(r.bookings);
        if (r.stadium) {
          const up = { ...r.stadium, owner_code: savedOwner.owner_code };
          setOwner(up); localStorage.setItem("malaabi_owner", JSON.stringify(up));
        }
      });
    } else if (savedOwner) {
      setOwner(savedOwner); setScreen("owner");
    }
    loadData();
    if ("Notification" in window) Notification.requestPermission();
  }, []);

  // ðŸ”” Ø¥Ø´Ø¹Ø§Ø±Ø§Øª ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ù„Ø¹Ø¨ â€” Ø­Ø¬Ø² Ø¬Ø¯ÙŠØ¯ Ù„Ù…Ù„Ø¹Ø¨Ù‡
  useEffect(() => {
    if (!owner) return;
    const ch = supabase.channel("owner-new-" + owner.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings", filter: `stadium_id=eq.${owner.id}` }, (p) => {
        setMyBookingsList(prev => prev.some(b => b.id === p.new.id) ? prev : [...prev, p.new]);
        notify("ðŸ”” " + L("newBooking"), `${p.new.client_name} â€” ${p.new.date} â€” ${p.new.hour}:00`);
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, [owner, lang]);

  // ðŸ”” Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„Ø²Ø¨ÙˆÙ† â€” Ù‚Ø¨ÙˆÙ„ Ø£Ùˆ Ø±ÙØ¶
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("client-upd-" + user.phone)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings", filter: `client_phone=eq.${user.phone}` }, (p) => {
        setMyBookingsList(prev => prev.map(b => b.id === p.new.id ? p.new : b));
        if (p.new.status === "confirmed") notify("âœ… " + L("bookingAccepted"), `${p.new.stadium_name} â€” ${p.new.hour}:00`);
        if (p.new.status === "rejected") notify("âŒ " + L("bookingRejected"), `${p.new.stadium_name} â€” ${p.new.hour}:00`);
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, [user, lang]);

  // ðŸ”” Ø¹Ù†Ø¯ ÙØªØ­ ØªØ¨ÙˆÙŠØ¨ "Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª"ØŒ Ù†ÙØ¹Ù„Ù‘Ù… ÙƒÙ„ Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø© Ø­Ø§Ù„ÙŠØ§Ù‹ ÙƒÙ…Ù‚Ø±ÙˆØ¡Ø© â€” Ù„Ø§ ØªÙØ­Ø³Ø¨ Ù…Ø¬Ø¯Ø¯Ø§Ù‹ Ø­ØªÙ‰ Ø¨Ø¹Ø¯ Ø§Ù„Ø®Ø±ÙˆØ¬ ÙˆØ§Ù„Ø¯Ø®ÙˆÙ„
  useEffect(() => {
    if (bottomTab !== "notifs" || !user) return;
    const currentIds = myBookingsList.filter(b => b.status !== "pending").map(b => b.id);
    if (currentIds.length === 0) return;
    setReadNotifIds(prev => {
      const merged = Array.from(new Set([...prev, ...currentIds]));
      if (merged.length === prev.length) return prev;
      localStorage.setItem("malaabi_read_notifs", JSON.stringify(merged));
      return merged;
    });
  }, [bottomTab, myBookingsList, user]);

  const showToast = (msg, color=COLORS.accent) => { setToast({msg, color}); setTimeout(() => setToast(null), 4000); };

  // ðŸ“ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø­Ø§Ù„ÙŠ â€” Ù„Ù„Ù…Ø´Ø±Ù Ø¹Ù†Ø¯ Ø¥Ø¶Ø§ÙØ©/ØªØ¹Ø¯ÙŠÙ„ Ù…Ù„Ø¹Ø¨
  const geoErrorKey = (err) => {
    if (err?.code === 1) return "locationDenied";      // PERMISSION_DENIED
    if (err?.code === 3) return "locationTimeout";      // TIMEOUT
    if (err?.code === 2) return "locationUnavailable";  // POSITION_UNAVAILABLE
    return "locationFailed";
  };

  const getMyLocation = (isEdit = false) => {
    if (!navigator.geolocation) return showToast(L("noGeo"), "#FF4444");
    showToast(L("locating"), COLORS.accent2);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude.toFixed(7);
        const lo = pos.coords.longitude.toFixed(7);
        if (isEdit) { setEditLat(la); setEditLng(lo); }
        else { setNewLat(la); setNewLng(lo); }
        showToast(L("locationSet"));
      },
      (err) => showToast(L(geoErrorKey(err)), "#FF4444"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ðŸ“ ØªØ­Ø¯ÙŠØ¯ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø²Ø¨ÙˆÙ† â€” Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø³Ø§ÙØ© ÙˆØ§Ù„ØªØ±ØªÙŠØ¨ Ø­Ø³Ø¨ Ø§Ù„Ø£Ù‚Ø±Ø¨
  const locateMe = () => {
    if (!navigator.geolocation) return showToast(L("noGeo"), "#FF4444");
    showToast(L("locating"), COLORS.accent2);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        showToast(L("locationSet"));
      },
      (err) => showToast(L(geoErrorKey(err)), "#FF4444"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ðŸŽ¯ Ø§Ù„Ø£Ù‚Ø±Ø¨ Ù„ÙŠ â€” ÙŠØ­Ø¯Ø¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø«Ù… ÙŠØ±ØªØ¨ Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨ Ø­Ø³Ø¨ Ø§Ù„Ù…Ø³Ø§ÙØ©
  const findNearest = () => {
    if (myPos) { setSortBy("nearest"); return; }
    if (!navigator.geolocation) return showToast(L("noGeo"), "#FF4444");
    showToast(L("locating"), COLORS.accent2);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy("nearest");
        showToast(L("locationSet"));
      },
      (err) => showToast(L(geoErrorKey(err)), "#FF4444"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ðŸ”’ Ø¬Ù„Ø¨ Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„Ø²Ø¨ÙˆÙ† Ù…Ù† Ø§Ù„Ø®Ø§Ø¯Ù… Ø¨Ø¹Ø¯ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ù‡ÙˆÙŠØªÙ‡
  const loadMyBookings = async (phone, pass) => {
    const ph = phone || user?.phone, pw = pass || sessionPass;
    if (!ph || !pw) return;
    const res = await stadiumApi("client-bookings", { payload: { phone: ph, password: pw } });
    if (res.bookings) setMyBookingsList(res.bookings);
  };

  const handleLogin = async () => {
    if (!loginPhone || !loginPass) return showToast(t.enterAll, "#FF4444");
    if (!isValidPhone(loginPhone)) return showToast(L("invalidPhone"), "#FF4444");
    if (loginPass.length !== 4) return showToast(t.pass4, "#FF4444");
    const res = await authApi("login", { phone: loginPhone, password: loginPass });
    if (res.error || !res.user) return showToast(res.error === "network" ? L("netError") : t.wrongCredentials, "#FF4444");
    const data = res.user;
    setUser(data);
    localStorage.setItem("malaabi_user", JSON.stringify(data));
    setScreen("app");
    setSessionPass(loginPass); sessionStorage.setItem("mb_sp", loginPass);
    loadMyBookings(data.phone, loginPass); loadMyRatings(data.phone, loginPass); loadFavorites(data.phone, loginPass);
    showToast(t.welcome + " " + data.name);
  };

  const handleRegister = async () => {
    if (!regName || !regPhone || !regPass) return showToast(t.enterAll, "#FF4444");
    if (!isValidPhone(regPhone)) return showToast(L("invalidPhone"), "#FF4444");
    if (regPass.length !== 4) return showToast(t.pass4, "#FF4444");
    if (!regQuestion || !regAnswer.trim()) return showToast(L("chooseQ"), "#FF4444");
    const res = await authApi("register", {
      name: regName, phone: regPhone, password: regPass,
      question: regQuestion, answer: regAnswer,
    });
    if (res.error || !res.user) {
      return showToast(res.error === "phone_exists" ? t.phoneExists : res.error === "network" ? L("netError") : t.enterAll, "#FF4444");
    }
    setUser(res.user);
    localStorage.setItem("malaabi_user", JSON.stringify(res.user));
    setScreen("app"); setUsersCount(p => p + 1);
    setSessionPass(regPass); sessionStorage.setItem("mb_sp", regPass);
    showToast(t.accountCreated);
  };

  // ðŸ”‘ Ø§Ù„Ù…Ø±Ø­Ù„Ø© 1 â€” Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆØ¬Ù„Ø¨ Ø³Ø¤Ø§Ù„Ù‡ Ø§Ù„Ø³Ø±ÙŠ
  const forgotFindUser = async () => {
    if (!isValidPhone(forgotPhone)) return showToast(L("invalidPhone"), "#FF4444");
    const res = await authApi("get-question", { phone: forgotPhone });
    if (res.error === "not_found") return showToast(L("phoneNotFound"), "#FF4444");
    if (res.error === "no_question") return showToast(L("noQuestionSet"), "#FF4444");
    if (res.error) return showToast(L("netError"), "#FF4444");
    setForgotUser({ phone: forgotPhone, security_question: res.question });
    setForgotStep(2); setForgotTries(0);
  };

  // ðŸ”‘ Ø§Ù„Ù…Ø±Ø­Ù„Ø© 2 â€” Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¬ÙˆØ§Ø¨
  const forgotVerify = async () => {
    if (!forgotAnswer.trim()) return;
    if (forgotTries >= 5) return showToast(L("tooManyTries"), "#FF4444");
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„ÙØ¹Ù„ÙŠ ÙŠØªÙ… ÙÙŠ Ø§Ù„Ø®Ø§Ø¯Ù… Ø¹Ù†Ø¯ Ø­ÙØ¸ ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± â€” Ù‡Ù†Ø§ Ù†Ù†ØªÙ‚Ù„ Ù„Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„ØªØ§Ù„ÙŠØ© ÙÙ‚Ø·
    setForgotStep(3);
  };

  // ðŸ”‘ Ø§Ù„Ù…Ø±Ø­Ù„Ø© 3 â€” Ø­ÙØ¸ ÙƒÙ„Ù…Ø© Ø³Ø± Ø¬Ø¯ÙŠØ¯Ø©
  const forgotReset = async () => {
    if (newPass1.length !== 4) return showToast(t.pass4, "#FF4444");
    if (newPass1 !== newPass2) return showToast(L("passMismatch"), "#FF4444");
    const res = await authApi("reset-password", {
      phone: forgotUser.phone, answer: forgotAnswer, newPassword: newPass1,
    });
    if (res.error === "wrong_answer") {
      setForgotTries(p => p + 1); setForgotStep(2);
      return showToast(L("wrongAnswer"), "#FF4444");
    }
    if (res.error) return showToast(L("netError"), "#FF4444");
    const ph = forgotUser.phone;
    closeForgot();
    setLoginPhone(ph);
    showToast(L("passChanged"));
  };

  const closeForgot = () => {
    setShowForgot(false); setForgotStep(1); setForgotUser(null);
    setForgotAnswer(""); setNewPass1(""); setNewPass2(""); setForgotTries(0);
  };

  // ðŸ” Ø­ÙØ¸ Ø§Ù„Ø³Ø¤Ø§Ù„ Ø§Ù„Ø³Ø±ÙŠ Ù„Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù‚Ø¯ÙŠÙ…Ø©
  const saveSecurityQ = async () => {
    if (!setupQuestion || !setupAnswer.trim()) return showToast(t.enterAll, "#FF4444");
    if (!/^\d{4}$/.test(setupPass)) return showToast(t.pass4, "#FF4444");
    const res = await authApi("set-question", {
      phone: user.phone, password: setupPass,
      question: setupQuestion, answer: setupAnswer,
    });
    if (res.error === "invalid_credentials") return showToast(t.wrongCredentials, "#FF4444");
    if (res.error) return showToast(L("netError"), "#FF4444");
    setUser(res.user); localStorage.setItem("malaabi_user", JSON.stringify(res.user));
    setSetupQuestion(""); setSetupAnswer(""); setSetupPass("");
    showToast(L("qSaved"));
  };

  const handleOwnerLogin = async () => {
    if (!ownerCodeInput) return showToast(L("enterCode"), "#FF4444");
    const code = ownerCodeInput.trim().toUpperCase();
    const res = await stadiumApi("owner-login", { ownerCode: code });
    if (res.error === "wrong_code") return showToast(L("wrongCode"), "#FF4444");
    if (res.error === "suspended") return showToast(L("suspended"), "#FF4444");
    if (res.error || !res.stadium) return showToast(L("netError"), "#FF4444");
    // Ù†Ø­ÙØ¸ Ø§Ù„ÙƒÙˆØ¯ Ù…Ø¹ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù„Ø¹Ø¨ â€” ÙŠÙØ³ØªØ¹Ù…Ù„ Ù„Ù„ØªØ­Ù‚Ù‚ ÙÙŠ ÙƒÙ„ Ø¹Ù…Ù„ÙŠØ© Ù„Ø§Ø­Ù‚Ø©
    const ow = { ...res.stadium, owner_code: code };
    setOwner(ow);
    localStorage.setItem("malaabi_owner", JSON.stringify(ow));
    setScreen("owner"); setOwnerCodeInput("");
    loadOwnerBookings(code); loadBlocked(code);
    showToast(t.welcome + " " + ow.name);
  };

  // ðŸ”’ Ø¬Ù„Ø¨ Ø­Ø¬ÙˆØ²Ø§Øª ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ù„Ø¹Ø¨ Ù…Ù† Ø§Ù„Ø®Ø§Ø¯Ù…
  const loadOwnerBookings = async (code) => {
    const res = await stadiumApi("owner-bookings", { ownerCode: code || owner?.owner_code });
    if (res.bookings) setMyBookingsList(res.bookings);
    if (res.stadium) {
      const up = { ...res.stadium, owner_code: code || owner?.owner_code };
      setOwner(up); localStorage.setItem("malaabi_owner", JSON.stringify(up));
    }
  };

  // ðŸ”’ ÙØªØ­ Ù„Ù‚Ø·Ø© Ø§Ù„Ø¯ÙØ¹ Ø¨Ø±Ø§Ø¨Ø· Ù…Ø¤Ù‚Øª ØµØ§Ù„Ø­ Ø®Ù…Ø³ Ø¯Ù‚Ø§Ø¦Ù‚
  const openProof = async (bookingId) => {
    const res = await stadiumApi("proof-url", {
      ownerCode: owner?.owner_code, adminPass, payload: { bookingId },
    });
    if (res.error || !res.url) return showToast(L("netError"), "#FF4444");
    window.open(res.url, "_blank");
  };

  // ðŸ”‘ ØªØºÙŠÙŠØ± ÙƒÙˆØ¯ ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ù„Ø¹Ø¨
  const changeOwnerCode = async () => {
    const res = await stadiumApi("owner-change-code", { ownerCode: owner?.owner_code });
    if (res.error || !res.owner_code) return showToast(L("netError"), "#FF4444");
    const up = { ...owner, owner_code: res.owner_code };
    setOwner(up); localStorage.setItem("malaabi_owner", JSON.stringify(up));
    loadOwnerBookings(res.owner_code);
    setShowOwnerCode(true);   // ðŸ”‘ Ù†ÙØ¸Ù‡Ø± Ø§Ù„ÙƒÙˆØ¯ Ø§Ù„Ø¬Ø¯ÙŠØ¯ Ù„ÙŠØ­ÙØ¸Ù‡
    showToast("ðŸ”‘ " + L("newCodeIs") + ": " + res.owner_code);
  };

  const handleLogout = () => {
    localStorage.removeItem("malaabi_user");
    localStorage.removeItem("malaabi_owner");
    setUser(null); setOwner(null);
    setSessionPass(""); sessionStorage.removeItem("mb_sp"); setMyBookingsList([]); setAdminPass(""); setMyRatings([]); setOwnerRatings([]); setFavorites([]);
    setScreen("login"); setTab("client"); setBottomTab("stadiums");
  };

  // ðŸ‘‘ Ø¹Ø´Ø±ÙˆÙ† Ø¶ØºØ·Ø© Ø¹Ù„Ù‰ Ø§Ù„ÙƒØ±Ø© ØªÙØªØ­ Ù†Ø§ÙØ°Ø© Ø¯Ø®ÙˆÙ„ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…
  const handleLogoClick = () => {
    setLogoClicks(p => {
      const n = p + 1;
      if (n >= 20) { setShowAdminLogin(true); setAdminPassInput(""); return 0; }
      return n;
    });
  };

  // ðŸ‘‘ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù… â€” Ù„Ø§ Ø´ÙŠØ¡ Ù…Ù†Ù‡Ø§ ÙÙŠ Ø§Ù„ÙƒÙˆØ¯
  const handleAdminLogin = async () => {
    if (!adminPassInput.trim()) return;
    setAdminChecking(true);
    const res = await stadiumApi("admin-check", { adminPass: adminPassInput });
    setAdminChecking(false);
    if (res.error === "wrong_pass") return showToast(L("wrongPass"), "#FF4444");
    if (res.error) return showToast(L("netError"), "#FF4444");
    setAdminPass(adminPassInput);      // ØªØ¨Ù‚Ù‰ ÙÙŠ Ø§Ù„Ø°Ø§ÙƒØ±Ø© ÙÙ‚Ø·ØŒ Ù„Ø§ ØªÙØ­ÙØ¸ ÙÙŠ Ø§Ù„Ù‚Ø±Øµ
    setAdminPassInput("");
    setShowAdminLogin(false);
    setTab("admin");
    await loadAdminData(adminPassInput);
    showToast(L("commanderWelcome"));
  };

  // ðŸ‘‘ Ø¬Ù„Ø¨ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙƒØ§Ù…Ù„Ø© Ù„Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…
  const loadAdminData = async (pass) => {
    const res = await stadiumApi("admin-data", { adminPass: pass || adminPass });
    if (res.error) return showToast(L("netError"), "#FF4444");
    if (res.stadiums) setStadiums(res.stadiums);
    if (res.bookings) setBookings(res.bookings);
    if (res.usersCount != null) setUsersCount(res.usersCount);
    if (res.ratings) setAdminRatings(res.ratings);
  };

  // ðŸ‘‘ Ø§Ù„Ø®Ø±ÙˆØ¬ Ù…Ù† Ø§Ù„Ù„ÙˆØ­Ø© â€” ØªÙÙ…Ø­Ù‰ ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± Ù…Ù† Ø§Ù„Ø°Ø§ÙƒØ±Ø©
  const exitAdmin = () => {
    setAdminPass(""); setTab("client");
    setSearchText(""); setFilterWilaya("Ø§Ù„ÙƒÙ„"); setSortBy("default");   // ðŸ§¹ ØªÙ†Ø¸ÙŠÙ Ø§Ù„ÙÙ„Ø§ØªØ±
    loadData();
  };

  const handleDelete = async (id) => {
    const res = await stadiumApi("admin-delete-stadium", { adminPass, stadiumId: id });
    if (res.error) { setConfirmDelete(null); return showToast(L("netError"), "#FF4444"); }
    setStadiums(p => p.filter(s => s.id !== id));
    setConfirmDelete(null);
    showToast(t.stadiumDeleted, "#FF4444");
  };

  const handleUploadProof = async (file) => {
    if (!file) return;
    setUploading(true);
    const fn = `${Date.now()}_${Math.random().toString(36).substring(2,8)}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("proofs").upload(fn, file);
    if (error) { setUploading(false); return showToast("Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø±ÙØ¹", "#FF4444"); }
    // ðŸ”’ Ù†Ø®Ø²Ù‘Ù† Ø§Ø³Ù… Ø§Ù„Ù…Ù„Ù ÙÙ‚Ø· â€” Ø§Ù„Ø±Ø§Ø¨Ø· ÙŠÙÙˆÙ„ÙŽÙ‘Ø¯ Ù…Ø¤Ù‚ØªØ§Ù‹ Ø¹Ù†Ø¯ Ø§Ù„Ø¹Ø±Ø¶
    setProofUrl(fn); setUploading(false);
    showToast("âœ…");
  };

  // ðŸ–¼ Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„Ù…Ù„Ø¹Ø¨ Ù…Ù† Ù…Ù„ÙØ§Øª Ø§Ù„Ù…Ø´Ø±Ù Ø¥Ù„Ù‰ Supabase Storage
  const handleUploadStadiumImage = async (file, isEdit = false) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast(L("imageTooBig"), "#FF4444");
    setUploadingImg(true);
    const ext = file.name.split(".").pop().toLowerCase();
    const fn = `stadium_${Date.now()}_${Math.random().toString(36).substring(2,8)}.${ext}`;
    const { error } = await supabase.storage.from("stadiums").upload(fn, file, { cacheControl: "3600", upsert: false });
    if (error) { setUploadingImg(false); return showToast(L("uploadFailed"), "#FF4444"); }
    const { data } = supabase.storage.from("stadiums").getPublicUrl(fn);
    if (isEdit) setEditImage(data.publicUrl); else setNewImage(data.publicUrl);
    setUploadingImg(false);
    showToast(L("imageUploaded"));
  };

  // ðŸ”’ Ø§Ù„Ø­Ø¬Ø² ÙŠÙ…Ø± Ø¨Ø§Ù„Ø®Ø§Ø¯Ù… â€” Ø³Ø¨Ø¹Ø© ÙØ­ÙˆØµØ§Øª Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø¯Ø®Ø§Ù„
  const handleBook = async () => {
    if (cart.length === 0 || !selectedPayApp || !transactionNum) return;
    if (!proofUrl) return showToast(L("proofRequired"), "#FF4444");
    if (!sessionPass) return showToast(L("needRelogin"), "#FF4444");

    const res = await stadiumApi("create-booking", {
      payload: {
        phone: user.phone, password: sessionPass,
        stadiumId: selected.id, slots: cart,
        payApp: selectedPayApp, transactionNum, proofUrl,
      },
    });

    if (res.error === "slots_busy")     { loadData(); return showToast(L("slotTakenNow"), "#FF4444"); }
    if (res.error === "suspended")      return showToast(L("suspended"), "#FF4444");
    if (res.error === "closed_hour")    return showToast(L("closedHour"), "#FF4444");
    if (res.error === "past_date")      return showToast(L("pastDate"), "#FF4444");
    if (res.error === "bad_payment")    return showToast(L("badPayment"), "#FF4444");
    if (res.error === "proof_required") return showToast(L("proofRequired"), "#FF4444");
    if (res.error === "unauthorized")   return showToast(L("needRelogin"), "#FF4444");
    if (res.error || !res.bookings)     return showToast(L("netError"), "#FF4444");

    const nb = res.bookings;
    setBookings(p => [...p, ...nb.map(b => ({
      stadium_id: b.stadium_id, date: b.date, hour: b.hour, status: "pending",
    }))]);
    setMyBookingsList(p => [...p, ...nb]);
    closeModal();
    showToast(t.bookingSuccess + (nb.length > 1 ? ` (${nb.length})` : ""));
  };

  const closeModal = () => {
    setSelected(null); setStep(1);
    setSelectedPayApp(null); setTransactionNum(""); setProofUrl("");
    setCart([]);
  };

  // âœ… ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ù„Ø¹Ø¨ ÙÙ‚Ø·
  const confirmBooking = async (id) => {
    const res = await stadiumApi("confirm-booking", { ownerCode: owner?.owner_code, bookingId: id });
    if (res.error === "unauthorized") return showToast(L("wrongCode"), "#FF4444");
    if (res.error === "already_handled") return showToast(L("accepted2"), "#FF6D00");
    if (res.error || !res.ok) return showToast(L("netError"), "#FF4444");

    setMyBookingsList(p => p.map(b => b.id === id
      ? { ...b, status: "confirmed", code: res.code, handled_by: "owner", commission: res.commission }
      : b));

    if (owner) {
      const up = { ...owner, balance_due: res.balance_due };
      setOwner(up); localStorage.setItem("malaabi_owner", JSON.stringify(up));
    }
    setStadiums(p => p.map(s => s.id === owner?.id ? { ...s, balance_due: res.balance_due } : s));
    showToast("âœ… " + t.confirmed + " â€” " + res.code);
  };

  const rejectBooking = async (id) => {
    const res = await stadiumApi("reject-booking", { ownerCode: owner?.owner_code, bookingId: id });
    if (res.error === "unauthorized") return showToast(L("wrongCode"), "#FF4444");
    if (res.error || !res.ok) return showToast(L("netError"), "#FF4444");
    setMyBookingsList(p => p.map(b => b.id === id ? { ...b, status: "rejected", handled_by: "owner" } : b));
    showToast(t.rejectDone, "#FF4444");
  };

  const resetDue = async (id) => {
    const res = await stadiumApi("admin-reset-due", { adminPass, stadiumId: id });
    if (res.error) return showToast(L("netError"), "#FF4444");
    setStadiums(p => p.map(s => s.id === id ? { ...s, balance_due: 0 } : s));
    showToast("âœ… " + L("resetDue"));
  };

  const saveRate = async (id) => {
    const v = parseFloat(rateEdit[id]);
    if (isNaN(v) || v < 0 || v > 100) return showToast("0-100", "#FF4444");
    const res = await stadiumApi("admin-set-rate", { adminPass, stadiumId: id, payload: { rate: v } });
    if (res.error) return showToast(L("netError"), "#FF4444");
    setStadiums(p => p.map(s => s.id === id ? { ...s, commission_rate: v } : s));
    showToast("âœ…");
  };

  const toggleSuspend = async (st) => {
    const res = await stadiumApi("admin-toggle-suspend", { adminPass, stadiumId: st.id });
    if (res.error || !res.status) return showToast(L("netError"), "#FF4444");
    const ns = res.status;
    setStadiums(p => p.map(s => s.id === st.id ? { ...s, status: ns } : s));
    showToast(ns === "suspended" ? "â›” " + L("suspend") : "âœ… " + L("activate"), ns === "suspended" ? "#FF4444" : COLORS.accent);
  };

  const openEdit = (st) => {
    setEditStadium(st); setEditName(st.name); setEditWilaya(st.wilaya); setEditHood(st.hood);
    setEditPrice(st.price); setEditOwnerPhone(st.owner_phone || ""); setEditPayments(st.payments || {});
    setEditWorkingHours(st.working_hours || [...ALL_HOURS]);
    setEditImage(st.image || "");                                 // ðŸ–¼ Ø§Ù„ØµÙˆØ±Ø©
    setEditLat(st.latitude != null ? String(st.latitude) : "");   // ðŸ“ Ø§Ù„Ù…ÙˆÙ‚Ø¹
    setEditLng(st.longitude != null ? String(st.longitude) : ""); // ðŸ“ Ø§Ù„Ù…ÙˆÙ‚Ø¹
  };

  const handleEdit = async () => {
    if (!editName || !editWilaya || !editHood || !editPrice) return showToast(t.enterAll, "#FF4444");
    const res = await stadiumApi("admin-edit-stadium", {
      adminPass, stadiumId: editStadium.id,
      payload: {
        name: editName, wilaya: editWilaya, hood: editHood, price: editPrice,
        owner_phone: editOwnerPhone, payments: editPayments, working_hours: editWorkingHours,
        image: editImage.trim() || pickImage(stadiums.filter(s => s.id !== editStadium.id)),
        latitude: editLat ? parseFloat(editLat) : null,
        longitude: editLng ? parseFloat(editLng) : null,
      },
    });
    if (res.error || !res.stadium) return showToast(L("netError"), "#FF4444");
    setStadiums(p => p.map(s => s.id === editStadium.id ? res.stadium : s));
    setEditStadium(null); showToast(t.editSaved);
  };

  const handleAdd = async () => {
    if (!newName || !newWilayaSelect || !newHood || !newPrice) return showToast(t.enterAll, "#FF4444");
    const colors = ["#80D030","#80D030","#FF6D00","#FF4081","#7C4DFF","#00BCD4"];
    const res = await stadiumApi("admin-add-stadium", {
      adminPass,
      payload: {
        name: newName, wilaya: newWilayaSelect, hood: newHood, price: newPrice,
        color: colors[stadiums.length % colors.length], payments: newPayments,
        owner_phone: newOwnerPhone, working_hours: newWorkingHours,
        image: newImage.trim() || pickImage(stadiums),
        latitude: newLat ? parseFloat(newLat) : null,
        longitude: newLng ? parseFloat(newLng) : null,
      },
    });
    if (res.error || !res.stadium) return showToast(L("netError"), "#FF4444");
    setStadiums(p => [...p, res.stadium]);
    showToast("âœ… " + L("ownerCodeIs") + ": " + res.stadium.owner_code);
    setNewName(""); setNewWilayaSelect(""); setNewHood(""); setNewPrice(""); setNewPayments({}); setNewOwnerPhone(""); setNewWorkingHours([...ALL_HOURS]);
    setNewLat(""); setNewLng(""); setNewImage("");
  };

  const handleAddWilaya = async () => {
    if (!newWilaya || wilayas.includes(newWilaya)) return;
    const res = await stadiumApi("admin-add-wilaya", { adminPass, payload: { name: newWilaya } });
    if (res.error) return showToast(L("netError"), "#FF4444");
    setWilayas(p => [...p, newWilaya]); setNewWilaya("");
    showToast(t.wilayaAdded);
  };

  // ðŸ—‘ Ø­Ø°Ù ÙˆÙ„Ø§ÙŠØ© â€” Ù…Ø¹ ØªØ­Ø°ÙŠØ± Ø¥Ù† ÙƒØ§Ù†Øª ØªØ­ÙˆÙŠ Ù…Ù„Ø§Ø¹Ø¨
  const handleDeleteWilaya = async (name) => {
    const info = await stadiumApi("admin-wilaya-info", { adminPass, payload: { name } });
    if (info.error) return showToast(L("netError"), "#FF4444");

    const msg = info.count > 0
      ? `âš ï¸ ${name}\n\n${info.count} ${L("wilayaHasStadiums")}`
      : `${name}\n\n${L("wilayaEmpty")}`;
    if (!confirm(msg)) return;

    const res = await stadiumApi("admin-delete-wilaya", { adminPass, payload: { name } });
    if (res.error) return showToast(L("netError"), "#FF4444");

    setWilayas(p => p.filter(w => w !== name));
    setStadiums(p => p.filter(s => s.wilaya !== name));
    if (filterWilaya === name) setFilterWilaya("Ø§Ù„ÙƒÙ„");
    showToast("ðŸ—‘ " + L("wilayaDeleted") + (res.deletedStadiums ? ` (${res.deletedStadiums})` : ""), "#FF4444");
  };

  // â­ Ù‡Ù„ Ø§Ù†ØªÙ‡Ù‰ Ù…ÙˆØ¹Ø¯ Ø§Ù„Ø­Ø¬Ø²ØŸ (ÙˆÙ‚ØªÙ‡ + Ø³Ø§Ø¹Ø© Ø§Ù„Ù„Ø¹Ø¨)
  const bookingEnded = (b) => {
    if (!b?.date || b.hour == null) return false;
    const end = new Date(`${b.date}T${String(b.hour).padStart(2, "0")}:00:00`);
    end.setHours(end.getHours() + 1);
    return Date.now() >= end.getTime();
  };

  // â­ Ù‡Ù„ ÙŠØ³ØªØ­Ù‚ Ù‡Ø°Ø§ Ø§Ù„Ø­Ø¬Ø² ØªÙ‚ÙŠÙŠÙ…Ø§Ù‹ Ø§Ù„Ø¢Ù†ØŸ
  const canRate = (b) =>
    b.status === "confirmed" && bookingEnded(b) && !myRatings.some(r => r.booking_id === b.id);

  const myRatingOf = (id) => myRatings.find(r => r.booking_id === id);

  // â­ Ø¬Ù„Ø¨ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø§Ù„Ø²Ø¨ÙˆÙ†
  const loadMyRatings = async (phone, pass) => {
    const ph = phone || user?.phone, pw = pass || sessionPass;
    if (!ph || !pw) return;
    const res = await stadiumApi("my-ratings", { payload: { phone: ph, password: pw } });
    if (res.ratings) setMyRatings(res.ratings);
  };

  // â­ Ø¬Ù„Ø¨ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨ Ø§Ù„Ù…ÙØ¶Ù„Ø© Ù„Ù„Ø²Ø¨ÙˆÙ†
  const loadFavorites = async (phone, pass) => {
    const ph = phone || user?.phone, pw = pass || sessionPass;
    if (!ph || !pw) return;
    const res = await stadiumApi("my-favorites", { payload: { phone: ph, password: pw } });
    if (res.favorites) setFavorites(res.favorites);
  };

  // â­ Ø¥Ø¶Ø§ÙØ©/Ø¥Ø²Ø§Ù„Ø© Ù…Ù„Ø¹Ø¨ Ù…Ù† Ø§Ù„Ù…ÙØ¶Ù„Ø©
  const toggleFavorite = async (stadiumId) => {
    if (!user || !sessionPass) return showToast(L("needRelogin"), "#FF4444");
    // ØªØ­Ø¯ÙŠØ« ÙÙˆØ±ÙŠ ÙÙŠ Ø§Ù„ÙˆØ§Ø¬Ù‡Ø©ØŒ Ø«Ù… ØªØ£ÙƒÙŠØ¯ Ù…Ù† Ø§Ù„Ø®Ø§Ø¯Ù…
    const wasFav = favorites.includes(stadiumId);
    setFavorites(p => wasFav ? p.filter(id => id !== stadiumId) : [...p, stadiumId]);
    const res = await stadiumApi("toggle-favorite", {
      payload: { phone: user.phone, password: sessionPass, stadiumId },
    });
    if (res.error) {
      setFavorites(p => wasFav ? [...p, stadiumId] : p.filter(id => id !== stadiumId));
      return showToast(L("netError"), "#FF4444");
    }
    showToast(res.favorited ? L("addedFav") : L("removedFav"), res.favorited ? "#FF4081" : COLORS.muted);
  };

  // â­ Ø¥Ø±Ø³Ø§Ù„ ØªÙ‚ÙŠÙŠÙ…
  const submitRating = async () => {
    if (!rateStars) return showToast(L("pickStars"), "#FF4444");
    const res = await stadiumApi("rate-booking", {
      payload: {
        phone: user?.phone, password: sessionPass,
        bookingId: rateBooking.id, stars: rateStars, comment: rateText,
      },
    });
    if (res.error === "too_early") return showToast(L("rateTooEarly"), "#FF4444");
    if (res.error === "already_rated") return showToast(L("alreadyRated"), "#FF6D00");
    if (res.error) return showToast(L("netError"), "#FF4444");

    setMyRatings(p => [...p, { booking_id: rateBooking.id, stars: rateStars, comment: rateText }]);
    setRateBooking(null); setRateStars(0); setRateText("");
    loadData();   // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø©
    showToast(L("rateThanks"), "#FFD700");
  };

  // â­ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ù…Ù„Ø¹Ø¨ Ø§Ù„Ù…Ø§Ù„Ùƒ
  const loadOwnerRatings = async () => {
    const res = await stadiumApi("stadium-ratings", {
      ownerCode: owner?.owner_code, payload: { stadiumId: owner?.id },
    });
    if (res.ratings) setOwnerRatings(res.ratings);
  };

  // ðŸ—‘ Ø­Ø°Ù ØªÙ‚ÙŠÙŠÙ… â€” Ø§Ù„Ù…Ø´Ø±Ù ÙÙ‚Ø·
  const deleteRating = async (id) => {
    if (!confirm(t.deleteConfirm + "ØŸ")) return;
    const res = await stadiumApi("admin-delete-rating", { adminPass, payload: { ratingId: id } });
    if (res.error) return showToast(L("netError"), "#FF4444");
    setAdminRatings(p => p.filter(r => r.id !== id));
    showToast("ðŸ—‘", "#FF4444");
  };

  // ðŸ›’ Ù…ÙØªØ§Ø­ Ø§Ù„Ù…ÙˆØ¹Ø¯
  const inCart = (d, h) => cart.some(c => c.date === d && c.hour === h);

  // ðŸ›’ Ø¥Ø¶Ø§ÙØ© Ø£Ùˆ Ø¥Ø²Ø§Ù„Ø© Ù…ÙˆØ¹Ø¯ Ù…Ù† Ø§Ù„Ø³Ù„Ø©
  const toggleCartSlot = (d, h) => {
    if (inCart(d, h)) return setCart(p => p.filter(c => !(c.date === d && c.hour === h)));
    if (cart.length >= 70) return showToast(L("maxSlots"), "#FF4444");
    setCart(p => [...p, { date: d, hour: h }].sort((a,b) => a.date === b.date ? a.hour - b.hour : a.date < b.date ? -1 : 1));
  };

  // ðŸš« Ø¬Ù„Ø¨ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ù…ØºÙ„Ù‚Ø©
  const loadBlocked = async (code) => {
    const res = await stadiumApi("owner-blocked", { ownerCode: code || owner?.owner_code });
    if (res.blocked) setBlockedList(res.blocked);
  };

  // ðŸš« Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
  const saveBlockedHours = async () => {
    if (blockHoursSel.length === 0) return;
    const res = await stadiumApi("owner-block-hours", {
      ownerCode: owner?.owner_code,
      payload: { date: blockDate, hours: blockHoursSel },
    });
    if (res.error === "all_taken") return showToast(L("allTaken"), "#FF4444");
    if (res.error) return showToast(L("netError"), "#FF4444");
    setBlockedList(res.blocked ?? []);
    setBlockHoursSel([]);
    loadData();
    showToast(L("blockDone"), "#FF6D00");
  };

  // ðŸš« Ø¥Ù„ØºØ§Ø¡ Ø¥ØºÙ„Ø§Ù‚ Ù…ÙˆØ¹Ø¯
  const unblockSlot = async (id) => {
    const res = await stadiumApi("owner-unblock", {
      ownerCode: owner?.owner_code, payload: { ids: [id] },
    });
    if (res.error) return showToast(L("netError"), "#FF4444");
    setBlockedList(res.blocked ?? []);
    loadData();
    showToast(L("unblockDone"));
  };

  // ðŸ” Ù‚Ø¨ÙˆÙ„ Ø£Ùˆ Ø±ÙØ¶ Ù…Ø¬Ù…ÙˆØ¹Ø© Ø­Ø¬ÙˆØ²Ø§Øª
  const handleGroup = async (groupId, accept) => {
    const res = await stadiumApi("handle-group", {
      ownerCode: owner?.owner_code, payload: { groupId, accept },
    });
    if (res.error) return showToast(L("netError"), "#FF4444");
    if (accept) {
      setMyBookingsList(p => p.map(b => b.group_id === groupId
        ? { ...b, status: "confirmed", code: res.code, handled_by: "owner", commission: res.commission }
        : b));
      const up = { ...owner, balance_due: res.balance_due };
      setOwner(up); localStorage.setItem("malaabi_owner", JSON.stringify(up));
      showToast("âœ… " + t.confirmed + " â€” " + res.code);
    } else {
      setMyBookingsList(p => p.map(b => b.group_id === groupId
        ? { ...b, status: "rejected", handled_by: "owner" } : b));
      showToast(t.rejectDone, "#FF4444");
    }
  };

  const toggleHour = (h, isEdit) => {
    if (isEdit) setEditWorkingHours(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h].sort((a,b) => a-b));
    else setNewWorkingHours(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h].sort((a,b) => a-b));
  };

  const isBooked = (sid, d, h) => bookings.some(b => b.stadium_id === sid && b.date === d && b.hour === h && b.status !== "rejected");

  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  // ðŸ”’ Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„Ø²Ø¨ÙˆÙ† ØªØ£ØªÙŠ Ù…Ù† Ø§Ù„Ø®Ø§Ø¯Ù… â€” Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª Ù„Ù… ÙŠØ¹Ø¯ Ù…Ù‚Ø±ÙˆØ¡Ø§Ù‹ Ù…Ø¨Ø§Ø´Ø±Ø©
  const myBookings = user ? myBookingsList : [];
  const myConfirmedBookings = myBookings.filter(b => b.status === "confirmed");
  const unreadNotifs = myBookings.filter(b => b.status !== "pending" && !readNotifIds.includes(b.id)).length;
  const pendingRatingsCount = myBookings.filter(b => canRate(b)).length;   // ðŸ”” Ø¹Ø¯Ø¯ Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„ØªÙŠ ØªØ³ØªØ­Ù‚ ØªÙ‚ÙŠÙŠÙ…Ø§Ù‹ Ø§Ù„Ø¢Ù†
  const totalDues = stadiums.reduce((a,s) => a + (s.balance_due || 0), 0);

  // ðŸ“ Ø§Ù„Ù…Ø³Ø§ÙØ© Ø¨ÙŠÙ† Ø§Ù„Ø²Ø¨ÙˆÙ† ÙˆØ§Ù„Ù…Ù„Ø¹Ø¨
  const stadiumDistance = (s) => (myPos && hasLocation(s)) ? distanceKm(myPos.lat, myPos.lng, s.latitude, s.longitude) : null;

  let filteredStadiums = stadiums.filter(s => s.status !== "suspended");
  if (filterWilaya !== "Ø§Ù„ÙƒÙ„") filteredStadiums = filteredStadiums.filter(s => s.wilaya === filterWilaya);
  if (searchText) filteredStadiums = filteredStadiums.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase()) ||
    s.hood.toLowerCase().includes(searchText.toLowerCase()) ||
    s.wilaya.toLowerCase().includes(searchText.toLowerCase()));
  if (sortBy === "price_asc") filteredStadiums = [...filteredStadiums].sort((a,b) => a.price - b.price);
  if (sortBy === "price_desc") filteredStadiums = [...filteredStadiums].sort((a,b) => b.price - a.price);
  if (sortBy === "rating") filteredStadiums = [...filteredStadiums].sort((a,b) =>
    (ratingsMap[b.id]?.avg_stars ?? 0) - (ratingsMap[a.id]?.avg_stars ?? 0));
  if (sortBy === "popular") filteredStadiums = [...filteredStadiums].sort((a,b) => confirmedBookings.filter(x => x.stadium_id === b.id).length - confirmedBookings.filter(x => x.stadium_id === a.id).length);
  // ðŸ“ Ø§Ù„ØªØ±ØªÙŠØ¨ Ø­Ø³Ø¨ Ø§Ù„Ø£Ù‚Ø±Ø¨
  if (sortBy === "nearest" && myPos) filteredStadiums = [...filteredStadiums].sort((a,b) => {
    const da = stadiumDistance(a), db = stadiumDistance(b);
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });

  const pendingBookings = bookings.filter(b => b.status === "pending");
  // ðŸ”’ Ø­Ø¬ÙˆØ²Ø§Øª ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ù„Ø¹Ø¨ ØªØ£ØªÙŠ Ù…Ù† Ø§Ù„Ø®Ø§Ø¯Ù… Ø¨Ø¹Ø¯ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙƒÙˆØ¯Ù‡
  const ownerBookings = owner ? myBookingsList : [];
  const ownerPending = ownerBookings.filter(b => b.status === "pending");
  const payApp = selectedPayApp ? PAYMENT_APPS.find(p => p.id === selectedPayApp) : null;
  const stadiumPayNum = selected && payApp ? (selected.payments?.[selectedPayApp] || "") : "";
  const stadiumHours = selected ? (selected.working_hours || ALL_HOURS) : ALL_HOURS;
  // ðŸ›’ Ø§Ù„Ù…Ø¨Ù„Øº Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ = Ø§Ù„Ø³Ø¹Ø± Ã— Ø¹Ø¯Ø¯ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯
  const totalPrice = (selected?.price || 0) * cart.length;

  const inp = { width:"100%", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"12px 16px", color:"#fff", fontSize:"15px", fontFamily:"inherit", marginBottom:"16px", boxSizing:"border-box", outline:"none" };
  const lbl = { color:COLORS.muted, fontSize:"13px", marginBottom:"6px", display:"block" };
  // ðŸŽ¨ Ù‚Ø§Ø¦Ù…Ø© Ù…Ù†Ø³Ø¯Ù„Ø© Ø¨Ù„ÙˆÙ† Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ â€” Ø§Ù„Ø®Ù„ÙÙŠØ© ÙˆØ§Ù„ÙƒØªØ§Ø¨Ø© ÙˆØ§Ù„Ø®ÙŠØ§Ø±Ø§Øª
  const sel = { ...inp, background:COLORS.bg, color:"#fff", WebkitAppearance:"none", appearance:"none",
    backgroundImage:`url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%238892A4' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat", backgroundPosition: isRTL ? "left 16px center" : "right 16px center",
    paddingInlineEnd:"38px" };
  const opt = { background:COLORS.card, color:"#fff" };

  const BottomNav = () => {
    const items = [
      { id:"stadiums", label: lang==="ar"?"Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨":lang==="fr"?"Accueil":"Home" },
      { id:"notifs", label: lang==="ar"?"Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª":lang==="fr"?"RÃ©servations":"Reservations", badge: unreadNotifs },
      { id:"favorites", label: L("favorites"), badge: favorites.length },
      { id:"profile", label: lang==="ar"?"Ø­Ø³Ø§Ø¨ÙŠ":lang==="fr"?"Profil":"Profile" },
    ];
    return (
      <div style={{position:"fixed", bottom:0, left:0, right:0, background:COLORS.card, borderTop:`1px solid ${COLORS.border}`, display:"flex", zIndex:50, paddingBottom:"8px"}}>
        {items.map(item => {
          const active = bottomTab === item.id;
          const color = active ? COLORS.accent : COLORS.muted;
          return (
            <button key={item.id} onClick={() => {
              if (item.id === "profile") return setShowProfile(true);
              setBottomTab(item.id);
            }} style={{flex:1, padding:"10px 4px 4px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:"5px"}}>
              <div style={{position:"relative", color, display:"flex"}}>
                {item.id === "stadiums" && <HomeIcon active={active}/>}
                {item.id === "notifs" && <CalendarIcon active={active}/>}
                {item.id === "favorites" && <HeartIcon active={active}/>}
                {item.id === "profile" && <PersonIcon active={active}/>}
                {item.badge > 0 && <div style={{position:"absolute", top:"-4px", right:"-6px", background:"#FF4444", color:"#fff", borderRadius:"50%", width:"16px", height:"16px", fontSize:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700"}}>{item.badge}</div>}
              </div>
              <div style={{fontSize:"10px", color, fontWeight: active?"700":"400"}}>{item.label}</div>
            </button>
          );
        })}
      </div>
    );
  };

  // ðŸŸ Ø¨Ø·Ø§Ù‚Ø© Ù…Ù„Ø¹Ø¨ â€” ØªØ¹Ø±ÙŠÙÙ‡Ø§ Ø®Ø§Ø±Ø¬ Ø§Ù„Ù…ÙƒÙˆÙ‘Ù† Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ Ø£Ø³ÙÙ„ Ø§Ù„Ù…Ù„Ù (Ù„ØªÙØ§Ø¯ÙŠ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ø±Ø³Ù… ØºÙŠØ± Ø§Ù„Ø¶Ø±ÙˆØ±ÙŠØ©)

  // âœ… Ø´Ø§Ø´Ø© Ø§Ù„Ø¯Ø®ÙˆÙ„ â€” 3 Ø®ÙŠØ§Ø±Ø§Øª
  let mainContent = null;
  if (screen === "login" || screen === "register" || screen === "ownerLogin") {
    const isReg = screen === "register";
    const isOwner = screen === "ownerLogin";
    mainContent = (
      <div style={{minHeight:"100vh", background:COLORS.bg, fontFamily:"Tajawal,sans-serif", direction:isRTL?"rtl":"ltr", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px"}}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
        <div style={{position:"fixed", top:"16px", left:"16px", zIndex:999}}><LangButton/></div>
        <div style={{width:"100%", maxWidth:"400px"}}>
          <div style={{textAlign:"center", marginBottom:"32px"}}>
            <div style={{marginTop:"-45px", marginBottom:"8px"}}><Logo size={84} glow={0.24}/></div>
            <div><BrandName text={t.appName}/></div>
            <div style={{color:COLORS.muted, marginTop:"8px", fontSize:"15px"}}>{t.appSlogan}</div>
          </div>
          <div style={{background:COLORS.card, borderRadius:"24px", padding:"28px", border:`1px solid ${COLORS.border}`, boxShadow:"0 25px 50px rgba(0,0,0,0.5)"}}>
            {isOwner ? (
              <>
                <div style={{textAlign:"center", marginBottom:"18px"}}>
                  <div style={{fontSize:"40px", marginBottom:"6px"}}>ðŸŸ</div>
                  <div style={{fontWeight:"800", fontSize:"17px", color:"#FF6D00"}}>{L("ownerLogin")}</div>
                </div>
                <label style={lbl}>{L("ownerCode")}</label>
                <input style={{...inp, letterSpacing:"4px", textAlign:"center", fontWeight:"800", fontSize:"18px"}} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={ownerCodeInput} onChange={e => setOwnerCodeInput(e.target.value.toUpperCase())}/>
                <button onClick={handleOwnerLogin} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#FF6D00,#FF4081)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"16px", cursor:"pointer", fontFamily:"inherit", color:"#fff"}}>{t.enterApp}</button>
                <button onClick={() => setScreen("login")} style={{width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"10px", fontSize:"13px"}}>{L("backToLogin")}</button>
              </>
            ) : isReg ? (
              <>
                <div style={{fontSize:"19px", fontWeight:"800", marginBottom:"18px", textAlign:"center"}}>{L("createNewAccount")}</div>
                <label style={lbl}>{t.fullName}</label>
                <input style={inp} placeholder={t.enterName} value={regName} onChange={e => setRegName(e.target.value)}/>
                <label style={lbl}>{t.phone}</label>
                <input style={inp} placeholder={t.enter8} maxLength={8} value={regPhone} onChange={e => setRegPhone(cleanPhone(e.target.value))}/>
                <label style={lbl}>{t.password}</label>
                {passField({ id:"reg", value:regPass, placeholder:t.enter4, onChange:e => setRegPass(e.target.value.replace(/\D/g,"")) })}
                <label style={lbl}>ðŸ” {L("securityQ")}</label>
                <select style={sel} value={regQuestion} onChange={e => setRegQuestion(e.target.value)}>
                  <option style={opt} value="">{L("chooseQ")}</option>
                  {SECURITY_QUESTIONS.map(q => <option style={opt} key={q.id} value={q.id}>{q[lang]}</option>)}
                </select>
                {regQuestion && (
                  <>
                    <label style={lbl}>{L("yourAnswer")}</label>
                    <input style={{...inp, marginBottom:"6px"}} value={regAnswer} onChange={e => setRegAnswer(e.target.value)}/>
                    <div style={{color:"#FF6D00", fontSize:"12px", marginBottom:"16px"}}>âš ï¸ {L("answerHint")}</div>
                  </>
                )}
                <button onClick={handleRegister} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"16px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{t.createAccount}</button>
                <button onClick={() => setScreen("login")} style={{width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.accent2, fontWeight:"700", cursor:"pointer", fontFamily:"inherit", marginTop:"12px", fontSize:"14px"}}>{L("haveAccount")}</button>
              </>
            ) : (
              <>
                <label style={lbl}>{t.phone}</label>
                <input style={inp} placeholder={t.enter8} maxLength={8} value={loginPhone} onChange={e => setLoginPhone(cleanPhone(e.target.value))}/>
                <label style={lbl}>{t.password}</label>
                <div style={{marginBottom:"10px"}}>{passField({ id:"login", value:loginPass, placeholder:t.enter4, onEnter:handleLogin, onChange:e => setLoginPass(e.target.value.replace(/\D/g,"")), extra:{marginBottom:0} })}</div>
                <button onClick={handleLogin} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"16px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{t.enterApp}</button>

                {/* ðŸ”‘ Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± */}
                <button onClick={() => { setShowForgot(true); setForgotPhone(loginPhone); }} style={{display:"block", width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.accent2, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>{L("forgotPass")}</button>

                {/* âž– ÙØ§ØµÙ„ */}
                <div style={{display:"flex", alignItems:"center", gap:"12px", margin:"6px 0 18px"}}>
                  <div style={{flex:1, height:"1px", background:COLORS.border}}></div>
                  <div style={{color:COLORS.muted, fontSize:"12px"}}>{lang==="ar" ? "Ø£Ùˆ" : lang==="fr" ? "ou" : "or"}</div>
                  <div style={{flex:1, height:"1px", background:COLORS.border}}></div>
                </div>

                {/* âž• Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯ */}
                <button onClick={() => setScreen("register")} style={{width:"100%", padding:"14px", background:"transparent", border:`2px solid ${COLORS.accent}`, borderRadius:"12px", color:COLORS.accent, fontWeight:"800", fontSize:"15px", cursor:"pointer", fontFamily:"inherit"}}>{L("createNewAccount")}</button>

                {/* ðŸŸ Ø¯Ø®ÙˆÙ„ Ø£ØµØ­Ø§Ø¨ Ø§Ù„Ù…Ù„Ø§Ø¹Ø¨ */}
                <button onClick={() => setScreen("ownerLogin")} style={{width:"100%", padding:"12px", background:"#FF6D0015", border:"1px solid #FF6D0044", borderRadius:"12px", color:"#FF6D00", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", marginTop:"12px", fontSize:"13px"}}>{L("ownerEntry")}</button>
              </>
            )}
            <button onClick={() => setShowAbout(true)} style={{width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"8px", fontSize:"13px"}}>{lang==="ar" ? "ØªØ¹Ø±Ù Ø¹Ù„ÙŠÙ†Ø§" : lang==="fr" ? "Ã€ propos" : "About us"}</button>
          </div>
        </div>

        {/* ðŸ”‘ Ù†Ø§ÙØ°Ø© Ø§Ø³ØªØ¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± â€” 3 Ù…Ø±Ø§Ø­Ù„ */}
        {showForgot && (
          <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && closeForgot()}>
            <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"400px", padding:"28px"}}>
              <div style={{textAlign:"center", marginBottom:"18px"}}>
                <div style={{fontSize:"42px", marginBottom:"8px"}}>{forgotStep===1?"ðŸ”‘":forgotStep===2?"ðŸ”":"âœ…"}</div>
                <div style={{fontSize:"18px", fontWeight:"800", color:COLORS.accent}}>{L("forgotTitle")}</div>
                <div style={{display:"flex", gap:"6px", justifyContent:"center", marginTop:"12px"}}>
                  {[1,2,3].map(n => <div key={n} style={{width:"28px", height:"4px", borderRadius:"4px", background: forgotStep>=n?COLORS.accent:COLORS.border}}></div>)}
                </div>
              </div>

              {forgotStep===1 && (
                <>
                  <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"16px", textAlign:lang==="ar"?"right":"left"}}>{L("forgotStep1")}</div>
                  <label style={lbl}>{t.phone}</label>
                  <input style={inp} placeholder={t.enter8} maxLength={8} value={forgotPhone} onChange={e => setForgotPhone(cleanPhone(e.target.value))}/>
                  <button onClick={forgotFindUser} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{L("next2")}</button>
                </>
              )}

              {forgotStep===2 && forgotUser && (
                <>
                  <div style={{background:COLORS.bg, borderRadius:"12px", padding:"14px", marginBottom:"16px"}}>
                    <div style={{color:COLORS.muted, fontSize:"11px", marginBottom:"6px"}}>ðŸ” {L("securityQ")}</div>
                    <div style={{fontWeight:"700", fontSize:"14px", lineHeight:"1.6"}}>{qText(forgotUser.security_question, lang)}</div>
                  </div>
                  <label style={lbl}>{L("yourAnswer")}</label>
                  <input style={inp} value={forgotAnswer} onChange={e => setForgotAnswer(e.target.value)} onKeyDown={e => e.key === "Enter" && forgotVerify()}/>
                  <button onClick={forgotVerify} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{L("verify")}</button>
                </>
              )}

              {forgotStep===3 && (
                <>
                  <label style={lbl}>{L("newPass")}</label>
                  {passField({ id:"np1", value:newPass1, placeholder:t.enter4, onChange:e => setNewPass1(e.target.value.replace(/\D/g,"")) })}
                  <label style={lbl}>{L("confirmPass")}</label>
                  {passField({ id:"np2", value:newPass2, placeholder:t.enter4, onChange:e => setNewPass2(e.target.value.replace(/\D/g,"")) })}
                  <button onClick={forgotReset} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{L("savePass")}</button>
                </>
              )}

              <button onClick={closeForgot} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"10px"}}>{lang==="ar" ? "Ø§ØºÙ„Ø§Ù‚" : lang==="fr" ? "Fermer" : "Close"}</button>
            </div>
          </div>
        )}

        {showAbout && (
          <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", backdropFilter:"blur(4px)"}} onClick={e => e.target===e.currentTarget && setShowAbout(false)}>
            <div style={{background:`linear-gradient(160deg, ${COLORS.card}, #060905)`, borderRadius:"28px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"440px", maxHeight:"88vh", overflow:"hidden", boxShadow:"0 30px 80px rgba(0,0,0,0.5)"}}>
              {/* ðŸŸ Ø±Ø£Ø³ÙŠØ© Ø¨ØªÙˆÙ‡Ø¬ Ø£Ø®Ø¶Ø± ÙˆØ´Ø¹Ø§Ø± Ø­Ù‚ÙŠÙ‚ÙŠ */}
              <div style={{position:"relative", padding:"36px 28px 24px", textAlign:"center", overflow:"hidden"}}>
                <div style={{position:"relative", margin:"0 auto 14px"}}><Logo size={72} glow={0.12}/></div>
                <div style={{position:"relative"}}><BrandName text="malaabi" size="26px"/></div>
                <div style={{position:"relative", color:COLORS.accent, fontSize:"12px", fontWeight:"700", marginTop:"6px", letterSpacing:"0.5px"}}>{lang==="ar" ? "Ø§Ø­Ø¬Ø² Ù…Ù„Ø¹Ø¨Ùƒ Ø¨Ø³Ù‡ÙˆÙ„Ø©" : lang==="fr" ? "RÃ©servez facilement" : "Book your field easily"}</div>
              </div>

              {/* ðŸ“œ Ø§Ù„Ù†Øµ â€” Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªÙ…Ø±ÙŠØ± Ø¥Ù† Ø·Ø§Ù„ */}
              <div style={{padding:"4px 28px 28px", overflowY:"auto", maxHeight:"52vh"}}>
                <div style={{color:"#D7DCE5", fontSize:"14px", lineHeight:"2.1", textAlign:lang==="ar"?"right":"left", whiteSpace:"pre-line"}}>{aboutText[lang]}</div>
              </div>

              <div style={{padding:"0 28px 28px"}}>
                <button onClick={() => setShowAbout(false)} style={{width:"100%", padding:"13px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", color:"#0B0E08", fontWeight:"800", fontSize:"14px", cursor:"pointer", fontFamily:"inherit"}}>{lang==="ar" ? "Ø­Ø³Ù†Ø§Ù‹ØŒ ÙÙ‡Ù…Øª" : lang==="fr" ? "Compris" : "Got it"}</button>
              </div>
            </div>
          </div>
        )}
        {toast && <div style={{position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", background:toast.color, color:"#fff", padding:"14px 28px", borderRadius:"16px", fontWeight:"700", zIndex:999, maxWidth:"90%", textAlign:"center"}}>{toast.msg}</div>}
      </div>
    );
  // âœ… ÙˆØ§Ø¬Ù‡Ø© ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ù„Ø¹Ø¨
  } else if (screen === "owner" && owner) {
    const st = owner;   // ðŸ” Ø¨ÙŠØ§Ù†Ø§ØªÙ‡ Ø§Ù„ÙƒØ§Ù…Ù„Ø© ØªØ£ØªÙŠ Ù…Ù† stadium-api Ù„Ø§ Ù…Ù† Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø¹Ø§Ù…
    const conf = ownerBookings.filter(b => b.status === "confirmed");
    mainContent = (
      <div style={{minHeight:"100vh", background:COLORS.bg, fontFamily:"Tajawal,sans-serif", direction:isRTL?"rtl":"ltr", color:"#fff", paddingBottom:"24px"}}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
        <div style={{background:COLORS.card, borderBottom:`1px solid ${COLORS.border}`, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50}}>
          <div style={{fontSize:"17px", fontWeight:"800", color:"#FF6D00"}}>ðŸŸ {st.name}</div>
          <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
            <LangButton/>
            <button onClick={handleLogout} style={{padding:"5px 10px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"8px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.logout}</button>
          </div>
        </div>

        <div style={{maxWidth:"800px", margin:"0 auto", padding:"16px"}}>
          <div style={{background:"linear-gradient(135deg, #FF6D0022, #FF408122)", borderRadius:"18px", padding:"22px", marginBottom:"16px", border:"1px solid #FF6D0044", textAlign:"center"}}>
            <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"6px"}}>{L("dueAmount")}</div>
            <div style={{fontSize:"40px", fontWeight:"900", color:"#FF6D00", marginBottom:"10px"}}>{st.balance_due || 0}</div>
            <div style={{display:"inline-block", background:COLORS.bg, borderRadius:"20px", padding:"6px 16px", fontSize:"12px", color:COLORS.muted}}>
              {L("commission")}: <span style={{color:"#FF6D00", fontWeight:"800"}}>{st.commission_rate ?? 12}%</span> ðŸ”’
            </div>
          </div>

          {/* ðŸ“ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù…Ù„Ø¹Ø¨ â€” Ø¹Ø±Ø¶ Ù„ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ù„Ø¹Ø¨ */}
          <div style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"16px", border:`1px solid ${COLORS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", gap:"10px"}}>
            <div>
              <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"4px"}}>ðŸ“ {L("location")}</div>
              <div style={{fontWeight:"700", fontSize:"14px", color: hasLocation(st) ? COLORS.accent : COLORS.muted}}>
                {hasLocation(st) ? `${st.latitude}, ${st.longitude}` : L("noLocation")}
              </div>
            </div>
            {hasLocation(st) && (
              <button onClick={() => window.open(mapsLink(st.latitude, st.longitude), "_blank")} style={{padding:"10px 14px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px", whiteSpace:"nowrap"}}>{L("showOnMap")}</button>
            )}
          </div>

          {/* ðŸ”‘ Ø²Ø± Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„ÙƒÙˆØ¯ ÙˆØ²Ø± ØªØºÙŠÙŠØ±Ù‡ â€” Ù…ØªÙ‚Ø§Ø¨Ù„Ø§Ù† */}
          <div style={{display:"flex", gap:"8px", marginBottom:"16px"}}>
            <button onClick={() => setShowOwnerCode(v => !v)} style={{flex:1, padding:"11px 8px", background:"#80D03015", color:COLORS.accent, border:"1px solid #80D03044", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>
              ðŸ”‘ {showOwnerCode ? <b style={{letterSpacing:"2px", fontSize:"13px"}}>{owner?.owner_code}</b> : `${L("myCode")} â€¢ â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢`}
            </button>
            <button onClick={() => { if (confirm(L("confirmChangeCode"))) changeOwnerCode(); }} style={{flex:1, padding:"11px 8px", background:"#7C4DFF15", color:"#7C4DFF", border:"1px solid #7C4DFF44", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{L("changeCode")}</button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px", marginBottom:"20px"}}>
            <div style={{background:COLORS.card, borderRadius:"14px", padding:"16px", border:`1px solid ${COLORS.border}`, textAlign:"center"}}>
              <div style={{fontSize:"26px"}}>âœ…</div>
              <div style={{fontSize:"26px", fontWeight:"800", color:COLORS.accent}}>{conf.length}</div>
              <div style={{color:COLORS.muted, fontSize:"11px"}}>{t.totalConfirmed}</div>
            </div>
            <div style={{background:COLORS.card, borderRadius:"14px", padding:"16px", border:`1px solid ${COLORS.border}`, textAlign:"center"}}>
              <div style={{fontSize:"26px"}}>â³</div>
              <div style={{fontSize:"26px", fontWeight:"800", color:"#FF6D00"}}>{ownerPending.length}</div>
              <div style={{color:COLORS.muted, fontSize:"11px"}}>{t.totalPending}</div>
            </div>
          </div>

          {/* ðŸš« Ø¥ØºÙ„Ø§Ù‚ Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…Ø¤Ù‚ØªØ§Ù‹ */}
          <div style={{background:COLORS.card, borderRadius:"16px", border:"1px solid #FF6D0033", padding:"18px", marginBottom:"20px"}}>
            <div style={{fontSize:"15px", fontWeight:"800", color:"#FF6D00", marginBottom:"14px"}}>{L("blockHours")}</div>

            <label style={lbl}>{L("pickDate")}</label>
            <input type="date" style={inp} value={blockDate} min={today} onChange={e => { setBlockDate(e.target.value); setBlockHoursSel([]); }}/>

            <label style={lbl}>{L("pickHours")}</label>
            <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"6px", marginBottom:"14px"}}>
              {(st.working_hours || ALL_HOURS).map(h => {
                const isBlocked = blockedList.some(b => b.date === blockDate && b.hour === h);
                const isTaken = myBookingsList.some(b => b.date === blockDate && b.hour === h && b.status !== "rejected");
                const sel = blockHoursSel.includes(h);
                return (
                  <button key={h} disabled={isTaken || isBlocked}
                    onClick={() => setBlockHoursSel(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h])}
                    style={{padding:"7px 3px", borderRadius:"9px", border: sel?"2px solid #FF4444":`2px solid ${COLORS.border}`, background: isTaken?COLORS.bg : isBlocked?"#FF444422" : sel?"#FF444433":COLORS.bg, color: isTaken?"#374151" : isBlocked?"#FF6B6B" : sel?"#FF4444":COLORS.muted, cursor:(isTaken||isBlocked)?"not-allowed":"pointer", fontSize:"11px", fontWeight:"700", fontFamily:"inherit"}}>
                    {h}:00
                    {isTaken && <span style={{display:"block", fontSize:"8px"}}>{L("bookedHour")}</span>}
                    {isBlocked && <span style={{display:"block", fontSize:"8px"}}>ðŸš«</span>}
                  </button>
                );
              })}
            </div>

            <button onClick={saveBlockedHours} disabled={blockHoursSel.length===0} style={{width:"100%", padding:"12px", background: blockHoursSel.length?"linear-gradient(135deg,#FF6D00,#FF4081)":COLORS.bg, border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor: blockHoursSel.length?"pointer":"not-allowed", fontFamily:"inherit", color: blockHoursSel.length?"#fff":COLORS.muted}}>
              {L("saveBlock")} {blockHoursSel.length>0 && `(${blockHoursSel.length})`}
            </button>

            <div style={{fontSize:"13px", fontWeight:"700", color:COLORS.muted, margin:"18px 0 10px"}}>{L("blockedList")}</div>
            {blockedList.length === 0 ? (
              <div style={{color:COLORS.muted, fontSize:"12px", textAlign:"center", padding:"14px"}}>{L("noBlocked")}</div>
            ) : (
              <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
                {blockedList.map(b => (
                  <div key={b.id} style={{background:"#FF444418", color:"#FF6B6B", padding:"5px 6px 5px 11px", borderRadius:"18px", fontSize:"11px", fontWeight:"700", display:"flex", alignItems:"center", gap:"6px"}}>
                    {b.date} â€¢ {b.hour}:00
                    <button onClick={() => unblockSlot(b.id)} style={{width:"18px", height:"18px", borderRadius:"50%", background:"#FF444433", color:"#FF6B6B", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"10px", lineHeight:"1", display:"flex", alignItems:"center", justifyContent:"center", padding:0}}>âœ•</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{fontSize:"18px", fontWeight:"800", marginBottom:"14px"}}>ðŸ“‹ {t.requests}</div>
          {ownerPending.length === 0 ? (
            <div style={{textAlign:"center", padding:"50px", color:COLORS.muted, background:COLORS.card, borderRadius:"16px", border:`1px solid ${COLORS.border}`}}>{t.noPending}</div>
          ) : Object.values(ownerPending.reduce((acc, b) => {
            // ðŸ” Ù†Ø¬Ù…Ø¹ Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ø­Ø¬Ø² Ø§Ù„Ù…ØªÙƒØ±Ø± ÙÙŠ Ø¨Ø·Ø§Ù‚Ø© ÙˆØ§Ø­Ø¯Ø©
            const k = b.group_id || `s${b.id}`;
            if (!acc[k]) acc[k] = { ...b, _group: [] };
            acc[k]._group.push(b);
            return acc;
          }, {})).map((b,i) => {
            const pa = PAYMENT_APPS.find(p => p.id===b.pay_app);
            const isGroup = b._group.length > 1;
            return (
              <div key={i} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"12px", border:`1px solid ${COLORS.border}`}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}>
                  <div>
                    <div style={{fontWeight:"700", fontSize:"15px"}}>{b.client_name}</div>
                    <div style={{color:COLORS.muted, fontSize:"13px"}}>ðŸ“ž {b.client_phone}</div>
                    {isGroup ? (
                      <>
                        <div style={{color:"#7C4DFF", fontSize:"12px", fontWeight:"800", marginTop:"3px"}}>ðŸ” {L("groupBooking")} â€” {b._group.length} {L("sessions")}</div>
                        {b._group.map(g => (
                          <div key={g.id} style={{color:COLORS.muted, fontSize:"12px"}}>ðŸ“… {g.date} â€” {g.hour}:00</div>
                        ))}
                      </>
                    ) : (
                      <div style={{color:COLORS.muted, fontSize:"13px"}}>ðŸ“… {b.date} â€” {b.hour}:00</div>
                    )}
                  </div>
                  <div style={{background:`${pa?.color}22`, color:pa?.color, padding:"4px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"700", height:"fit-content"}}>{pa?.name}</div>
                </div>
                <div style={{background:COLORS.bg, borderRadius:"10px", padding:"10px 14px", marginBottom:"10px", fontSize:"13px"}}>{t.serialNum}: <span style={{color:COLORS.accent, fontWeight:"700"}}>{b.transaction_num}</span></div>
                {b.proof_url && <button onClick={() => openProof(b.id)} style={{display:"block", width:"100%", textAlign:"center", padding:"10px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", fontSize:"13px", cursor:"pointer", fontFamily:"inherit", marginBottom:"10px"}}>{L("viewProof")}</button>}
                <div style={{display:"flex", gap:"10px"}}>
                  <button onClick={() => isGroup ? handleGroup(b.group_id, true) : confirmBooking(b.id)} style={{flex:1, padding:"11px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{isGroup ? L("acceptAll") : t.confirm}</button>
                  <button onClick={() => isGroup ? handleGroup(b.group_id, false) : rejectBooking(b.id)} style={{flex:1, padding:"11px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>{isGroup ? L("rejectAll") : t.reject}</button>
                </div>
              </div>
            );
          })}

          {/* â­ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø§Ù„Ù…Ù„Ø¹Ø¨ */}
          <div style={{fontSize:"18px", fontWeight:"800", margin:"24px 0 14px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span>â­ {L("ratings")}</span>
            <button onClick={loadOwnerRatings} style={{padding:"6px 12px", background:"#FFD70018", color:"#FFD700", border:"1px solid #FFD70033", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>ðŸ”„</button>
          </div>
          {ownerRatings.length === 0 ? (
            <div style={{textAlign:"center", padding:"24px", color:COLORS.muted, background:COLORS.card, borderRadius:"14px", border:`1px solid ${COLORS.border}`, fontSize:"13px"}}>{L("noRatings")}</div>
          ) : (
            <>
              <div style={{background:"linear-gradient(135deg,#FFD70015,#FF950015)", borderRadius:"16px", padding:"18px", marginBottom:"12px", textAlign:"center", border:"1px solid #FFD70033"}}>
                <div style={{fontSize:"34px", fontWeight:"900", color:"#FFD700"}}>
                  {(ownerRatings.reduce((a,r) => a + r.stars, 0) / ownerRatings.length).toFixed(1)}
                </div>
                <div style={{color:COLORS.muted, fontSize:"12px"}}>{ownerRatings.length} {L("ratings")}</div>
              </div>
              {ownerRatings.map(r => (
                <div key={r.id} style={{background:COLORS.card, borderRadius:"12px", padding:"14px", marginBottom:"8px", border:`1px solid ${COLORS.border}`}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <div style={{fontWeight:"700", fontSize:"14px"}}>{r.client_name}</div>
                    <div style={{fontSize:"13px"}}>{"â­".repeat(r.stars)}</div>
                  </div>
                  {r.comment && <div style={{color:COLORS.muted, fontSize:"13px", marginTop:"6px", lineHeight:"1.7"}}>{r.comment}</div>}
                </div>
              ))}
            </>
          )}

          <div style={{fontSize:"18px", fontWeight:"800", margin:"24px 0 14px"}}>ðŸ“œ {t.myBookingsTitle}</div>
          {ownerBookings.filter(b => b.status !== "pending").slice().reverse().map((b,i) => {
            const sc = b.status==="confirmed"?COLORS.accent:"#FF4444";
            return (
              <div key={i} style={{background:COLORS.card, borderRadius:"12px", padding:"14px", marginBottom:"10px", border:`1px solid ${sc}33`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:"700"}}>{b.client_name}</div>
                  <div style={{color:COLORS.muted, fontSize:"12px"}}>ðŸ“… {b.date} â€” {b.hour}:00</div>
                  {b.status === "confirmed" && <div style={{color:"#FF6D00", fontSize:"12px", marginTop:"3px"}}>{L("commission")}: {b.commission || 0}</div>}
                  {b.status === "confirmed" && b.code && (
                    <div style={{marginTop:"5px", background:`${COLORS.accent}18`, borderRadius:"8px", padding:"4px 10px", display:"inline-block"}}>
                      <span style={{color:COLORS.muted, fontSize:"10px"}}>{L("bookingCode")}: </span>
                      <span style={{color:COLORS.accent, fontWeight:"800", letterSpacing:"2px", fontSize:"12px"}}>{b.code}</span>
                    </div>
                  )}
                </div>
                <div style={{background:`${sc}22`, color:sc, padding:"5px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"700"}}>{b.status==="confirmed"?L("accepted2"):L("rejected2")}</div>
              </div>
            );
          })}
        </div>
        {toast && <div style={{position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", background:toast.color, color:"#fff", padding:"14px 28px", borderRadius:"16px", fontWeight:"700", zIndex:999, maxWidth:"90%", textAlign:"center"}}>{toast.msg}</div>}
      </div>
    );
  } else {
    mainContent = (
    <div style={{minHeight:"100vh", background:COLORS.bg, fontFamily:"Tajawal,sans-serif", direction:isRTL?"rtl":"ltr", color:"#fff", touchAction:"pan-x pan-y", paddingBottom:"70px"}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
      <div style={{background:COLORS.card, borderBottom:`1px solid ${COLORS.border}`, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50}}>
        <div onClick={handleLogoClick} style={{display:"flex", alignItems:"center", gap:"7px", cursor:"pointer", userSelect:"none"}}>
          <div style={{flexShrink:0}}><Logo size={26} glow={0}/></div>
          <BrandName text={t.appName} size="17px"/>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
          {tab === "client" && (
            <button onClick={() => setShowRateNotifs(true)} style={{position:"relative", width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"8px", color:COLORS.muted, cursor:"pointer"}}>
              <BellIcon/>
              {pendingRatingsCount > 0 && <div style={{position:"absolute", top:"-4px", right:"-4px", background:"#FFD700", color:"#000", borderRadius:"50%", width:"15px", height:"15px", fontSize:"9px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700"}}>{pendingRatingsCount}</div>}
            </button>
          )}
          <LangButton/>
          {tab === "admin" && <button onClick={handleLogout} style={{padding:"5px 10px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"8px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.logout}</button>}
          {tab === "admin" && <button onClick={exitAdmin} style={{padding:"5px 10px", background:"#FF444422", border:"none", borderRadius:"8px", color:"#FF4444", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.closeAdmin}</button>}
        </div>
      </div>

      <div style={{maxWidth:"1100px", margin:"0 auto", padding:"16px"}}>
        {tab==="client" && (
          <>
            {bottomTab==="stadiums" && (
              <>
                <div style={{background:`linear-gradient(135deg, ${COLORS.card}, #0a1628)`, borderRadius:"16px", padding:"20px 16px", marginBottom:"16px", border:`1px solid ${COLORS.border}`}}>
                  <div style={{fontSize:"16px", fontWeight:"800", marginBottom:"10px", color:"#fff"}}>{L("findField")}</div>
                  <div style={{position:"relative", marginBottom:"8px"}}>
                    <span style={{position:"absolute", insetInlineStart:"14px", top:"50%", transform:"translateY(-50%)", fontSize:"16px", pointerEvents:"none"}}>ðŸ“</span>
                    <input style={{...inp, marginBottom:0, background:COLORS.bg, color:"#fff", WebkitAppearance:"none", appearance:"none", paddingInlineStart:"40px"}} type="text" name="malaabi-search" autoComplete="off" placeholder={t.search} value={searchText} onChange={e => setSearchText(e.target.value)}/>
                  </div>
                  <select style={{...sel, marginTop:"8px", marginBottom:"8px"}} value={sortBy} onChange={e => { const v = e.target.value; if (v === "nearest") return findNearest(); setSortBy(v); }}>
                    <option style={opt} value="default">{t.sortDefault}</option>
                    <option style={opt} value="price_asc">{t.sortPriceAsc}</option>
                    <option style={opt} value="price_desc">{t.sortPriceDesc}</option>
                    <option style={opt} value="popular">{t.sortPopular}</option>
                    <option style={opt} value="rating">â­ {L("sortRating")}</option>
                    <option style={opt} value="nearest">ðŸ“ {L("sortNearest")}</option>
                  </select>
                  {/* ðŸŽ¯ Ø²Ø± Ø§Ù„Ø£Ù‚Ø±Ø¨ Ù„ÙŠ */}
                  <div style={{display:"flex", gap:"8px"}}>
                    <button onClick={findNearest} style={{flex:2, padding:"12px", background: sortBy==="nearest"?"linear-gradient(135deg,#80D030,#80D030)":COLORS.bg, color: sortBy==="nearest"?"#000":COLORS.accent, border:`1px solid ${sortBy==="nearest"?"transparent":COLORS.border}`, borderRadius:"10px", fontWeight:"800", cursor:"pointer", fontFamily:"inherit", fontSize:"14px"}}>
                      {L("nearestBtn")}
                    </button>
                    {sortBy==="nearest" && (
                      <button onClick={() => setSortBy("default")} style={{flex:1, padding:"12px", background:COLORS.bg, color:COLORS.muted, border:`1px solid ${COLORS.border}`, borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>
                        {L("showAllBtn")}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"16px"}}>
                  {[t.all, ...wilayas].map((w, i) => {
                    const act = i === 0 ? filterWilaya === "Ø§Ù„ÙƒÙ„" : filterWilaya === w;
                    return <button key={w} onClick={() => setFilterWilaya(i === 0 ? "Ø§Ù„ÙƒÙ„" : w)} style={{padding:"6px 14px", borderRadius:"20px", border:`1px solid ${act ? COLORS.accent : COLORS.border}`, cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"13px", background: act?"linear-gradient(135deg,#80D030,#80D030)":COLORS.card, color: act?"#000":COLORS.muted}}>{w}</button>;
                  })}
                </div>
                {filteredStadiums.length===0 ? (
                  <div style={{textAlign:"center", padding:"80px 20px", color:COLORS.muted}}>
                    <div style={{fontSize:"60px", marginBottom:"16px"}}>ðŸŸ</div><div>{t.noStadiums}</div>
                  </div>
                ) : (
                  <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"16px"}}>
                    {filteredStadiums.map((s) => (
                      <StadiumCardView key={s.id} s={s} lang={lang} t={t} L={L} bookings={bookings} myPos={myPos}
                        favorites={favorites} user={user} toggleFavorite={toggleFavorite} ratingsMap={ratingsMap}
                        onBook={() => { setSelected(s); setStep(1); setBookDate(today); }}/>
                    ))}
                  </div>
                )}
              </>
            )}

            {bottomTab==="favorites" && (
              <div>
                <div style={{fontSize:"20px", fontWeight:"800", marginBottom:"20px"}}>â¤ï¸ {L("favorites")}</div>
                {favorites.length===0 ? (
                  <div style={{textAlign:"center", padding:"60px 20px", color:COLORS.muted}}>
                    <div style={{fontSize:"48px", marginBottom:"12px"}}>ðŸ¤</div>
                    <div style={{fontWeight:"700", marginBottom:"6px"}}>{L("noFavorites")}</div>
                    <div style={{fontSize:"13px"}}>{L("noFavoritesHint")}</div>
                  </div>
                ) : (
                  <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"16px"}}>
                    {stadiums.filter(s => favorites.includes(s.id)).map(s => (
                      <StadiumCardView key={s.id} s={s} lang={lang} t={t} L={L} bookings={bookings} myPos={myPos}
                        favorites={favorites} user={user} toggleFavorite={toggleFavorite} ratingsMap={ratingsMap}
                        onBook={() => { setSelected(s); setStep(1); setBookDate(today); }}/>
                    ))}
                  </div>
                )}
              </div>
            )}

            {bottomTab==="notifs" && (
              <div>
                <div style={{fontSize:"20px", fontWeight:"800", marginBottom:"20px"}}>ðŸ“… {lang==="ar"?"Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª":lang==="fr"?"RÃ©servations":"Reservations"}</div>
                {myBookings.length===0 ? (
                  <div style={{textAlign:"center", padding:"60px", color:COLORS.muted}}>
                    <div style={{fontSize:"48px", marginBottom:"12px"}}>ðŸ“…</div>
                    <div>{lang==="ar"?"Ù„Ø§ ØªÙˆØ¬Ø¯ Ø­Ø¬ÙˆØ²Ø§Øª":"No reservations"}</div>
                  </div>
                ) : myBookings.slice().reverse().map((b,i) => {
                  const sc = b.status==="confirmed"?COLORS.accent:b.status==="rejected"?"#FF4444":"#FF6D00";
                  const si = b.status==="confirmed"?"âœ…":b.status==="rejected"?"âŒ":"â³";
                  const stx = b.status==="confirmed"?L("bookingAccepted"):b.status==="rejected"?L("bookingRejected"):L("waiting");
                  const bst = stadiums.find(x => x.id === b.stadium_id);
                  return (
                    <div key={i} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"10px", border:`1px solid ${sc}33`, display:"flex", gap:"12px", alignItems:"center"}}>
                      <div style={{fontSize:"28px"}}>{si}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:"700", color:sc, marginBottom:"4px"}}>{stx}</div>
                        <div style={{color:"#fff", fontWeight:"600"}}>{b.stadium_name}</div>
                        <div style={{color:COLORS.muted, fontSize:"13px"}}>ðŸ“… {b.date} â€” {b.hour}:00</div>
                        {b.status==="confirmed" && b.code && (
                          <div style={{marginTop:"8px", background:`${COLORS.accent}22`, borderRadius:"8px", padding:"6px 10px", display:"inline-block"}}>
                            <span style={{color:COLORS.muted, fontSize:"11px"}}>{t.code}: </span>
                            <span style={{color:COLORS.accent, fontWeight:"800", letterSpacing:"2px"}}>{b.code}</span>
                          </div>
                        )}
                        {myRatingOf(b.id) && (
                          <div style={{marginTop:"8px", fontSize:"12px", color:"#FFD700"}}>
                            {L("yourRating")}: {"â­".repeat(myRatingOf(b.id).stars)}
                          </div>
                        )}

                        {/* ðŸ§­ Ø§ØªØ¬Ø§Ù‡Ø§Øª Ø§Ù„Ù…Ù„Ø¹Ø¨ ÙÙŠ Ø§Ù„Ø­Ø¬Ø² Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„ */}
                        {b.status==="confirmed" && hasLocation(bst) && (
                          <button onClick={() => window.open(directionsLink(bst.latitude, bst.longitude), "_blank")} style={{marginTop:"8px", display:"block", padding:"8px 14px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{L("directions")}</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab==="admin" && (
          <>
            <div style={{fontSize:"24px", fontWeight:"800", marginBottom:"16px"}}>Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…</div>
            <div style={{display:"flex", gap:"5px", marginBottom:"16px", background:COLORS.card, borderRadius:"12px", padding:"4px"}}>
              {[["bookings",L("allBookings"),"#FF6D00"],["dues",L("dues"),"#FF4081"],["ratings","â­","#FFD700"],["stadiums",t.stadiums,"#7C4DFF"],["stats",t.stats,COLORS.accent],["add",t.addStadium,COLORS.accent2]].map(([k,lab,c]) => (
                <button key={k} onClick={() => setAdminTab(k)} style={{flex:1, padding:"8px 2px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"11px", background: adminTab===k?c:"transparent", color: adminTab===k?"#fff":COLORS.muted}}>{lab}</button>
              ))}
            </div>

            {/* ðŸ‘ Ù…Ø´Ø§Ù‡Ø¯Ø© ÙÙ‚Ø· */}
            {adminTab==="bookings" && (
              <div>
                <div style={{background:"#80D03015", border:"1px solid #80D03033", borderRadius:"12px", padding:"12px", marginBottom:"16px", textAlign:"center", color:COLORS.accent2, fontSize:"13px", fontWeight:"700"}}>ðŸ‘ {L("viewOnly")}</div>
                <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"18px"}}>
                  {[["â³",pendingBookings.length,L("waiting"),"#FF6D00"],["âœ…",confirmedBookings.length,L("accepted2"),COLORS.accent],["âŒ",bookings.filter(b=>b.status==="rejected").length,L("rejected2"),"#FF4444"]].map(([ic,v,lb,c],i)=>(
                    <div key={i} style={{background:COLORS.card, borderRadius:"12px", padding:"14px 8px", border:`1px solid ${c}33`, textAlign:"center"}}>
                      <div style={{fontSize:"20px"}}>{ic}</div>
                      <div style={{fontSize:"22px", fontWeight:"800", color:c}}>{v}</div>
                      <div style={{color:COLORS.muted, fontSize:"10px"}}>{lb}</div>
                    </div>
                  ))}
                </div>
                {bookings.slice().reverse().map((b,i) => {
                  const pa = PAYMENT_APPS.find(p => p.id===b.pay_app);
                  const sc = b.status==="confirmed"?COLORS.accent:b.status==="rejected"?"#FF4444":"#FF6D00";
                  const si = b.status==="confirmed"?"âœ…":b.status==="rejected"?"âŒ":"â³";
                  const stx = b.status==="confirmed"?L("accepted2"):b.status==="rejected"?L("rejected2"):L("waiting");
                  return (
                    <div key={i} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"12px", border:`1px solid ${sc}44`}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"10px"}}>
                        <div>
                          <div style={{fontWeight:"700", fontSize:"15px"}}>{b.client_name}</div>
                          <div style={{color:COLORS.muted, fontSize:"13px"}}>ðŸ“ž {b.client_phone}</div>
                          <div style={{color:COLORS.muted, fontSize:"13px"}}>ðŸŸ {b.stadium_name}</div>
                          <div style={{color:COLORS.muted, fontSize:"13px"}}>ðŸ“… {b.date} â€” {b.hour}:00</div>
                        </div>
                        <div style={{background:`${sc}22`, color:sc, padding:"6px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"800", whiteSpace:"nowrap"}}>{si} {stx}</div>
                      </div>
                      <div style={{background:COLORS.bg, borderRadius:"10px", padding:"10px 14px", marginBottom:"10px", fontSize:"13px", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"6px"}}>
                        <span>{t.serialNum}: <b style={{color:COLORS.accent}}>{b.transaction_num}</b></span>
                        <span style={{color:pa?.color, fontWeight:"700"}}>{pa?.name}</span>
                      </div>
                      {b.proof_url && <button onClick={() => openProof(b.id)} style={{display:"block", width:"100%", textAlign:"center", padding:"11px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", fontSize:"13px", cursor:"pointer", fontFamily:"inherit"}}>{L("viewProof")}</button>}
                      {b.status === "confirmed" && b.code && (
                        <div style={{marginTop:"8px", textAlign:"center", background:`${COLORS.accent}15`, borderRadius:"10px", padding:"7px"}}>
                          <span style={{color:COLORS.muted, fontSize:"11px"}}>{L("bookingCode")}: </span>
                          <span style={{color:COLORS.accent, fontWeight:"800", letterSpacing:"3px", fontSize:"14px"}}>{b.code}</span>
                        </div>
                      )}
                      {b.status !== "pending" && <div style={{color:"#7C4DFF", fontSize:"12px", marginTop:"8px", textAlign:"center"}}>{L("handledBy")}: <b>{L("owner")}</b>{b.commission ? ` â€” ${L("commission")}: ${b.commission}` : ""}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {adminTab==="dues" && (
              <div>
                <div style={{background:"linear-gradient(135deg,#FF408122,#FF6D0022)", borderRadius:"18px", padding:"22px", marginBottom:"18px", border:"1px solid #FF408144", textAlign:"center"}}>
                  <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"6px"}}>{L("totalDues")}</div>
                  <div style={{fontSize:"40px", fontWeight:"900", color:"#FF4081"}}>{totalDues}</div>
                </div>
                {stadiums.map(s => (
                  <div key={s.id} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"12px", border:`1px solid ${s.status==="suspended"?"#FF444455":COLORS.border}`}}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px"}}>
                      <div>
                        <div style={{fontWeight:"800", fontSize:"16px"}}>{s.name}</div>
                        <div style={{color:COLORS.muted, fontSize:"12px"}}>ðŸ“ {s.wilaya} â€” {s.hood}</div>
                        <div style={{color:COLORS.accent2, fontSize:"12px", marginTop:"4px"}}>ðŸ”‘ <b style={{letterSpacing:"1px"}}>{s.owner_code || "â€”"}</b></div>
                      </div>
                      <div style={{background: s.status==="suspended"?"#FF444422":"#80D03022", color: s.status==="suspended"?"#FF4444":COLORS.accent, padding:"4px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:"700"}}>{s.status==="suspended"?L("suspendedS"):L("active")}</div>
                    </div>
                    <div style={{background:COLORS.bg, borderRadius:"12px", padding:"14px", marginBottom:"12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <div>
                        <div style={{color:COLORS.muted, fontSize:"11px"}}>{L("dueAmount")}</div>
                        <div style={{fontSize:"24px", fontWeight:"900", color:"#FF6D00"}}>{s.balance_due || 0}</div>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                        <input type="number" value={rateEdit[s.id] ?? (s.commission_rate ?? 12)} onChange={e => setRateEdit(p => ({...p, [s.id]: e.target.value}))} style={{width:"56px", background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:"8px", padding:"8px", color:"#fff", fontFamily:"inherit", textAlign:"center", fontWeight:"700"}}/>
                        <span style={{color:COLORS.muted, fontSize:"13px"}}>%</span>
                        <button onClick={() => saveRate(s.id)} style={{padding:"8px 12px", background:COLORS.accent2, border:"none", borderRadius:"8px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", color:"#000", fontSize:"12px"}}>ðŸ’¾</button>
                      </div>
                    </div>
                    <div style={{display:"flex", gap:"8px"}}>
                      <button onClick={() => resetDue(s.id)} style={{flex:1, padding:"10px", background:"#80D03022", color:COLORS.accent, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>ðŸ’° {L("resetDue")}</button>
                      <button onClick={() => toggleSuspend(s)} style={{flex:1, padding:"10px", background: s.status==="suspended"?"#80D03022":"#FF6D0022", color: s.status==="suspended"?COLORS.accent2:"#FF6D00", border:`1px solid ${s.status==="suspended"?"#80D03044":"#FF6D0044"}`, borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{s.status==="suspended"?"â–¶ "+L("activate"):"â›” "+L("suspend")}</button>
                      <button onClick={() => setConfirmDelete(s)} style={{padding:"10px 14px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>ðŸ—‘</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab==="ratings" && (
              <div>
                {adminRatings.length === 0 ? (
                  <div style={{textAlign:"center", padding:"60px", color:COLORS.muted}}>
                    <div style={{fontSize:"48px", marginBottom:"12px"}}>â­</div>
                    <div>{L("noRatings")}</div>
                  </div>
                ) : adminRatings.map(r => {
                  const st = stadiums.find(x => x.id === r.stadium_id);
                  return (
                    <div key={r.id} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"10px", border:"1px solid #FFD70022"}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px"}}>
                        <div>
                          <div style={{fontWeight:"700", fontSize:"14px"}}>{r.client_name}</div>
                          <div style={{color:COLORS.muted, fontSize:"12px"}}>ðŸŸ {st?.name || r.stadium_id}</div>
                        </div>
                        <div style={{fontSize:"13px"}}>{"â­".repeat(r.stars)}</div>
                      </div>
                      {r.comment && <div style={{color:COLORS.muted, fontSize:"13px", lineHeight:"1.7", marginBottom:"8px"}}>{r.comment}</div>}
                      <button onClick={() => deleteRating(r.id)} style={{padding:"7px 14px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"9px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"11px"}}>ðŸ—‘ {t.delete}</button>
                    </div>
                  );
                })}
              </div>
            )}

            {adminTab==="stadiums" && (
              <div>
                {stadiums.map(s => {
                  const c = confirmedBookings.filter(b => b.stadium_id === s.id).length;
                  return (
                    <div key={s.id} style={{background:COLORS.card, borderRadius:"12px", padding:"16px", marginBottom:"10px", display:"flex", justifyContent:"space-between", alignItems:"center", border:`1px solid ${COLORS.border}`}}>
                      <div>
                        <div style={{fontWeight:"700"}}>{s.name}</div>
                        <div style={{color:COLORS.muted, fontSize:"13px"}}>ðŸ“ {s.wilaya} - {s.hood} - {s.price}</div>
                        <div style={{color:COLORS.accent, fontSize:"13px", marginTop:"4px"}}>âœ… {c}</div>
                        <div style={{color:COLORS.accent2, fontSize:"12px"}}>ðŸ”‘ {s.owner_code || "â€”"}</div>
                        {/* ðŸ“ Ø­Ø§Ù„Ø© Ø§Ù„Ù…ÙˆÙ‚Ø¹ */}
                        <div style={{color: hasLocation(s)?COLORS.accent:"#FF6D00", fontSize:"12px", marginTop:"2px"}}>
                          {hasLocation(s) ? `ðŸ“ ${Number(s.latitude).toFixed(4)}, ${Number(s.longitude).toFixed(4)}` : "âš ï¸ " + L("noLocation")}
                        </div>
                      </div>
                      <div style={{display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"flex-end"}}>
                        {hasLocation(s) && <button onClick={() => window.open(mapsLink(s.latitude, s.longitude), "_blank")} style={{padding:"8px 12px", background:"#80D03022", color:COLORS.accent, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>ðŸ—º</button>}
                        <button onClick={() => openEdit(s)} style={{padding:"8px 12px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.edit}</button>
                        <button onClick={() => setConfirmDelete(s)} style={{padding:"8px 12px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.delete}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {adminTab==="stats" && (
              <div>
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"12px", marginBottom:"20px"}}>
                  {[
                    { l:t.totalUsers, v:usersCount, i:"ðŸ‘¥", c:COLORS.accent },
                    { l:t.totalStadiums, v:stadiums.length, i:"ðŸŸ", c:COLORS.accent2 },
                    { l:t.totalConfirmed, v:confirmedBookings.length, i:"âœ…", c:"#7C4DFF" },
                    { l:L("totalDues"), v:totalDues, i:"ðŸ’°", c:"#FF4081" },
                  ].map((s,i) => (
                    <div key={i} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", border:`1px solid ${s.c}33`}}>
                      <div style={{fontSize:"28px", marginBottom:"6px"}}>{s.i}</div>
                      <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"4px"}}>{s.l}</div>
                      <div style={{fontSize:"28px", fontWeight:"800", color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:COLORS.card, borderRadius:"14px", padding:"20px", border:`1px solid ${COLORS.border}`}}>
                  <div style={{fontWeight:"700", marginBottom:"14px"}}>{t.confirmedBookingsPerStadium}</div>
                  {stadiums.map(s => {
                    const cnt = confirmedBookings.filter(b => b.stadium_id === s.id).length;
                    const mx = Math.max(...stadiums.map(x => confirmedBookings.filter(b => b.stadium_id === x.id).length), 1);
                    return (
                      <div key={s.id} style={{marginBottom:"12px"}}>
                        <div style={{display:"flex", justifyContent:"space-between", marginBottom:"4px"}}>
                          <span style={{fontSize:"13px"}}>{s.name}</span>
                          <span style={{fontSize:"13px", color:s.color, fontWeight:"700"}}>{cnt}</span>
                        </div>
                        <div style={{background:COLORS.bg, borderRadius:"20px", height:"8px"}}>
                          <div style={{background:`linear-gradient(90deg, ${s.color}, ${s.color}88)`, borderRadius:"20px", height:"8px", width:`${(cnt/mx)*100}%`}}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {adminTab==="add" && (
              <div>
                <div style={{background:COLORS.card, borderRadius:"16px", border:`1px solid ${COLORS.border}`, padding:"20px", marginBottom:"16px"}}>
                  <div style={{fontWeight:"700", color:COLORS.accent2, marginBottom:"16px"}}>{t.addWilaya}</div>
                  <div style={{display:"flex", gap:"12px"}}>
                    <input style={{...inp, marginBottom:0, flex:1}} placeholder={t.wilaya} value={newWilaya} onChange={e => setNewWilaya(e.target.value)}/>
                    <button onClick={handleAddWilaya} style={{padding:"10px 16px", background:COLORS.accent2, border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{t.add}</button>
                  </div>
                  <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"12px"}}>
                    {wilayas.map(w => (
                      <div key={w} style={{background:"#80D03022", color:COLORS.accent2, padding:"4px 6px 4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"700", display:"flex", alignItems:"center", gap:"6px"}}>
                        {w}
                        <button onClick={() => handleDeleteWilaya(w)} title={L("delWilaya")} style={{width:"20px", height:"20px", borderRadius:"50%", background:"#FF444433", color:"#FF6B6B", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"11px", lineHeight:"1", display:"flex", alignItems:"center", justifyContent:"center", padding:0}}>âœ•</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{background:COLORS.card, borderRadius:"16px", border:`1px solid ${COLORS.border}`, padding:"20px"}}>
                  <div style={{fontWeight:"700", color:COLORS.accent, marginBottom:"16px"}}>{t.addNewStadium}</div>
                  <label style={lbl}>{t.stadiumName}</label>
                  <input style={inp} value={newName} onChange={e => setNewName(e.target.value)}/>
                  <label style={lbl}>{t.wilaya}</label>
                  <select style={sel} value={newWilayaSelect} onChange={e => setNewWilayaSelect(e.target.value)}>
                    <option style={opt} value="">{t.chooseWilaya}</option>
                    {wilayas.map(w => <option style={opt} key={w} value={w}>{w}</option>)}
                  </select>
                  <label style={lbl}>{t.hood}</label>
                  <input style={inp} value={newHood} onChange={e => setNewHood(e.target.value)}/>
                  <label style={lbl}>{t.price}</label>
                  <input style={inp} type="number" placeholder="1000" value={newPrice} onChange={e => setNewPrice(e.target.value)}/>
                  <label style={lbl}>{t.ownerPhone}</label>
                  <input style={inp} maxLength={8} value={newOwnerPhone} onChange={e => setNewOwnerPhone(cleanPhone(e.target.value))}/>

                  <label style={lbl}>ðŸ–¼ {L("imageUrl")}</label>
                  <label style={{display:"block", width:"100%", padding:"14px", background: newImage?"#80D03022":COLORS.bg, border:`2px dashed ${newImage?COLORS.accent:COLORS.border}`, borderRadius:"12px", color: newImage?COLORS.accent:COLORS.muted, fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", textAlign:"center", marginBottom:"10px", boxSizing:"border-box"}}>
                    {uploadingImg ? L("uploading") : newImage ? L("imageUploaded") : L("uploadImage")}
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={e => handleUploadStadiumImage(e.target.files[0], false)}/>
                  </label>
                  <input style={{...inp, marginBottom:"6px"}} placeholder={L("orPasteLink")} value={newImage} onChange={e => setNewImage(e.target.value)}/>
                  <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"12px"}}>{L("imageHint")}</div>
                  {newImage.trim() && (
                    <>
                      <img src={newImage} alt="" onError={e => e.target.style.display="none"} style={{width:"100%", height:"120px", objectFit:"cover", borderRadius:"12px", marginBottom:"8px"}}/>
                      <button onClick={() => setNewImage("")} style={{width:"100%", padding:"9px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px", marginBottom:"16px"}}>{L("removeImage")}</button>
                    </>
                  )}

                  {/* ðŸ“ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù…Ù„Ø¹Ø¨ */}
                  <div style={{fontWeight:"700", color:"#FF6D00", margin:"12px 0 10px"}}>ðŸ“ {L("location")}</div>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                    <div>
                      <label style={lbl}>Latitude</label>
                      <input style={inp} type="number" step="any" placeholder="20.9310526" value={newLat} onChange={e => setNewLat(e.target.value)}/>
                    </div>
                    <div>
                      <label style={lbl}>Longitude</label>
                      <input style={inp} type="number" step="any" placeholder="-17.0347218" value={newLng} onChange={e => setNewLng(e.target.value)}/>
                    </div>
                  </div>
                  <div style={{display:"flex", gap:"8px", marginBottom:"16px"}}>
                    <button onClick={() => getMyLocation(false)} style={{flex:1, padding:"11px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>{L("myLocation")}</button>
                    {newLat && newLng && <button onClick={() => window.open(mapsLink(newLat, newLng), "_blank")} style={{flex:1, padding:"11px", background:"#80D03022", color:COLORS.accent, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>{L("checkLocation")}</button>}
                  </div>

                  <div style={{fontWeight:"700", color:COLORS.accent, margin:"12px 0 10px"}}>{t.workingHours}</div>
                  <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"6px", marginBottom:"14px"}}>
                    {ALL_HOURS.map(h => (
                      <button key={h} onClick={() => toggleHour(h, false)} style={{padding:"6px 4px", borderRadius:"8px", border: newWorkingHours.includes(h)?`2px solid ${COLORS.accent}`:`2px solid ${COLORS.border}`, background: newWorkingHours.includes(h)?`${COLORS.accent}22`:COLORS.bg, color: newWorkingHours.includes(h)?COLORS.accent:COLORS.muted, cursor:"pointer", fontSize:"11px", fontWeight:"600", fontFamily:"inherit"}}>{h}:00</button>
                    ))}
                  </div>
                  <div style={{fontWeight:"700", color:COLORS.accent2, margin:"12px 0 10px"}}>{t.bankAccounts}</div>
                  {PAYMENT_APPS.map(p => (
                    <div key={p.id}>
                      <label style={lbl}>{p.name}</label>
                      <input style={inp} value={newPayments[p.id]||""} onChange={e => setNewPayments(pr => ({...pr, [p.id]: e.target.value}))}/>
                    </div>
                  ))}
                  <button onClick={handleAdd} style={{padding:"12px 24px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"14px", color:"#000"}}>{t.addStadiumBtn}</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {tab === "client" && <BottomNav/>}

      {editStadium && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setEditStadium(null)}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"520px", maxHeight:"90vh", overflow:"auto", padding:"24px"}}>
            <div style={{fontSize:"18px", fontWeight:"800", color:COLORS.accent2, marginBottom:"20px"}}>âœï¸ {editStadium.name}</div>
            <label style={lbl}>{t.stadiumName}</label>
            <input style={inp} value={editName} onChange={e => setEditName(e.target.value)}/>
            <label style={lbl}>{t.wilaya}</label>
            <select style={sel} value={editWilaya} onChange={e => setEditWilaya(e.target.value)}>
              {wilayas.map(w => <option style={opt} key={w} value={w}>{w}</option>)}
            </select>
            <label style={lbl}>{t.hood}</label>
            <input style={inp} value={editHood} onChange={e => setEditHood(e.target.value)}/>
            <label style={lbl}>{t.price}</label>
            <input style={inp} type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}/>
            <label style={lbl}>{t.ownerPhone}</label>
            <input style={inp} maxLength={8} value={editOwnerPhone} onChange={e => setEditOwnerPhone(cleanPhone(e.target.value))}/>

            <label style={lbl}>ðŸ–¼ {L("imageUrl")}</label>
            <label style={{display:"block", width:"100%", padding:"14px", background: editImage?"#80D03022":COLORS.bg, border:`2px dashed ${editImage?COLORS.accent:COLORS.border}`, borderRadius:"12px", color: editImage?COLORS.accent:COLORS.muted, fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", textAlign:"center", marginBottom:"10px", boxSizing:"border-box"}}>
              {uploadingImg ? L("uploading") : editImage ? L("imageUploaded") : L("uploadImage")}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={e => handleUploadStadiumImage(e.target.files[0], true)}/>
            </label>
            <input style={{...inp, marginBottom:"6px"}} placeholder={L("orPasteLink")} value={editImage} onChange={e => setEditImage(e.target.value)}/>
            <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"10px"}}>{L("imageHint")}</div>
            <img src={editImage.trim() || stadiumImage(editStadium)} alt="" onError={e => onImgError(e, editStadium.id || 0)} style={{width:"100%", height:"120px", objectFit:"cover", borderRadius:"12px", marginBottom:"8px"}}/>
            {editImage.trim() && <button onClick={() => setEditImage("")} style={{width:"100%", padding:"9px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px", marginBottom:"16px"}}>{L("removeImage")}</button>}

            {/* ðŸ“ ØªØ¹Ø¯ÙŠÙ„ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù…Ù„Ø¹Ø¨ */}
            <div style={{fontWeight:"700", color:"#FF6D00", margin:"12px 0 10px"}}>ðŸ“ {L("location")}</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
              <div>
                <label style={lbl}>Latitude</label>
                <input style={inp} type="number" step="any" placeholder="20.9310526" value={editLat} onChange={e => setEditLat(e.target.value)}/>
              </div>
              <div>
                <label style={lbl}>Longitude</label>
                <input style={inp} type="number" step="any" placeholder="-17.0347218" value={editLng} onChange={e => setEditLng(e.target.value)}/>
              </div>
            </div>
            <div style={{display:"flex", gap:"8px", marginBottom:"16px"}}>
              <button onClick={() => getMyLocation(true)} style={{flex:1, padding:"11px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>{L("myLocation")}</button>
              {editLat && editLng && <button onClick={() => window.open(mapsLink(editLat, editLng), "_blank")} style={{flex:1, padding:"11px", background:"#80D03022", color:COLORS.accent, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>{L("checkLocation")}</button>}
            </div>

            <div style={{fontWeight:"700", color:COLORS.accent, margin:"12px 0 10px"}}>{t.workingHours}</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"6px", marginBottom:"14px"}}>
              {ALL_HOURS.map(h => (
                <button key={h} onClick={() => toggleHour(h, true)} style={{padding:"6px 4px", borderRadius:"8px", border: editWorkingHours.includes(h)?`2px solid ${COLORS.accent}`:`2px solid ${COLORS.border}`, background: editWorkingHours.includes(h)?`${COLORS.accent}22`:COLORS.bg, color: editWorkingHours.includes(h)?COLORS.accent:COLORS.muted, cursor:"pointer", fontSize:"11px", fontWeight:"600", fontFamily:"inherit"}}>{h}:00</button>
              ))}
            </div>
            <div style={{fontWeight:"700", color:COLORS.accent2, margin:"12px 0 10px"}}>{t.bankAccounts}</div>
            {PAYMENT_APPS.map(p => (
              <div key={p.id}>
                <label style={lbl}>{p.name}</label>
                <input style={inp} value={editPayments[p.id]||""} onChange={e => setEditPayments(pr => ({...pr, [p.id]: e.target.value}))}/>
              </div>
            ))}
            <div style={{display:"flex", gap:"12px"}}>
              <button onClick={() => setEditStadium(null)} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.cancel}</button>
              <button onClick={handleEdit} style={{flex:2, padding:"12px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", color:"#000", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>{t.saveEdit}</button>
            </div>
          </div>
        </div>
      )}

      {showProfile && user && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setShowProfile(false)}>
          <div style={{background:`linear-gradient(160deg, ${COLORS.card}, #060905)`, borderRadius:"26px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"400px", overflow:"hidden"}}>
            {/* ðŸ‘¤ Ø±Ø£Ø³ÙŠØ© Ø¨ØªÙˆÙ‡Ø¬ Ø®ÙÙŠÙ ÙˆØ§Ø³Ù… Ø¨Ø§Ø±Ø² */}
            <div style={{position:"relative", padding:"32px 28px 22px", textAlign:"center", overflow:"hidden"}}>
              <div style={{position:"absolute", top:"-70px", left:"50%", transform:"translateX(-50%)", width:"200px", height:"200px", background:"radial-gradient(circle, #80D03026, transparent 70%)", pointerEvents:"none"}}></div>
              <div style={{position:"relative", width:"64px", height:"64px", margin:"0 auto 12px", borderRadius:"50%", background:"linear-gradient(135deg,#80D030,#80D030)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px"}}>ðŸ‘¤</div>
              <div style={{position:"relative", fontSize:"19px", fontWeight:"800", color:"#fff"}}>{user.name}</div>
              <div style={{position:"relative", color:COLORS.muted, fontSize:"13px", marginTop:"4px"}}>ðŸ“ž {user.phone}</div>
            </div>

            <div style={{padding:"4px 24px 24px"}}>
              {/* âœ… Ø¥Ø­ØµØ§Ø¦ÙŠØ© Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„Ù…Ø¤ÙƒÙŽÙ‘Ø¯Ø© */}
              <div style={{background:COLORS.bg, borderRadius:"16px", padding:"18px", marginBottom:"18px", textAlign:"center", border:`1px solid ${COLORS.border}`}}>
                <div style={{fontSize:"32px", fontWeight:"900", color:COLORS.accent, lineHeight:1}}>{myConfirmedBookings.length}</div>
                <div style={{color:COLORS.muted, fontSize:"12px", marginTop:"6px"}}>{t.acceptedBookings}</div>
              </div>

              <button onClick={() => { setShowProfile(false); handleLogout(); }} style={{width:"100%", padding:"13px", background:"#FF444415", border:"1px solid #FF444444", borderRadius:"14px", color:"#FF6B6B", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"14px", marginBottom:"10px"}}>ðŸšª {t.logout}</button>
              <button onClick={() => setShowProfile(false)} style={{width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && closeModal()}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"520px", maxHeight:"90vh", overflow:"auto", padding:"24px"}}>
            <div style={{fontSize:"18px", fontWeight:"800", color:selected.color, marginBottom:"4px"}}>ðŸŸ {selected.name}</div>
            <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"12px"}}>ðŸ“ {selected.wilaya} - {selected.hood} - {selected.price}</div>
            {/* ðŸ§­ Ø§ØªØ¬Ø§Ù‡Ø§Øª Ø§Ù„Ù…Ù„Ø¹Ø¨ Ø¯Ø§Ø®Ù„ Ù†Ø§ÙØ°Ø© Ø§Ù„Ø­Ø¬Ø² */}
            {hasLocation(selected) && (
              <button onClick={() => window.open(directionsLink(selected.latitude, selected.longitude), "_blank")} style={{width:"100%", padding:"11px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", marginBottom:"16px"}}>
                {L("directions")}{stadiumDistance(selected) != null ? ` â€” ${stadiumDistance(selected).toFixed(1)} ${L("kmAway")}` : ""}
              </button>
            )}
            {step===1 && (
              <>
                <label style={lbl}>{L("pickSlots")}</label>
                <input type="date" style={inp} value={bookDate} min={today} onChange={e => setBookDate(e.target.value)}/>

                <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"6px", marginBottom:"16px"}}>
                  {stadiumHours.map(h => {
                    const tk = isBooked(selected.id, bookDate, h);
                    const picked = inCart(bookDate, h);
                    return (
                      <button key={h} disabled={tk} onClick={() => toggleCartSlot(bookDate, h)}
                        style={{padding:"8px 4px", borderRadius:"10px", border: picked?`2px solid ${selected.color}`:"2px solid transparent", background: tk?COLORS.bg : picked?`${selected.color}33`:COLORS.bg, color: tk?"#374151" : picked?selected.color:COLORS.muted, cursor:tk?"not-allowed":"pointer", fontSize:"11px", fontWeight: picked?"800":"600", fontFamily:"inherit"}}>
                        {h}:00{tk && <span style={{display:"block", fontSize:"9px", color:"#4b5563"}}>{t.booked}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* ðŸ›’ Ø§Ù„Ø³Ù„Ø© */}
                <div style={{background:COLORS.bg, borderRadius:"14px", padding:"14px", marginBottom:"16px"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: cart.length?"10px":0}}>
                    <span style={{fontSize:"13px", fontWeight:"800"}}>ðŸ›’ {L("myCart")} {cart.length>0 && `(${cart.length})`}</span>
                    {cart.length>0 && <span style={{color:COLORS.accent, fontWeight:"900", fontSize:"19px"}}>{totalPrice}</span>}
                  </div>

                  {cart.length === 0 ? (
                    <div style={{color:COLORS.muted, fontSize:"12px", textAlign:"center", padding:"10px"}}>{L("cartEmpty")}</div>
                  ) : (
                    <div style={{maxHeight:"170px", overflowY:"auto", display:"flex", flexWrap:"wrap", gap:"6px"}}>
                      {cart.map(c => (
                        <div key={`${c.date}-${c.hour}`} style={{background:`${selected.color}22`, color:selected.color, padding:"5px 6px 5px 11px", borderRadius:"18px", fontSize:"11px", fontWeight:"700", display:"flex", alignItems:"center", gap:"6px"}}>
                          {c.date.slice(5)} â€¢ {c.hour}:00
                          <button onClick={() => toggleCartSlot(c.date, c.hour)} style={{width:"17px", height:"17px", borderRadius:"50%", background:"#FF444433", color:"#FF6B6B", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"10px", lineHeight:"1", display:"flex", alignItems:"center", justifyContent:"center", padding:0}}>âœ•</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={closeModal} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.cancel}</button>
                  <button disabled={cart.length===0} onClick={() => setStep(2)} style={{flex:2, padding:"12px", background:cart.length===0?COLORS.bg:`linear-gradient(135deg,${selected.color},${selected.color}BB)`, border:"none", borderRadius:"12px", color:cart.length===0?COLORS.muted:"#000", fontWeight:"700", cursor:cart.length===0?"not-allowed":"pointer", fontFamily:"inherit"}}>{t.next}</button>
                </div>
              </>
            )}
            {step===2 && (
              <>
                <div style={{fontWeight:"700", marginBottom:"14px"}}>{t.choosePayment}</div>
                <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"8px", marginBottom:"16px"}}>
                  {PAYMENT_APPS.map(p => selected.payments?.[p.id] ? <button key={p.id} onClick={() => setSelectedPayApp(p.id)} style={{padding:"12px", borderRadius:"12px", border: selectedPayApp===p.id?`2px solid ${p.color}`:`2px solid ${COLORS.border}`, background: selectedPayApp===p.id?`${p.color}22`:COLORS.bg, color: selectedPayApp===p.id?p.color:COLORS.muted, cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"13px"}}>{p.name}</button> : null)}
                </div>
                {selectedPayApp && stadiumPayNum && (
                  <div style={{background:COLORS.bg, borderRadius:"12px", padding:"14px", marginBottom:"16px"}}>
                    <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"10px"}}>
                      {t.sendAmount} <strong style={{color:COLORS.accent, fontSize:"19px"}}>{totalPrice}</strong>
                      {cart.length>1 && <span style={{color:"#7C4DFF", fontSize:"11px"}}> ({cart.length} {L("sessions")})</span>}
                    </div>
                    {/* ðŸ“‹ Ø±Ù‚Ù… Ø§Ù„Ø¯ÙØ¹ Ù‚Ø§Ø¨Ù„ Ù„Ù„Ù†Ø³Ø® */}
                    <div onClick={() => copyText(stadiumPayNum)} style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", background:`${payApp?.color}18`, border:`1px solid ${payApp?.color}44`, borderRadius:"11px", padding:"11px 14px", cursor:"pointer"}}>
                      <span style={{fontSize:"20px", fontWeight:"800", color:payApp?.color, letterSpacing:"2px"}}>{stadiumPayNum}</span>
                      <span style={{display:"flex", alignItems:"center", gap:"5px", color:payApp?.color, fontSize:"11px", fontWeight:"700", whiteSpace:"nowrap"}}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="12" height="12" rx="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        {L("copyNum")}
                      </span>
                    </div>
                    <div style={{color:COLORS.muted, fontSize:"12px", marginTop:"7px"}}>{t.via} {payApp?.name}</div>
                  </div>
                )}
                <label style={lbl}>{t.serialNum}</label>
                <input style={inp} placeholder={t.enterSerial} maxLength={19} value={transactionNum} onChange={e => setTransactionNum(e.target.value)}/>
                <label style={lbl}>{L("proof")}</label>
                <label style={{display:"block", width:"100%", padding:"14px", background: proofUrl?"#80D03022":COLORS.bg, border:`2px dashed ${proofUrl?COLORS.accent:COLORS.border}`, borderRadius:"12px", color: proofUrl?COLORS.accent:COLORS.muted, fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", textAlign:"center", marginBottom:"16px", boxSizing:"border-box"}}>
                  {uploading ? L("uploading") : proofUrl ? "âœ… " + L("proof") : L("uploadProof")}
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e => handleUploadProof(e.target.files[0])}/>
                </label>
                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={() => setStep(1)} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.back}</button>
                  <button disabled={!selectedPayApp||!transactionNum||!proofUrl} onClick={handleBook} style={{flex:2, padding:"12px", background:(!selectedPayApp||!transactionNum||!proofUrl)?COLORS.bg:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", color:(!selectedPayApp||!transactionNum||!proofUrl)?COLORS.muted:"#000", fontWeight:"700", cursor:(!selectedPayApp||!transactionNum||!proofUrl)?"not-allowed":"pointer", fontFamily:"inherit"}}>{t.confirmBooking}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:"1px solid #FF444444", width:"100%", maxWidth:"400px", padding:"28px", textAlign:"center"}}>
            <div style={{fontSize:"40px", marginBottom:"12px"}}>ðŸ—‘</div>
            <div style={{fontSize:"16px", fontWeight:"800", marginBottom:"8px"}}>{t.deleteStadium}</div>
            <div style={{color:COLORS.muted, marginBottom:"20px"}}>{t.deleteConfirm} {confirmDelete.name}ØŸ</div>
            <div style={{display:"flex", gap:"12px"}}>
              <button onClick={() => setConfirmDelete(null)} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.cancel}</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{flex:1, padding:"12px", background:"#FF4444", border:"none", borderRadius:"12px", color:"#fff", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}

      {/* ðŸ”” Ù†Ø§ÙØ°Ø© Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„ØªÙ‚ÙŠÙŠÙ… â€” Ù…Ù†ÙØµÙ„Ø© Ø¹Ù† Ø§Ù„Ø­Ø¬ÙˆØ²Ø§ØªØŒ ØªÙØ¸Ù‡Ø± ÙÙ‚Ø· Ù…Ø§ ÙŠØ³ØªØ­Ù‚ ØªÙ‚ÙŠÙŠÙ…Ø§Ù‹ */}
      {showRateNotifs && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:150, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setShowRateNotifs(false)}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"420px", maxHeight:"78vh", display:"flex", flexDirection:"column"}}>
            <div style={{padding:"20px 20px 12px", fontSize:"18px", fontWeight:"800", display:"flex", alignItems:"center", gap:"8px"}}>ðŸ”” {lang==="ar"?"Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª":lang==="fr"?"Notifications":"Notifications"}</div>
            <div style={{overflowY:"auto", padding:"0 20px 20px"}}>
              {myBookings.filter(b => canRate(b)).length === 0 ? (
                <div style={{textAlign:"center", padding:"40px 10px", color:COLORS.muted}}>
                  <div style={{fontSize:"40px", marginBottom:"10px"}}>ðŸ””</div>
                  <div style={{fontSize:"13px"}}>{lang==="ar"?"Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø¬Ø¯ÙŠØ¯Ø©":lang==="fr"?"Aucune nouvelle notification":"No new notifications"}</div>
                </div>
              ) : myBookings.filter(b => canRate(b)).map((b,i) => (
                <div key={i} style={{background:"#FFD70012", border:"1px solid #FFD70033", borderRadius:"12px", padding:"14px", marginBottom:"10px"}}>
                  <div style={{fontWeight:"700", fontSize:"14px", marginBottom:"2px"}}>{b.stadium_name}</div>
                  <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"10px"}}>ðŸ“… {b.date} â€” {b.hour}:00</div>
                  <div style={{fontSize:"12px", color:"#FFD700", fontWeight:"700", marginBottom:"8px"}}>{L("rateTitle")}</div>
                  <button onClick={() => { setRateBooking(b); setRateStars(0); setRateText(""); setShowRateNotifs(false); }} style={{width:"100%", padding:"10px", background:"linear-gradient(135deg,#FFD700,#FF9500)", border:"none", borderRadius:"10px", fontWeight:"800", fontSize:"13px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{L("rateNow")}</button>
                </div>
              ))}
            </div>
            <div style={{padding:"0 20px 20px"}}>
              <button onClick={() => setShowRateNotifs(false)} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{lang==="ar"?"Ø¥ØºÙ„Ø§Ù‚":lang==="fr"?"Fermer":"Close"}</button>
            </div>
          </div>
        </div>
      )}

      {/* â­ Ù†Ø§ÙØ°Ø© Ø§Ù„ØªÙ‚ÙŠÙŠÙ… */}
      {rateBooking && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setRateBooking(null)}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:"1px solid #FFD70033", width:"100%", maxWidth:"400px", padding:"28px", textAlign:"center"}}>
            <div style={{fontSize:"15px", fontWeight:"800", marginBottom:"4px"}}>{rateBooking.stadium_name}</div>
            <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"18px"}}>ðŸ“… {rateBooking.date} â€” {rateBooking.hour}:00</div>

            <div style={{display:"flex", gap:"8px", justifyContent:"center", marginBottom:"18px"}}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRateStars(n)} style={{background:"none", border:"none", cursor:"pointer", fontSize:"36px", padding:0, lineHeight:1, filter: n <= rateStars ? "none" : "grayscale(1) opacity(0.35)", transition:"filter .15s"}}>â­</button>
              ))}
            </div>

            <textarea
              value={rateText}
              onChange={e => setRateText(e.target.value.slice(0, 300))}
              placeholder={L("rateComment")}
              rows={3}
              style={{width:"100%", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", padding:"12px", color:"#fff", fontSize:"14px", fontFamily:"inherit", resize:"none", marginBottom:"16px", boxSizing:"border-box", outline:"none", textAlign:lang==="ar"?"right":"left"}}
            />

            <button onClick={submitRating} disabled={!rateStars} style={{width:"100%", padding:"14px", background: rateStars ? "linear-gradient(135deg,#FFD700,#FF9500)" : COLORS.bg, border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor: rateStars ? "pointer" : "not-allowed", fontFamily:"inherit", color: rateStars ? "#000" : COLORS.muted}}>{L("rateSend")}</button>
            <button onClick={() => setRateBooking(null)} style={{width:"100%", padding:"11px", background:"transparent", border:"none", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"6px", fontSize:"13px"}}>{t.cancel}</button>
          </div>
        </div>
      )}

      {/* ðŸ‘‘ Ù†Ø§ÙØ°Ø© Ø¯Ø®ÙˆÙ„ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… */}
      {showAdminLogin && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", backdropFilter:"blur(6px)"}} onClick={e => e.target===e.currentTarget && setShowAdminLogin(false)}>
          <div style={{background:`linear-gradient(160deg, ${COLORS.card}, #0a1020)`, borderRadius:"28px", border:"1px solid #7C4DFF44", width:"100%", maxWidth:"380px", padding:"36px 28px", textAlign:"center", boxShadow:"0 30px 80px rgba(124,77,255,0.25)"}}>
            <div style={{width:"72px", height:"72px", margin:"0 auto 18px", borderRadius:"50%", background:"linear-gradient(135deg,#7C4DFF,#80D030)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"34px", boxShadow:"0 10px 30px rgba(124,77,255,0.4)"}}>ðŸ‘‘</div>
            <div style={{fontSize:"20px", fontWeight:"900", marginBottom:"6px", background:"linear-gradient(135deg,#7C4DFF,#80D030)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>{L("adminTitle")}</div>
            <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"24px"}}>ðŸ”’ {L("adminPassLabel")}</div>

            <div style={{position:"relative", marginBottom:"18px"}}>
              <input
                type={showPass.admin ? "text" : "password"}
                name="malaabi-admin"
                autoComplete="new-password"
                autoFocus
                value={adminPassInput}
                onChange={e => setAdminPassInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                style={{width:"100%", background:COLORS.bg, border:"1px solid #7C4DFF44", borderRadius:"14px", padding:"15px 46px", color:"#fff", fontSize:"17px", fontFamily:"inherit", textAlign:"center", letterSpacing:"3px", boxSizing:"border-box", outline:"none"}}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
              <button type="button" onClick={() => setShowPass(p => ({ ...p, admin: !p.admin }))}
                style={{position:"absolute", insetInlineEnd:"14px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color: showPass.admin ? "#7C4DFF" : COLORS.muted, padding:"4px", display:"flex", alignItems:"center"}}>
                <EyeIcon open={!!showPass.admin}/>
              </button>
            </div>

            <button onClick={handleAdminLogin} disabled={adminChecking} style={{width:"100%", padding:"15px", background: adminChecking ? COLORS.bg : "linear-gradient(135deg,#7C4DFF,#80D030)", border:"none", borderRadius:"14px", fontWeight:"900", fontSize:"16px", cursor: adminChecking ? "wait" : "pointer", fontFamily:"inherit", color: adminChecking ? COLORS.muted : "#fff"}}>
              {adminChecking ? L("checking") : L("adminEnter")}
            </button>
            <button onClick={() => { setShowAdminLogin(false); setAdminPassInput(""); }} style={{width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"8px", fontSize:"13px"}}>
              {lang==="ar" ? "Ø¥Ù„ØºØ§Ø¡" : lang==="fr" ? "Annuler" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* ðŸ” ØªØ°ÙƒÙŠØ± Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù‚Ø¯ÙŠÙ…Ø© Ø¨ØªØ­Ø¯ÙŠØ¯ Ø³Ø¤Ø§Ù„ Ø³Ø±ÙŠ */}
      {user && !user.security_question && showSetupQ && tab==="client" && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:150, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:"1px solid #FF6D0044", width:"100%", maxWidth:"400px", padding:"28px"}}>
            <div style={{textAlign:"center", marginBottom:"16px"}}>
              <div style={{fontSize:"42px", marginBottom:"8px"}}>ðŸ”</div>
              <div style={{fontSize:"18px", fontWeight:"800", color:"#FF6D00"}}>{L("setupQTitle")}</div>
            </div>
            <div style={{color:COLORS.muted, fontSize:"13px", lineHeight:"1.9", marginBottom:"18px", textAlign:lang==="ar"?"right":"left"}}>{L("setupQDesc")}</div>
            <label style={lbl}>{L("securityQ")}</label>
            <select style={sel} value={setupQuestion} onChange={e => setSetupQuestion(e.target.value)}>
              <option style={opt} value="">{L("chooseQ")}</option>
              {SECURITY_QUESTIONS.map(q => <option style={opt} key={q.id} value={q.id}>{q[lang]}</option>)}
            </select>
            {setupQuestion && (
              <>
                <label style={lbl}>{L("yourAnswer")}</label>
                <input style={{...inp, marginBottom:"6px"}} value={setupAnswer} onChange={e => setSetupAnswer(e.target.value)}/>
                <div style={{color:"#FF6D00", fontSize:"12px", marginBottom:"14px"}}>âš ï¸ {L("answerHint")}</div>
                <label style={lbl}>ðŸ”’ {L("confirmIdentity")}</label>
                {passField({ id:"setup", value:setupPass, placeholder:t.enter4, onChange:e => setSetupPass(e.target.value.replace(/\D/g,"")) })}
              </>
            )}
            <button onClick={saveSecurityQ} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{L("saveQ")}</button>
            <button onClick={() => setShowSetupQ(false)} style={{width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"8px", fontSize:"13px"}}>{L("later")}</button>
          </div>
        </div>
      )}

      {toast && <div style={{position:"fixed", bottom:"80px", left:"50%", transform:"translateX(-50%)", background:toast.color, color:"#fff", padding:"14px 28px", borderRadius:"16px", fontWeight:"700", zIndex:999, maxWidth:"90%", textAlign:"center"}}>{toast.msg}</div>}
    </div>
    );
  }

  return mainContent;
}

