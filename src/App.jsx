import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const PAYMENT_APPS = [
  { id: "bankily", name: "Bankily", color: "#00A651" },
  { id: "masrvi", name: "Masrvi", color: "#FF6B00" },
  { id: "sedad", name: "SEDAD", color: "#0066CC" },
  { id: "click", name: "Click", color: "#FF0000" },
  { id: "bimbank", name: "Bimbank", color: "#6B21A8" },
  { id: "moov", name: "Moov Money", color: "#FFD700" },
];

const HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
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

export default function App() {
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
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [editStadium, setEditStadium] = useState(null);
  const [editName, setEditName] = useState("");
  const [editWilaya, setEditWilaya] = useState("");
  const [editHood, setEditHood] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOwnerPhone, setEditOwnerPhone] = useState("");
  const [editPayments, setEditPayments] = useState({});
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("malaabi_user");
    if (saved) { setUser(JSON.parse(saved)); setScreen("app"); }
    loadData();
  }, []);

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

  const showToast = (msg, color=COLORS.accent) => {
    setToast({msg, color});
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async () => {
    if (!loginPhone || !loginPass) return showToast("ادخل رقم الهاتف وكلمة السر", "#FF4444");
    if (loginPhone.length !== 8) return showToast("رقم الهاتف يجب أن يكون 8 أرقام", "#FF4444");
    if (loginPass.length !== 4) return showToast("كلمة السر يجب أن تكون 4 أرقام", "#FF4444");
    const { data } = await supabase.from("users").select("*").eq("phone", loginPhone).eq("password", loginPass).single();
    if (data) {
      setUser(data);
      localStorage.setItem("malaabi_user", JSON.stringify(data));
      setScreen("app");
      showToast("مرحبا " + data.name);
    } else {
      showToast("رقم الهاتف او كلمة السر غير صحيحة", "#FF4444");
    }
  };

  const handleRegister = async () => {
    if (!regName || !regPhone || !regPass) return showToast("ادخل جميع البيانات", "#FF4444");
    if (regPhone.length !== 8) return showToast("رقم الهاتف يجب أن يكون 8 أرقام", "#FF4444");
    if (regPass.length !== 4) return showToast("كلمة السر يجب أن تكون 4 أرقام", "#FF4444");
    const { data, error } = await supabase.from("users").insert({ name: regName, phone: regPhone, password: regPass }).select().single();
    if (error) {
      showToast("رقم الهاتف مسجل مسبقاً", "#FF4444");
    } else {
      setUser(data);
      localStorage.setItem("malaabi_user", JSON.stringify(data));
      setScreen("app");
      setUsersCount(prev => prev + 1);
      showToast("تم انشاء حسابك بنجاح!");
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
        if (pass === ADMIN_PASS) { setTab("admin"); showToast("مرحبا بك في لوحة التحكم"); }
        return 0;
      }
      return n;
    });
  };

  const handleDelete = async (id) => {
    await supabase.from("stadiums").delete().eq("id", id);
    setStadiums(prev => prev.filter(s => s.id !== id));
    setConfirmDelete(null);
    showToast("تم حذف الملعب", "#FF4444");
  };

  const handleBook = async () => {
    if (bookHour === null) return;
    if (!selectedPayApp || !transactionNum) return;
    const { data } = await supabase.from("bookings").insert({
      stadium_id: selected.id, stadium_name: selected.name,
      client_name: user.name, client_phone: user.phone,
      date: bookDate, hour: bookHour, pay_app: selectedPayApp,
      transaction_num: transactionNum, status: "pending",
    }).select().single();
    if (data) setBookings(prev => [...prev, data]);
    closeModal();
    showToast("تم ارسال طلب الحجز انتظر التاكيد");
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
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "rejected" } : b));
    showToast("تم رفض الحجز", "#FF4444");
  };

  const openEdit = (st) => {
    setEditStadium(st);
    setEditName(st.name);
    setEditWilaya(st.wilaya);
    setEditHood(st.hood);
    setEditPrice(st.price);
    setEditOwnerPhone(st.owner_phone || "");
    setEditPayments(st.payments || {});
  };

  const handleEdit = async () => {
    if (!editName || !editWilaya || !editHood || !editPrice) return showToast("ادخل جميع البيانات", "#FF4444");
    const { data } = await supabase.from("stadiums").update({
      name: editName, wilaya: editWilaya, hood: editHood,
      price: parseInt(editPrice), owner_phone: editOwnerPhone,
      payments: editPayments
    }).eq("id", editStadium.id).select().single();
    if (data) setStadiums(prev => prev.map(s => s.id === editStadium.id ? data : s));
    setEditStadium(null);
    showToast("تم التعديل بنجاح");
  };

  const handleAdd = async () => {
    if (!newName || !newWilayaSelect || !newHood || !newPrice) return showToast("ادخل جميع البيانات", "#FF4444");
    const colors = ["#00E676","#00B0FF","#FF6D00","#FF4081","#7C4DFF","#00BCD4"];
    const { data } = await supabase.from("stadiums").insert({
      name: newName, wilaya: newWilayaSelect, hood: newHood,
      price: parseInt(newPrice), color: colors[stadiums.length % colors.length],
      payments: newPayments, owner_phone: newOwnerPhone
    }).select().single();
    if (data) setStadiums(prev => [...prev, data]);
    setNewName(""); setNewWilayaSelect(""); setNewHood(""); setNewPrice(""); setNewPayments({}); setNewOwnerPhone("");
    showToast("تمت الاضافة");
  };

  const handleAddWilaya = async () => {
    if (!newWilaya || wilayas.includes(newWilaya)) return;
    await supabase.from("wilayas").insert({ name: newWilaya });
    setWilayas(prev => [...prev, newWilaya]);
    setNewWilaya("");
    showToast("تمت اضافة الولاية");
  };

  const isBooked = (sid, date, hour) =>
    bookings.some(b => b.stadium_id === sid && b.date === date && b.hour === hour && b.status !== "rejected");

  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const myConfirmedBookings = user ? confirmedBookings.filter(b => b.client_phone === user.phone) : [];
  const filteredStadiums = filterWilaya === "الكل" ? stadiums : stadiums.filter(s => s.wilaya === filterWilaya);
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const payApp = selectedPayApp ? PAYMENT_APPS.find(p => p.id === selectedPayApp) : null;
  const stadiumPayNum = selected && payApp ? (selected.payments?.[selectedPayApp] || "") : "";

  const inp = { width:"100%", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"12px 16px", color:"#fff", fontSize:"15px", fontFamily:"inherit", marginBottom:"16px", boxSizing:"border-box", outline:"none" };
  const lbl = { color:COLORS.muted, fontSize:"13px", marginBottom:"6px", display:"block" };
  const sel = { width:"100%", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"12px 16px", color:"#fff", fontSize:"15px", fontFamily:"inherit", marginBottom:"16px", boxSizing:"border-box", outline:"none" };if (screen === "login" || screen === "register") {
    const isReg = screen === "register";
    return (
      <div style={{minHeight:"100vh", background:COLORS.bg, fontFamily:"Tajawal,sans-serif", direction:"rtl", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px"}}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
        <div style={{width:"100%", maxWidth:"400px"}}>
          <div style={{textAlign:"center", marginBottom:"40px"}}>
            <div style={{fontSize:"64px", marginBottom:"8px", filter:"drop-shadow(0 0 20px #00E676)"}}>⚽</div>
            <div style={{fontSize:"32px", fontWeight:"800", background:"linear-gradient(135deg, #00E676, #00B0FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>ملاعبي</div>
            <div style={{color:COLORS.muted, marginTop:"8px", fontSize:"15px"}}>احجز ملعبك بسهولة</div>
          </div>
          <div style={{background:COLORS.card, borderRadius:"24px", padding:"28px", border:`1px solid ${COLORS.border}`, boxShadow:"0 25px 50px rgba(0,0,0,0.5)"}}>
            <div style={{display:"flex", marginBottom:"24px", background:COLORS.bg, borderRadius:"12px", padding:"4px"}}>
              <button onClick={() => setScreen("login")} style={{flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", background:!isReg?"linear-gradient(135deg,#00E676,#00B0FF)":"transparent", color:!isReg?"#000":COLORS.muted}}>تسجيل الدخول</button>
              <button onClick={() => setScreen("register")} style={{flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", background:isReg?"linear-gradient(135deg,#00E676,#00B0FF)":"transparent", color:isReg?"#000":COLORS.muted}}>حساب جديد</button>
            </div>
            {isReg && (
              <>
                <label style={lbl}>الاسم الكامل</label>
                <input style={inp} placeholder="ادخل اسمك الكامل" value={regName} onChange={e => setRegName(e.target.value)}/>
              </>
            )}
            <label style={lbl}>رقم الهاتف</label>
            <input style={inp} placeholder="8 أرقام" maxLength={8} value={isReg ? regPhone : loginPhone} onChange={e => { const val = e.target.value.replace(/\D/g,""); isReg ? setRegPhone(val) : setLoginPhone(val); }}/>
            <label style={lbl}>كلمة السر (4 أرقام)</label>
            <input style={inp} type="password" placeholder="4 أرقام" maxLength={4} value={isReg ? regPass : loginPass} onChange={e => { const val = e.target.value.replace(/\D/g,""); isReg ? setRegPass(val) : setLoginPass(val); }}/>
            <button onClick={isReg ? handleRegister : handleLogin} style={{width:"100%", padding:"14px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"16px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>
              {isReg ? "انشاء الحساب" : "دخول"}
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
        <div style={{color:COLORS.accent, fontSize:"18px", fontWeight:"700"}}>جاري التحميل...</div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh", background:COLORS.bg, fontFamily:"Tajawal,sans-serif", direction:"rtl", color:"#fff"}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>

      <div style={{background:COLORS.card, borderBottom:`1px solid ${COLORS.border}`, padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50, backdropFilter:"blur(10px)"}}>
        <div onClick={handleLogoClick} style={{fontSize:"22px", fontWeight:"800", background:"linear-gradient(135deg,#00E676,#00B0FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", cursor:"pointer", userSelect:"none"}}>⚽ ملاعبي</div>
        <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
          {user && (
            <div onClick={() => setShowProfile(true)} style={{color:COLORS.accent, fontSize:"13px", cursor:"pointer", fontWeight:"700", background:"#00E67622", padding:"6px 14px", borderRadius:"8px", border:"1px solid #00E67644"}}>
              👤 {user.name}
            </div>
          )}
          <button onClick={handleLogout} style={{padding:"6px 14px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"8px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>خروج</button>
          {tab === "admin" && (
            <button onClick={() => setTab("client")} style={{padding:"6px 14px", background:"#FF444422", border:"none", borderRadius:"8px", color:"#FF4444", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>اغلاق التحكم</button>
          )}
        </div>
      </div>

      <div style={{maxWidth:"1100px", margin:"0 auto", padding:"32px 24px"}}>
        {tab==="client" && (
          <>
            <div style={{background:`linear-gradient(135deg, ${COLORS.card}, #0a1628)`, borderRadius:"24px", padding:"40px 32px", marginBottom:"32px", border:`1px solid ${COLORS.border}`, position:"relative", overflow:"hidden"}}>
              <div style={{position:"absolute", top:"-40px", left:"-40px", width:"200px", height:"200px", background:"radial-gradient(circle, #00E67615, transparent)", borderRadius:"50%"}}></div>
              <div style={{position:"absolute", bottom:"-40px", right:"-40px", width:"200px", height:"200px", background:"radial-gradient(circle, #00B0FF15, transparent)", borderRadius:"50%"}}></div>
              <div style={{fontSize:"36px", fontWeight:"800", marginBottom:"8px", background:"linear-gradient(135deg,#00E676,#00B0FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>احجز ملعبك 🏟</div>
              <div style={{color:COLORS.muted, fontSize:"16px"}}>اختر الولاية والملعب المناسب لك</div>
            </div>

            <div style={{display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"28px"}}>
              {["الكل", ...wilayas].map(w => (
                <button key={w} onClick={() => setFilterWilaya(w)} style={{padding:"8px 20px", borderRadius:"20px", border:`1px solid ${filterWilaya===w ? COLORS.accent : COLORS.border}`, cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"14px", background: filterWilaya===w?"linear-gradient(135deg,#00E676,#00B0FF)":COLORS.card, color: filterWilaya===w?"#000":COLORS.muted}}>{w}</button>
              ))}
            </div>

            {filteredStadiums.length===0 ? (
              <div style={{textAlign:"center", padding:"80px 20px", color:COLORS.muted}}>
                <div style={{fontSize:"60px", marginBottom:"16px"}}>🏟</div>
                <div>لا توجد ملاعب في هذه الولاية</div>
              </div>
            ) : (
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:"24px"}}>
                {filteredStadiums.map(st => {
                  const free = HOURS.filter(h => !isBooked(st.id, today, h)).length;
                  const total = confirmedBookings.filter(b => b.stadium_id === st.id).length;
                  return (
                    <div key={st.id} style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
                      <div style={{background:`linear-gradient(135deg, ${st.color}22, ${st.color}11)`, padding:"28px 24px", position:"relative", overflow:"hidden"}}>
                        <div style={{position:"absolute", top:"-20px", left:"-20px", width:"100px", height:"100px", background:`radial-gradient(circle, ${st.color}20, transparent)`, borderRadius:"50%"}}></div>
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                          <div>
                            <div style={{fontWeight:"800", fontSize:"20px", marginBottom:"6px"}}>{st.name}</div>
                            <div style={{color:COLORS.muted, fontSize:"13px"}}>📍 {st.wilaya} — {st.hood}</div>
                          </div>
                          <div style={{background:`${st.color}33`, borderRadius:"16px", padding:"8px 14px", fontSize:"22px"}}>🏟</div>
                        </div>
                      </div>
                      <div style={{padding:"20px 24px"}}>
                        <div style={{display:"flex", justifyContent:"space-between", marginBottom:"16px"}}>
                          <div style={{background:`${st.color}22`, borderRadius:"12px", padding:"10px 16px", textAlign:"center"}}>
                            <div style={{color:st.color, fontWeight:"800", fontSize:"18px"}}>{st.price}</div>
                            <div style={{color:COLORS.muted, fontSize:"11px"}}>اوقية/ساعة</div>
                          </div>
                          <div style={{background:"#00E67622", borderRadius:"12px", padding:"10px 16px", textAlign:"center"}}>
                            <div style={{color:COLORS.accent, fontWeight:"800", fontSize:"18px"}}>{free}</div>
                            <div style={{color:COLORS.muted, fontSize:"11px"}}>ساعة متاحة</div>
                          </div>
                          <div style={{background:"#00B0FF22", borderRadius:"12px", padding:"10px 16px", textAlign:"center"}}>
                            <div style={{color:COLORS.accent2, fontWeight:"800", fontSize:"18px"}}>{total}</div>
                            <div style={{color:COLORS.muted, fontSize:"11px"}}>حجز مؤكد</div>
                          </div>
                        </div>
                        <button onClick={() => { setSelected(st); setStep(1); setBookDate(today); }} style={{width:"100%", padding:"13px", background:`linear-gradient(135deg, ${st.color}, ${st.color}BB)`, border:"none", borderRadius:"14px", fontWeight:"800", fontSize:"15px", cursor:"pointer", fontFamily:"inherit", color:"#000", boxShadow:`0 4px 15px ${st.color}44`}}>
                          احجز الان ←
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
            <div style={{fontSize:"28px", fontWeight:"800", marginBottom:"24px"}}>لوحة التحكم</div>
            <div style={{display:"flex", gap:"8px", marginBottom:"24px", background:COLORS.card, borderRadius:"12px", padding:"4px"}}>
              {[["pending","الطلبات","#FF6D00"],["stadiums","الملاعب","#7C4DFF"],["stats","الاحصائيات",COLORS.accent],["add","اضافة ملعب",COLORS.accent2]].map(([key,label,color]) => (
                <button key={key} onClick={() => setAdminTab(key)} style={{flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"13px", background: adminTab===key?color:"transparent", color: adminTab===key?"#fff":COLORS.muted}}>{label}</button>
              ))}
            </div>

            {adminTab==="pending" && (
              <div>
                {pendingBookings.length===0 ? (
                  <div style={{textAlign:"center", padding:"60px", color:COLORS.muted}}>لا توجد طلبات معلقة</div>
                ) : pendingBookings.map((b,i) => {
                  const pa = PAYMENT_APPS.find(p => p.id===b.pay_app);
                  return (
                    <div key={i} style={{background:COLORS.card, borderRadius:"12px", padding:"16px 20px", marginBottom:"12px", borderRight:"4px solid #FF6D00", border:`1px solid ${COLORS.border}`}}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}>
                        <div>
                          <div style={{fontWeight:"700"}}>{b.client_name}</div>
                          <div style={{color:COLORS.muted, fontSize:"13px"}}>📞 {b.client_phone}</div>
                          <div style={{color:COLORS.muted, fontSize:"13px"}}>🏟 {b.stadium_name} - {b.date} - {b.hour}:00</div>
                        </div>
                        <div style={{background:`${pa?.color}22`, color:pa?.color, padding:"4px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"700", height:"fit-content"}}>{pa?.name}</div>
                      </div>
                      <div style={{background:COLORS.bg, borderRadius:"10px", padding:"10px 14px", marginBottom:"12px", fontSize:"13px"}}>
                        الرقم التسلسلي: <span style={{color:COLORS.accent, fontWeight:"700"}}>{b.transaction_num}</span>
                      </div>
                      <div style={{display:"flex", gap:"10px"}}>
                        <button onClick={() => confirmBooking(b.id)} style={{flex:1, padding:"10px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>✅ تاكيد</button>
                        <button onClick={() => rejectBooking(b.id)} style={{flex:1, padding:"10px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>رفض</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {adminTab==="stadiums" && (
              <div>
                {stadiums.length===0 ? (
                  <div style={{textAlign:"center", padding:"60px", color:COLORS.muted}}>لا توجد ملاعب</div>
                ) : stadiums.map(st => {
                  const stConfirmed = confirmedBookings.filter(b => b.stadium_id === st.id).length;
                  return (
                    <div key={st.id} style={{background:COLORS.card, borderRadius:"12px", padding:"16px 20px", marginBottom:"10px", display:"flex", justifyContent:"space-between", alignItems:"center", borderRight:`4px solid ${st.color}`, border:`1px solid ${COLORS.border}`}}>
                      <div>
                        <div style={{fontWeight:"700"}}>{st.name}</div>
                        <div style={{color:COLORS.muted, fontSize:"13px"}}>📍 {st.wilaya} - {st.hood} - {st.price} اوقية/ساعة</div>
                        <div style={{color:COLORS.accent, fontSize:"13px", marginTop:"4px"}}>✅ {stConfirmed} حجز مؤكد</div>
                        {st.owner_phone && <div style={{color:COLORS.muted, fontSize:"13px"}}>📞 {st.owner_phone}</div>}
                      </div>
                      <div style={{display:"flex", gap:"8px"}}>
                        <button onClick={() => openEdit(st)} style={{padding:"8px 16px", background:"#00B0FF22", color:COLORS.accent2, border:`1px solid #00B0FF44`, borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>تعديل</button>
                        <button onClick={() => setConfirmDelete(st)} style={{padding:"8px 16px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>حذف</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {adminTab==="stats" && (
              <div>
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"16px", marginBottom:"24px"}}>
                  {[
                    { label:"عدد المسجلين", value: usersCount, icon:"👥", color:COLORS.accent },
                    { label:"عدد الملاعب", value: stadiums.length, icon:"🏟", color:COLORS.accent2 },
                    { label:"الحجوزات المؤكدة", value: confirmedBookings.length, icon:"✅", color:"#7C4DFF" },
                    { label:"الحجوزات المعلقة", value: pendingBookings.length, icon:"⏳", color:"#FF6D00" },
                  ].map((stat,i) => (
                    <div key={i} style={{background:COLORS.card, borderRadius:"16px", padding:"20px", border:`1px solid ${stat.color}33`}}>
                      <div style={{fontSize:"32px", marginBottom:"8px"}}>{stat.icon}</div>
                      <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"4px"}}>{stat.label}</div>
                      <div style={{fontSize:"32px", fontWeight:"800", color:stat.color}}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:COLORS.card, borderRadius:"16px", padding:"24px", border:`1px solid ${COLORS.border}`}}>
                  <div style={{fontWeight:"700", marginBottom:"16px"}}>الحجوزات المؤكدة لكل ملعب</div>
                  {stadiums.map(st => {
                    const count = confirmedBookings.filter(b => b.stadium_id === st.id).length;
                    const max = Math.max(...stadiums.map(s => confirmedBookings.filter(b => b.stadium_id === s.id).length), 1);
                    return (
                      <div key={st.id} style={{marginBottom:"12px"}}>
                        <div style={{display:"flex", justifyContent:"space-between", marginBottom:"4px"}}>
                          <span style={{fontSize:"13px"}}>{st.name}</span>
                          <span style={{fontSize:"13px", color:st.color, fontWeight:"700"}}>{count} حجز</span>
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
                <div style={{background:COLORS.card, borderRadius:"20px", border:`1px solid ${COLORS.border}`, padding:"28px", marginBottom:"24px"}}>
                  <div style={{fontWeight:"700", color:COLORS.accent2, marginBottom:"20px"}}>اضافة ولاية جديدة</div>
                  <div style={{display:"flex", gap:"12px"}}>
                    <input style={{...inp, marginBottom:0, flex:1}} placeholder="اسم الولاية" value={newWilaya} onChange={e => setNewWilaya(e.target.value)}/>
                    <button onClick={handleAddWilaya} style={{padding:"10px 20px", background:COLORS.accent2, border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", color:"#000"}}>اضافة</button>
                  </div>
                  <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"16px"}}>
                    {wilayas.map(w => <div key={w} style={{background:"#00B0FF22", color:COLORS.accent2, padding:"4px 14px", borderRadius:"20px", fontSize:"13px", fontWeight:"700"}}>{w}</div>)}
                  </div>
                </div>
                <div style={{background:COLORS.card, borderRadius:"20px", border:`1px solid ${COLORS.border}`, padding:"28px"}}>
                  <div style={{fontWeight:"700", color:COLORS.accent, marginBottom:"20px"}}>اضافة ملعب جديد</div>
                  <label style={lbl}>اسم الملعب</label>
                  <input style={inp} placeholder="اسم الملعب" value={newName} onChange={e => setNewName(e.target.value)}/>
                  <label style={lbl}>الولاية</label>
                  <select style={sel} value={newWilayaSelect} onChange={e => setNewWilayaSelect(e.target.value)}>
                    <option value="">اختر الولاية</option>
                    {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <label style={lbl}>الحي</label>
                  <input style={inp} placeholder="اسم الحي" value={newHood} onChange={e => setNewHood(e.target.value)}/>
                  <label style={lbl}>السعر (اوقية/ساعة)</label>
                  <input style={inp} type="number" placeholder="1000" value={newPrice} onChange={e => setNewPrice(e.target.value)}/>
                  <label style={lbl}>رقم هاتف صاحب الملعب</label>
                  <input style={inp} placeholder="8 أرقام" maxLength={8} value={newOwnerPhone} onChange={e => { const val = e.target.value.replace(/\D/g,""); setNewOwnerPhone(val); }}/>
                  <div style={{fontWeight:"700", color:COLORS.accent2, margin:"16px 0 12px"}}>ارقام الحسابات البنكية</div>
                  {PAYMENT_APPS.map(p => (
                    <div key={p.id}>
                      <label style={lbl}>{p.name}</label>
                      <input style={inp} placeholder={"رقم حسابك في " + p.name} value={newPayments[p.id]||""} onChange={e => setNewPayments(prev => ({...prev, [p.id]: e.target.value}))}/>
                    </div>
                  ))}
                  <button onClick={handleAdd} style={{padding:"12px 24px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"15px", color:"#000"}}>اضافة الملعب</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>{/* نافذة WhatsApp بعد التأكيد */}
      {confirmedBooking && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"400px", padding:"32px", textAlign:"center"}}>
            <div style={{fontSize:"48px", marginBottom:"16px"}}>✅</div>
            <div style={{fontSize:"18px", fontWeight:"800", marginBottom:"8px"}}>تم التأكيد!</div>
            <div style={{color:COLORS.muted, marginBottom:"8px"}}>الكود: <span style={{color:COLORS.accent, fontWeight:"800"}}>{confirmedBooking.code}</span></div>
            <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"24px"}}>أرسل الرسائل للزبون وصاحب الملعب</div>
            <div style={{display:"flex", flexDirection:"column", gap:"12px", marginBottom:"16px"}}>
              <button onClick={() => {
                const msg = `مرحبا ${confirmedBooking.client_name} 👋\nلقد تم قبول حجزكم في ${confirmedBooking.stadium_name} ✅\nيرجى عدم التأخر عن الساعة ${confirmedBooking.hour}:00\nالكود: ${confirmedBooking.code}`;
                window.open(`https://wa.me/222${confirmedBooking.client_phone}?text=${encodeURIComponent(msg)}`, "_blank");
              }} style={{padding:"12px", background:"#25D36622", color:"#25D366", border:"1px solid #25D36644", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"14px"}}>
                📱 واتساب الزبون — {confirmedBooking.client_name}
              </button>
              {confirmedBooking.ownerPhone && (
                <button onClick={() => {
                  const msg = `مرحبا ${confirmedBooking.stadium_name} 👋\nلديكم مباراة جديدة الساعة ${confirmedBooking.hour}:00\nالاسم: ${confirmedBooking.client_name}\nالهاتف: ${confirmedBooking.client_phone}\nالكود: ${confirmedBooking.code}`;
                  window.open(`https://wa.me/222${confirmedBooking.ownerPhone}?text=${encodeURIComponent(msg)}`, "_blank");
                }} style={{padding:"12px", background:"#00B0FF22", color:COLORS.accent2, border:`1px solid #00B0FF44`, borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"14px"}}>
                  📱 واتساب صاحب الملعب — {confirmedBooking.stadium_name}
                </button>
              )}
            </div>
            <button onClick={() => setConfirmedBooking(null)} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>اغلاق</button>
          </div>
        </div>
      )}

      {/* نافذة تعديل الملعب */}
      {editStadium && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setEditStadium(null)}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"520px", maxHeight:"90vh", overflow:"auto", padding:"32px"}}>
            <div style={{fontSize:"20px", fontWeight:"800", color:COLORS.accent2, marginBottom:"24px"}}>✏️ تعديل {editStadium.name}</div>
            <label style={lbl}>اسم الملعب</label>
            <input style={inp} value={editName} onChange={e => setEditName(e.target.value)}/>
            <label style={lbl}>الولاية</label>
            <select style={sel} value={editWilaya} onChange={e => setEditWilaya(e.target.value)}>
              {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <label style={lbl}>الحي</label>
            <input style={inp} value={editHood} onChange={e => setEditHood(e.target.value)}/>
            <label style={lbl}>السعر (اوقية/ساعة)</label>
            <input style={inp} type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}/>
            <label style={lbl}>رقم هاتف صاحب الملعب</label>
            <input style={inp} placeholder="8 أرقام" maxLength={8} value={editOwnerPhone} onChange={e => { const val = e.target.value.replace(/\D/g,""); setEditOwnerPhone(val); }}/>
            <div style={{fontWeight:"700", color:COLORS.accent2, margin:"16px 0 12px"}}>ارقام الحسابات البنكية</div>
            {PAYMENT_APPS.map(p => (
              <div key={p.id}>
                <label style={lbl}>{p.name}</label>
                <input style={inp} placeholder={"رقم حسابك في " + p.name} value={editPayments[p.id]||""} onChange={e => setEditPayments(prev => ({...prev, [p.id]: e.target.value}))}/>
              </div>
            ))}
            <div style={{display:"flex", gap:"12px"}}>
              <button onClick={() => setEditStadium(null)} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>الغاء</button>
              <button onClick={handleEdit} style={{flex:2, padding:"12px", background:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", color:"#000", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>حفظ التعديلات</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الملف الشخصي */}
      {showProfile && user && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setShowProfile(false)}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"400px", padding:"32px"}}>
            <div style={{textAlign:"center", marginBottom:"24px"}}>
              <div style={{fontSize:"56px", marginBottom:"8px"}}>👤</div>
              <div style={{fontSize:"20px", fontWeight:"800", color:COLORS.accent}}>{user.name}</div>
            </div>
            <div style={{background:COLORS.bg, borderRadius:"12px", padding:"16px", marginBottom:"12px"}}>
              <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"4px"}}>رقم الهاتف</div>
              <div style={{fontWeight:"700", fontSize:"16px"}}>📞 {user.phone}</div>
            </div>
            <div style={{background:COLORS.bg, borderRadius:"12px", padding:"16px", marginBottom:"12px"}}>
              <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"4px"}}>كلمة السر</div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div style={{fontWeight:"700", fontSize:"16px", letterSpacing:"4px"}}>
                  {showPass ? user.password : "••••"}
                </div>
                <button onClick={() => setShowPass(!showPass)} style={{background:"none", border:"none", cursor:"pointer", fontSize:"20px", padding:"4px"}}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <div style={{background:COLORS.bg, borderRadius:"12px", padding:"16px", marginBottom:"24px"}}>
              <div style={{color:COLORS.muted, fontSize:"12px", marginBottom:"4px"}}>الحجوزات المقبولة</div>
              <div style={{fontWeight:"800", fontSize:"32px", color:COLORS.accent}}>✅ {myConfirmedBookings.length}</div>
            </div>
            <button onClick={() => setShowProfile(false)} style={{width:"100%", padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>اغلاق</button>
          </div>
        </div>
      )}

      {/* نافذة الحجز */}
      {selected && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && closeModal()}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:"520px", maxHeight:"90vh", overflow:"auto", padding:"32px"}}>
            <div style={{fontSize:"20px", fontWeight:"800", color:selected.color, marginBottom:"4px"}}>🏟 {selected.name}</div>
            <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"24px"}}>📍 {selected.wilaya} - {selected.hood} - {selected.price} اوقية/ساعة</div>
            {step===1 && (
              <>
                <label style={lbl}>التاريخ</label>
                <input type="date" style={inp} value={bookDate} min={today} onChange={e => { setBookDate(e.target.value); setBookHour(null); }}/>
                <label style={lbl}>اختر الساعة</label>
                <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"8px", marginBottom:"20px"}}>
                  {HOURS.map(h => {
                    const taken = isBooked(selected.id, bookDate, h);
                    const s = bookHour===h;
                    return (
                      <button key={h} disabled={taken} onClick={() => !taken && setBookHour(h)} style={{padding:"10px 4px", borderRadius:"10px", border: s?`2px solid ${selected.color}`:"2px solid transparent", background: taken?COLORS.bg:s?`${selected.color}22`:COLORS.bg, color: taken?"#374151":s?selected.color:COLORS.muted, cursor:taken?"not-allowed":"pointer", fontSize:"12px", fontWeight:"600", fontFamily:"inherit"}}>
                        {h}:00
                        {taken && <span style={{display:"block", fontSize:"9px", color:"#4b5563"}}>محجوز</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={closeModal} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>الغاء</button>
                  <button disabled={bookHour===null} onClick={() => setStep(2)} style={{flex:2, padding:"12px", background:bookHour===null?COLORS.bg:`linear-gradient(135deg,${selected.color},${selected.color}BB)`, border:"none", borderRadius:"12px", color:bookHour===null?COLORS.muted:"#000", fontWeight:"700", cursor:bookHour===null?"not-allowed":"pointer", fontFamily:"inherit"}}>التالي</button>
                </div>
              </>
            )}
            {step===2 && (
              <>
                <div style={{fontWeight:"700", marginBottom:"16px"}}>اختر طريقة الدفع</div>
                <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px", marginBottom:"20px"}}>
                  {PAYMENT_APPS.map(p => {
                    if (!selected.payments?.[p.id]) return null;
                    return (
                      <button key={p.id} onClick={() => setSelectedPayApp(p.id)} style={{padding:"14px", borderRadius:"12px", border: selectedPayApp===p.id?`2px solid ${p.color}`:`2px solid ${COLORS.border}`, background: selectedPayApp===p.id?`${p.color}22`:COLORS.bg, color: selectedPayApp===p.id?p.color:COLORS.muted, cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"14px"}}>{p.name}</button>
                    );
                  })}
                </div>
                {selectedPayApp && stadiumPayNum && (
                  <div style={{background:COLORS.bg, borderRadius:"12px", padding:"16px", marginBottom:"20px"}}>
                    <div style={{color:COLORS.muted, fontSize:"13px", marginBottom:"8px"}}>ارسل <strong style={{color:"#fff"}}>{selected.price} اوقية</strong> الى:</div>
                    <div style={{fontSize:"22px", fontWeight:"800", color:payApp?.color, letterSpacing:"2px"}}>{stadiumPayNum}</div>
                    <div style={{color:COLORS.muted, fontSize:"12px", marginTop:"4px"}}>عبر {payApp?.name}</div>
                  </div>
                )}
                <label style={lbl}>الرقم التسلسلي للعملية</label>
                <input style={inp} placeholder="ادخل رقم العملية بعد الدفع" maxLength={19} value={transactionNum} onChange={e => setTransactionNum(e.target.value)}/>
                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={() => setStep(1)} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>رجوع</button>
                  <button disabled={!selectedPayApp||!transactionNum} onClick={handleBook} style={{flex:2, padding:"12px", background:!selectedPayApp||!transactionNum?COLORS.bg:"linear-gradient(135deg,#00E676,#00B0FF)", border:"none", borderRadius:"12px", color:!selectedPayApp||!transactionNum?COLORS.muted:"#000", fontWeight:"700", cursor:!selectedPayApp||!transactionNum?"not-allowed":"pointer", fontFamily:"inherit"}}>تاكيد الحجز</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      {confirmDelete && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}}>
          <div style={{background:COLORS.card, borderRadius:"24px", border:"1px solid #FF444444", width:"100%", maxWidth:"400px", padding:"32px", textAlign:"center"}}>
            <div style={{fontSize:"48px", marginBottom:"16px"}}>🗑</div>
            <div style={{fontSize:"18px", fontWeight:"800", marginBottom:"8px"}}>حذف الملعب</div>
            <div style={{color:COLORS.muted, marginBottom:"24px"}}>هل انت متاكد من حذف {confirmDelete.name}؟</div>
            <div style={{display:"flex", gap:"12px"}}>
              <button onClick={() => setConfirmDelete(null)} style={{flex:1, padding:"12px", background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:"12px", color:COLORS.muted, fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>الغاء</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{flex:1, padding:"12px", background:"#FF4444", border:"none", borderRadius:"12px", color:"#fff", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>حذف</button>
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