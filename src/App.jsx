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
const ADMIN_PASS = "malaabi5964";

const COLORS = {
  bg: "#070B14",
  card: "#0D1424",
  border: "#1A2540",
  accent: "#00E676",
  accent2: "#00B0FF",
  text: "#ffffff",
  muted: "#8892A4",
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

const getRandomImage = (id) => {
  const index = id % STADIUM_IMAGES.length;
  return STADIUM_IMAGES[index];
};

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("malaabi_lang") || "ar");
  const t = translations[lang];
  const isRTL = lang === "ar";
  const [splash, setSplash] = useState(true);

  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("client");
  const [adminTab, setAdminTab] = useState("pending");
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
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newName, setNewName] = useState("");
  const [newWilaya, setNewWilaya] = useState("");
  const [newWilayaSelect, setNewWilayaSelect] = useState("");
  const [newHood, setNewHood] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newPayments, setNewPayments] = useState({});
  const [newOwnerPhone, setNewOwnerPhone] = useState("");
  const [newWorkingHours, setNewWorkingHours] = useState([...ALL_HOURS]);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [editStadium, setEditStadium] = useState(null);
  const [editName, setEditName] = useState("");
  const [editWilaya, setEditWilaya] = useState("");
  const [editHood, setEditHood] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOwnerPhone, setEditOwnerPhone] = useState("");
  const [editPayments, setEditPayments] = useState({});
  const [editWorkingHours, setEditWorkingHours] = useState([...ALL_HOURS]);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [rejectedBooking, setRejectedBooking] = useState(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("malaabi_lang", l);
  };

  const langLabel = lang === "ar" ? "🌐 ع" : lang === "fr" ? "🌐 FR" : "🌐 EN";

  const LangButton = () => (
    <div style={{position:"relative"}}>
      <button onClick={() => setShowLangMenu(!showLangMenu)} style={{padding:"6px 12px", borderRadius:"8px", border:`1px solid ${COLORS.border}`, cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"12px", background:COLORS.card, color:COLORS.accent}}>
        {langLabel}
      </button>
      {showLangMenu && (
        <div style={{position:"absolute", top:"110%", left:0, background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:"10px", overflow:"hidden", zIndex:200, minWidth:"80px"}}>
          {[["ar","🇲 ع"],["fr","🇫🇷 FR"],["en","🏴 EN"]].map(([l, label]) => (
            <button key={l} onClick={() => { changeLang(l); setShowLangMenu(false); }} style={{display:"block", width:"100%", padding:"8px 16px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"12px", background: lang===l?`${COLORS.accent}22`:COLORS.card, color: lang===l?COLORS.accent:COLORS.muted, textAlign:"right"}}>
              {label}
            </button>
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
    if (saved) { setUser(JSON.parse(saved)); setScreen("app"); }
    loadData();
  }, []);

  if (splash) return (
    <div style={{minHeight:"100vh", background:"#111", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Arial,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"48px", fontWeight:"900", color:"#ffffff", letterSpacing:"6px", marginBottom:"8px"}}>malaabi</div>
        <div style={{color:"#00E676", fontSize:"14px"}}>⚽ احجز ملعبك بسهولة</div>
      </div>
    </div>
  );

  const showToast = (msg, color=COLORS.accent) => {
    setToast({msg, color});
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async () => {
    if (!loginPhone || !loginPass) return showToast(t.enterAll, "#FF4444");
    if (loginPhone.length !== 8) return showToast(t.phone8, "#FF4444");
    if (loginPass.length !== 4) return showToast(t.pass4, "#FF4444");
    const { data } = await supabase.from("users").select("*").eq("phone", loginPhone).single();
    if (!data || !(await bcrypt.compare(loginPass, data.password))) {
      return showToast(t.wrongCredentials, "#FF4444");
    }
    setUser(data);
    localStorage.setItem("malaabi_user", JSON.stringify(data));
    setScreen("app");
    showToast(t.welcome + " " + data.name);
  };

  const handleRegister = async () => {
    if (!regName || !regPhone || !regPass) return showToast(t.enterAll, "#FF4444");
    if (regPhone.length !== 8) return showToast(t.phone8, "#FF4444");
    if (regPass.length !== 4) return showToast(t.pass4, "#FF4444");
    const hashedPassword = await bcrypt.hash(regPass, 10);
    const { data, error } = await supabase.from("users").insert({ name: regName, phone: regPhone, password: hashedPassword }).select().single();
    if (error) {
      showToast(t.phoneExists, "#FF4444");
    } else {
      setUser(data);
      localStorage.setItem("malaabi_user", JSON.stringify(data));
      setScreen("app");
      setUsersCount(prev => prev + 1);
      showToast(t.accountCreated);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("malaabi_user");
    setUser(null);
    setScreen("login");
    setTab("client");
  };

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const n = prev + 1;
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
    setStadiums(prev => prev.filter(s => s.id !== id));
    setConfirmDelete(null);
    showToast(t.stadiumDeleted, "#FF4444");
  };

  const handleBook = async () => {
    if (bookHour === null) return;
    if (!selectedPayApp || !transactionNum) return;
    const duplicate = bookings.some(b =>
      b.stadium_id === selected.id &&
      b.date === bookDate &&
      b.hour === bookHour &&
      b.client_phone === user.phone &&
      b.status !== "rejected"
    );
    if (duplicate) return showToast(t.duplicateBooking, "#FF4444");
    const { data } = await supabase.from("bookings").insert({
      stadium_id: selected.id, stadium_name: selected.name,
      client_name: user.name, client_phone: user.phone,
      date: bookDate, hour: bookHour, pay_app: selectedPayApp,
      transaction_num: transactionNum, status: "pending",
    }).select().single();
    if (data) setBookings(prev => [...prev, data]);
    closeModal();
    showToast(t.bookingSuccess);
  };

  const closeModal = () => {
    setSelected(null); setStep(1);
    setBookHour(null); setSelectedPayApp(null); setTransactionNum("");
  };

  const confirmBooking = async (id) => {
    const code = genCode();
    await supabase.from("bookings").update({ status: "confirmed", code }).eq("id", id);
    const booking = bookings.find(b => b.id === id);
    const stadium = stadiums.find(s => s.id === booking?.stadium_id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed", code } : b));
    setConfirmedBooking({ ...booking, code, ownerPhone: stadium?.owner_phone });
  };

  const rejectBooking = async (id) => {
    await supabase.from("bookings").update({ status: "rejected" }).eq("id", id);
    const booking = bookings.find(b => b.id === id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "rejected" } : b));
    setRejectedBooking(booking);
    showToast(t.rejectDone, "#FF4444");
  };

  const openEdit = (st) => {
    setEditStadium(st);
    setEditName(st.name);
    setEditWilaya(st.wilaya);
    setEditHood(st.hood);
    setEditPrice(st.price);
    setEditOwnerPhone(st.owner_phone || "");
    setEditPayments(st.payments || {});
    setEditWorkingHours(st.working_hours || [...ALL_HOURS]);
  };

  const handleEdit = async () => {
    if (!editName || !editWilaya || !editHood || !editPrice) return showToast(t.enterAll, "#FF4444");
    const { data } = await supabase.from("stadiums").update({
      name: editName, wilaya: editWilaya, hood: editHood,
      price: parseInt(editPrice), owner_phone: editOwnerPhone,
      payments: editPayments, working_hours: editWorkingHours
    }).eq("id", editStadium.id).select().single();
    if (data) setStadiums(prev => prev.map(s => s.id === editStadium.id ? data : s));
    setEditStadium(null);
    showToast(t.editSaved);
  };

  const handleAdd = async () => {
    if (!newName || !newWilayaSelect || !newHood || !newPrice) return showToast(t.enterAll, "#FF4444");
    const colors = ["#00E676","#00B0FF","#FF6D00","#FF4081","#7C4DFF","#00BCD4"];
    const { data } = await supabase.from("stadiums").insert({
      name: newName, wilaya: newWilayaSelect, hood: newHood,
      price: parseInt(newPrice), color: colors[stadiums.length % colors.length],
      payments: newPayments, owner_phone: newOwnerPhone,
      working_hours: newWorkingHours
    }).select().single();
    if (data) setStadiums(prev => [...prev, data]);
    setNewName(""); setNewWilayaSelect(""); setNewHood(""); setNewPrice(""); setNewPayments({}); setNewOwnerPhone(""); setNewWorkingHours([...ALL_HOURS]);
    showToast(t.stadiumAdded);
  };

  const handleAddWilaya = async () => {
    if (!newWilaya || wilayas.includes(newWilaya)) return;
    await supabase.from("wilayas").insert({ name: newWilaya });
    setWilayas(prev => [...prev, newWilaya]);
    setNewWilaya("");
    showToast(t.wilayaAdded);
  };

  const toggleHour = (hour, isEdit) => {
    if (isEdit) {
      setEditWorkingHours(prev =>
        prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour].sort((a,b) => a-b)
      );
    } else {
      setNewWorkingHours(prev =>
        prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour].sort((a,b) => a-b)
      );
    }
  };

  const isBooked = (sid, date, hour) =>
    bookings.some(b => b.stadium_id === sid && b.date === date && b.hour === hour && b.status !== "rejected");

  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const myBookings = user ? bookings.filter(b => b.client_phone === user.phone) : [];
  const myConfirmedBookings = myBookings.filter(b => b.status === "confirmed");

  let filteredStadiums = filterWilaya === "الكل" ? stadiums : stadiums.filter(s => s.wilaya === filterWilaya);
  if (searchText) filteredStadiums = filteredStadiums.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase()) ||
    s.hood.toLowerCase().includes(searchText.toLowerCase()) ||
    s.wilaya.toLowerCase().includes(searchText.toLowerCase())
  );
  if (sortBy === "price_asc") filteredStadiums = [...filteredStadiums].sort((a,b) => a.price - b.price);
  if (sortBy === "price_desc") filteredStadiums = [...filteredStadiums].sort((a,b) => b.price - a.price);
  if (sortBy === "popular") filteredStadiums = [...filteredStadiums].sort((a,b) => confirmedBookings.filter(x => x.stadium_id === b.id).length - confirmedBookings.filter(x => x.stadium_id === a.id).length);

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const payApp = selectedPayApp ? PAYMENT_APPS.find(p => p.id === selectedPayApp) : null;
  const stadiumPayNum = selected && payApp ? (selected.payments?.[selectedPayApp] || "") : "";
  const stadiumHours = selected ? (selected.working_hours || ALL_HOURS) : ALL_HOURS;

  const inp = { width:"100%", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"12px 16px", color:"#fff", fontSize:"15px", fontFamily:"inherit", marginBottom:"16px", boxSizing:"border-box", outline:"none" };
  const lbl = { color:COLORS.muted, fontSize:"13px", marginBottom:"6px", display:"block" };
  const sel = { width:"100%", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"12px 16px", color:"#fff", fontSize:"15px", fontFamily:"inherit", marginBottom:"16px", boxSizing:"border-box", outline:"none" };if (screen === "login" || screen === "register") {
    const isReg = screen === "register";
    return (
      <div style={{minHeight:"100vh", background:COLORS.bg, fontFamily:"Tajawal,sans-serif", direction:isRTL?"rtl":"ltr", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px"}}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
        {/* ✅ زر اللغة في الزاوية العلوية */}
        <div style={{position:"fixed", top:"16px", left:"16px", zIndex:999}}>
          <LangButton/>
        </div>
        <div style={{width:"100%", maxWidth:"400px"}}>
          <div style={{textAlign:"center", marginBottom:"40px"}}>
            <div style={{fontSize:"64px", marginBottom:"8px", filter:"drop-shadow(0 0 20px #00E676)"}}>⚽</div>
            <div style={{fontSize:"32px", fontWeight:"800", background:"linear-gradient(135deg, #00E676, #00B0FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>{t.appName}</div>
            <div style={{color:COLORS.muted, marginTop:"8px", fontSize:"15px"}}>{t.appSlogan}</div>
          </div>
          <div style={{background:COLORS.card, borderRadius:"24px", padding:"28px", border:`1px solid ${COLORS.border}`, boxShadow:"0 25px 50px rgba(0,0,0,0.5)"}}>
            <div style={{display:"flex", marginBottom:"24px", background:COLORS.bg, borderRadius:"12px", padding:"4px"}}>
              <button onClick={() => setScreen("login")} style={{flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", background:!isReg?"linear-gradient(135deg,#00E676,#00B0FF)":"transparent", color:!isReg?"#000":COLORS.muted}}>{t.login}</button>
              <button onClick={() => setScreen("register")} style={{flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", background:isReg?"linear-gradient(135deg,#00E676,#00B0FF)":"transparent", color:isReg?"#000":COLORS.muted}}>{t.register}</button>
            </div>
            {isReg && (
              <>
                <label style={lbl}>{t.fullName}</label>
                <input style={inp} placeholder={t.enterName} value={regName} onChange={e => setRegName(e.target.value)}/>
              </>
            )}
            <label style={lbl}>{t.phone}</label>
            <input style={inp} placeholder={t.enter8} maxLength={8} value={isReg ? regPhone : loginPhone} onChange={e => { const val = e.target.value.replace(/\D/g,""); isReg ? setRegPhone(val) : setLoginPhone(val); }}/>
            <label style={lbl}>{t.password}</label>
            <input style={inp} type="password" placeholder={t.enter4} maxLength={4} value={isReg ? regPass : loginPass} onChange={e => { const val = e.target.value.replace(/\D/g,""); isReg ? setRegPass(val) : setLoginPass(val); }}/>
            <button onClick={isReg ? handleRegister : handleLogin} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"16px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>
              {isReg ? t.createAccount : t.enterApp}
            </button>
          </div>
        </div>
        {toast && <div style={{position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", background:toast.color, color:"#fff", padding:"14px 28px", borderRadius:"16px", fontWeight:"700", zIndex:999}}>{toast.msg}</div>}
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
    <div style={{minHeight:"100vh", background:COLORS.bg, fontFamily:"Tajawal,sans-serif", direction:isRTL?"rtl":"ltr", color:"#fff", touchAction:"pan-x pan-y"}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
      <div style={{background:COLORS.card, borderBottom:`1px solid ${COLORS.border}`, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50, backdropFilter:"blur(10px)"}}>
        <div onClick={handleLogoClick} style={{fontSize:"18px", fontWeight:"800", background:"linear-gradient(135deg,#00E676,#00B0FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", cursor:"pointer", userSelect:"none"}}>⚽ {t.appName}</div>
        <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
          <LangButton/>
          {user && (
            <div onClick={() => setShowProfile(true)} style={{color:COLORS.accent, fontSize:"12px", cursor:"pointer", fontWeight:"700", background:"#00E67622", padding:"5px 10px", borderRadius:"8px", border:"1px solid #00E67644"}}>
              👤 {user.name}
            </div>
          )}
          <button onClick={handleLogout} style={{padding:"5px 10px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"8px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.logout}</button>
          {tab === "admin" && (
            <button onClick={() => setTab("client")} style={{padding:"5px 10px", background:"#FF444422", border:"none", borderRadius:"8px", color:"#FF4444", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.closeAdmin}</button>
          )}
        </div>
      </div>

      <div style={{maxWidth:"1100px", margin:"0 auto", padding:"16px"}}>
        {tab==="client" && (
          <>
            <div style={{background:`linear-gradient(135deg, ${COLORS.card}, #0a1628)`, borderRadius:"16px", padding:"20px 16px", marginBottom:"16px", border:`1px solid ${COLORS.border}`, position:"relative", overflow:"hidden"}}>
              <div style={{fontSize:"22px", fontWeight:"800", marginBottom:"4px", background:"linear-gradient(135deg,#00E676,#00B0FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>{t.bookYourStadium}</div>
              <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"12px"}}>{t.chooseStadium}</div>
              <input style={{...inp, marginBottom:"8px", background:"#ffffff11", border:`1px solid ${COLORS.border}`}} placeholder={t.search} value={searchText} onChange={e => setSearchText(e.target.value)}/>
              <select style={{...sel, marginBottom:0, background:"#ffffff11"}} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">{t.sortDefault}</option>
                <option value="price_asc">{t.sortPriceAsc}</option>
                <option value="price_desc">{t.sortPriceDesc}</option>
                <option value="popular">{t.sortPopular}</option>
              </select>
            </div>

            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"8px"}}>
              <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
                {[t.all, ...wilayas].map((w, idx) => (
                  <button key={w} onClick={() => setFilterWilaya(idx === 0 ? "الكل" : w)} style={{padding:"6px 14px", borderRadius:"20px", border:`1px solid ${(idx === 0 ? filterWilaya === "الكل" : filterWilaya === w) ? COLORS.accent : COLORS.border}`, cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"13px", background: (idx === 0 ? filterWilaya === "الكل" : filterWilaya === w)?"linear-gradient(135deg,#00E676,#00B0FF)":COLORS.card, color: (idx === 0 ? filterWilaya === "الكل" : filterWilaya === w)?"#000":COLORS.muted}}>{w}</button>
                ))}
              </div>
              <button onClick={() => setShowMyBookings(true)} style={{padding:"6px 14px", background:"#7C4DFF22", border:"1px solid #7C4DFF44", borderRadius:"20px", color:"#7C4DFF", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", whiteSpace:"nowrap"}}>
                📋 {t.myBookings} ({myBookings.length})
              </button>
            </div>

            {filteredStadiums.length===0 ? (
              <div style={{textAlign:"center", padding:"80px 20px", color:COLORS.muted}}>
                <div style={{fontSize:"60px", marginBottom:"16px"}}>🏟</div>
                <div>{t.noStadiums}</div>
              </div>
            ) : (
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"16px"}}>
                {filteredStadiums.map((st) => {
                  const hours = st.working_hours || ALL_HOURS;
                  const free = hours.filter(h => !isBooked(st.id, today, h)).length;
                  const imgUrl = getRandomImage(st.id);
                  return (
                    <div key={st.id} style={{background:COLORS.card, borderRadius:"20px", border:`1px solid ${COLORS.border}`, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
                      <div style={{position:"relative"}}>
                        <img src={imgUrl} alt={st.name} style={{width:"100%", height:"140px", objectFit:"cover", display:"block"}}/>
                        <div style={{position:"absolute", inset:0, background:`linear-gradient(to bottom, transparent 50%, ${COLORS.card} 100%)`}}></div>
                        <div style={{position:"absolute", bottom:"10px", right:"12px", left:"12px"}}>
                          <div style={{fontWeight:"800", fontSize:"18px", color:"#fff", textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>{st.name}</div>
                          <div style={{color:"#ffffffaa", fontSize:"12px"}}>📍 {st.wilaya} — {st.hood}</div>
                        </div>
                      </div>
                      <div style={{padding:"12px 16px 16px"}}>
                        <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}>
                          <div style={{background:`${st.color}22`, borderRadius:"10px", padding:"8px 12px", textAlign:"center"}}>
                            <div style={{color:st.color, fontWeight:"800", fontSize:"16px"}}>{st.price}</div>
                            <div style={{color:COLORS.muted, fontSize:"10px"}}>{t.pricePerHour}</div>
                          </div>
                          <div style={{background:"#00E67622", borderRadius:"10px", padding:"8px 12px", textAlign:"center"}}>
                            <div style={{color:COLORS.accent, fontWeight:"800", fontSize:"16px"}}>{free}</div>
                            <div style={{color:COLORS.muted, fontSize:"10px"}}>{t.hourAvailable}</div>
                          </div>
                        </div>
                        <button onClick={() => { setSelected(st); setStep(1); setBookDate(today); }} style={{width:"100%", padding:"11px", background:`linear-gradient(135deg, ${st.color}, ${st.color}BB)`, border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:"pointer", fontFamily:"inherit", color:"#000", boxShadow:`0 4px 15px ${st.color}44`}}>
                          {t.bookNow}
                        </button>
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
            <div style={{display:"flex", gap:"6px", marginBottom:"16px", background:COLORS.card, borderRadius:"12px", padding:"4px"}}>
              {[["pending",t.requests,"#FF6D00"],["stadiums",t.stadiums,"#7C4DFF"],["stats",t.stats,COLORS.accent],["add",t.addStadium,COLORS.accent2]].map(([key,label,color]) => (
                <button key={key} onClick={() => setAdminTab(key)} style={{flex:1, padding:"8px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"12px", background: adminTab===key?color:"transparent", color: adminTab===key?"#fff":COLORS.muted}}>{label}</button>
              ))}
            </div>

            {adminTab==="pending" && (
              <div>
                {pendingBookings.length===0 ? (
                  <div style={{textAlign:"center", padding:"60px", color:COLORS.muted}}>{t.noPending}</div>
                ) : pendingBookings.map((b,i) => {
                  const pa = PAYMENT_APPS.find(p => p.id===b.pay_app);
                  return (
                    <div key={i} style={{background:COLORS.card, borderRadius:"12px", padding:"16px", marginBottom:"12px", borderRight:"4px solid #FF6D00", border:`1px solid ${COLORS.border}`}}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}>
                        <div>
                          <div style={{fontWeight:"700"}}>{b.client_name}</div>
                          <div style={{color:COLORS.muted, fontSize:"13px"}}>📞 {b.client_phone}</div>
                          <div style={{color:COLORS.muted, fontSize:"13px"}}>🏟 {b.stadium_name} - {b.date} - {b.hour}:00</div>
                        </div>
                        <div style={{background:`${pa?.color}22`, color:pa?.color, padding:"4px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"700", height:"fit-content"}}>{pa?.name}</div>
                      </div>
                      <div style={{background:COLORS.bg, borderRadius:"10px", padding:"10px 14px", marginBottom:"12px", fontSize:"13px"}}>
                        {t.serialNum}: <span style={{color:COLORS.accent, fontWeight:"700"}}>{b.transaction_num}</span>
                      </div>
                      <div style={{display:"flex", gap:"10px"}}>
                        <button onClick={() => confirmBooking(b.id)} style={{flex:1, padding:"10px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>{t.confirm}</button>
                        <button onClick={() => rejectBooking(b.id)} style={{flex:1, padding:"10px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>{t.reject}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {adminTab==="stadiums" && (
              <div>
                {stadiums.length===0 ? (
                  <div style={{textAlign:"center", padding:"60px", color:COLORS.muted}}>{t.noStadiums}</div>
                ) : stadiums.map(st => {
                  const stConfirmed = confirmedBookings.filter(b => b.stadium_id === st.id).length;
                  return (
                    <div key={st.id} style={{background:COLORS.card, borderRadius:"12px", padding:"16px", marginBottom:"10px", display:"flex", justifyContent:"space-between", alignItems:"center", borderRight:`4px solid ${st.color}`, border:`1px solid ${COLORS.border}`}}>
                      <div>
                        <div style={{fontWeight:"700"}}>{st.name}</div>
                        <div style={{color:COLORS.muted, fontSize:"13px"}}>📍 {st.wilaya} - {st.hood} - {st.price} {t.pricePerHour}</div>
                        <div style={{color:COLORS.accent, fontSize:"13px", marginTop:"4px"}}>✅ {stConfirmed} {t.confirmedBookings}</div>
                        {st.owner_phone && <div style={{color:COLORS.muted, fontSize:"13px"}}>📞 {st.owner_phone}</div>}
                      </div>
                      <div style={{display:"flex", gap:"8px"}}>
                        <button onClick={() => openEdit(st)} style={{padding:"8px 12px", background:"#00B0FF22", color:COLORS.accent2, border:`1px solid #00B0FF44`, borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.edit}</button>
                        <button onClick={() => setConfirmDelete(st)} style={{padding:"8px 12px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"12px"}}>{t.delete}</button>
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
                    { label:t.totalUsers, value: usersCount, icon:"👥", color:COLORS.accent },
                    { label:t.totalStadiums, value: stadiums.length, icon:"🏟", color:COLORS.accent2 },
                    { label:t.totalConfirmed, value: confirmedBookings.length, icon:"✅", color:"#7C4DFF" },
                    { label:t.totalPending, value: pendingBookings.length, icon:"⏳", color:"#FF6D00" },
                  ].map((stat,i) => (
                    <div key={i} style={{background:COLORS.card, borderRadius:"14px", padding:"16px", border:`1px solid ${stat.color}33`}}>
                      <div style={{fontSize:"28px", marginBottom:"6px"}}>{stat.icon}</div>
                      <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"4px"}}>{stat.label}</div>
                      <div style={{fontSize:"28px", fontWeight:"800", color:stat.color}}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:COLORS.card, borderRadius:"14px", padding:"20px", border:`1px solid ${COLORS.border}`}}>
                  <div style={{fontWeight:"700", marginBottom:"14px"}}>{t.confirmedBookingsPerStadium}</div>
                  {stadiums.map(st => {
                    const count = confirmedBookings.filter(b => b.stadium_id === st.id).length;
                    const max = Math.max(...stadiums.map(s => confirmedBookings.filter(b => b.stadium_id === s.id).length), 1);
                    return (
                      <div key={st.id} style={{marginBottom:"12px"}}>
                        <div style={{display:"flex", justifyContent:"space-between", marginBottom:"4px"}}>
                          <span style={{fontSize:"13px"}}>{st.name}</span>
                          <span style={{fontSize:"13px", color:st.color, fontWeight:"700"}}>{count} {t.confirmedBookings}</span>
                        </div>
                        <div style={{background:COLORS.bg, borderRadius:"20px", height:"8px"}}>
                          <div style={{background:`linear-gradient(90deg, ${st.color}, ${st.color}88)`, borderRadius:"20px", height:"8px", width:`${(count/max)*100}%`, transition:"width 0.3s"}}></div>
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
                    <button onClick={handleAddWilaya} style={{padding:"10px 16px", background:COLORS.accent2, border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", color:"#000"}}>{t.add}</button>
                  </div>
                  <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"12px"}}>
                    {wilayas.map(w => <div key={w} style={{background:"#00B0FF22", color:COLORS.accent2, padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"700"}}>{w}</div>)}
                  </div>
                </div>
                <div style={{background:COLORS.card, borderRadius:"16px", border:`1px solid ${COLORS.border}`, padding:"20px"}}>
                  <div style={{fontWeight:"700", color:COLORS.accent, marginBottom:"16px"}}>{t.addNewStadium}</div>
                  <label style={lbl}>{t.stadiumName}</label>
                  <input style={inp} placeholder={t.stadiumName} value={newName} onChange={e => setNewName(e.target.value)}/>
                  <label style={lbl}>{t.wilaya}</label>
                  <select style={sel} value={newWilayaSelect} onChange={e => setNewWilayaSelect(e.target.value)}>
                    <option value="">{t.chooseWilaya}</option>
                    {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <label style={lbl}>{t.hood}</label>
                  <input style={inp} placeholder={t.hood} value={newHood} onChange={e => setNewHood(e.target.value)}/>
                  <label style={lbl}>{t.price}</label>
                  <input style={inp} type="number" placeholder="1000" value={newPrice} onChange={e => setNewPrice(e.target.value)}/>
                  <label style={lbl}>{t.ownerPhone}</label>
                  <input style={inp} placeholder="8" maxLength={8} value={newOwnerPhone} onChange={e => { const val = e.target.value.replace(/\D/g,""); setNewOwnerPhone(val); }}/>
                  <div style={{fontWeight:"700", color:COLORS.accent, margin:"12px 0 10px"}}>{t.workingHours}</div>
                  <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"6px", marginBottom:"14px"}}>
                    {ALL_HOURS.map(h => (
                      <button key={h} onClick={() => toggleHour(h, false)} style={{padding:"6px 4px", borderRadius:"8px", border: newWorkingHours.includes(h)?`2px solid ${COLORS.accent}`:`2px solid ${COLORS.border}`, background: newWorkingHours.includes(h)?`${COLORS.accent}22`:COLORS.bg, color: newWorkingHours.includes(h)?COLORS.accent:COLORS.muted, cursor:"pointer", fontSize:"11px", fontWeight:"600", fontFamily:"inherit"}}>
                        {h}:00
                      </button>
                    ))}
                  </div>
                  <div style={{fontWeight:"700", color:COLORS.accent2, margin:"12px 0 10px"}}>{t.bankAccounts}</div>
                  {PAYMENT_APPS.map(p => (
                    <div key={p.id}>
                      <label style={lbl}>{p.name}</label>
                      <input style={inp} placeholder={p.name} value={newPayments[p.id]||""} onChange={e => setNewPayments(prev => ({...prev, [p.id]: e.target.value}))}/>
                    </div>
                  ))}
                  <button onClick={handleAdd} style={{padding:"12px 24px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"14px", color:"#000"}}>{t.addStadiumBtn}</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>{showMyBookings && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setShowMyBookings(false)}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"520px", maxHeight:"90vh", overflow:"auto", padding:"24px"}}>
            <div style={{fontSize:"20px", fontWeight:"800", marginBottom:"20px"}}>📋 {t.myBookingsTitle}</div>
            {myBookings.length===0 ? (
              <div style={{textAlign:"center", padding:"40px", color:COLORS.muted}}>{t.noBookings}</div>
            ) : myBookings.slice().reverse().map((b,i) => {
              const statusColor = b.status==="confirmed"?COLORS.accent:b.status==="rejected"?"#FF4444":"#FF6D00";
              const statusText = b.status==="confirmed"?t.accepted:b.status==="rejected"?t.rejected:t.pending;
              return (
                <div key={i} style={{background:COLORS.bg, borderRadius:"12px", padding:"14px", marginBottom:"10px", border:`1px solid ${statusColor}33`}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:"6px"}}>
                    <div style={{fontWeight:"700"}}>{b.stadium_name}</div>
                    <div style={{background:`${statusColor}22`, color:statusColor, padding:"4px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"700"}}>{statusText}</div>
                  </div>
                  <div style={{color:COLORS.muted, fontSize:"13px"}}>📅 {b.date} - {b.hour}:00</div>
                  {b.status==="confirmed" && b.code && (
                    <div style={{marginTop:"8px", background:`${COLORS.accent}22`, borderRadius:"8px", padding:"8px 12px"}}>
                      <div style={{color:COLORS.muted, fontSize:"11px"}}>{t.code}</div>
                      <div style={{color:COLORS.accent, fontWeight:"800", fontSize:"18px", letterSpacing:"2px"}}>{b.code}</div>
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={() => setShowMyBookings(false)} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginTop:"8px"}}>{t.close}</button>
          </div>
        </div>
      )}

      {rejectedBooking && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:"1px solid #FF444444", width:"100%", maxWidth:"400px", padding:"28px", textAlign:"center"}}>
            <div style={{fontSize:"48px", marginBottom:"12px"}}>❌</div>
            <div style={{fontSize:"18px", fontWeight:"800", marginBottom:"8px", color:"#FF4444"}}>{t.rejectedTitle}</div>
            <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"20px"}}>{t.sendRejectNotif}</div>
            <button onClick={() => {
              const msg = `مرحبا ${rejectedBooking.client_name} 👋\nنأسف، لقد تم رفض طلب حجزكم في ${rejectedBooking.stadium_name}\nالساعة ${rejectedBooking.hour}:00 بتاريخ ${rejectedBooking.date}`;
              window.open(`https://wa.me/222${rejectedBooking.client_phone}?text=${encodeURIComponent(msg)}`, "_blank");
            }} style={{width:"100%", padding:"12px", background:"#25D36622", color:"#25D366", border:"1px solid #25D36644", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"14px", marginBottom:"10px"}}>
              📱 {t.sendNotification}
            </button>
            <button onClick={() => setRejectedBooking(null)} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.close}</button>
          </div>
        </div>
      )}

      {confirmedBooking && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"400px", padding:"28px", textAlign:"center"}}>
            <div style={{fontSize:"48px", marginBottom:"12px"}}>✅</div>
            <div style={{fontSize:"18px", fontWeight:"800", marginBottom:"8px"}}>{t.confirmed}</div>
            <div style={{color:COLORS.muted, marginBottom:"8px"}}>{t.code}: <span style={{color:COLORS.accent, fontWeight:"800"}}>{confirmedBooking.code}</span></div>
            <div style={{display:"flex", flexDirection:"column", gap:"10px", marginBottom:"14px"}}>
              <button onClick={() => {
                const msg = `مرحبا ${confirmedBooking.client_name} 👋\nلقد تم قبول حجزكم في ${confirmedBooking.stadium_name} ✅\nيرجى عدم التأخر عن الساعة ${confirmedBooking.hour}:00\nالكود: ${confirmedBooking.code}`;
                window.open(`https://wa.me/222${confirmedBooking.client_phone}?text=${encodeURIComponent(msg)}`, "_blank");
              }} style={{padding:"12px", background:"#25D36622", color:"#25D366", border:"1px solid #25D36644", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"14px"}}>
                {t.whatsappClient} — {confirmedBooking.client_name}
              </button>
              {confirmedBooking.ownerPhone && (
                <button onClick={() => {
                  const msg = `مرحبا ${confirmedBooking.stadium_name} 👋\nلديكم مباراة جديدة الساعة ${confirmedBooking.hour}:00\nالاسم: ${confirmedBooking.client_name}\nالهاتف: ${confirmedBooking.client_phone}\nالكود: ${confirmedBooking.code}`;
                  window.open(`https://wa.me/222${confirmedBooking.ownerPhone}?text=${encodeURIComponent(msg)}`, "_blank");
                }} style={{padding:"12px", background:"#00B0FF22", color:COLORS.accent2, border:`1px solid #00B0FF44`, borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"14px"}}>
                  {t.whatsappOwner} — {confirmedBooking.stadium_name}
                </button>
              )}
            </div>
            <button onClick={() => setConfirmedBooking(null)} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.close}</button>
          </div>
        </div>
      )}

      {editStadium && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setEditStadium(null)}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"520px", maxHeight:"90vh", overflow:"auto", padding:"24px"}}>
            <div style={{fontSize:"18px", fontWeight:"800", color:COLORS.accent2, marginBottom:"20px"}}>✏️ {t.editStadium} {editStadium.name}</div>
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
            <input style={inp} placeholder="8" maxLength={8} value={editOwnerPhone} onChange={e => { const val = e.target.value.replace(/\D/g,""); setEditOwnerPhone(val); }}/>
            <div style={{fontWeight:"700", color:COLORS.accent, margin:"12px 0 10px"}}>{t.workingHours}</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"6px", marginBottom:"14px"}}>
              {ALL_HOURS.map(h => (
                <button key={h} onClick={() => toggleHour(h, true)} style={{padding:"6px 4px", borderRadius:"8px", border: editWorkingHours.includes(h)?`2px solid ${COLORS.accent}`:`2px solid ${COLORS.border}`, background: editWorkingHours.includes(h)?`${COLORS.accent}22`:COLORS.bg, color: editWorkingHours.includes(h)?COLORS.accent:COLORS.muted, cursor:"pointer", fontSize:"11px", fontWeight:"600", fontFamily:"inherit"}}>
                  {h}:00
                </button>
              ))}
            </div>
            <div style={{fontWeight:"700", color:COLORS.accent2, margin:"12px 0 10px"}}>{t.bankAccounts}</div>
            {PAYMENT_APPS.map(p => (
              <div key={p.id}>
                <label style={lbl}>{p.name}</label>
                <input style={inp} placeholder={p.name} value={editPayments[p.id]||""} onChange={e => setEditPayments(prev => ({...prev, [p.id]: e.target.value}))}/>
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
            <button onClick={() => { setShowProfile(false); setShowMyBookings(true); }} style={{width:"100%", padding:"11px", background:"#7C4DFF22", border:"1px solid #7C4DFF44", borderRadius:"12px", color:"#7C4DFF", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", marginBottom:"10px"}}>{t.viewAllBookings}</button>
            <button onClick={() => setShowProfile(false)} style={{width:"100%", padding:"11px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.close}</button>
          </div>
        </div>
      )}

      {selected && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && closeModal()}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"520px", maxHeight:"90vh", overflow:"auto", padding:"24px"}}>
            <div style={{fontSize:"18px", fontWeight:"800", color:selected.color, marginBottom:"4px"}}>🏟 {selected.name}</div>
            <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"20px"}}>📍 {selected.wilaya} - {selected.hood} - {selected.price} {t.pricePerHour}</div>
            {step===1 && (
              <>
                <label style={lbl}>{t.date}</label>
                <input type="date" style={inp} value={bookDate} min={today} onChange={e => { setBookDate(e.target.value); setBookHour(null); }}/>
                <label style={lbl}>{t.chooseHour}</label>
                <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"6px", marginBottom:"16px"}}>
                  {stadiumHours.map(h => {
                    const taken = isBooked(selected.id, bookDate, h);
                    const s = bookHour===h;
                    return (
                      <button key={h} disabled={taken} onClick={() => !taken && setBookHour(h)} style={{padding:"8px 4px", borderRadius:"10px", border: s?`2px solid ${selected.color}`:"2px solid transparent", background: taken?COLORS.bg:s?`${selected.color}22`:COLORS.bg, color: taken?"#374151":s?selected.color:COLORS.muted, cursor:taken?"not-allowed":"pointer", fontSize:"11px", fontWeight:"600", fontFamily:"inherit"}}>
                        {h}:00
                        {taken && <span style={{display:"block", fontSize:"9px", color:"#4b5563"}}>{t.booked}</span>}
                      </button>
                    );
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
                  {PAYMENT_APPS.map(p => {
                    if (!selected.payments?.[p.id]) return null;
                    return (
                      <button key={p.id} onClick={() => setSelectedPayApp(p.id)} style={{padding:"12px", borderRadius:"12px", border: selectedPayApp===p.id?`2px solid ${p.color}`:`2px solid ${COLORS.border}`, background: selectedPayApp===p.id?`${p.color}22`:COLORS.bg, color: selectedPayApp===p.id?p.color:COLORS.muted, cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"13px"}}>{p.name}</button>
                    );
                  })}
                </div>
                {selectedPayApp && stadiumPayNum && (
                  <div style={{background:COLORS.bg, borderRadius:"12px", padding:"14px", marginBottom:"16px"}}>
                    <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"8px"}}>{t.sendAmount} <strong style={{color:"#fff"}}>{selected.price} {t.pricePerHour}</strong></div>
                    <div style={{fontSize:"20px", fontWeight:"800", color:payApp?.color, letterSpacing:"2px"}}>{stadiumPayNum}</div>
                    <div style={{color:COLORS.muted, fontSize:"12px", marginTop:"4px"}}>{t.via} {payApp?.name}</div>
                  </div>
                )}
                <label style={lbl}>{t.serialNum}</label>
                <input style={inp} placeholder={t.enterSerial} maxLength={19} value={transactionNum} onChange={e => setTransactionNum(e.target.value)}/>
                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={() => setStep(1)} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>{t.back}</button>
                  <button disabled={!selectedPayApp||!transactionNum} onClick={handleBook} style={{flex:2, padding:"12px", background:!selectedPayApp||!transactionNum?COLORS.bg:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", color:!selectedPayApp||!transactionNum?COLORS.muted:"#000", fontWeight:"700", cursor:!selectedPayApp||!transactionNum?"not-allowed":"pointer", fontFamily:"inherit"}}>{t.confirmBooking}</button>
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

      {toast && (
        <div style={{position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", background:toast.color, color:"#fff", padding:"14px 28px", borderRadius:"16px", fontWeight:"700", zIndex:999}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}