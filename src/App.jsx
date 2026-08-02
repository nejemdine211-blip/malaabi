import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { translations } from "./translations";
import bcrypt from "bcryptjs";

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
const genCode = () => Math.random().toString(36).substring(2,10).toUpperCase();
const genOwnerCode = () => "M" + Math.random().toString(36).substring(2,8).toUpperCase();
const ADMIN_PASS = "malaabi5964";
const WHATSAPP_NUM = "21654542791";
const ADMIN_PHONE = "49058641";

const COLORS = {
  bg: "#070B14", card: "#0D1424", border: "#1A2540",
  accent: "#00E676", accent2: "#00B0FF", text: "#ffffff", muted: "#8892A4",
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

const getRandomImage = () => STADIUM_IMAGES[Math.floor(Math.random() * STADIUM_IMAGES.length)];

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
  ar: "ملاعبي هو أول تطبيق موريتاني متخصص في حجز ملاعب كرة القدم. نهدف إلى تسهيل عملية الحجز بين الزبائن وأصحاب الملاعب بطريقة سريعة وآمنة. يمكنك اختيار الملعب المناسب لك، تحديد الوقت، والدفع عبر تطبيقات الدفع المحلية مثل Bankily وMasrvi وSEDAD.",
  fr: "Malaabi est la première application mauritanienne spécialisée dans la réservation de terrains de football. Notre objectif est de faciliter le processus de réservation entre les clients et les propriétaires de terrains de manière rapide et sécurisée.",
  en: "Malaabi is the first Mauritanian app specialized in booking football fields. We aim to facilitate the booking process between clients and field owners in a fast and secure way.",
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
  // 📍 نصوص الموقع الجديدة
  location: { ar:"موقع الملعب", fr:"Localisation du terrain", en:"Field location" },
  myLocation: { ar:"📍 موقعي الحالي", fr:"📍 Ma position", en:"📍 My location" },
  checkLocation: { ar:"🗺 تحقق من الموقع", fr:"🗺 Vérifier", en:"🗺 Check on map" },
  locating: { ar:"📍 جاري تحديد الموقع...", fr:"📍 Localisation...", en:"📍 Locating..." },
  locationSet: { ar:"✅ تم تحديد الموقع", fr:"✅ Position définie", en:"✅ Location set" },
  locationFailed: { ar:"تعذر تحديد الموقع", fr:"Échec de localisation", en:"Location failed" },
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
  // 🔑 شاشة الدخول الجديدة
  forgotPass: { ar:"نسيت كلمة السر؟", fr:"Mot de passe oublié ?", en:"Forgot password?" },
  createNewAccount: { ar:"إنشاء حساب جديد", fr:"Créer un nouveau compte", en:"Create new account" },
  haveAccount: { ar:"لديك حساب؟ تسجيل الدخول", fr:"Déjà un compte ? Se connecter", en:"Have an account? Log in" },
  ownerEntry: { ar:"🏟 دخول أصحاب الملاعب", fr:"🏟 Espace propriétaires", en:"🏟 Field owners" },
  backToLogin: { ar:"← رجوع لتسجيل الدخول", fr:"← Retour à la connexion", en:"← Back to log in" },
  forgotTitle: { ar:"استعادة كلمة السر", fr:"Récupérer le mot de passe", en:"Recover password" },
  forgotDesc: { ar:"أدخل رقم هاتفك وسنرسل لك كلمة سر جديدة عبر واتساب خلال وقت قصير.", fr:"Entrez votre numéro et nous vous enverrons un nouveau mot de passe par WhatsApp.", en:"Enter your phone number and we'll send you a new password via WhatsApp." },
  sendRequest: { ar:"📱 إرسال الطلب عبر واتساب", fr:"📱 Envoyer via WhatsApp", en:"📱 Send via WhatsApp" },
  phoneNotFound: { ar:"لا يوجد حساب بهذا الرقم", fr:"Aucun compte avec ce numéro", en:"No account with this number" },
};

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("malaabi_lang") || "ar");
  const t = translations[lang];
  const L = (k) => TXT[k][lang];
  const isRTL = lang === "ar";
  const [splash, setSplash] = useState(true);
  const [showContact, setShowContact] = useState(false);
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
  const [bookHour, setBookHour] = useState(null);
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
  const [newLat, setNewLat] = useState("");        // 📍 جديد
  const [newLng, setNewLng] = useState("");        // 📍 جديد
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
  const [editLat, setEditLat] = useState("");      // 📍 جديد
  const [editLng, setEditLng] = useState("");      // 📍 جديد
  const [editPayments, setEditPayments] = useState({});
  const [editWorkingHours, setEditWorkingHours] = useState([...ALL_HOURS]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [rateEdit, setRateEdit] = useState({});
  const [myPos, setMyPos] = useState(null);        // 📍 موقع الزبون الحالي
  const [showForgot, setShowForgot] = useState(false);   // 🔑 نافذة نسيت كلمة السر
  const [forgotPhone, setForgotPhone] = useState("");     // 🔑 رقم الاستعادة

  const changeLang = (l) => { setLang(l); localStorage.setItem("malaabi_lang", l); };
  const langLabel = lang === "ar" ? "🌐 ع" : lang === "fr" ? "🌐 FR" : "🌐 EN";

  const notify = (title, body) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") new Notification(title, { body, icon: "/icon.png" });
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
    const [w, s, b, u] = await Promise.all([
      supabase.from("wilayas").select("*").order("id"),
      supabase.from("stadiums").select("*").order("id"),
      supabase.from("bookings").select("*").order("id"),
      supabase.from("users").select("*", { count: "exact", head: true }),
    ]);
    if (w.data) setWilayas(w.data.map(x => x.name));
    if (s.data) setStadiums(s.data);
    if (b.data) setBookings(b.data);
    if (u.count !== null) setUsersCount(u.count);
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => setSplash(false), 2500);
    const saved = localStorage.getItem("malaabi_user");
    const savedOwner = localStorage.getItem("malaabi_owner");
    if (saved) { setUser(JSON.parse(saved)); setScreen("app"); }
    else if (savedOwner) { setOwner(JSON.parse(savedOwner)); setScreen("owner"); }
    loadData();
    if ("Notification" in window) Notification.requestPermission();
  }, []);

  // 🔔 إشعارات المشرف — حجز جديد
  useEffect(() => {
    if (!user || user.phone !== ADMIN_PHONE) return;
    const ch = supabase.channel("admin-new")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (p) => {
        setBookings(prev => prev.some(b => b.id === p.new.id) ? prev : [...prev, p.new]);
        notify("🏟 " + L("newBooking"), `${p.new.client_name} — ${p.new.stadium_name} — ${p.new.hour}:00`);
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, [user, lang]);

  // 🔔 إشعارات صاحب الملعب — حجز جديد لملعبه
  useEffect(() => {
    if (!owner) return;
    const ch = supabase.channel("owner-new-" + owner.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings", filter: `stadium_id=eq.${owner.id}` }, (p) => {
        setBookings(prev => prev.some(b => b.id === p.new.id) ? prev : [...prev, p.new]);
        notify("🔔 " + L("newBooking"), `${p.new.client_name} — ${p.new.date} — ${p.new.hour}:00`);
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, [owner, lang]);

  // 🔔 إشعارات الزبون — قبول أو رفض
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("client-upd-" + user.phone)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings", filter: `client_phone=eq.${user.phone}` }, (p) => {
        setBookings(prev => prev.map(b => b.id === p.new.id ? p.new : b));
        if (p.new.status === "confirmed") notify("✅ " + L("bookingAccepted"), `${p.new.stadium_name} — ${p.new.hour}:00`);
        if (p.new.status === "rejected") notify("❌ " + L("bookingRejected"), `${p.new.stadium_name} — ${p.new.hour}:00`);
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, [user, lang]);

  if (splash) return (
    <div style={{minHeight:"100vh", background:"#111", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Arial,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"48px", fontWeight:"900", color:"#ffffff", letterSpacing:"6px", marginBottom:"8px"}}>malaabi</div>
        <div style={{color:"#00E676", fontSize:"14px"}}>⚽ احجز ملعبك بسهولة</div>
      </div>
    </div>
  );

  const showToast = (msg, color=COLORS.accent) => { setToast({msg, color}); setTimeout(() => setToast(null), 4000); };

  // 📍 تحديد الموقع الحالي — للمشرف عند إضافة/تعديل ملعب
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
      () => showToast(L("locationFailed"), "#FF4444"),
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
      () => showToast(L("locationFailed"), "#FF4444"),
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
      () => showToast(L("locationFailed"), "#FF4444"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLogin = async () => {
    if (!loginPhone || !loginPass) return showToast(t.enterAll, "#FF4444");
    if (loginPhone.length !== 8) return showToast(t.phone8, "#FF4444");
    if (loginPass.length !== 4) return showToast(t.pass4, "#FF4444");
    const { data } = await supabase.from("users").select("*").eq("phone", loginPhone).single();
    if (!data || !(await bcrypt.compare(loginPass, data.password))) return showToast(t.wrongCredentials, "#FF4444");
    setUser(data);
    localStorage.setItem("malaabi_user", JSON.stringify(data));
    setScreen("app");
    showToast(t.welcome + " " + data.name);
  };

  const handleRegister = async () => {
    if (!regName || !regPhone || !regPass) return showToast(t.enterAll, "#FF4444");
    if (regPhone.length !== 8) return showToast(t.phone8, "#FF4444");
    if (regPass.length !== 4) return showToast(t.pass4, "#FF4444");
    const hashed = await bcrypt.hash(regPass, 10);
    const { data, error } = await supabase.from("users").insert({ name: regName, phone: regPhone, password: hashed }).select().single();
    if (error) showToast(t.phoneExists, "#FF4444");
    else {
      setUser(data);
      localStorage.setItem("malaabi_user", JSON.stringify(data));
      setScreen("app"); setUsersCount(p => p + 1);
      showToast(t.accountCreated);
    }
  };

  // 🔑 طلب استعادة كلمة السر عبر واتساب
  const handleForgot = async () => {
    if (forgotPhone.length !== 8) return showToast(t.phone8, "#FF4444");
    const { data } = await supabase.from("users").select("name, phone").eq("phone", forgotPhone).single();
    if (!data) return showToast(L("phoneNotFound"), "#FF4444");
    const msg = lang === "ar"
      ? `مرحبا، نسيت كلمة السر الخاصة بحسابي في تطبيق ملاعبي.\nالاسم: ${data.name}\nرقم الهاتف: ${data.phone}`
      : `Bonjour, mot de passe oublié — Malaabi.\nNom: ${data.name}\nTéléphone: ${data.phone}`;
    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`, "_blank");
    setShowForgot(false); setForgotPhone("");
  };

  const handleOwnerLogin = async () => {
    if (!ownerCodeInput) return showToast(L("enterCode"), "#FF4444");
    const { data } = await supabase.from("stadiums").select("*").eq("owner_code", ownerCodeInput.trim().toUpperCase()).single();
    if (!data) return showToast(L("wrongCode"), "#FF4444");
    if (data.status === "suspended") return showToast(L("suspended"), "#FF4444");
    setOwner(data);
    localStorage.setItem("malaabi_owner", JSON.stringify(data));
    setScreen("owner"); setOwnerCodeInput("");
    showToast(t.welcome + " " + data.name);
  };

  const handleLogout = () => {
    localStorage.removeItem("malaabi_user");
    localStorage.removeItem("malaabi_owner");
    setUser(null); setOwner(null);
    setScreen("login"); setTab("client"); setBottomTab("stadiums");
  };

  const handleLogoClick = () => {
    setLogoClicks(p => {
      const n = p + 1;
      if (n >= 5) {
        const pass = prompt("كلمة السر:");
        if (pass === ADMIN_PASS) { setTab("admin"); showToast(t.adminWelcome); }
        return 0;
      }
      return n;
    });
  };

  const handleDelete = async (id) => {
    await supabase.from("stadiums").delete().eq("id", id);
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
    const { data } = supabase.storage.from("proofs").getPublicUrl(fn);
    setProofUrl(data.publicUrl); setUploading(false);
    showToast("✅");
  };

  const handleBook = async () => {
    if (bookHour === null || !selectedPayApp || !transactionNum) return;
    if (!proofUrl) return showToast(L("proofRequired"), "#FF4444");
    const dup = bookings.some(b => b.stadium_id === selected.id && b.date === bookDate && b.hour === bookHour && b.client_phone === user.phone && b.status !== "rejected");
    if (dup) return showToast(t.duplicateBooking, "#FF4444");
    const { data } = await supabase.from("bookings").insert({
      stadium_id: selected.id, stadium_name: selected.name,
      client_name: user.name, client_phone: user.phone,
      date: bookDate, hour: bookHour, pay_app: selectedPayApp,
      transaction_num: transactionNum, status: "pending", proof_url: proofUrl,
    }).select().single();
    if (data) setBookings(p => [...p, data]);
    closeModal();
    showToast(t.bookingSuccess);
  };

  const closeModal = () => {
    setSelected(null); setStep(1); setBookHour(null);
    setSelectedPayApp(null); setTransactionNum(""); setProofUrl("");
  };

  // ✅ صاحب الملعب فقط
  const confirmBooking = async (id) => {
    const code = genCode();
    const bk = bookings.find(b => b.id === id);
    const st = stadiums.find(s => s.id === bk?.stadium_id) || owner;
    const rate = st?.commission_rate ?? 12;
    const comm = Math.round((st?.price || 0) * rate / 100);
    await supabase.from("bookings").update({ status: "confirmed", code, handled_by: "owner", commission: comm }).eq("id", id);
    if (st) {
      const nb = (st.balance_due || 0) + comm;
      await supabase.from("stadiums").update({ balance_due: nb }).eq("id", st.id);
      setStadiums(p => p.map(s => s.id === st.id ? { ...s, balance_due: nb } : s));
      if (owner && owner.id === st.id) {
        const up = { ...owner, balance_due: nb };
        setOwner(up); localStorage.setItem("malaabi_owner", JSON.stringify(up));
      }
    }
    setBookings(p => p.map(b => b.id === id ? { ...b, status: "confirmed", code, handled_by: "owner", commission: comm } : b));
    showToast("✅ " + t.confirmed + " — " + code);
  };

  const rejectBooking = async (id) => {
    await supabase.from("bookings").update({ status: "rejected", handled_by: "owner" }).eq("id", id);
    setBookings(p => p.map(b => b.id === id ? { ...b, status: "rejected", handled_by: "owner" } : b));
    showToast(t.rejectDone, "#FF4444");
  };

  const resetDue = async (id) => {
    await supabase.from("stadiums").update({ balance_due: 0 }).eq("id", id);
    setStadiums(p => p.map(s => s.id === id ? { ...s, balance_due: 0 } : s));
    showToast("✅ " + L("resetDue"));
  };

  const saveRate = async (id) => {
    const v = parseFloat(rateEdit[id]);
    if (isNaN(v) || v < 0 || v > 100) return showToast("0-100", "#FF4444");
    await supabase.from("stadiums").update({ commission_rate: v }).eq("id", id);
    setStadiums(p => p.map(s => s.id === id ? { ...s, commission_rate: v } : s));
    showToast("✅");
  };

  const toggleSuspend = async (st) => {
    const ns = st.status === "suspended" ? "active" : "suspended";
    await supabase.from("stadiums").update({ status: ns }).eq("id", st.id);
    setStadiums(p => p.map(s => s.id === st.id ? { ...s, status: ns } : s));
    showToast(ns === "suspended" ? "⛔ " + L("suspend") : "✅ " + L("activate"), ns === "suspended" ? "#FF4444" : COLORS.accent);
  };

  const openEdit = (st) => {
    setEditStadium(st); setEditName(st.name); setEditWilaya(st.wilaya); setEditHood(st.hood);
    setEditPrice(st.price); setEditOwnerPhone(st.owner_phone || ""); setEditPayments(st.payments || {});
    setEditWorkingHours(st.working_hours || [...ALL_HOURS]);
    setEditLat(st.latitude != null ? String(st.latitude) : "");   // 📍 جديد
    setEditLng(st.longitude != null ? String(st.longitude) : ""); // 📍 جديد
  };

  const handleEdit = async () => {
    if (!editName || !editWilaya || !editHood || !editPrice) return showToast(t.enterAll, "#FF4444");
    const { data } = await supabase.from("stadiums").update({
      name: editName, wilaya: editWilaya, hood: editHood, price: parseInt(editPrice),
      owner_phone: editOwnerPhone, payments: editPayments, working_hours: editWorkingHours,
      latitude: editLat ? parseFloat(editLat) : null,     // 📍 جديد
      longitude: editLng ? parseFloat(editLng) : null,    // 📍 جديد
    }).eq("id", editStadium.id).select().single();
    if (data) setStadiums(p => p.map(s => s.id === editStadium.id ? data : s));
    setEditStadium(null); showToast(t.editSaved);
  };

  const handleAdd = async () => {
    if (!newName || !newWilayaSelect || !newHood || !newPrice) return showToast(t.enterAll, "#FF4444");
    const colors = ["#00E676","#00B0FF","#FF6D00","#FF4081","#7C4DFF","#00BCD4"];
    const { data } = await supabase.from("stadiums").insert({
      name: newName, wilaya: newWilayaSelect, hood: newHood, price: parseInt(newPrice),
      color: colors[stadiums.length % colors.length], payments: newPayments, owner_phone: newOwnerPhone,
      working_hours: newWorkingHours, image: getRandomImage(),
      latitude: newLat ? parseFloat(newLat) : null,       // 📍 جديد
      longitude: newLng ? parseFloat(newLng) : null,      // 📍 جديد
      owner_code: genOwnerCode(), commission_rate: 12, balance_due: 0, status: "active"
    }).select().single();
    if (data) { setStadiums(p => [...p, data]); showToast("✅ " + L("ownerCodeIs") + ": " + data.owner_code); }
    setNewName(""); setNewWilayaSelect(""); setNewHood(""); setNewPrice(""); setNewPayments({}); setNewOwnerPhone(""); setNewWorkingHours([...ALL_HOURS]);
    setNewLat(""); setNewLng("");                          // 📍 جديد
  };

  const handleAddWilaya = async () => {
    if (!newWilaya || wilayas.includes(newWilaya)) return;
    await supabase.from("wilayas").insert({ name: newWilaya });
    setWilayas(p => [...p, newWilaya]); setNewWilaya("");
    showToast(t.wilayaAdded);
  };

  const toggleHour = (h, isEdit) => {
    if (isEdit) setEditWorkingHours(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h].sort((a,b) => a-b));
    else setNewWorkingHours(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h].sort((a,b) => a-b));
  };

  const isBooked = (sid, d, h) => bookings.some(b => b.stadium_id === sid && b.date === d && b.hour === h && b.status !== "rejected");

  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const myBookings = user ? bookings.filter(b => b.client_phone === user.phone) : [];
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
  if (sortBy === "popular") filteredStadiums = [...filteredStadiums].sort((a,b) => confirmedBookings.filter(x => x.stadium_id === b.id).length - confirmedBookings.filter(x => x.stadium_id === a.id).length);
  // 📍 الترتيب حسب الأقرب
  if (sortBy === "nearest" && myPos) filteredStadiums = [...filteredStadiums].sort((a,b) => {
    const da = stadiumDistance(a), db = stadiumDistance(b);
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const ownerBookings = owner ? bookings.filter(b => b.stadium_id === owner.id) : [];
  const ownerPending = ownerBookings.filter(b => b.status === "pending");
  const payApp = selectedPayApp ? PAYMENT_APPS.find(p => p.id === selectedPayApp) : null;
  const stadiumPayNum = selected && payApp ? (selected.payments?.[selectedPayApp] || "") : "";
  const stadiumHours = selected ? (selected.working_hours || ALL_HOURS) : ALL_HOURS;

  const inp = { width:"100%", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"12px 16px", color:"#fff", fontSize:"15px", fontFamily:"inherit", marginBottom:"16px", boxSizing:"border-box", outline:"none" };
  const lbl = { color:COLORS.muted, fontSize:"13px", marginBottom:"6px", display:"block" };
  const sel = { ...inp };

  const BottomNav = () => (
    <div style={{position:"fixed", bottom:0, left:0, right:0, background:COLORS.card, borderTop:`1px solid ${COLORS.border}`, display:"flex", zIndex:50, paddingBottom:"8px"}}>
      {[
        { id:"stadiums", icon:"🏟", label: lang==="ar"?"الملاعب":lang==="fr"?"Terrains":"Fields" },
        { id:"profile", icon:"👤", label: lang==="ar"?"حسابي":lang==="fr"?"Profil":"Profile" },
        { id:"notifs", icon:"🔔", label: lang==="ar"?"الإشعارات":lang==="fr"?"Notifs":"Notifs", badge: unreadNotifs },
        { id:"contact", icon:"💬", label: lang==="ar"?"اتصل بنا":lang==="fr"?"Contact":"Contact" },
      ].map(item => (
        <button key={item.id} onClick={() => {
          if (item.id === "contact") return setShowContact(true);
          if (item.id === "profile") return setShowProfile(true);
          setBottomTab(item.id);
        }} style={{flex:1, padding:"10px 4px 4px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:"4px"}}>
          <div style={{fontSize:"22px", position:"relative"}}>
            {item.icon}
            {item.badge > 0 && <div style={{position:"absolute", top:"-4px", right:"-4px", background:"#FF4444", color:"#fff", borderRadius:"50%", width:"16px", height:"16px", fontSize:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700"}}>{item.badge}</div>}
          </div>
          <div style={{fontSize:"10px", color: bottomTab===item.id?COLORS.accent:COLORS.muted, fontWeight: bottomTab===item.id?"700":"400"}}>{item.label}</div>
        </button>
      ))}
    </div>
  );
  // ✅ شاشة الدخول — 3 خيارات
  if (screen === "login" || screen === "register" || screen === "ownerLogin") {
    const isReg = screen === "register";
    const isOwner = screen === "ownerLogin";
    return (
      <div style={{minHeight:"100vh", background:COLORS.bg, fontFamily:"Tajawal,sans-serif", direction:isRTL?"rtl":"ltr", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px"}}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
        <div style={{position:"fixed", top:"16px", left:"16px", zIndex:999}}><LangButton/></div>
        <div style={{width:"100%", maxWidth:"400px"}}>
          <div style={{textAlign:"center", marginBottom:"32px"}}>
            <div style={{fontSize:"64px", marginBottom:"8px", filter:"drop-shadow(0 0 20px #00E676)"}}>⚽</div>
            <div style={{fontSize:"32px", fontWeight:"800", background:"linear-gradient(135deg, #00E676, #00B0FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>{t.appName}</div>
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
                <input style={{...inp, letterSpacing:"4px", textAlign:"center", fontWeight:"800", fontSize:"18px"}} placeholder="M••••••" value={ownerCodeInput} onChange={e => setOwnerCodeInput(e.target.value.toUpperCase())}/>
                <button onClick={handleOwnerLogin} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#FF6D00,#FF4081)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"16px", cursor:"pointer", fontFamily:"inherit", color:"#fff"}}>{t.enterApp}</button>
                <button onClick={() => setScreen("login")} style={{width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"10px", fontSize:"13px"}}>{L("backToLogin")}</button>
              </>
            ) : isReg ? (
              <>
                <div style={{fontSize:"19px", fontWeight:"800", marginBottom:"18px", textAlign:"center"}}>{L("createNewAccount")}</div>
                <label style={lbl}>{t.fullName}</label>
                <input style={inp} placeholder={t.enterName} value={regName} onChange={e => setRegName(e.target.value)}/>
                <label style={lbl}>{t.phone}</label>
                <input style={inp} placeholder={t.enter8} maxLength={8} value={regPhone} onChange={e => setRegPhone(e.target.value.replace(/\D/g,""))}/>
                <label style={lbl}>{t.password}</label>
                <input style={inp} type="password" placeholder={t.enter4} maxLength={4} value={regPass} onChange={e => setRegPass(e.target.value.replace(/\D/g,""))}/>
                <button onClick={handleRegister} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"16px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{t.createAccount}</button>
                <button onClick={() => setScreen("login")} style={{width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.accent2, fontWeight:"700", cursor:"pointer", fontFamily:"inherit", marginTop:"12px", fontSize:"14px"}}>{L("haveAccount")}</button>
              </>
            ) : (
              <>
                <label style={lbl}>{t.phone}</label>
                <input style={inp} placeholder={t.enter8} maxLength={8} value={loginPhone} onChange={e => setLoginPhone(e.target.value.replace(/\D/g,""))}/>
                <label style={lbl}>{t.password}</label>
                <input style={{...inp, marginBottom:"10px"}} type="password" placeholder={t.enter4} maxLength={4} value={loginPass} onChange={e => setLoginPass(e.target.value.replace(/\D/g,""))} onKeyDown={e => e.key === "Enter" && handleLogin()}/>
                <button onClick={handleLogin} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"16px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{t.enterApp}</button>

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
            <button onClick={() => setShowAbout(true)} style={{width:"100%", padding:"12px", background:"transparent", border:"none", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"8px", fontSize:"13px"}}>{lang==="ar" ? "🏟 تعرف علينا" : lang==="fr" ? "🏟 À propos" : "🏟 About us"}</button>
          </div>
        </div>

        {/* 🔑 نافذة استعادة كلمة السر */}
        {showForgot && (
          <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setShowForgot(false)}>
            <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"400px", padding:"28px"}}>
              <div style={{textAlign:"center", marginBottom:"18px"}}>
                <div style={{fontSize:"42px", marginBottom:"8px"}}>🔑</div>
                <div style={{fontSize:"18px", fontWeight:"800", color:COLORS.accent}}>{L("forgotTitle")}</div>
              </div>
              <div style={{color:COLORS.muted, fontSize:"13px", lineHeight:"1.9", marginBottom:"18px", textAlign:lang==="ar"?"right":"left"}}>{L("forgotDesc")}</div>
              <label style={lbl}>{t.phone}</label>
              <input style={inp} placeholder={t.enter8} maxLength={8} value={forgotPhone} onChange={e => setForgotPhone(e.target.value.replace(/\D/g,""))}/>
              <button onClick={handleForgot} style={{width:"100%", padding:"14px", background:"#25D366", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:"pointer", fontFamily:"inherit", color:"#fff"}}>{L("sendRequest")}</button>
              <button onClick={() => setShowForgot(false)} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"10px"}}>{lang==="ar" ? "اغلاق" : lang==="fr" ? "Fermer" : "Close"}</button>
            </div>
          </div>
        )}

        {showAbout && (
          <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setShowAbout(false)}>
            <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"420px", padding:"32px", textAlign:"center"}}>
              <div style={{fontSize:"48px", marginBottom:"12px"}}>⚽</div>
              <div style={{fontSize:"22px", fontWeight:"800", color:COLORS.accent, marginBottom:"16px"}}>malaabi</div>
              <div style={{color:COLORS.muted, fontSize:"14px", lineHeight:"2", marginBottom:"24px", textAlign:lang==="ar"?"right":"left"}}>{aboutText[lang]}</div>
              <button onClick={() => setShowAbout(false)} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{lang==="ar" ? "اغلاق" : lang==="fr" ? "Fermer" : "Close"}</button>
            </div>
          </div>
        )}
        {toast && <div style={{position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", background:toast.color, color:"#fff", padding:"14px 28px", borderRadius:"16px", fontWeight:"700", zIndex:999, maxWidth:"90%", textAlign:"center"}}>{toast.msg}</div>}
      </div>
    );
  }

  // ✅ واجهة صاحب الملعب
  if (screen === "owner" && owner) {
    const st = stadiums.find(s => s.id === owner.id) || owner;
    const conf = ownerBookings.filter(b => b.status === "confirmed");
    return (
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
              <button onClick={() => window.open(mapsLink(st.latitude, st.longitude), "_blank")} style={{padding:"10px 14px", background:"#00B0FF22", color:COLORS.accent2, border:"1px solid #00B0FF44", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px", whiteSpace:"nowrap"}}>{L("showOnMap")}</button>
            )}
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

          <div style={{fontSize:"18px", fontWeight:"800", marginBottom:"14px"}}>📋 {t.requests}</div>
          {ownerPending.length === 0 ? (
            <div style={{textAlign:"center", padding:"50px", color:COLORS.muted, background:COLORS.card, borderRadius:"16px", border:`1px solid ${COLORS.border}`}}>{t.noPending}</div>
          ) : ownerPending.map((b,i) => {
            const pa = PAYMENT_APPS.find(p => p.id===b.pay_app);
            return (
              <div key={i} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", marginBottom:"12px", border:`1px solid ${COLORS.border}`}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}>
                  <div>
                    <div style={{fontWeight:"700", fontSize:"15px"}}>{b.client_name}</div>
                    <div style={{color:COLORS.muted, fontSize:"13px"}}>📞 {b.client_phone}</div>
                    <div style={{color:COLORS.muted, fontSize:"13px"}}>📅 {b.date} — {b.hour}:00</div>
                  </div>
                  <div style={{background:`${pa?.color}22`, color:pa?.color, padding:"4px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"700", height:"fit-content"}}>{pa?.name}</div>
                </div>
                <div style={{background:COLORS.bg, borderRadius:"10px", padding:"10px 14px", marginBottom:"10px", fontSize:"13px"}}>{t.serialNum}: <span style={{color:COLORS.accent, fontWeight:"700"}}>{b.transaction_num}</span></div>
                {b.proof_url && <a href={b.proof_url} target="_blank" rel="noreferrer" style={{display:"block", textAlign:"center", padding:"10px", background:"#00B0FF22", color:COLORS.accent2, border:"1px solid #00B0FF44", borderRadius:"10px", fontWeight:"700", fontSize:"13px", textDecoration:"none", marginBottom:"10px"}}>{L("viewProof")}</a>}
                <div style={{display:"flex", gap:"10px"}}>
                  <button onClick={() => confirmBooking(b.id)} style={{flex:1, padding:"11px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{t.confirm}</button>
                  <button onClick={() => rejectBooking(b.id)} style={{flex:1, padding:"11px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>{t.reject}</button>
                </div>
              </div>
            );
          })}

          <div style={{fontSize:"18px", fontWeight:"800", margin:"24px 0 14px"}}>📜 {t.myBookingsTitle}</div>
          {ownerBookings.filter(b => b.status !== "pending").slice().reverse().map((b,i) => {
            const sc = b.status==="confirmed"?COLORS.accent:"#FF4444";
            return (
              <div key={i} style={{background:COLORS.card, borderRadius:"12px", padding:"14px", marginBottom:"10px", border:`1px solid ${sc}33`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:"700"}}>{b.client_name}</div>
                  <div style={{color:COLORS.muted, fontSize:"12px"}}>📅 {b.date} — {b.hour}:00</div>
                  {b.status === "confirmed" && <div style={{color:"#FF6D00", fontSize:"12px", marginTop:"3px"}}>{L("commission")}: {b.commission || 0}</div>}
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

  if (loading) return (
    <div style={{minHeight:"100vh", background:COLORS.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Tajawal,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"56px", marginBottom:"16px", filter:"drop-shadow(0 0 20px #00E676)"}}>⚽</div>
        <div style={{color:COLORS.accent, fontSize:"18px", fontWeight:"700"}}>{t.loading}</div>
      </div>
    </div>
  );
  return (
    <div style={{minHeight:"100vh", background:COLORS.bg, fontFamily:"Tajawal,sans-serif", direction:isRTL?"rtl":"ltr", color:"#fff", touchAction:"pan-x pan-y", paddingBottom:"70px"}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
      <div style={{background:COLORS.card, borderBottom:`1px solid ${COLORS.border}`, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50}}>
        <div onClick={handleLogoClick} style={{fontSize:"18px", fontWeight:"800", background:"linear-gradient(135deg,#00E676,#00B0FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", cursor:"pointer", userSelect:"none"}}>⚽ {t.appName}</div>
        <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
          <LangButton/>
          <button onClick={handleLogout} style={{padding:"5px 10px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"8px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.logout}</button>
          {tab === "admin" && <button onClick={() => setTab("client")} style={{padding:"5px 10px", background:"#FF444422", border:"none", borderRadius:"8px", color:"#FF4444", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.closeAdmin}</button>}
        </div>
      </div>

      <div style={{maxWidth:"1100px", margin:"0 auto", padding:"16px"}}>
        {tab==="client" && (
          <>
            {bottomTab==="stadiums" && (
              <>
                <div style={{background:`linear-gradient(135deg, ${COLORS.card}, #0a1628)`, borderRadius:"16px", padding:"20px 16px", marginBottom:"16px", border:`1px solid ${COLORS.border}`}}>
                  <div style={{fontSize:"22px", fontWeight:"800", marginBottom:"4px", background:"linear-gradient(135deg,#00E676,#00B0FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>{t.bookYourStadium}</div>
                  <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"12px"}}>{t.chooseStadium}</div>
                  <input style={{...inp, marginBottom:"8px", background:"#ffffff11"}} placeholder={t.search} value={searchText} onChange={e => setSearchText(e.target.value)}/>
                  <select style={{...sel, marginBottom:"8px", background:"#ffffff11"}} value={sortBy} onChange={e => { const v = e.target.value; if (v === "nearest") return findNearest(); setSortBy(v); }}>
                    <option value="default">{t.sortDefault}</option>
                    <option value="price_asc">{t.sortPriceAsc}</option>
                    <option value="price_desc">{t.sortPriceDesc}</option>
                    <option value="popular">{t.sortPopular}</option>
                    <option value="nearest">📍 {L("sortNearest")}</option>
                  </select>
                  {/* 🎯 زر الأقرب لي */}
                  <div style={{display:"flex", gap:"8px"}}>
                    <button onClick={findNearest} style={{flex:2, padding:"12px", background: sortBy==="nearest"?"linear-gradient(135deg,#00E676,#00B0FF)":"#ffffff11", color: sortBy==="nearest"?"#000":COLORS.accent, border:`1px solid ${sortBy==="nearest"?"transparent":COLORS.border}`, borderRadius:"10px", fontWeight:"800", cursor:"pointer", fontFamily:"inherit", fontSize:"14px"}}>
                      {L("nearestBtn")}
                    </button>
                    {sortBy==="nearest" && (
                      <button onClick={() => setSortBy("default")} style={{flex:1, padding:"12px", background:"#ffffff11", color:COLORS.muted, border:`1px solid ${COLORS.border}`, borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>
                        {L("showAllBtn")}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"16px"}}>
                  {[t.all, ...wilayas].map((w, i) => {
                    const act = i === 0 ? filterWilaya === "الكل" : filterWilaya === w;
                    return <button key={w} onClick={() => setFilterWilaya(i === 0 ? "الكل" : w)} style={{padding:"6px 14px", borderRadius:"20px", border:`1px solid ${act ? COLORS.accent : COLORS.border}`, cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"13px", background: act?"linear-gradient(135deg,#00E676,#00B0FF)":COLORS.card, color: act?"#000":COLORS.muted}}>{w}</button>;
                  })}
                </div>
                {filteredStadiums.length===0 ? (
                  <div style={{textAlign:"center", padding:"80px 20px", color:COLORS.muted}}>
                    <div style={{fontSize:"60px", marginBottom:"16px"}}>🏟</div><div>{t.noStadiums}</div>
                  </div>
                ) : (
                  <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"16px"}}>
                    {filteredStadiums.map((s) => {
                      const hrs = s.working_hours || ALL_HOURS;
                      const free = hrs.filter(h => !isBooked(s.id, today, h)).length;
                      const dist = stadiumDistance(s);
                      return (
                        <div key={s.id} style={{background:COLORS.card, borderRadius:"20px", border:`1px solid ${COLORS.border}`, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
                          <div style={{position:"relative"}}>
                            <img src={s.image || STADIUM_IMAGES[0]} alt={s.name} style={{width:"100%", height:"140px", objectFit:"cover", display:"block"}}/>
                            <div style={{position:"absolute", inset:0, background:`linear-gradient(to bottom, transparent 50%, ${COLORS.card} 100%)`}}></div>
                            {/* 📍 شارة المسافة */}
                            {dist != null && (
                              <div style={{position:"absolute", top:"10px", insetInlineStart:"10px", background:"rgba(0,0,0,0.65)", color:COLORS.accent, padding:"4px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"800", backdropFilter:"blur(4px)"}}>
                                📍 {dist < 1 ? Math.round(dist*1000) + " m" : dist.toFixed(1) + " " + L("kmAway")}
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
                              <div style={{background:"#00E67622", borderRadius:"10px", padding:"8px 12px", textAlign:"center"}}>
                                <div style={{color:COLORS.accent, fontWeight:"800", fontSize:"16px"}}>{free}</div>
                                <div style={{color:COLORS.muted, fontSize:"10px"}}>{t.hourAvailable}</div>
                              </div>
                            </div>
                            <div style={{display:"flex", gap:"8px"}}>
                              <button onClick={() => { setSelected(s); setStep(1); setBookDate(today); }} style={{flex:2, padding:"11px", background:`linear-gradient(135deg, ${s.color}, ${s.color}BB)`, border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{t.bookNow}</button>
                              {/* 🧭 زر الاتجاهات */}
                              {hasLocation(s) && (
                                <button onClick={() => window.open(directionsLink(s.latitude, s.longitude), "_blank")} style={{flex:1, padding:"11px", background:"#00B0FF22", color:COLORS.accent2, border:"1px solid #00B0FF44", borderRadius:"12px", fontWeight:"700", fontSize:"13px", cursor:"pointer", fontFamily:"inherit"}}>{L("directions")}</button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
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
                        {/* 🧭 اتجاهات الملعب في الإشعار المقبول */}
                        {b.status==="confirmed" && hasLocation(bst) && (
                          <button onClick={() => window.open(directionsLink(bst.latitude, bst.longitude), "_blank")} style={{marginTop:"8px", display:"block", padding:"8px 14px", background:"#00B0FF22", color:COLORS.accent2, border:"1px solid #00B0FF44", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{L("directions")}</button>
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
              {[["bookings",L("allBookings"),"#FF6D00"],["dues",L("dues"),"#FF4081"],["stadiums",t.stadiums,"#7C4DFF"],["stats",t.stats,COLORS.accent],["add",t.addStadium,COLORS.accent2]].map(([k,lab,c]) => (
                <button key={k} onClick={() => setAdminTab(k)} style={{flex:1, padding:"8px 2px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"11px", background: adminTab===k?c:"transparent", color: adminTab===k?"#fff":COLORS.muted}}>{lab}</button>
              ))}
            </div>

            {/* 👁 مشاهدة فقط */}
            {adminTab==="bookings" && (
              <div>
                <div style={{background:"#00B0FF15", border:"1px solid #00B0FF33", borderRadius:"12px", padding:"12px", marginBottom:"16px", textAlign:"center", color:COLORS.accent2, fontSize:"13px", fontWeight:"700"}}>👁 {L("viewOnly")}</div>
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
                      {b.proof_url && <a href={b.proof_url} target="_blank" rel="noreferrer" style={{display:"block", textAlign:"center", padding:"11px", background:"#00B0FF22", color:COLORS.accent2, border:"1px solid #00B0FF44", borderRadius:"10px", fontWeight:"700", fontSize:"13px", textDecoration:"none"}}>{L("viewProof")}</a>}
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
                      <div style={{background: s.status==="suspended"?"#FF444422":"#00E67622", color: s.status==="suspended"?"#FF4444":COLORS.accent, padding:"4px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:"700"}}>{s.status==="suspended"?L("suspendedS"):L("active")}</div>
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
                      <button onClick={() => resetDue(s.id)} style={{flex:1, padding:"10px", background:"#00E67622", color:COLORS.accent, border:"1px solid #00E67644", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>💰 {L("resetDue")}</button>
                      <button onClick={() => toggleSuspend(s)} style={{flex:1, padding:"10px", background: s.status==="suspended"?"#00B0FF22":"#FF6D0022", color: s.status==="suspended"?COLORS.accent2:"#FF6D00", border:`1px solid ${s.status==="suspended"?"#00B0FF44":"#FF6D0044"}`, borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{s.status==="suspended"?"▶ "+L("activate"):"⛔ "+L("suspend")}</button>
                      <button onClick={() => setConfirmDelete(s)} style={{padding:"10px 14px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>🗑</button>
                    </div>
                  </div>
                ))}
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
                        {hasLocation(s) && <button onClick={() => window.open(mapsLink(s.latitude, s.longitude), "_blank")} style={{padding:"8px 12px", background:"#00E67622", color:COLORS.accent, border:"1px solid #00E67644", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>🗺</button>}
                        <button onClick={() => openEdit(s)} style={{padding:"8px 12px", background:"#00B0FF22", color:COLORS.accent2, border:"1px solid #00B0FF44", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.edit}</button>
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
                    {wilayas.map(w => <div key={w} style={{background:"#00B0FF22", color:COLORS.accent2, padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"700"}}>{w}</div>)}
                  </div>
                </div>
                <div style={{background:COLORS.card, borderRadius:"16px", border:`1px solid ${COLORS.border}`, padding:"20px"}}>
                  <div style={{fontWeight:"700", color:COLORS.accent, marginBottom:"16px"}}>{t.addNewStadium}</div>
                  <label style={lbl}>{t.stadiumName}</label>
                  <input style={inp} value={newName} onChange={e => setNewName(e.target.value)}/>
                  <label style={lbl}>{t.wilaya}</label>
                  <select style={sel} value={newWilayaSelect} onChange={e => setNewWilayaSelect(e.target.value)}>
                    <option value="">{t.chooseWilaya}</option>
                    {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <label style={lbl}>{t.hood}</label>
                  <input style={inp} value={newHood} onChange={e => setNewHood(e.target.value)}/>
                  <label style={lbl}>{t.price}</label>
                  <input style={inp} type="number" placeholder="1000" value={newPrice} onChange={e => setNewPrice(e.target.value)}/>
                  <label style={lbl}>{t.ownerPhone}</label>
                  <input style={inp} maxLength={8} value={newOwnerPhone} onChange={e => setNewOwnerPhone(e.target.value.replace(/\D/g,""))}/>

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
                    <button onClick={() => getMyLocation(false)} style={{flex:1, padding:"11px", background:"#00B0FF22", color:COLORS.accent2, border:"1px solid #00B0FF44", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>{L("myLocation")}</button>
                    {newLat && newLng && <button onClick={() => window.open(mapsLink(newLat, newLng), "_blank")} style={{flex:1, padding:"11px", background:"#00E67622", color:COLORS.accent, border:"1px solid #00E67644", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>{L("checkLocation")}</button>}
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
                  <button onClick={handleAdd} style={{padding:"12px 24px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"14px", color:"#000"}}>{t.addStadiumBtn}</button>
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
            <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(lang==="ar" ? "مرحبا، أريد الاستفسار عن تطبيق ملاعبي" : "Bonjour, Malaabi")}`, "_blank")} style={{width:"100%", padding:"14px", background:"#25D366", border:"none", borderRadius:"14px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"15px", color:"#fff", marginBottom:"12px"}}>📱 WhatsApp — +216 54542791</button>
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
              {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <label style={lbl}>{t.hood}</label>
            <input style={inp} value={editHood} onChange={e => setEditHood(e.target.value)}/>
            <label style={lbl}>{t.price}</label>
            <input style={inp} type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}/>
            <label style={lbl}>{t.ownerPhone}</label>
            <input style={inp} maxLength={8} value={editOwnerPhone} onChange={e => setEditOwnerPhone(e.target.value.replace(/\D/g,""))}/>

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
              <button onClick={() => getMyLocation(true)} style={{flex:1, padding:"11px", background:"#00B0FF22", color:COLORS.accent2, border:"1px solid #00B0FF44", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>{L("myLocation")}</button>
              {editLat && editLng && <button onClick={() => window.open(mapsLink(editLat, editLng), "_blank")} style={{flex:1, padding:"11px", background:"#00E67622", color:COLORS.accent, border:"1px solid #00E67644", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>{L("checkLocation")}</button>}
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
              <button onClick={handleEdit} style={{flex:2, padding:"12px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", color:"#000", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>{t.saveEdit}</button>
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
              <button onClick={() => window.open(directionsLink(selected.latitude, selected.longitude), "_blank")} style={{width:"100%", padding:"11px", background:"#00B0FF22", color:COLORS.accent2, border:"1px solid #00B0FF44", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", marginBottom:"16px"}}>
                {L("directions")}{stadiumDistance(selected) != null ? ` — ${stadiumDistance(selected).toFixed(1)} ${L("kmAway")}` : ""}
              </button>
            )}
            {step===1 && (
              <>
                <label style={lbl}>{t.date}</label>
                <input type="date" style={inp} value={bookDate} min={today} onChange={e => { setBookDate(e.target.value); setBookHour(null); }}/>
                <label style={lbl}>{t.chooseHour}</label>
                <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"6px", marginBottom:"16px"}}>
                  {stadiumHours.map(h => {
                    const tk = isBooked(selected.id, bookDate, h);
                    const s2 = bookHour===h;
                    return <button key={h} disabled={tk} onClick={() => !tk && setBookHour(h)} style={{padding:"8px 4px", borderRadius:"10px", border: s2?`2px solid ${selected.color}`:"2px solid transparent", background: tk?COLORS.bg:s2?`${selected.color}22`:COLORS.bg, color: tk?"#374151":s2?selected.color:COLORS.muted, cursor:tk?"not-allowed":"pointer", fontSize:"11px", fontWeight:"600", fontFamily:"inherit"}}>{h}:00{tk && <span style={{display:"block", fontSize:"9px", color:"#4b5563"}}>{t.booked}</span>}</button>;
                  })}
                </div>
                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={closeModal} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.cancel}</button>
                  <button disabled={bookHour===null} onClick={() => setStep(2)} style={{flex:2, padding:"12px", background:bookHour===null?COLORS.bg:`linear-gradient(135deg,${selected.color},${selected.color}BB)`, border:"none", borderRadius:"12px", color:bookHour===null?COLORS.muted:"#000", fontWeight:"700", cursor:bookHour===null?"not-allowed":"pointer", fontFamily:"inherit"}}>{t.next}</button>
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
                    <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"8px"}}>{t.sendAmount} <strong style={{color:"#fff"}}>{selected.price}</strong></div>
                    <div style={{fontSize:"20px", fontWeight:"800", color:payApp?.color, letterSpacing:"2px"}}>{stadiumPayNum}</div>
                    <div style={{color:COLORS.muted, fontSize:"12px", marginTop:"4px"}}>{t.via} {payApp?.name}</div>
                  </div>
                )}
                <label style={lbl}>{t.serialNum}</label>
                <input style={inp} placeholder={t.enterSerial} maxLength={19} value={transactionNum} onChange={e => setTransactionNum(e.target.value)}/>
                <label style={lbl}>{L("proof")}</label>
                <label style={{display:"block", width:"100%", padding:"14px", background: proofUrl?"#00E67622":COLORS.bg, border:`2px dashed ${proofUrl?COLORS.accent:COLORS.border}`, borderRadius:"12px", color: proofUrl?COLORS.accent:COLORS.muted, fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", textAlign:"center", marginBottom:"16px", boxSizing:"border-box"}}>
                  {uploading ? L("uploading") : proofUrl ? "✅ " + L("proof") : L("uploadProof")}
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e => handleUploadProof(e.target.files[0])}/>
                </label>
                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={() => setStep(1)} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.back}</button>
                  <button disabled={!selectedPayApp||!transactionNum||!proofUrl} onClick={handleBook} style={{flex:2, padding:"12px", background:(!selectedPayApp||!transactionNum||!proofUrl)?COLORS.bg:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", color:(!selectedPayApp||!transactionNum||!proofUrl)?COLORS.muted:"#000", fontWeight:"700", cursor:(!selectedPayApp||!transactionNum||!proofUrl)?"not-allowed":"pointer", fontFamily:"inherit"}}>{t.confirmBooking}</button>
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

      {toast && <div style={{position:"fixed", bottom:"80px", left:"50%", transform:"translateX(-50%)", background:toast.color, color:"#fff", padding:"14px 28px", borderRadius:"16px", fontWeight:"700", zIndex:999, maxWidth:"90%", textAlign:"center"}}>{toast.msg}</div>}
    </div>
  );
}
