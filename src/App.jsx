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
// ⚠️ رقم التواصل — غيّره إذا أردت رقماً موريتانياً (222...)
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

// 🔐 استدعاء دالة المصادقة الخادمية — جدول users مقفل أمام المتصفح
const authApi = async (action, payload = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke("auth-api", {
      body: { action, ...payload },
    });
    if (error) {
      // نحاول قراءة رسالة الخطأ القادمة من الدالة
      let code = "network";
      try { code = (await error.context?.json())?.error || "network"; } catch (_e) { /* تجاهل */ }
      return { error: code };
    }
    return data ?? { error: "network" };
  } catch (_e) {
    return { error: "network" };
  }
};

// 🏟 استدعاء دالة الملاعب الخادمية — أكواد المالكين والمستحقات لا تمر بالمتصفح
const stadiumApi = async (action, payload = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke("stadium-api", {
      body: { action, ...payload },
    });
    if (error) {
      let code = "network";
      try { code = (await error.context?.json())?.error || "network"; } catch (_e) { /* تجاهل */ }
      return { error: code };
    }
    return data ?? { error: "network" };
  } catch (_e) {
    return { error: "network" };
  }
};

// 🖼 صور احتياطية من مصدر مختلف (تُستعمل إذا فشل تحميل الصورة الأصلية)
const FALLBACK_IMAGES = [
  "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/54567/football-stadium-arena-crowd-54567.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=400",
];

// 🎲 اختيار صورة أقل استعمالاً حتى لا تتكرر الصور بين الملاعب
const pickImage = (existing = []) => {
  const counts = STADIUM_IMAGES.map(u => existing.filter(s => s.image === u).length);
  const min = Math.min(...counts);
  const pool = STADIUM_IMAGES.filter((u, i) => counts[i] === min);
  return pool[Math.floor(Math.random() * pool.length)];
};

// 🖼 صورة الملعب: المخزّنة، وإلا واحدة ثابتة حسب رقمه
const stadiumImage = (s) => s.image || STADIUM_IMAGES[(s.id || 0) % STADIUM_IMAGES.length];

// 🛟 إذا فشل تحميل الصورة، نجرب البدائل ثم نخفيها ليظهر التدرج اللوني
const onImgError = (e, seed = 0) => {
  const tried = parseInt(e.target.dataset.try || "0", 10);
  if (tried < FALLBACK_IMAGES.length) {
    e.target.dataset.try = String(tried + 1);
    e.target.src = FALLBACK_IMAGES[(seed + tried) % FALLBACK_IMAGES.length];
  } else {
    e.target.style.display = "none";
  }
};

// 🔐 الأسئلة السرية لاستعادة كلمة السر
const SECURITY_QUESTIONS = [
  { id:"q1", ar:"ما اسم الحي الذي نشأت فيه؟", fr:"Dans quel quartier avez-vous grandi ?", en:"Which neighborhood did you grow up in?" },
  { id:"q2", ar:"ما اسم أول ملعب لعبت فيه؟", fr:"Nom du premier terrain où vous avez joué ?", en:"Name of the first field you played on?" },
  { id:"q3", ar:"ما اسم فريقك المفضل؟", fr:"Quelle est votre équipe préférée ?", en:"What is your favorite team?" },
  { id:"q4", ar:"ما اسم أستاذك المفضل؟", fr:"Nom de votre professeur préféré ?", en:"Your favorite teacher's name?" },
  { id:"q5", ar:"ما اسم صديق طفولتك؟", fr:"Nom de votre ami d'enfance ?", en:"Your childhood friend's name?" },
];
const qText = (id, lang) => SECURITY_QUESTIONS.find(q => q.id === id)?.[lang] || "";

// 📞 أرقام الهاتف الموريتانية: 8 أرقام تبدأ بـ 2 أو 3 أو 4
const PHONE_PREFIXES = ["2","3","4"];
const cleanPhone = (v) => {
  let d = v.replace(/\D/g, "");
  while (d && !PHONE_PREFIXES.includes(d[0])) d = d.slice(1);
  return d.slice(0, 8);
};
const isValidPhone = (p) => /^[234]\d{7}$/.test(p);

// 📍 روابط الخرائط
const mapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;
const directionsLink = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
const hasLocation = (s) => s && s.latitude != null && s.longitude != null;

// 📏 حساب المسافة بالكيلومتر بين نقطتين (صيغة Haversine)
const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const aboutText = {
  ar: "ملاعبي هو أول تطبيق موريتاني متخصص في حجز ملاعب كرة القدم إلكترونياً، يجمع بين الزبائن وأصحاب الملاعب في مكان واحد بطريقة سريعة وآمنة وبلا تعقيد.\n\nتصفّح الملاعب القريبة منك، اطّلع على الأسعار والمواعيد المتاحة لحظياً، واحجز موعدك في دقائق معدودة. ادفع بسهولة عبر تطبيقات الدفع المحلية، واحفظ ملاعبك المفضّلة للرجوع إليها بسرعة عند الحاجة. تصلك إشعارات فورية بحالة حجزك، وتبقى كل تفاصيل ملاعبك وحجوزاتك في مكان واحد، بلا مكالمات هاتفية وبلا انتظار.",
  fr: "Malaabi est la première application mauritanienne dédiée à la réservation de terrains de football en ligne, réunissant clients et propriétaires de terrains en un seul endroit, de façon rapide, sécurisée et sans complications.\n\nParcourez les terrains proches de vous, consultez les prix et les créneaux disponibles en temps réel, et réservez en quelques minutes seulement. Payez facilement via les applications de paiement locales, et enregistrez vos terrains favoris pour les retrouver rapidement. Recevez des notifications instantanées sur l'état de votre réservation, et gardez tous les détails de vos terrains et réservations au même endroit, sans appels téléphoniques ni attente.",
  en: "Malaabi is Mauritania's first app dedicated to booking football fields online, bringing clients and field owners together in one place — quickly, securely, and without hassle.\n\nBrowse fields near you, check live prices and available time slots, and book in just a few minutes. Pay easily through local payment apps, and save your favorite fields for quick access whenever you need them. Get instant notifications on your booking status, and keep all your field and booking details in one place — no phone calls, no waiting.",
};

const TXT = {
  ownerLogin: { ar:"صاحب ملعب", fr:"Propriétaire", en:"Owner" },
  ownerCode: { ar:"كود صاحب الملعب", fr:"Code propriétaire", en:"Owner code" },
  enterCode: { ar:"ادخل الكود", fr:"Entrez le code", en:"Enter code" },
  wrongCode: { ar:"الكود غير صحيح", fr:"Code incorrect", en:"Wrong code" },
  suspended: { ar:"ملعبك معلق، يرجى التواصل مع الإدارة", fr:"Terrain suspendu", en:"Stadium suspended" },
  dueAmount: { ar:"المبلغ المستحق عليك", fr:"Montant dû", en:"Amount due" },
  commission: { ar:"نسبة التطبيق", fr:"Commission", en:"Commission" },
  dues: { ar:"المستحقات", fr:"Dûs", en:"Dues" },
  totalDues: { ar:"إجمالي المستحقات", fr:"Total dû", en:"Total due" },
  resetDue: { ar:"تصفير المبلغ", fr:"Réinitialiser", en:"Reset" },
  suspend: { ar:"تعليق", fr:"Suspendre", en:"Suspend" },
  activate: { ar:"تفعيل", fr:"Activer", en:"Activate" },
  handledBy: { ar:"تمت المعالجة من طرف", fr:"Traité par", en:"Handled by" },
  owner: { ar:"صاحب الملعب", fr:"Propriétaire", en:"Owner" },
  proof: { ar:"إثبات الدفع (صورة)", fr:"Preuve de paiement", en:"Payment proof" },
  uploadProof: { ar:"📷 ارفع لقطة الشاشة", fr:"📷 Télécharger", en:"📷 Upload" },
  viewProof: { ar:"📷 عرض الإثبات", fr:"📷 Voir preuve", en:"📷 View proof" },
  proofRequired: { ar:"يرجى رفع إثبات الدفع", fr:"Preuve requise", en:"Proof required" },
  uploading: { ar:"جاري الرفع...", fr:"Envoi...", en:"Uploading..." },
  ownerCodeIs: { ar:"كود صاحب الملعب", fr:"Code propriétaire", en:"Owner code" },
  active: { ar:"نشط", fr:"Actif", en:"Active" },
  suspendedS: { ar:"معلق", fr:"Suspendu", en:"Suspended" },
  allBookings: { ar:"كل الحجوزات", fr:"Réservations", en:"All bookings" },
  viewOnly: { ar:"للمشاهدة فقط", fr:"Lecture seule", en:"View only" },
  waiting: { ar:"قيد الانتظار", fr:"En attente", en:"Pending" },
  accepted2: { ar:"تم القبول", fr:"Accepté", en:"Accepted" },
  rejected2: { ar:"تم الرفض", fr:"Refusé", en:"Rejected" },
  newBooking: { ar:"حجز جديد", fr:"Nouvelle réservation", en:"New booking" },
  bookingAccepted: { ar:"تم قبول حجزك", fr:"Réservation confirmée", en:"Booking confirmed" },
  bookingRejected: { ar:"تم رفض حجزك", fr:"Réservation refusée", en:"Booking rejected" },
  // 📍 نصوص الموقع
  location: { ar:"موقع الملعب", fr:"Localisation du terrain", en:"Field location" },
  myLocation: { ar:"📍 موقعي الحالي", fr:"📍 Ma position", en:"📍 My location" },
  checkLocation: { ar:"🗺 تحقق من الموقع", fr:"🗺 Vérifier", en:"🗺 Check on map" },
  locating: { ar:"📍 جاري تحديد الموقع...", fr:"📍 Localisation...", en:"📍 Locating..." },
  locationSet: { ar:"✅ تم تحديد الموقع", fr:"✅ Position définie", en:"✅ Location set" },
  locationFailed: { ar:"تعذر تحديد الموقع", fr:"Échec de localisation", en:"Location failed" },
  locationDenied: { ar:"رفضت إذن الموقع — فعّله من إعدادات الجهاز", fr:"Permission refusée — activez la localisation dans les réglages", en:"Permission denied — enable location in device settings" },
  locationTimeout: { ar:"انتهت المهلة — جرّب في مكان مفتوح", fr:"Délai dépassé — essayez en extérieur", en:"Timed out — try in an open area" },
  locationUnavailable: { ar:"تعذر تحديد موقعك الآن، حاول مجدداً", fr:"Position indisponible, réessayez", en:"Position unavailable, try again" },
  noGeo: { ar:"المتصفح لا يدعم تحديد الموقع", fr:"Géolocalisation non supportée", en:"Geolocation not supported" },
  directions: { ar:"📍 الموقع", fr:"📍 Localisation", en:"📍 Location" },
  nearestBtn: { ar:"🎯 الأقرب لي", fr:"🎯 Le plus proche", en:"🎯 Nearest to me" },
  showAllBtn: { ar:"عرض الكل", fr:"Tout afficher", en:"Show all" },
  noNearby: { ar:"لا توجد ملاعب بمواقع محددة قريبة منك", fr:"Aucun terrain géolocalisé", en:"No located fields nearby" },
  showOnMap: { ar:"📍 عرض على الخريطة", fr:"📍 Voir sur la carte", en:"📍 View on map" },
  noLocation: { ar:"لم يحدد الموقع بعد", fr:"Position non définie", en:"No location yet" },
  sortNearest: { ar:"الأقرب إليّ", fr:"Le plus proche", en:"Nearest to me" },
  kmAway: { ar:"كم منك", fr:"km de vous", en:"km away" },
  enableLocation: { ar:"فعّل موقعك لعرض المسافة", fr:"Activez votre position", en:"Enable location for distance" },
  // 🔑 شاشة الدخول
  forgotPass: { ar:"نسيت كلمة السر؟", fr:"Mot de passe oublié ?", en:"Forgot password?" },
  createNewAccount: { ar:"إنشاء حساب جديد", fr:"Créer un nouveau compte", en:"Create new account" },
  haveAccount: { ar:"لديك حساب؟ تسجيل الدخول", fr:"Déjà un compte ? Se connecter", en:"Have an account? Log in" },
  ownerEntry: { ar:"🏟 دخول أصحاب الملاعب", fr:"🏟 Espace propriétaires", en:"🏟 Field owners" },
  backToLogin: { ar:"← رجوع لتسجيل الدخول", fr:"← Retour à la connexion", en:"← Back to log in" },
  forgotTitle: { ar:"استعادة كلمة السر", fr:"Récupérer le mot de passe", en:"Recover password" },
  forgotStep1: { ar:"أدخل رقم هاتفك المسجل", fr:"Entrez votre numéro enregistré", en:"Enter your registered phone" },
  next2: { ar:"التالي", fr:"Suivant", en:"Next" },
  phoneNotFound: { ar:"لا يوجد حساب بهذا الرقم", fr:"Aucun compte avec ce numéro", en:"No account with this number" },
  noQuestionSet: { ar:"هذا الحساب لم يحدد سؤالاً سرياً. تواصل معنا عبر واتساب.", fr:"Aucune question secrète définie. Contactez-nous.", en:"No security question set. Contact us." },
  yourAnswer: { ar:"جوابك", fr:"Votre réponse", en:"Your answer" },
  wrongAnswer: { ar:"الجواب غير صحيح", fr:"Réponse incorrecte", en:"Wrong answer" },
  verify: { ar:"تحقق", fr:"Vérifier", en:"Verify" },
  newPass: { ar:"كلمة السر الجديدة (4 أرقام)", fr:"Nouveau mot de passe (4 chiffres)", en:"New password (4 digits)" },
  confirmPass: { ar:"تأكيد كلمة السر", fr:"Confirmer le mot de passe", en:"Confirm password" },
  passMismatch: { ar:"كلمتا السر غير متطابقتين", fr:"Les mots de passe ne correspondent pas", en:"Passwords don't match" },
  savePass: { ar:"حفظ كلمة السر", fr:"Enregistrer", en:"Save password" },
  passChanged: { ar:"✅ تم تغيير كلمة السر، يمكنك الدخول الآن", fr:"✅ Mot de passe modifié", en:"✅ Password changed" },
  securityQ: { ar:"السؤال السري", fr:"Question secrète", en:"Security question" },
  chooseQ: { ar:"اختر سؤالاً", fr:"Choisissez une question", en:"Choose a question" },
  answerHint: { ar:"احفظ جوابك جيداً — ستحتاجه إذا نسيت كلمة السر", fr:"Retenez bien votre réponse", en:"Remember your answer well" },
  setupQTitle: { ar:"احمِ حسابك", fr:"Protégez votre compte", en:"Protect your account" },
  setupQDesc: { ar:"حدد سؤالاً سرياً حتى تتمكن من استعادة حسابك بنفسك إذا نسيت كلمة السر.", fr:"Définissez une question secrète pour récupérer votre compte.", en:"Set a security question so you can recover your account yourself." },
  saveQ: { ar:"حفظ السؤال", fr:"Enregistrer", en:"Save question" },
  later: { ar:"لاحقاً", fr:"Plus tard", en:"Later" },
  qSaved: { ar:"✅ تم حفظ السؤال السري", fr:"✅ Question enregistrée", en:"✅ Question saved" },
  uploadImage: { ar:"📷 اختر صورة من ملفاتك", fr:"📷 Choisir une image", en:"📷 Choose an image" },
  imageUploaded: { ar:"✅ تم رفع الصورة", fr:"✅ Image envoyée", en:"✅ Image uploaded" },
  removeImage: { ar:"🗑 حذف الصورة", fr:"🗑 Supprimer l\'image", en:"🗑 Remove image" },
  imageTooBig: { ar:"الصورة كبيرة جداً (الحد 5 ميغا)", fr:"Image trop volumineuse (max 5 Mo)", en:"Image too large (max 5MB)" },
  uploadFailed: { ar:"فشل رفع الصورة", fr:"Échec de l\'envoi", en:"Upload failed" },
  orPasteLink: { ar:"أو الصق رابط صورة", fr:"Ou collez un lien", en:"Or paste an image link" },
  imageUrl: { ar:"رابط صورة الملعب (اختياري)", fr:"Lien de l\'image (optionnel)", en:"Image URL (optional)" },
  imageHint: { ar:"اتركه فارغاً لاختيار صورة تلقائياً", fr:"Laissez vide pour une image automatique", en:"Leave empty for an automatic image" },
  adminTitle: { ar:"لوحة التحكم", fr:"Panneau d\'administration", en:"Admin panel" },
  adminPassLabel: { ar:"كلمة السر", fr:"Mot de passe", en:"Password" },
  adminEnter: { ar:"دخول", fr:"Entrer", en:"Enter" },
  wrongPass: { ar:"كلمة السر خاطئة", fr:"Mot de passe incorrect", en:"Wrong password" },
  commanderWelcome: { ar:"مرحباً بك أيها القائد 👑", fr:"Bienvenue Commandant 👑", en:"Welcome Commander 👑" },
  checking: { ar:"جاري التحقق...", fr:"Vérification...", en:"Checking..." },
  pickSlots: { ar:"اختر مواعيدك", fr:"Choisissez vos créneaux", en:"Pick your slots" },
  myCart: { ar:"مواعيدك", fr:"Vos créneaux", en:"Your slots" },
  cartEmpty: { ar:"لم تختر أي موعد بعد", fr:"Aucun créneau choisi", en:"No slots picked yet" },
  maxSlots: { ar:"الحد الأقصى 70 موعداً", fr:"Maximum 70 créneaux", en:"Max 70 slots" },
  copied: { ar:"✅ تم نسخ الرقم", fr:"✅ Numéro copié", en:"✅ Number copied" },
  copyNum: { ar:"نسخ", fr:"Copier", en:"Copy" },
  blockHours: { ar:"🚫 إغلاق مواعيد", fr:"🚫 Fermer des créneaux", en:"🚫 Block slots" },
  pickDate: { ar:"اختر التاريخ", fr:"Choisissez la date", en:"Pick a date" },
  pickHours: { ar:"اختر الساعات المراد إغلاقها", fr:"Choisissez les heures", en:"Pick hours to block" },
  saveBlock: { ar:"إغلاق المواعيد المحددة", fr:"Fermer les créneaux", en:"Block selected" },
  blockedList: { ar:"المواعيد المغلقة", fr:"Créneaux fermés", en:"Blocked slots" },
  noBlocked: { ar:"لا توجد مواعيد مغلقة", fr:"Aucun créneau fermé", en:"No blocked slots" },
  blockDone: { ar:"🚫 تم إغلاق المواعيد", fr:"🚫 Créneaux fermés", en:"🚫 Slots blocked" },
  unblockDone: { ar:"✅ تم فتح الموعد", fr:"✅ Créneau rouvert", en:"✅ Slot reopened" },
  allTaken: { ar:"كل الساعات المحددة محجوزة", fr:"Toutes ces heures sont réservées", en:"All selected hours are booked" },
  bookedHour: { ar:"محجوز", fr:"Réservé", en:"Booked" },
  repeat: { ar:"🔁 كرّر أسبوعياً", fr:"🔁 Répéter chaque semaine", en:"🔁 Repeat weekly" },
  weeks: { ar:"أسابيع", fr:"semaines", en:"weeks" },
  totalAmount: { ar:"المبلغ الإجمالي", fr:"Montant total", en:"Total amount" },
  sessions: { ar:"مواعيد", fr:"créneaux", en:"sessions" },
  slotBusy: { ar:"محجوز", fr:"occupé", en:"busy" },
  noSlotsLeft: { ar:"كل المواعيد محجوزة — اختر وقتاً آخر", fr:"Tous occupés — choisissez un autre horaire", en:"All busy — pick another time" },
  groupBooking: { ar:"حجز متكرر", fr:"Réservation récurrente", en:"Recurring booking" },
  acceptAll: { ar:"قبول الكل", fr:"Tout accepter", en:"Accept all" },
  rejectAll: { ar:"رفض الكل", fr:"Tout refuser", en:"Reject all" },
  rateTitle: { ar:"كيف كانت تجربتك؟", fr:"Comment était votre expérience ?", en:"How was your experience?" },
  rateSend: { ar:"إرسال التقييم", fr:"Envoyer l\'avis", en:"Send rating" },
  rateComment: { ar:"تعليق (اختياري)", fr:"Commentaire (optionnel)", en:"Comment (optional)" },
  rateThanks: { ar:"⭐ شكراً لتقييم الملعب", fr:"⭐ Merci d\'avoir évalué le terrain", en:"⭐ Thanks for rating the field" },
  yourRating: { ar:"تقييمك", fr:"Votre note", en:"Your rating" },
  rateTooEarly: { ar:"لم ينته موعد الحجز بعد", fr:"La réservation n\'est pas terminée", en:"Booking not finished yet" },
  alreadyRated: { ar:"قيّمت هذا الحجز مسبقاً", fr:"Déjà évalué", en:"Already rated" },
  pickStars: { ar:"اختر عدد النجوم", fr:"Choisissez les étoiles", en:"Pick stars" },
  ratings: { ar:"التقييمات", fr:"Avis", en:"Ratings" },
  noRatings: { ar:"لا توجد تقييمات بعد", fr:"Aucun avis", en:"No ratings yet" },
  sortRating: { ar:"الأعلى تقييماً", fr:"Mieux notés", en:"Top rated" },
  delWilaya: { ar:"حذف الولاية", fr:"Supprimer la wilaya", en:"Delete wilaya" },
  wilayaEmpty: { ar:"حذف الولاية نهائياً؟", fr:"Supprimer définitivement ?", en:"Delete permanently?" },
  wilayaHasStadiums: { ar:"ملاعب — سيُحذفون هم وحجوزاتهم نهائياً! متأكد؟", fr:"terrains seront supprimés avec leurs réservations ! Confirmer ?", en:"fields will be deleted with their bookings! Sure?" },
  wilayaDeleted: { ar:"تم حذف الولاية", fr:"Wilaya supprimée", en:"Wilaya deleted" },
  myCode: { ar:"كودي", fr:"Mon code", en:"My code" },
  bookingCode: { ar:"كود الحجز", fr:"Code réservation", en:"Booking code" },
  changeCode: { ar:"🔄 تغيير الكود", fr:"🔑 Changer le code", en:"🔑 Change code" },
  newCodeIs: { ar:"كودك الجديد", fr:"Votre nouveau code", en:"Your new code" },
  confirmChangeCode: { ar:"سيتوقف كودك الحالي عن العمل. متأكد؟", fr:"Votre code actuel cessera de fonctionner. Confirmer ?", en:"Your current code will stop working. Sure?" },
  netError: { ar:"تعذر الاتصال بالخادم، حاول مجدداً", fr:"Connexion au serveur impossible", en:"Server connection failed" },
  confirmIdentity: { ar:"أدخل كلمة سرك للتأكيد", fr:"Entrez votre mot de passe", en:"Enter your password to confirm" },
  invalidPhone: { ar:"الرقم غير صحيح", fr:"Numéro invalide", en:"Invalid number" },
  tooManyTries: { ar:"محاولات كثيرة، حاول لاحقاً", fr:"Trop de tentatives", en:"Too many attempts" },
  // 🔒 رسائل الحجز الخادمي
  slotTakenNow: { ar:"⚠️ أحد المواعيد حُجز للتو — اختر وقتاً آخر", fr:"⚠️ Un créneau vient d\'être pris", en:"⚠️ A slot was just taken" },
  closedHour: { ar:"هذه الساعة خارج أوقات عمل الملعب", fr:"Heure hors service", en:"Hour outside working hours" },
  pastDate: { ar:"لا يمكن الحجز في وقت مضى", fr:"Créneau déjà passé", en:"That time has passed" },
  needRelogin: { ar:"يرجى تسجيل الدخول مجدداً لإتمام الحجز", fr:"Reconnectez-vous pour réserver", en:"Please log in again to book" },
  badPayment: { ar:"هذا الملعب لا يقبل وسيلة الدفع المختارة", fr:"Moyen de paiement non accepté", en:"Payment method not accepted" },
  rateNow: { ar:"⭐ قيّم هذا الحجز", fr:"⭐ Évaluer cette réservation", en:"⭐ Rate this booking" },
  // ⭐ المفضلة
  favorites: { ar:"المفضلة", fr:"Favoris", en:"Favorites" },
  addedFav: { ar:"⭐ أُضيف للمفضلة", fr:"⭐ Ajouté aux favoris", en:"⭐ Added to favorites" },
  removedFav: { ar:"أُزيل من المفضلة", fr:"Retiré des favoris", en:"Removed from favorites" },
  noFavorites: { ar:"لم تُضف أي ملعب للمفضلة بعد", fr:"Aucun terrain ajouté aux favoris", en:"No favorite fields yet" },
  noFavoritesHint: { ar:"اضغط على ♡ داخل بطاقة الملعب لإضافته هنا", fr:"Appuyez sur ♡ sur une carte pour l'ajouter ici", en:"Tap ♡ on a field card to add it here" },
  // 👋 الترحيب الشخصي
  findField: { ar:"أين تريد اللعب؟", fr:"Où voulez-vous jouer ?", en:"Where do you want to play?" },
};

export default function App() {
  // 🔒 خصائص تمنع حفظ/نسخ الشعار عبر الضغط المطوّل أو كليك يمين أو السحب
  const noCopyImgProps = { draggable: false, onContextMenu: (e) => e.preventDefault() };
  const noCopyStyle = { WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" };
  const [lang, setLang] = useState(() => localStorage.getItem("malaabi_lang") || "ar");
  const t = translations[lang];
  const L = (k) => TXT[k][lang];
  const isRTL = lang === "ar";
  const [showContact, setShowContact] = useState(false);
  // ⚽ شاشة الشعار — تظهر ٣ ثوانٍ ثم تتلاشى بنعومة فوق الصفحة الجاهزة أصلاً خلفها (بلا قفزة)
  const [splash, setSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [bottomTab, setBottomTab] = useState("stadiums");

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
  const [loading, setLoading] = useState(true);
  const [filterWilaya, setFilterWilaya] = useState("الكل");
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
  const [newImage, setNewImage] = useState("");    // 🖼 رابط صورة مخصص (اختياري)
  const [uploadingImg, setUploadingImg] = useState(false);  // 🖼 حالة رفع الصورة
  const [newLat, setNewLat] = useState("");        // 📍 الموقع
  const [newLng, setNewLng] = useState("");        // 📍 الموقع
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
  const [editImage, setEditImage] = useState("");  // 🖼 رابط صورة مخصص (اختياري)
  const [editLat, setEditLat] = useState("");      // 📍 الموقع
  const [editLng, setEditLng] = useState("");      // 📍 الموقع
  const [editPayments, setEditPayments] = useState({});
  const [editWorkingHours, setEditWorkingHours] = useState([...ALL_HOURS]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [rateEdit, setRateEdit] = useState({});
  const [myPos, setMyPos] = useState(null);        // 📍 موقع الزبون الحالي
  const [showForgot, setShowForgot] = useState(false);   // 🔑 نافذة نسيت كلمة السر
  const [forgotPhone, setForgotPhone] = useState("");     // 🔑 رقم الاستعادة
  const [forgotStep, setForgotStep] = useState(1);        // 🔑 مرحلة الاستعادة
  const [forgotUser, setForgotUser] = useState(null);     // 🔑 الحساب المستهدف
  const [forgotAnswer, setForgotAnswer] = useState("");   // 🔑 جواب السؤال السري
  const [forgotTries, setForgotTries] = useState(0);      // 🔑 عدد المحاولات
  const [newPass1, setNewPass1] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [regQuestion, setRegQuestion] = useState("");     // 🔐 سؤال التسجيل
  const [regAnswer, setRegAnswer] = useState("");         // 🔐 جواب التسجيل
  const [showSetupQ, setShowSetupQ] = useState(true);     // 🔐 نافذة الحسابات القديمة
  const [setupQuestion, setSetupQuestion] = useState("");
  const [setupAnswer, setSetupAnswer] = useState("");
  const [setupPass, setSetupPass] = useState("");   // 🔐 تأكيد الهوية قبل حفظ السؤال
  const [showAdminLogin, setShowAdminLogin] = useState(false);  // 👑 نافذة دخول اللوحة
  const [adminPassInput, setAdminPassInput] = useState("");     // 👑 كلمة السر المدخلة
  const [adminPass, setAdminPass] = useState("");               // 👑 محفوظة في الذاكرة فقط
  const [adminChecking, setAdminChecking] = useState(false);
  const [showOwnerCode, setShowOwnerCode] = useState(false);   // 🔑 إظهار كود المالك
  const [ratingsMap, setRatingsMap] = useState({});      // ⭐ معدلات الملاعب العامة
  const [myRatings, setMyRatings] = useState([]);        // ⭐ ما قيّمه الزبون
  const [rateBooking, setRateBooking] = useState(null);  // ⭐ الحجز الجاري تقييمه
  const [rateStars, setRateStars] = useState(0);
  const [rateText, setRateText] = useState("");
  const [ownerRatings, setOwnerRatings] = useState([]);  // ⭐ تقييمات ملعب المالك
  const [adminRatings, setAdminRatings] = useState([]);  // ⭐ كل التقييمات للمشرف
  const [blockedList, setBlockedList] = useState([]);    // 🚫 المواعيد المغلقة
  const [blockDate, setBlockDate] = useState(today);     // 🚫 تاريخ الإغلاق
  const [blockHoursSel, setBlockHoursSel] = useState([]);// 🚫 الساعات المختارة
  const [cart, setCart] = useState([]);                  // 🛒 سلة المواعيد
  const [showPass, setShowPass] = useState({});          // 👁 إظهار كلمات السر
  const [sessionPass, setSessionPass] = useState(() => sessionStorage.getItem("mb_sp") || "");   // 🔒 تُمحى بإغلاق التبويب
  const [myBookingsList, setMyBookingsList] = useState([]);   // 🔒 حجوزات الزبون الكاملة
  const [favorites, setFavorites] = useState([]);             // ⭐ أرقام الملاعب المفضلة للزبون

  const changeLang = (l) => { setLang(l); localStorage.setItem("malaabi_lang", l); };
  const langLabel = lang === "ar" ? "🌐 ع" : lang === "fr" ? "🌐 FR" : "🌐 EN";

  const notify = (title, body) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") new Notification(title, { body, icon: "/icon.png" });
  };

  // 👁 أيقونة العين — SVG بسيط
  const EyeIcon = ({ open }) => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12z"/>
      <circle cx="12" cy="12" r="3.2"/>
      {!open && <line x1="3" y1="21" x2="21" y2="3"/>}
    </svg>
  );

  // 🏠 أيقونات شريط التنقل — نمط خطي بسيط، مطابق لهوية العلامة
  const HomeIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5"/>
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9.5"/>
    </svg>
  );
  const HeartIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 1.5 : 1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-10-9.4C.5 7.8 2.3 4.5 5.7 4c2.2-.3 4.2.8 6.3 3 2.1-2.2 4.1-3.3 6.3-3 3.4.5 5.2 3.8 3.7 7.1-2.5 4.8-10 9.4-10 9.4z"/>
    </svg>
  );
  const PersonIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4.5 20.5c1.2-4 4-6 7.5-6s6.3 2 7.5 6"/>
    </svg>
  );
  const BellIcon = () => (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z"/>
      <path d="M10 20a2 2 0 0 0 4 0"/>
    </svg>
  );

  // 🎨 اسم العلامة بلونين — أبيض ثم أخضر على آخر الأحرف، كما في هوية ملاعبي البصرية
  const BrandName = ({ text, size = "32px" }) => {
    const upper = text.toUpperCase();
    const greenLen = Math.min(3, Math.max(1, Math.floor(upper.length / 2)));
    const head = upper.slice(0, upper.length - greenLen);
    const tail = upper.slice(upper.length - greenLen);
    return (
      <span style={{fontSize:size, fontWeight:"800", userSelect:"none", WebkitUserSelect:"none", MozUserSelect:"none", msUserSelect:"none", letterSpacing:"0.5px"}}>
        <span style={{color:"#ffffff"}}>{head}</span><span style={{color:"#80D030"}}>{tail}</span>
      </span>
    );
  };

  // ⚽ شعار موحّد بتوهج دائري خفيف خلفه — بلا drop-shadow (يمنع ظهور توهج مربّع على خلفيات CSS)
  const Logo = ({ size = 84, glow = 0.22, margin = "0 auto" }) => (
    <div style={{position:"relative", width:size, height:size, margin}}>
      <div style={{position:"absolute", inset:`-${Math.round(size*0.35)}px`, background:`radial-gradient(circle, #80D030${Math.round(glow*255).toString(16).padStart(2,"0")} 0%, transparent 68%)`, pointerEvents:"none"}}/>
      <div role="img" aria-label="malaabi" {...noCopyImgProps} style={{position:"relative", width:"100%", height:"100%", backgroundImage:"url(/logo.png)", backgroundSize:"contain", backgroundRepeat:"no-repeat", backgroundPosition:"center", ...noCopyStyle}}/>
    </div>
  );

  // 🔒 حقل كلمة سر بزر إظهار — دالة لا مكوّن، حتى لا يفقد التركيز عند الكتابة
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

  // 📋 نسخ نص إلى الحافظة
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
          {[["ar","🇲🇷 ع"],["fr","🇫🇷 FR"],["en","🏴 EN"]].map(([l, label]) => (
            <button key={l} onClick={() => { changeLang(l); setShowLangMenu(false); }} style={{display:"block", width:"100%", padding:"8px 16px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"12px", background: lang===l?`${COLORS.accent}22`:COLORS.card, color: lang===l?COLORS.accent:COLORS.muted, textAlign:"right"}}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );

  const loadData = async () => {
    setLoading(true);
    const [w, s, b, r, u] = await Promise.all([
      supabase.from("wilayas").select("*").order("id"),
      supabase.from("stadiums_public").select("*").order("id"),
      supabase.from("bookings_slots").select("*"),   // 🔒 الساعات فقط — بلا أسماء ولا أرقام
      supabase.from("stadium_ratings").select("*"),  // ⭐ المعدلات (ثلاثة تقييمات فأكثر)
      supabase.from("users_count").select("*").maybeSingle(),   // 🔐 عرض عام يُرجع العدد فقط
    ]);
    if (w.data) setWilayas(w.data.map(x => x.name));
    if (s.data) setStadiums(s.data);
    if (b.data) setBookings(b.data);
    if (u.data?.total != null) setUsersCount(u.data.total);
    if (r.data) setRatingsMap(Object.fromEntries(r.data.map(x => [x.stadium_id, x])));
    setLoading(false);
  };

  useEffect(() => {
    const t1 = setTimeout(() => setSplashFading(true), 1000);    // ثانية واحدة الآن للاختبار
    const t2 = setTimeout(() => setSplash(false), 1500);         // + نصف ثانية للتلاشي
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    // 🛟 قراءة آمنة — لو كانت القيمة تالفة نمسحها بدل أن ينهار التطبيق
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
      // 🔒 نعيد جلب حجوزاته إن كانت كلمة السر ما زالت في جلسة التبويب
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

  // 🔔 إشعارات صاحب الملعب — حجز جديد لملعبه
  useEffect(() => {
    if (!owner) return;
    const ch = supabase.channel("owner-new-" + owner.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings", filter: `stadium_id=eq.${owner.id}` }, (p) => {
        setMyBookingsList(prev => prev.some(b => b.id === p.new.id) ? prev : [...prev, p.new]);
        notify("🔔 " + L("newBooking"), `${p.new.client_name} — ${p.new.date} — ${p.new.hour}:00`);
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, [owner, lang]);

  // 🔔 إشعارات الزبون — قبول أو رفض
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("client-upd-" + user.phone)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings", filter: `client_phone=eq.${user.phone}` }, (p) => {
        setMyBookingsList(prev => prev.map(b => b.id === p.new.id ? p.new : b));
        if (p.new.status === "confirmed") notify("✅ " + L("bookingAccepted"), `${p.new.stadium_name} — ${p.new.hour}:00`);
        if (p.new.status === "rejected") notify("❌ " + L("bookingRejected"), `${p.new.stadium_name} — ${p.new.hour}:00`);
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, [user, lang]);

  const showToast = (msg, color=COLORS.accent) => { setToast({msg, color}); setTimeout(() => setToast(null), 4000); };

  // 📍 تحديد الموقع الحالي — للمشرف عند إضافة/تعديل ملعب
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

  // 📍 تحديد موقع الزبون — لحساب المسافة والترتيب حسب الأقرب
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

  // 🎯 الأقرب لي — يحدد الموقع ثم يرتب الملاعب حسب المسافة
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

  // 🔒 جلب حجوزات الزبون من الخادم بعد التحقق من هويته
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

  // 🔑 المرحلة 1 — البحث عن الحساب وجلب سؤاله السري
  const forgotFindUser = async () => {
    if (!isValidPhone(forgotPhone)) return showToast(L("invalidPhone"), "#FF4444");
    const res = await authApi("get-question", { phone: forgotPhone });
    if (res.error === "not_found") return showToast(L("phoneNotFound"), "#FF4444");
    if (res.error === "no_question") return showToast(L("noQuestionSet"), "#FF4444");
    if (res.error) return showToast(L("netError"), "#FF4444");
    setForgotUser({ phone: forgotPhone, security_question: res.question });
    setForgotStep(2); setForgotTries(0);
  };

  // 🔑 المرحلة 2 — التحقق من الجواب
  const forgotVerify = async () => {
    if (!forgotAnswer.trim()) return;
    if (forgotTries >= 5) return showToast(L("tooManyTries"), "#FF4444");
    // التحقق الفعلي يتم في الخادم عند حفظ كلمة السر — هنا ننتقل للمرحلة التالية فقط
    setForgotStep(3);
  };

  // 🔑 المرحلة 3 — حفظ كلمة سر جديدة
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

  // 🔐 حفظ السؤال السري للحسابات القديمة
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
    // نحفظ الكود مع بيانات الملعب — يُستعمل للتحقق في كل عملية لاحقة
    const ow = { ...res.stadium, owner_code: code };
    setOwner(ow);
    localStorage.setItem("malaabi_owner", JSON.stringify(ow));
    setScreen("owner"); setOwnerCodeInput("");
    loadOwnerBookings(code); loadBlocked(code);
    showToast(t.welcome + " " + ow.name);
  };

  // 🔒 جلب حجوزات صاحب الملعب من الخادم
  const loadOwnerBookings = async (code) => {
    const res = await stadiumApi("owner-bookings", { ownerCode: code || owner?.owner_code });
    if (res.bookings) setMyBookingsList(res.bookings);
    if (res.stadium) {
      const up = { ...res.stadium, owner_code: code || owner?.owner_code };
      setOwner(up); localStorage.setItem("malaabi_owner", JSON.stringify(up));
    }
  };

  // 🔒 فتح لقطة الدفع برابط مؤقت صالح خمس دقائق
  const openProof = async (bookingId) => {
    const res = await stadiumApi("proof-url", {
      ownerCode: owner?.owner_code, adminPass, payload: { bookingId },
    });
    if (res.error || !res.url) return showToast(L("netError"), "#FF4444");
    window.open(res.url, "_blank");
  };

  // 🔑 تغيير كود صاحب الملعب
  const changeOwnerCode = async () => {
    const res = await stadiumApi("owner-change-code", { ownerCode: owner?.owner_code });
    if (res.error || !res.owner_code) return showToast(L("netError"), "#FF4444");
    const up = { ...owner, owner_code: res.owner_code };
    setOwner(up); localStorage.setItem("malaabi_owner", JSON.stringify(up));
    loadOwnerBookings(res.owner_code);
    setShowOwnerCode(true);   // 🔑 نُظهر الكود الجديد ليحفظه
    showToast("🔑 " + L("newCodeIs") + ": " + res.owner_code);
  };

  const handleLogout = () => {
    localStorage.removeItem("malaabi_user");
    localStorage.removeItem("malaabi_owner");
    setUser(null); setOwner(null);
    setSessionPass(""); sessionStorage.removeItem("mb_sp"); setMyBookingsList([]); setAdminPass(""); setMyRatings([]); setOwnerRatings([]); setFavorites([]);
    setScreen("login"); setTab("client"); setBottomTab("stadiums");
  };

  // 👑 عشرون ضغطة على الكرة تفتح نافذة دخول لوحة التحكم
  const handleLogoClick = () => {
    setLogoClicks(p => {
      const n = p + 1;
      if (n >= 20) { setShowAdminLogin(true); setAdminPassInput(""); return 0; }
      return n;
    });
  };

  // 👑 التحقق من كلمة السر على الخادم — لا شيء منها في الكود
  const handleAdminLogin = async () => {
    if (!adminPassInput.trim()) return;
    setAdminChecking(true);
    const res = await stadiumApi("admin-check", { adminPass: adminPassInput });
    setAdminChecking(false);
    if (res.error === "wrong_pass") return showToast(L("wrongPass"), "#FF4444");
    if (res.error) return showToast(L("netError"), "#FF4444");
    setAdminPass(adminPassInput);      // تبقى في الذاكرة فقط، لا تُحفظ في القرص
    setAdminPassInput("");
    setShowAdminLogin(false);
    setTab("admin");
    await loadAdminData(adminPassInput);
    showToast(L("commanderWelcome"));
  };

  // 👑 جلب البيانات الكاملة للوحة التحكم
  const loadAdminData = async (pass) => {
    const res = await stadiumApi("admin-data", { adminPass: pass || adminPass });
    if (res.error) return showToast(L("netError"), "#FF4444");
    if (res.stadiums) setStadiums(res.stadiums);
    if (res.bookings) setBookings(res.bookings);
    if (res.usersCount != null) setUsersCount(res.usersCount);
    if (res.ratings) setAdminRatings(res.ratings);
  };

  // 👑 الخروج من اللوحة — تُمحى كلمة السر من الذاكرة
  const exitAdmin = () => {
    setAdminPass(""); setTab("client");
    setSearchText(""); setFilterWilaya("الكل"); setSortBy("default");   // 🧹 تنظيف الفلاتر
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
    if (error) { setUploading(false); return showToast("خطأ في الرفع", "#FF4444"); }
    // 🔒 نخزّن اسم الملف فقط — الرابط يُولَّد مؤقتاً عند العرض
    setProofUrl(fn); setUploading(false);
    showToast("✅");
  };

  // 🖼 رفع صورة الملعب من ملفات المشرف إلى Supabase Storage
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

  // 🔒 الحجز يمر بالخادم — سبعة فحوصات قبل الإدخال
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

  // ✅ صاحب الملعب فقط
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
    showToast("✅ " + t.confirmed + " — " + res.code);
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
    showToast("✅ " + L("resetDue"));
  };

  const saveRate = async (id) => {
    const v = parseFloat(rateEdit[id]);
    if (isNaN(v) || v < 0 || v > 100) return showToast("0-100", "#FF4444");
    const res = await stadiumApi("admin-set-rate", { adminPass, stadiumId: id, payload: { rate: v } });
    if (res.error) return showToast(L("netError"), "#FF4444");
    setStadiums(p => p.map(s => s.id === id ? { ...s, commission_rate: v } : s));
    showToast("✅");
  };

  const toggleSuspend = async (st) => {
    const res = await stadiumApi("admin-toggle-suspend", { adminPass, stadiumId: st.id });
    if (res.error || !res.status) return showToast(L("netError"), "#FF4444");
    const ns = res.status;
    setStadiums(p => p.map(s => s.id === st.id ? { ...s, status: ns } : s));
    showToast(ns === "suspended" ? "⛔ " + L("suspend") : "✅ " + L("activate"), ns === "suspended" ? "#FF4444" : COLORS.accent);
  };

  const openEdit = (st) => {
    setEditStadium(st); setEditName(st.name); setEditWilaya(st.wilaya); setEditHood(st.hood);
    setEditPrice(st.price); setEditOwnerPhone(st.owner_phone || ""); setEditPayments(st.payments || {});
    setEditWorkingHours(st.working_hours || [...ALL_HOURS]);
    setEditImage(st.image || "");                                 // 🖼 الصورة
    setEditLat(st.latitude != null ? String(st.latitude) : "");   // 📍 الموقع
    setEditLng(st.longitude != null ? String(st.longitude) : ""); // 📍 الموقع
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
    showToast("✅ " + L("ownerCodeIs") + ": " + res.stadium.owner_code);
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

  // 🗑 حذف ولاية — مع تحذير إن كانت تحوي ملاعب
  const handleDeleteWilaya = async (name) => {
    const info = await stadiumApi("admin-wilaya-info", { adminPass, payload: { name } });
    if (info.error) return showToast(L("netError"), "#FF4444");

    const msg = info.count > 0
      ? `⚠️ ${name}\n\n${info.count} ${L("wilayaHasStadiums")}`
      : `${name}\n\n${L("wilayaEmpty")}`;
    if (!confirm(msg)) return;

    const res = await stadiumApi("admin-delete-wilaya", { adminPass, payload: { name } });
    if (res.error) return showToast(L("netError"), "#FF4444");

    setWilayas(p => p.filter(w => w !== name));
    setStadiums(p => p.filter(s => s.wilaya !== name));
    if (filterWilaya === name) setFilterWilaya("الكل");
    showToast("🗑 " + L("wilayaDeleted") + (res.deletedStadiums ? ` (${res.deletedStadiums})` : ""), "#FF4444");
  };

  // ⭐ هل انتهى موعد الحجز؟ (وقته + ساعة اللعب)
  const bookingEnded = (b) => {
    if (!b?.date || b.hour == null) return false;
    const end = new Date(`${b.date}T${String(b.hour).padStart(2, "0")}:00:00`);
    end.setHours(end.getHours() + 1);
    return Date.now() >= end.getTime();
  };

  // ⭐ هل يستحق هذا الحجز تقييماً الآن؟
  const canRate = (b) =>
    b.status === "confirmed" && bookingEnded(b) && !myRatings.some(r => r.booking_id === b.id);

  const myRatingOf = (id) => myRatings.find(r => r.booking_id === id);

  // ⭐ جلب تقييمات الزبون
  const loadMyRatings = async (phone, pass) => {
    const ph = phone || user?.phone, pw = pass || sessionPass;
    if (!ph || !pw) return;
    const res = await stadiumApi("my-ratings", { payload: { phone: ph, password: pw } });
    if (res.ratings) setMyRatings(res.ratings);
  };

  // ⭐ جلب قائمة الملاعب المفضلة للزبون
  const loadFavorites = async (phone, pass) => {
    const ph = phone || user?.phone, pw = pass || sessionPass;
    if (!ph || !pw) return;
    const res = await stadiumApi("my-favorites", { payload: { phone: ph, password: pw } });
    if (res.favorites) setFavorites(res.favorites);
  };

  // ⭐ إضافة/إزالة ملعب من المفضلة
  const toggleFavorite = async (stadiumId) => {
    if (!user || !sessionPass) return showToast(L("needRelogin"), "#FF4444");
    // تحديث فوري في الواجهة، ثم تأكيد من الخادم
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

  // ⭐ إرسال تقييم
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
    loadData();   // تحديث المعدلات المعروضة
    showToast(L("rateThanks"), "#FFD700");
  };

  // ⭐ تقييمات ملعب المالك
  const loadOwnerRatings = async () => {
    const res = await stadiumApi("stadium-ratings", {
      ownerCode: owner?.owner_code, payload: { stadiumId: owner?.id },
    });
    if (res.ratings) setOwnerRatings(res.ratings);
  };

  // 🗑 حذف تقييم — المشرف فقط
  const deleteRating = async (id) => {
    if (!confirm(t.deleteConfirm + "؟")) return;
    const res = await stadiumApi("admin-delete-rating", { adminPass, payload: { ratingId: id } });
    if (res.error) return showToast(L("netError"), "#FF4444");
    setAdminRatings(p => p.filter(r => r.id !== id));
    showToast("🗑", "#FF4444");
  };

  // 🛒 مفتاح الموعد
  const inCart = (d, h) => cart.some(c => c.date === d && c.hour === h);

  // 🛒 إضافة أو إزالة موعد من السلة
  const toggleCartSlot = (d, h) => {
    if (inCart(d, h)) return setCart(p => p.filter(c => !(c.date === d && c.hour === h)));
    if (cart.length >= 70) return showToast(L("maxSlots"), "#FF4444");
    setCart(p => [...p, { date: d, hour: h }].sort((a,b) => a.date === b.date ? a.hour - b.hour : a.date < b.date ? -1 : 1));
  };

  // 🚫 جلب المواعيد المغلقة
  const loadBlocked = async (code) => {
    const res = await stadiumApi("owner-blocked", { ownerCode: code || owner?.owner_code });
    if (res.blocked) setBlockedList(res.blocked);
  };

  // 🚫 إغلاق الساعات المختارة
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

  // 🚫 إلغاء إغلاق موعد
  const unblockSlot = async (id) => {
    const res = await stadiumApi("owner-unblock", {
      ownerCode: owner?.owner_code, payload: { ids: [id] },
    });
    if (res.error) return showToast(L("netError"), "#FF4444");
    setBlockedList(res.blocked ?? []);
    loadData();
    showToast(L("unblockDone"));
  };

  // 🔁 قبول أو رفض مجموعة حجوزات
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
      showToast("✅ " + t.confirmed + " — " + res.code);
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
  // 🔒 حجوزات الزبون تأتي من الخادم — جدول الحجوزات لم يعد مقروءاً مباشرة
  const myBookings = user ? myBookingsList : [];
  const myConfirmedBookings = myBookings.filter(b => b.status === "confirmed");
  const unreadNotifs = myBookings.filter(b => b.status !== "pending").length;
  const totalDues = stadiums.reduce((a,s) => a + (s.balance_due || 0), 0);

  // 📏 المسافة بين الزبون والملعب
  const stadiumDistance = (s) => (myPos && hasLocation(s)) ? distanceKm(myPos.lat, myPos.lng, s.latitude, s.longitude) : null;

  let filteredStadiums = stadiums.filter(s => s.status !== "suspended");
  if (filterWilaya !== "الكل") filteredStadiums = filteredStadiums.filter(s => s.wilaya === filterWilaya);
  if (searchText) filteredStadiums = filteredStadiums.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase()) ||
    s.hood.toLowerCase().includes(searchText.toLowerCase()) ||
    s.wilaya.toLowerCase().includes(searchText.toLowerCase()));
  if (sortBy === "price_asc") filteredStadiums = [...filteredStadiums].sort((a,b) => a.price - b.price);
  if (sortBy === "price_desc") filteredStadiums = [...filteredStadiums].sort((a,b) => b.price - a.price);
  if (sortBy === "rating") filteredStadiums = [...filteredStadiums].sort((a,b) =>
    (ratingsMap[b.id]?.avg_stars ?? 0) - (ratingsMap[a.id]?.avg_stars ?? 0));
  if (sortBy === "popular") filteredStadiums = [...filteredStadiums].sort((a,b) => confirmedBookings.filter(x => x.stadium_id === b.id).length - confirmedBookings.filter(x => x.stadium_id === a.id).length);
  // 📍 الترتيب حسب الأقرب
  if (sortBy === "nearest" && myPos) filteredStadiums = [...filteredStadiums].sort((a,b) => {
    const da = stadiumDistance(a), db = stadiumDistance(b);
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });

  const pendingBookings = bookings.filter(b => b.status === "pending");
  // 🔒 حجوزات صاحب الملعب تأتي من الخادم بعد التحقق من كوده
  const ownerBookings = owner ? myBookingsList : [];
  const ownerPending = ownerBookings.filter(b => b.status === "pending");
  const payApp = selectedPayApp ? PAYMENT_APPS.find(p => p.id === selectedPayApp) : null;
  const stadiumPayNum = selected && payApp ? (selected.payments?.[selectedPayApp] || "") : "";
  const stadiumHours = selected ? (selected.working_hours || ALL_HOURS) : ALL_HOURS;
  // 🛒 المبلغ الإجمالي = السعر × عدد المواعيد
  const totalPrice = (selected?.price || 0) * cart.length;

  const inp = { width:"100%", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"12px 16px", color:"#fff", fontSize:"15px", fontFamily:"inherit", marginBottom:"16px", boxSizing:"border-box", outline:"none" };
  const lbl = { color:COLORS.muted, fontSize:"13px", marginBottom:"6px", display:"block" };
  // 🎨 قائمة منسدلة بلون التطبيق — الخلفية والكتابة والخيارات
  const sel = { ...inp, background:COLORS.bg, color:"#fff", WebkitAppearance:"none", appearance:"none",
    backgroundImage:`url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%238892A4' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat", backgroundPosition: isRTL ? "left 16px center" : "right 16px center",
    paddingInlineEnd:"38px" };
  const opt = { background:COLORS.card, color:"#fff" };

  const BottomNav = () => {
    const items = [
      { id:"stadiums", label: lang==="ar"?"الملاعب":lang==="fr"?"Accueil":"Home" },
      { id:"favorites", label: L("favorites"), badge: favorites.length },
      { id:"profile", label: lang==="ar"?"حسابي":lang==="fr"?"Profil":"Profile" },
      { id:"contact", label: lang==="ar"?"اتصل بنا":lang==="fr"?"Contact":"Contact" },
    ];
    return (
      <div style={{position:"fixed", bottom:0, left:0, right:0, background:COLORS.card, borderTop:`1px solid ${COLORS.border}`, display:"flex", zIndex:50, paddingBottom:"8px"}}>
        {items.map(item => {
          const active = bottomTab === item.id;
          const color = active ? COLORS.accent : COLORS.muted;
          return (
            <button key={item.id} onClick={() => {
              if (item.id === "contact") return setShowContact(true);
              if (item.id === "profile") return setShowProfile(true);
              setBottomTab(item.id);
            }} style={{flex:1, padding:"10px 4px 4px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:"5px"}}>
              <div style={{position:"relative", color, display:"flex"}}>
                {item.id === "stadiums" && <HomeIcon active={active}/>}
                {item.id === "favorites" && <HeartIcon active={active}/>}
                {item.id === "profile" && <PersonIcon active={active}/>}
                {item.id === "contact" && <span style={{fontSize:"20px", lineHeight:1}}>💬</span>}
                {item.badge > 0 && <div style={{position:"absolute", top:"-4px", right:"-6px", background:"#FF4444", color:"#fff", borderRadius:"50%", width:"16px", height:"16px", fontSize:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700"}}>{item.badge}</div>}
              </div>
              <div style={{fontSize:"10px", color, fontWeight: active?"700":"400"}}>{item.label}</div>
            </button>
          );
        })}
      </div>
    );
  };

  // 🏟 بطاقة ملعب قابلة لإعادة الاستخدام — الشبكة الرئيسية، الشائعة، والمفضلة
  const StadiumCardView = ({ s, wide }) => {
    const hrs = s.working_hours || ALL_HOURS;
    const free = hrs.filter(h => !isBooked(s.id, today, h)).length;
    const dist = stadiumDistance(s);
    const isFav = favorites.includes(s.id);
    return (
      <div style={{background:COLORS.card, borderRadius:"20px", border:`1px solid ${COLORS.border}`, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.3)", width: wide ? "250px" : "auto", flexShrink: wide ? 0 : undefined}}>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute", inset:0, background:`linear-gradient(135deg, ${s.color}44, ${COLORS.card})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"44px"}}>⚽</div>
          <img src={stadiumImage(s)} alt={s.name} onError={e => onImgError(e, s.id || 0)} style={{width:"100%", height:"140px", objectFit:"cover", display:"block", position:"relative"}}/>
          <div style={{position:"absolute", inset:0, background:`linear-gradient(to bottom, transparent 50%, ${COLORS.card} 100%)`}}></div>
          {/* ❤️ زر المفضلة */}
          {user && (
            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(s.id); }} style={{position:"absolute", top:"10px", insetInlineEnd:"10px", width:"30px", height:"30px", borderRadius:"50%", background:"rgba(0,0,0,0.55)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", backdropFilter:"blur(4px)", zIndex:2}}>
              {isFav ? "❤️" : "🤍"}
            </button>
          )}
          {/* 📍 شارة المسافة */}
          {dist != null && (
            <div style={{position:"absolute", top:"10px", insetInlineStart:"10px", background:"rgba(0,0,0,0.65)", color:COLORS.accent, padding:"4px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"800", backdropFilter:"blur(4px)"}}>
              📍 {dist < 1 ? Math.round(dist*1000) + " m" : dist.toFixed(1) + " " + L("kmAway")}
            </div>
          )}
          {ratingsMap[s.id] && (
            <div style={{position:"absolute", top: user ? "48px" : "10px", insetInlineEnd:"10px", background:"rgba(0,0,0,0.65)", color:"#FFD700", padding:"4px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"800", backdropFilter:"blur(4px)"}}>
              ⭐ {ratingsMap[s.id].avg_stars}
            </div>
          )}
          <div style={{position:"absolute", bottom:"10px", right:"12px", left:"12px"}}>
            <div style={{fontWeight:"800", fontSize:"18px", color:"#fff", textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>{s.name}</div>
            <div style={{color:"#ffffffaa", fontSize:"12px"}}>📍 {s.wilaya} — {s.hood}</div>
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
            <button onClick={() => { setSelected(s); setStep(1); setBookDate(today); }} style={{flex:2, padding:"11px", background:`linear-gradient(135deg, ${s.color}, ${s.color}BB)`, border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{t.bookNow}</button>
            {hasLocation(s) && (
              <button onClick={() => window.open(directionsLink(s.latitude, s.longitude), "_blank")} style={{flex:1, padding:"11px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"12px", fontWeight:"700", fontSize:"13px", cursor:"pointer", fontFamily:"inherit"}}>{L("directions")}</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ✅ شاشة الدخول — 3 خيارات
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
            <div style={{marginBottom:"8px"}}><Logo size={84} glow={0.24}/></div>
            <div><BrandName text={t.appName}/></div>
            <div style={{color:COLORS.muted, marginTop:"8px", fontSize:"15px"}}>{t.appSlogan}</div>
          </div>
          <div style={{background:COLORS.card, borderRadius:"24px", padding:"28px", border:`1px solid ${COLORS.border}`, boxShadow:"0 25px 50px rgba(0,0,0,0.5)"}}>
            {isOwner ? (
              <>
                <div style={{textAlign:"center", marginBottom:"18px"}}>
                  <div style={{fontSize:"40px", marginBottom:"6px"}}>🏟</div>
                  <div style={{fontWeight:"800", fontSize:"17px", color:"#FF6D00"}}>{L("ownerLogin")}</div>
                </div>
                <label style={lbl}>{L("ownerCode")}</label>
                <input style={{...inp, letterSpacing:"4px", textAlign:"center", fontWeight:"800", fontSize:"18px"}} placeholder="••••••••" value={ownerCodeInput} onChange={e => setOwnerCodeInput(e.target.value.toUpperCase())}/>
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
                <label style={lbl}>🔐 {L("securityQ")}</label>
                <select style={sel} value={regQuestion} onChange={e => setRegQuestion(e.target.value)}>
                  <option style={opt} value="">{L("chooseQ")}</option>
                  {SECURITY_QUESTIONS.map(q => <option style={opt} key={q.id} value={q.id}>{q[lang]}</option>)}
                </select>
                {regQuestion && (
                  <>
                    <label style={lbl}>{L("yourAnswer")}</label>
                    <input style={{...inp, marginBottom:"6px"}} value={regAnswer} onChange={e => setRegAnswer(e.target.value)}/>
                    <div style={{color:"#FF6D00", fontSize:"12px", marginBottom:"16px"}}>⚠️ {L("answerHint")}</div>
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

                {/* 🔑 نسيت كلمة السر */}
                <button onClick={() => { setShowForgot(true); setForgotPhone(loginPhone); }} style={{display:"block", width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.accent2, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>{L("forgotPass")}</button>

                {/* ➖ فاصل */}
                <div style={{display:"flex", alignItems:"center", gap:"12px", margin:"6px 0 18px"}}>
                  <div style={{flex:1, height:"1px", background:COLORS.border}}></div>
                  <div style={{color:COLORS.muted, fontSize:"12px"}}>{lang==="ar" ? "أو" : lang==="fr" ? "ou" : "or"}</div>
                  <div style={{flex:1, height:"1px", background:COLORS.border}}></div>
                </div>

                {/* ➕ إنشاء حساب جديد */}
                <button onClick={() => setScreen("register")} style={{width:"100%", padding:"14px", background:"transparent", border:`2px solid ${COLORS.accent}`, borderRadius:"12px", color:COLORS.accent, fontWeight:"800", fontSize:"15px", cursor:"pointer", fontFamily:"inherit"}}>{L("createNewAccount")}</button>

                {/* 🏟 دخول أصحاب الملاعب */}
                <button onClick={() => setScreen("ownerLogin")} style={{width:"100%", padding:"12px", background:"#FF6D0015", border:"1px solid #FF6D0044", borderRadius:"12px", color:"#FF6D00", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", marginTop:"12px", fontSize:"13px"}}>{L("ownerEntry")}</button>
              </>
            )}
            <button onClick={() => setShowAbout(true)} style={{width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"8px", fontSize:"13px"}}>{lang==="ar" ? "تعرف علينا" : lang==="fr" ? "À propos" : "About us"}</button>
          </div>
        </div>

        {/* 🔑 نافذة استعادة كلمة السر — 3 مراحل */}
        {showForgot && (
          <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && closeForgot()}>
            <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"400px", padding:"28px"}}>
              <div style={{textAlign:"center", marginBottom:"18px"}}>
                <div style={{fontSize:"42px", marginBottom:"8px"}}>{forgotStep===1?"🔑":forgotStep===2?"🔐":"✅"}</div>
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
                    <div style={{color:COLORS.muted, fontSize:"11px", marginBottom:"6px"}}>🔐 {L("securityQ")}</div>
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

              <button onClick={closeForgot} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"10px"}}>{lang==="ar" ? "اغلاق" : lang==="fr" ? "Fermer" : "Close"}</button>
            </div>
          </div>
        )}

        {showAbout && (
          <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", backdropFilter:"blur(4px)"}} onClick={e => e.target===e.currentTarget && setShowAbout(false)}>
            <div style={{background:`linear-gradient(160deg, ${COLORS.card}, #060905)`, borderRadius:"28px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"440px", maxHeight:"88vh", overflow:"hidden", boxShadow:"0 30px 80px rgba(0,0,0,0.5)"}}>
              {/* 🏟 رأسية بتوهج أخضر وشعار حقيقي */}
              <div style={{position:"relative", padding:"36px 28px 24px", textAlign:"center", overflow:"hidden"}}>
                <div style={{position:"relative", margin:"0 auto 14px"}}><Logo size={72} glow={0.12}/></div>
                <div style={{position:"relative"}}><BrandName text="malaabi" size="26px"/></div>
                <div style={{position:"relative", color:COLORS.accent, fontSize:"12px", fontWeight:"700", marginTop:"6px", letterSpacing:"0.5px"}}>{lang==="ar" ? "احجز ملعبك بسهولة" : lang==="fr" ? "Réservez facilement" : "Book your field easily"}</div>
              </div>

              {/* 📜 النص — قابل للتمرير إن طال */}
              <div style={{padding:"4px 28px 28px", overflowY:"auto", maxHeight:"52vh"}}>
                <div style={{color:"#D7DCE5", fontSize:"14px", lineHeight:"2.1", textAlign:lang==="ar"?"right":"left", whiteSpace:"pre-line"}}>{aboutText[lang]}</div>
              </div>

              <div style={{padding:"0 28px 28px"}}>
                <button onClick={() => setShowAbout(false)} style={{width:"100%", padding:"13px", background:"linear-gradient(135deg,#80D030,#80D030)", border:"none", borderRadius:"12px", color:"#0B0E08", fontWeight:"800", fontSize:"14px", cursor:"pointer", fontFamily:"inherit"}}>{lang==="ar" ? "حسناً، فهمت" : lang==="fr" ? "Compris" : "Got it"}</button>
              </div>
            </div>
          </div>
        )}
        {toast && <div style={{position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", background:toast.color, color:"#fff", padding:"14px 28px", borderRadius:"16px", fontWeight:"700", zIndex:999, maxWidth:"90%", textAlign:"center"}}>{toast.msg}</div>}
      </div>
    );
  }

  // ✅ واجهة صاحب الملعب
  if (screen === "owner" && owner) {
    const st = owner;   // 🔐 بياناته الكاملة تأتي من stadium-api لا من العرض العام
    const conf = ownerBookings.filter(b => b.status === "confirmed");
    mainContent = (
      <div style={{minHeight:"100vh", background:COLORS.bg, fontFamily:"Tajawal,sans-serif", direction:isRTL?"rtl":"ltr", color:"#fff", paddingBottom:"24px"}}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
        <div style={{background:COLORS.card, borderBottom:`1px solid ${COLORS.border}`, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50}}>
          <div style={{fontSize:"17px", fontWeight:"800", color:"#FF6D00"}}>🏟 {st.name}</div>
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
              {L("commission")}: <span style={{color:"#FF6D00", fontWeight:"800"}}>{st.commission_rate ?? 12}%</span> 🔒
            </div>
          </div>

          {/* 📍 موقع الملعب — عرض لصاحب الملعب */}
          <div style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"16px", border:`1px solid ${COLORS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", gap:"10px"}}>
            <div>
              <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"4px"}}>📍 {L("location")}</div>
              <div style={{fontWeight:"700", fontSize:"14px", color: hasLocation(st) ? COLORS.accent : COLORS.muted}}>
                {hasLocation(st) ? `${st.latitude}, ${st.longitude}` : L("noLocation")}
              </div>
            </div>
            {hasLocation(st) && (
              <button onClick={() => window.open(mapsLink(st.latitude, st.longitude), "_blank")} style={{padding:"10px 14px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px", whiteSpace:"nowrap"}}>{L("showOnMap")}</button>
            )}
          </div>

          {/* 🔑 زر إظهار الكود وزر تغييره — متقابلان */}
          <div style={{display:"flex", gap:"8px", marginBottom:"16px"}}>
            <button onClick={() => setShowOwnerCode(v => !v)} style={{flex:1, padding:"11px 8px", background:"#80D03015", color:COLORS.accent, border:"1px solid #80D03044", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>
              🔑 {showOwnerCode ? <b style={{letterSpacing:"2px", fontSize:"13px"}}>{owner?.owner_code}</b> : `${L("myCode")} • ••••••••`}
            </button>
            <button onClick={() => { if (confirm(L("confirmChangeCode"))) changeOwnerCode(); }} style={{flex:1, padding:"11px 8px", background:"#7C4DFF15", color:"#7C4DFF", border:"1px solid #7C4DFF44", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{L("changeCode")}</button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px", marginBottom:"20px"}}>
            <div style={{background:COLORS.card, borderRadius:"14px", padding:"16px", border:`1px solid ${COLORS.border}`, textAlign:"center"}}>
              <div style={{fontSize:"26px"}}>✅</div>
              <div style={{fontSize:"26px", fontWeight:"800", color:COLORS.accent}}>{conf.length}</div>
              <div style={{color:COLORS.muted, fontSize:"11px"}}>{t.totalConfirmed}</div>
            </div>
            <div style={{background:COLORS.card, borderRadius:"14px", padding:"16px", border:`1px solid ${COLORS.border}`, textAlign:"center"}}>
              <div style={{fontSize:"26px"}}>⏳</div>
              <div style={{fontSize:"26px", fontWeight:"800", color:"#FF6D00"}}>{ownerPending.length}</div>
              <div style={{color:COLORS.muted, fontSize:"11px"}}>{t.totalPending}</div>
            </div>
          </div>

          {/* 🚫 إغلاق مواعيد مؤقتاً */}
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
                    {isBlocked && <span style={{display:"block", fontSize:"8px"}}>🚫</span>}
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
                    {b.date} • {b.hour}:00
                    <button onClick={() => unblockSlot(b.id)} style={{width:"18px", height:"18px", borderRadius:"50%", background:"#FF444433", color:"#FF6B6B", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"10px", lineHeight:"1", display:"flex", alignItems:"center", justifyContent:"center", padding:0}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{fontSize:"18px", fontWeight:"800", marginBottom:"14px"}}>📋 {t.requests}</div>
          {ownerPending.length === 0 ? (
            <div style={{textAlign:"center", padding:"50px", color:COLORS.muted, background:COLORS.card, borderRadius:"16px", border:`1px solid ${COLORS.border}`}}>{t.noPending}</div>
          ) : Object.values(ownerPending.reduce((acc, b) => {
            // 🔁 نجمع مواعيد الحجز المتكرر في بطاقة واحدة
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
                    <div style={{color:COLORS.muted, fontSize:"13px"}}>📞 {b.client_phone}</div>
                    {isGroup ? (
                      <>
                        <div style={{color:"#7C4DFF", fontSize:"12px", fontWeight:"800", marginTop:"3px"}}>🔁 {L("groupBooking")} — {b._group.length} {L("sessions")}</div>
                        {b._group.map(g => (
                          <div key={g.id} style={{color:COLORS.muted, fontSize:"12px"}}>📅 {g.date} — {g.hour}:00</div>
                        ))}
                      </>
                    ) : (
                      <div style={{color:COLORS.muted, fontSize:"13px"}}>📅 {b.date} — {b.hour}:00</div>
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

          {/* ⭐ تقييمات الملعب */}
          <div style={{fontSize:"18px", fontWeight:"800", margin:"24px 0 14px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span>⭐ {L("ratings")}</span>
            <button onClick={loadOwnerRatings} style={{padding:"6px 12px", background:"#FFD70018", color:"#FFD700", border:"1px solid #FFD70033", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>🔄</button>
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
                    <div style={{fontSize:"13px"}}>{"⭐".repeat(r.stars)}</div>
                  </div>
                  {r.comment && <div style={{color:COLORS.muted, fontSize:"13px", marginTop:"6px", lineHeight:"1.7"}}>{r.comment}</div>}
                </div>
              ))}
            </>
          )}

          <div style={{fontSize:"18px", fontWeight:"800", margin:"24px 0 14px"}}>📜 {t.myBookingsTitle}</div>
          {ownerBookings.filter(b => b.status !== "pending").slice().reverse().map((b,i) => {
            const sc = b.status==="confirmed"?COLORS.accent:"#FF4444";
            return (
              <div key={i} style={{background:COLORS.card, borderRadius:"12px", padding:"14px", marginBottom:"10px", border:`1px solid ${sc}33`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:"700"}}>{b.client_name}</div>
                  <div style={{color:COLORS.muted, fontSize:"12px"}}>📅 {b.date} — {b.hour}:00</div>
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
  }

  if (loading) {
    mainContent = (
      <div style={{minHeight:"100vh", background:COLORS.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Tajawal,sans-serif"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"56px", marginBottom:"16px", filter:"drop-shadow(0 0 20px #80D030)"}}>⚽</div>
          <div style={{color:COLORS.accent, fontSize:"18px", fontWeight:"700"}}>{t.loading}</div>
        </div>
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
            <button onClick={() => setBottomTab("notifs")} style={{position:"relative", width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"8px", color: bottomTab==="notifs"?COLORS.accent:COLORS.muted, cursor:"pointer"}}>
              <BellIcon/>
              {unreadNotifs > 0 && <div style={{position:"absolute", top:"-4px", right:"-4px", background:"#FF4444", color:"#fff", borderRadius:"50%", width:"15px", height:"15px", fontSize:"9px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700"}}>{unreadNotifs}</div>}
            </button>
          )}
          <LangButton/>
          <button onClick={handleLogout} style={{padding:"5px 10px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"8px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.logout}</button>
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
                    <span style={{position:"absolute", insetInlineStart:"14px", top:"50%", transform:"translateY(-50%)", fontSize:"16px", pointerEvents:"none"}}>📍</span>
                    <input style={{...inp, marginBottom:0, background:COLORS.bg, color:"#fff", WebkitAppearance:"none", appearance:"none", paddingInlineStart:"40px"}} type="text" name="malaabi-search" autoComplete="off" placeholder={t.search} value={searchText} onChange={e => setSearchText(e.target.value)}/>
                  </div>
                  <select style={{...sel, marginTop:"8px", marginBottom:"8px"}} value={sortBy} onChange={e => { const v = e.target.value; if (v === "nearest") return findNearest(); setSortBy(v); }}>
                    <option style={opt} value="default">{t.sortDefault}</option>
                    <option style={opt} value="price_asc">{t.sortPriceAsc}</option>
                    <option style={opt} value="price_desc">{t.sortPriceDesc}</option>
                    <option style={opt} value="popular">{t.sortPopular}</option>
                    <option style={opt} value="rating">⭐ {L("sortRating")}</option>
                    <option style={opt} value="nearest">📍 {L("sortNearest")}</option>
                  </select>
                  {/* 🎯 زر الأقرب لي */}
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
                    const act = i === 0 ? filterWilaya === "الكل" : filterWilaya === w;
                    return <button key={w} onClick={() => setFilterWilaya(i === 0 ? "الكل" : w)} style={{padding:"6px 14px", borderRadius:"20px", border:`1px solid ${act ? COLORS.accent : COLORS.border}`, cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"13px", background: act?"linear-gradient(135deg,#80D030,#80D030)":COLORS.card, color: act?"#000":COLORS.muted}}>{w}</button>;
                  })}
                </div>
                {filteredStadiums.length===0 ? (
                  <div style={{textAlign:"center", padding:"80px 20px", color:COLORS.muted}}>
                    <div style={{fontSize:"60px", marginBottom:"16px"}}>🏟</div><div>{t.noStadiums}</div>
                  </div>
                ) : (
                  <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"16px"}}>
                    {filteredStadiums.map((s) => <StadiumCardView key={s.id} s={s} />)}
                  </div>
                )}
              </>
            )}

            {bottomTab==="favorites" && (
              <div>
                <div style={{fontSize:"20px", fontWeight:"800", marginBottom:"20px"}}>❤️ {L("favorites")}</div>
                {favorites.length===0 ? (
                  <div style={{textAlign:"center", padding:"60px 20px", color:COLORS.muted}}>
                    <div style={{fontSize:"48px", marginBottom:"12px"}}>🤍</div>
                    <div style={{fontWeight:"700", marginBottom:"6px"}}>{L("noFavorites")}</div>
                    <div style={{fontSize:"13px"}}>{L("noFavoritesHint")}</div>
                  </div>
                ) : (
                  <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"16px"}}>
                    {stadiums.filter(s => favorites.includes(s.id)).map(s => <StadiumCardView key={s.id} s={s} />)}
                  </div>
                )}
              </div>
            )}

            {bottomTab==="notifs" && (
              <div>
                <div style={{fontSize:"20px", fontWeight:"800", marginBottom:"20px"}}>🔔 {lang==="ar"?"الإشعارات":"Notifications"}</div>
                {myBookings.length===0 ? (
                  <div style={{textAlign:"center", padding:"60px", color:COLORS.muted}}>
                    <div style={{fontSize:"48px", marginBottom:"12px"}}>🔔</div>
                    <div>{lang==="ar"?"لا توجد إشعارات":"No notifications"}</div>
                  </div>
                ) : myBookings.slice().reverse().map((b,i) => {
                  const sc = b.status==="confirmed"?COLORS.accent:b.status==="rejected"?"#FF4444":"#FF6D00";
                  const si = b.status==="confirmed"?"✅":b.status==="rejected"?"❌":"⏳";
                  const stx = b.status==="confirmed"?L("bookingAccepted"):b.status==="rejected"?L("bookingRejected"):L("waiting");
                  const bst = stadiums.find(x => x.id === b.stadium_id);
                  return (
                    <div key={i} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"10px", border:`1px solid ${sc}33`, display:"flex", gap:"12px", alignItems:"center"}}>
                      <div style={{fontSize:"28px"}}>{si}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:"700", color:sc, marginBottom:"4px"}}>{stx}</div>
                        <div style={{color:"#fff", fontWeight:"600"}}>{b.stadium_name}</div>
                        <div style={{color:COLORS.muted, fontSize:"13px"}}>📅 {b.date} — {b.hour}:00</div>
                        {b.status==="confirmed" && b.code && (
                          <div style={{marginTop:"8px", background:`${COLORS.accent}22`, borderRadius:"8px", padding:"6px 10px", display:"inline-block"}}>
                            <span style={{color:COLORS.muted, fontSize:"11px"}}>{t.code}: </span>
                            <span style={{color:COLORS.accent, fontWeight:"800", letterSpacing:"2px"}}>{b.code}</span>
                          </div>
                        )}
                        {/* ⭐ تقييم الحجز بعد انتهاء موعده — زر واحد واضح */}
                        {canRate(b) && (
                          <div style={{marginTop:"10px", background:"#FFD70012", border:"1px solid #FFD70033", borderRadius:"12px", padding:"12px"}}>
                            <div style={{fontSize:"12px", color:"#FFD700", fontWeight:"700", marginBottom:"8px"}}>{L("rateTitle")}</div>
                            <button onClick={() => { setRateBooking(b); setRateStars(0); setRateText(""); }} style={{width:"100%", padding:"10px", background:"linear-gradient(135deg,#FFD700,#FF9500)", border:"none", borderRadius:"10px", fontWeight:"800", fontSize:"13px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{L("rateNow")}</button>
                          </div>
                        )}
                        {myRatingOf(b.id) && (
                          <div style={{marginTop:"8px", fontSize:"12px", color:"#FFD700"}}>
                            {L("yourRating")}: {"⭐".repeat(myRatingOf(b.id).stars)}
                          </div>
                        )}

                        {/* 🧭 اتجاهات الملعب في الإشعار المقبول */}
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
            <div style={{fontSize:"24px", fontWeight:"800", marginBottom:"16px"}}>لوحة التحكم</div>
            <div style={{display:"flex", gap:"5px", marginBottom:"16px", background:COLORS.card, borderRadius:"12px", padding:"4px"}}>
              {[["bookings",L("allBookings"),"#FF6D00"],["dues",L("dues"),"#FF4081"],["ratings","⭐","#FFD700"],["stadiums",t.stadiums,"#7C4DFF"],["stats",t.stats,COLORS.accent],["add",t.addStadium,COLORS.accent2]].map(([k,lab,c]) => (
                <button key={k} onClick={() => setAdminTab(k)} style={{flex:1, padding:"8px 2px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"11px", background: adminTab===k?c:"transparent", color: adminTab===k?"#fff":COLORS.muted}}>{lab}</button>
              ))}
            </div>

            {/* 👁 مشاهدة فقط */}
            {adminTab==="bookings" && (
              <div>
                <div style={{background:"#80D03015", border:"1px solid #80D03033", borderRadius:"12px", padding:"12px", marginBottom:"16px", textAlign:"center", color:COLORS.accent2, fontSize:"13px", fontWeight:"700"}}>👁 {L("viewOnly")}</div>
                <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"18px"}}>
                  {[["⏳",pendingBookings.length,L("waiting"),"#FF6D00"],["✅",confirmedBookings.length,L("accepted2"),COLORS.accent],["❌",bookings.filter(b=>b.status==="rejected").length,L("rejected2"),"#FF4444"]].map(([ic,v,lb,c],i)=>(
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
                  const si = b.status==="confirmed"?"✅":b.status==="rejected"?"❌":"⏳";
                  const stx = b.status==="confirmed"?L("accepted2"):b.status==="rejected"?L("rejected2"):L("waiting");
                  return (
                    <div key={i} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"12px", border:`1px solid ${sc}44`}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"10px"}}>
                        <div>
                          <div style={{fontWeight:"700", fontSize:"15px"}}>{b.client_name}</div>
                          <div style={{color:COLORS.muted, fontSize:"13px"}}>📞 {b.client_phone}</div>
                          <div style={{color:COLORS.muted, fontSize:"13px"}}>🏟 {b.stadium_name}</div>
                          <div style={{color:COLORS.muted, fontSize:"13px"}}>📅 {b.date} — {b.hour}:00</div>
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
                      {b.status !== "pending" && <div style={{color:"#7C4DFF", fontSize:"12px", marginTop:"8px", textAlign:"center"}}>{L("handledBy")}: <b>{L("owner")}</b>{b.commission ? ` — ${L("commission")}: ${b.commission}` : ""}</div>}
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
                        <div style={{color:COLORS.muted, fontSize:"12px"}}>📍 {s.wilaya} — {s.hood}</div>
                        <div style={{color:COLORS.accent2, fontSize:"12px", marginTop:"4px"}}>🔑 <b style={{letterSpacing:"1px"}}>{s.owner_code || "—"}</b></div>
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
                        <button onClick={() => saveRate(s.id)} style={{padding:"8px 12px", background:COLORS.accent2, border:"none", borderRadius:"8px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", color:"#000", fontSize:"12px"}}>💾</button>
                      </div>
                    </div>
                    <div style={{display:"flex", gap:"8px"}}>
                      <button onClick={() => resetDue(s.id)} style={{flex:1, padding:"10px", background:"#80D03022", color:COLORS.accent, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>💰 {L("resetDue")}</button>
                      <button onClick={() => toggleSuspend(s)} style={{flex:1, padding:"10px", background: s.status==="suspended"?"#80D03022":"#FF6D0022", color: s.status==="suspended"?COLORS.accent2:"#FF6D00", border:`1px solid ${s.status==="suspended"?"#80D03044":"#FF6D0044"}`, borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{s.status==="suspended"?"▶ "+L("activate"):"⛔ "+L("suspend")}</button>
                      <button onClick={() => setConfirmDelete(s)} style={{padding:"10px 14px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab==="ratings" && (
              <div>
                {adminRatings.length === 0 ? (
                  <div style={{textAlign:"center", padding:"60px", color:COLORS.muted}}>
                    <div style={{fontSize:"48px", marginBottom:"12px"}}>⭐</div>
                    <div>{L("noRatings")}</div>
                  </div>
                ) : adminRatings.map(r => {
                  const st = stadiums.find(x => x.id === r.stadium_id);
                  return (
                    <div key={r.id} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"10px", border:"1px solid #FFD70022"}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px"}}>
                        <div>
                          <div style={{fontWeight:"700", fontSize:"14px"}}>{r.client_name}</div>
                          <div style={{color:COLORS.muted, fontSize:"12px"}}>🏟 {st?.name || r.stadium_id}</div>
                        </div>
                        <div style={{fontSize:"13px"}}>{"⭐".repeat(r.stars)}</div>
                      </div>
                      {r.comment && <div style={{color:COLORS.muted, fontSize:"13px", lineHeight:"1.7", marginBottom:"8px"}}>{r.comment}</div>}
                      <button onClick={() => deleteRating(r.id)} style={{padding:"7px 14px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"9px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"11px"}}>🗑 {t.delete}</button>
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
                        <div style={{color:COLORS.muted, fontSize:"13px"}}>📍 {s.wilaya} - {s.hood} - {s.price}</div>
                        <div style={{color:COLORS.accent, fontSize:"13px", marginTop:"4px"}}>✅ {c}</div>
                        <div style={{color:COLORS.accent2, fontSize:"12px"}}>🔑 {s.owner_code || "—"}</div>
                        {/* 📍 حالة الموقع */}
                        <div style={{color: hasLocation(s)?COLORS.accent:"#FF6D00", fontSize:"12px", marginTop:"2px"}}>
                          {hasLocation(s) ? `📍 ${Number(s.latitude).toFixed(4)}, ${Number(s.longitude).toFixed(4)}` : "⚠️ " + L("noLocation")}
                        </div>
                      </div>
                      <div style={{display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"flex-end"}}>
                        {hasLocation(s) && <button onClick={() => window.open(mapsLink(s.latitude, s.longitude), "_blank")} style={{padding:"8px 12px", background:"#80D03022", color:COLORS.accent, border:"1px solid #80D03044", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>🗺</button>}
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
                    { l:t.totalUsers, v:usersCount, i:"👥", c:COLORS.accent },
                    { l:t.totalStadiums, v:stadiums.length, i:"🏟", c:COLORS.accent2 },
                    { l:t.totalConfirmed, v:confirmedBookings.length, i:"✅", c:"#7C4DFF" },
                    { l:L("totalDues"), v:totalDues, i:"💰", c:"#FF4081" },
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
                        <button onClick={() => handleDeleteWilaya(w)} title={L("delWilaya")} style={{width:"20px", height:"20px", borderRadius:"50%", background:"#FF444433", color:"#FF6B6B", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"11px", lineHeight:"1", display:"flex", alignItems:"center", justifyContent:"center", padding:0}}>✕</button>
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

                  <label style={lbl}>🖼 {L("imageUrl")}</label>
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

                  {/* 📍 موقع الملعب */}
                  <div style={{fontWeight:"700", color:"#FF6D00", margin:"12px 0 10px"}}>📍 {L("location")}</div>
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

      {showContact && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setShowContact(false)}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"400px", padding:"32px", textAlign:"center"}}>
            <div style={{fontSize:"48px", marginBottom:"12px"}}>💬</div>
            <div style={{fontSize:"20px", fontWeight:"800", marginBottom:"8px", color:COLORS.accent}}>{lang==="ar" ? "اتصل بنا" : "Contact Us"}</div>
            <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"24px"}}>{lang==="ar" ? "تواصل معنا عبر واتساب" : "Via WhatsApp"}</div>
            <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(lang==="ar" ? "مرحبا، أريد الاستفسار عن تطبيق ملاعبي" : "Bonjour, Malaabi")}`, "_blank")} style={{width:"100%", padding:"14px", background:"#25D366", border:"none", borderRadius:"14px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"15px", color:"#fff", marginBottom:"12px"}}>📱 WhatsApp — +{WHATSAPP_NUM}</button>
            <button onClick={() => setShowContact(false)} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{lang==="ar" ? "اغلاق" : "Close"}</button>
          </div>
        </div>
      )}

      {editStadium && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setEditStadium(null)}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"520px", maxHeight:"90vh", overflow:"auto", padding:"24px"}}>
            <div style={{fontSize:"18px", fontWeight:"800", color:COLORS.accent2, marginBottom:"20px"}}>✏️ {editStadium.name}</div>
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

            <label style={lbl}>🖼 {L("imageUrl")}</label>
            <label style={{display:"block", width:"100%", padding:"14px", background: editImage?"#80D03022":COLORS.bg, border:`2px dashed ${editImage?COLORS.accent:COLORS.border}`, borderRadius:"12px", color: editImage?COLORS.accent:COLORS.muted, fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", textAlign:"center", marginBottom:"10px", boxSizing:"border-box"}}>
              {uploadingImg ? L("uploading") : editImage ? L("imageUploaded") : L("uploadImage")}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={e => handleUploadStadiumImage(e.target.files[0], true)}/>
            </label>
            <input style={{...inp, marginBottom:"6px"}} placeholder={L("orPasteLink")} value={editImage} onChange={e => setEditImage(e.target.value)}/>
            <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"10px"}}>{L("imageHint")}</div>
            <img src={editImage.trim() || stadiumImage(editStadium)} alt="" onError={e => onImgError(e, editStadium.id || 0)} style={{width:"100%", height:"120px", objectFit:"cover", borderRadius:"12px", marginBottom:"8px"}}/>
            {editImage.trim() && <button onClick={() => setEditImage("")} style={{width:"100%", padding:"9px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px", marginBottom:"16px"}}>{L("removeImage")}</button>}

            {/* 📍 تعديل موقع الملعب */}
            <div style={{fontWeight:"700", color:"#FF6D00", margin:"12px 0 10px"}}>📍 {L("location")}</div>
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
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"400px", padding:"28px"}}>
            <div style={{textAlign:"center", marginBottom:"20px"}}>
              <div style={{fontSize:"48px", marginBottom:"8px"}}>👤</div>
              <div style={{fontSize:"18px", fontWeight:"800", color:COLORS.accent}}>{user.name}</div>
            </div>
            <div style={{background:COLORS.bg, borderRadius:"12px", padding:"14px", marginBottom:"10px"}}>
              <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"4px"}}>{t.myPhone}</div>
              <div style={{fontWeight:"700", fontSize:"15px"}}>📞 {user.phone}</div>
            </div>
            <div style={{background:COLORS.bg, borderRadius:"12px", padding:"14px", marginBottom:"10px"}}>
              <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"4px"}}>{t.acceptedBookings}</div>
              <div style={{fontWeight:"800", fontSize:"28px", color:COLORS.accent}}>✅ {myConfirmedBookings.length}</div>
            </div>
            <button onClick={() => { setShowProfile(false); setBottomTab("notifs"); }} style={{width:"100%", padding:"11px", background:"#7C4DFF22", border:"1px solid #7C4DFF44", borderRadius:"12px", color:"#7C4DFF", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", marginBottom:"10px"}}>{t.viewAllBookings}</button>
            <button onClick={() => setShowProfile(false)} style={{width:"100%", padding:"11px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.close}</button>
          </div>
        </div>
      )}

      {selected && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && closeModal()}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"520px", maxHeight:"90vh", overflow:"auto", padding:"24px"}}>
            <div style={{fontSize:"18px", fontWeight:"800", color:selected.color, marginBottom:"4px"}}>🏟 {selected.name}</div>
            <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"12px"}}>📍 {selected.wilaya} - {selected.hood} - {selected.price}</div>
            {/* 🧭 اتجاهات الملعب داخل نافذة الحجز */}
            {hasLocation(selected) && (
              <button onClick={() => window.open(directionsLink(selected.latitude, selected.longitude), "_blank")} style={{width:"100%", padding:"11px", background:"#80D03022", color:COLORS.accent2, border:"1px solid #80D03044", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", marginBottom:"16px"}}>
                {L("directions")}{stadiumDistance(selected) != null ? ` — ${stadiumDistance(selected).toFixed(1)} ${L("kmAway")}` : ""}
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

                {/* 🛒 السلة */}
                <div style={{background:COLORS.bg, borderRadius:"14px", padding:"14px", marginBottom:"16px"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: cart.length?"10px":0}}>
                    <span style={{fontSize:"13px", fontWeight:"800"}}>🛒 {L("myCart")} {cart.length>0 && `(${cart.length})`}</span>
                    {cart.length>0 && <span style={{color:COLORS.accent, fontWeight:"900", fontSize:"19px"}}>{totalPrice}</span>}
                  </div>

                  {cart.length === 0 ? (
                    <div style={{color:COLORS.muted, fontSize:"12px", textAlign:"center", padding:"10px"}}>{L("cartEmpty")}</div>
                  ) : (
                    <div style={{maxHeight:"170px", overflowY:"auto", display:"flex", flexWrap:"wrap", gap:"6px"}}>
                      {cart.map(c => (
                        <div key={`${c.date}-${c.hour}`} style={{background:`${selected.color}22`, color:selected.color, padding:"5px 6px 5px 11px", borderRadius:"18px", fontSize:"11px", fontWeight:"700", display:"flex", alignItems:"center", gap:"6px"}}>
                          {c.date.slice(5)} • {c.hour}:00
                          <button onClick={() => toggleCartSlot(c.date, c.hour)} style={{width:"17px", height:"17px", borderRadius:"50%", background:"#FF444433", color:"#FF6B6B", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"10px", lineHeight:"1", display:"flex", alignItems:"center", justifyContent:"center", padding:0}}>✕</button>
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
                    {/* 📋 رقم الدفع قابل للنسخ */}
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
                  {uploading ? L("uploading") : proofUrl ? "✅ " + L("proof") : L("uploadProof")}
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
            <div style={{fontSize:"40px", marginBottom:"12px"}}>🗑</div>
            <div style={{fontSize:"16px", fontWeight:"800", marginBottom:"8px"}}>{t.deleteStadium}</div>
            <div style={{color:COLORS.muted, marginBottom:"20px"}}>{t.deleteConfirm} {confirmDelete.name}؟</div>
            <div style={{display:"flex", gap:"12px"}}>
              <button onClick={() => setConfirmDelete(null)} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.cancel}</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{flex:1, padding:"12px", background:"#FF4444", border:"none", borderRadius:"12px", color:"#fff", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ نافذة التقييم */}
      {rateBooking && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setRateBooking(null)}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:"1px solid #FFD70033", width:"100%", maxWidth:"400px", padding:"28px", textAlign:"center"}}>
            <div style={{fontSize:"15px", fontWeight:"800", marginBottom:"4px"}}>{rateBooking.stadium_name}</div>
            <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"18px"}}>📅 {rateBooking.date} — {rateBooking.hour}:00</div>

            <div style={{display:"flex", gap:"8px", justifyContent:"center", marginBottom:"18px"}}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRateStars(n)} style={{background:"none", border:"none", cursor:"pointer", fontSize:"36px", padding:0, lineHeight:1, filter: n <= rateStars ? "none" : "grayscale(1) opacity(0.35)", transition:"filter .15s"}}>⭐</button>
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

      {/* 👑 نافذة دخول لوحة التحكم */}
      {showAdminLogin && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", backdropFilter:"blur(6px)"}} onClick={e => e.target===e.currentTarget && setShowAdminLogin(false)}>
          <div style={{background:`linear-gradient(160deg, ${COLORS.card}, #0a1020)`, borderRadius:"28px", border:"1px solid #7C4DFF44", width:"100%", maxWidth:"380px", padding:"36px 28px", textAlign:"center", boxShadow:"0 30px 80px rgba(124,77,255,0.25)"}}>
            <div style={{width:"72px", height:"72px", margin:"0 auto 18px", borderRadius:"50%", background:"linear-gradient(135deg,#7C4DFF,#80D030)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"34px", boxShadow:"0 10px 30px rgba(124,77,255,0.4)"}}>👑</div>
            <div style={{fontSize:"20px", fontWeight:"900", marginBottom:"6px", background:"linear-gradient(135deg,#7C4DFF,#80D030)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>{L("adminTitle")}</div>
            <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"24px"}}>🔒 {L("adminPassLabel")}</div>

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
                placeholder="••••••••"
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
              {lang==="ar" ? "إلغاء" : lang==="fr" ? "Annuler" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* 🔐 تذكير الحسابات القديمة بتحديد سؤال سري */}
      {user && !user.security_question && showSetupQ && tab==="client" && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:150, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:"1px solid #FF6D0044", width:"100%", maxWidth:"400px", padding:"28px"}}>
            <div style={{textAlign:"center", marginBottom:"16px"}}>
              <div style={{fontSize:"42px", marginBottom:"8px"}}>🔐</div>
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
                <div style={{color:"#FF6D00", fontSize:"12px", marginBottom:"14px"}}>⚠️ {L("answerHint")}</div>
                <label style={lbl}>🔒 {L("confirmIdentity")}</label>
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

  // ⚽ طبقة شعار متلاشية فوق الصفحة الجاهزة أصلاً خلفها — بلا أي قفزة موضع أو حجم
  return (
    <>
      {mainContent}
      {splash && (
        <div style={{position:"fixed", inset:0, zIndex:9999, background:"#0B0E08", display:"flex", alignItems:"center", justifyContent:"center", opacity: splashFading ? 0 : 1, transition:"opacity 500ms ease", pointerEvents: splashFading ? "none" : "auto"}}>
          <div style={{textAlign:"center"}}>
            <div style={{marginBottom:"14px"}}><Logo size={84} glow={0.24}/></div>
            <div style={{fontSize:"42px", fontWeight:"900", letterSpacing:"3px", marginBottom:"8px", userSelect:"none", WebkitUserSelect:"none"}}>
              <span style={{color:"#ffffff"}}>MALA</span><span style={{color:"#80D030"}}>ABI</span>
            </div>
            <div style={{color:"#80D030", fontSize:"14px", userSelect:"none", WebkitUserSelect:"none"}}>⚽ احجز ملعبك بسهولة</div>
          </div>
        </div>
      )}
    </>
  );
}
