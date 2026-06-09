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

// ✅ 24 ساعة
const HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
const today = new Date().toISOString().split("T")[0];
// ✅ كود 8 خانات
const genCode = () => Math.random().toString(36).substring(2,10).toUpperCase();
const ADMIN_PASS = "malaabi5964";

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
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");
  // ✅ الملف الشخصي
  const [showProfile, setShowProfile] = useState(false);
  const [showPass, setShowPass] = useState(false);

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

  const showToast = (msg, color="#00C853") => {
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
      showToast("رقم الهاتف مسجل مسبقاً، سجل الدخول أو استخدم رقماً آخر", "#FF4444");
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
    if (!bookHour && bookHour !== 0) return;
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
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed", code } : b));
    showToast("تم التاكيد الكود: " + code);
  };

  const rejectBooking = async (id) => {
    await supabase.from("bookings").update({ status: "rejected" }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "rejected" } : b));
    showToast("تم رفض الحجز", "#FF4444");
  };

  const handleAdd = async () => {
    if (!newName || !newWilayaSelect || !newHood || !newPrice) return showToast("ادخل جميع البيانات", "#FF4444");
    const colors = ["#00C853","#2979FF","#FF6D00","#FF4081","#7C4DFF","#00BCD4"];
    const { data } = await supabase.from("stadiums").insert({
      name: newName, wilaya: newWilayaSelect, hood: newHood,
      price: parseInt(newPrice), color: colors[stadiums.length % colors.length],
      payments: newPayments
    }).select().single();
    if (data) setStadiums(prev => [...prev, data]);
    setNewName(""); setNewWilayaSelect(""); setNewHood(""); setNewPrice(""); setNewPayments({});
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
  // ✅ حجوزات المستخدم الحالي المقبولة
  const myConfirmedBookings = user ? confirmedBookings.filter(b => b.client_phone === user.phone) : [];
  const filteredStadiums = filterWilaya === "الكل" ? stadiums : stadiums.filter(s => s.wilaya === filterWilaya);
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const payApp = selectedPayApp ? PAYMENT_APPS.find(p => p.id === selectedPayApp) : null;
  const stadiumPayNum = selected && payApp ? (selected.payments?.[selectedPayApp] || "") : "";

  const inp = { width:"100%", background:"#1f2937", border:"1px solid #374151", borderRadius:"10px", padding:"12px 16px", color:"#fff", fontSize:"15px", fontFamily:"inherit", marginBottom:"16px", boxSizing:"border-box", outline:"none" };
  const lbl = { color:"#9ca3af", fontSize:"13px", marginBottom:"6px", display:"block" };
  const sel = { width:"100%", background:"#1f2937", border:"1px solid #374151", borderRadius:"10px", padding:"12px 16px", color:"#fff", fontSize:"15px", fontFamily:"inherit", marginBottom:"16px", boxSizing:"border-box", outline:"none" };

  if (screen === "login" || screen === "register") {
    const isReg = screen === "register";
    return (
      <div style={{minHeight:"100vh", background:"#0a0a0f", fontFamily:"Tajawal,sans-serif", direction:"rtl", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px"}}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
        <div style={{width:"100%", maxWidth:"400px"}}>
          <div style={{textAlign:"center", marginBottom:"40px"}}>
            <div style={{fontSize:"56px", marginBottom:"8px"}}>⚽</div>
            <div style={{fontSize:"28px", fontWeight:"800", color:"#00C853"}}>ملاعبي</div>
            <div style={{color:"#6b7280", marginTop:"8px"}}>احجز ملعبك بسهولة</div>
          </div>
          <div style={{background:"#111827", borderRadius:"20px", padding:"28px", border:"1px solid #1f2937"}}>
            <div style={{display:"flex", marginBottom:"24px", background:"#1f2937", borderRadius:"10px", padding:"4px"}}>
              <button onClick={() => setScreen("login")} style={{flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", background:!isReg?"#00C853":"transparent", color:!isReg?"#000":"#6b7280"}}>تسجيل الدخول</button>
              <button onClick={() => setScreen("register")} style={{flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", background:isReg?"#00C853":"transparent", color:isReg?"#000":"#6b7280"}}>حساب جديد</button>
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
            <button onClick={isReg ? handleRegister : handleLogin} style={{width:"100%", padding:"14px", background:"#00C853", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"16px", cursor:"pointer", fontFamily:"inherit", color:"#000"}}>
              {isReg ? "انشاء الحساب" : "دخول"}
            </button>
          </div>
        </div>
        {toast && <div style={{position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", background:toast.color, color:"#fff", padding:"14px 28px", borderRadius:"16px", fontWeight:"700", zIndex:999}}>{toast.msg}</div>}
      </div>
    );
  }

  if (loading) return (
    <div style={{minHeight:"100vh", background:"#0a0a0f", display:"flex", alignItems:"center", justifyContent:"center", color:"#00C853", fontSize:"20px", fontFamily:"Tajawal,sans-serif"}}>
      جاري التحميل...
    </div>
  );

  return (
    <div style={{minHeight:"100vh", background:"#0a0a0f", fontFamily:"Tajawal,sans-serif", direction:"rtl", color:"#fff"}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>

      {/* الشريط العلوي */}
      <div style={{background:"#111827", borderBottom:"1px solid #1f2937", padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50}}>
        <div onClick={handleLogoClick} style={{fontSize:"20px", fontWeight:"800", color:"#00C853", cursor:"pointer", userSelect:"none"}}>ملاعبي</div>
        <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
          {/* ✅ زر الملف الشخصي */}
          {user && (
            <div onClick={() => setShowProfile(true)} style={{color:"#00C853", fontSize:"13px", cursor:"pointer", fontWeight:"700", background:"#00C85322", padding:"6px 14px", borderRadius:"8px"}}>
              👤 {user.name}
            </div>
          )}
          <button onClick={handleLogout} style={{padding:"6px 14px", background:"#1f2937", border:"none", borderRadius:"8px", color:"#9ca3af", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>خروج</button>
          {tab === "admin" && (
            <button onClick={() => setTab("client")} style={{padding:"6px 14px", background:"#FF444422", border:"none", borderRadius:"8px", color:"#FF4444", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>اغلاق التحكم</button>
          )}
        </div>
      </div>

      <div style={{maxWidth:"1100px", margin:"0 auto", padding:"32px 24px"}}>
        {tab==="client" && (
          <>
            <div style={{fontSize:"28px", fontWeight:"800", marginBottom:"8px"}}>احجز ملعبك</div>
            <div style={{color:"#6b7280", marginBottom:"24px"}}>اختر الولاية والملعب المناسب</div>
            <div style={{display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"28px"}}>
              {["الكل", ...wilayas].map(w => (
                <button key={w} onClick={() => setFilterWilaya(w)} style={{padding:"8px 18px", borderRadius:"20px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"14px", background: filterWilaya===w?"#00C853":"#1f2937", color: filterWilaya===w?"#000":"#9ca3af"}}>{w}</button>
              ))}
            </div>
            {filteredStadiums.length===0 ? (
              <div style={{textAlign:"center", padding:"80px 20px", color:"#4b5563"}}>
                <div style={{fontSize:"60px", marginBottom:"16px"}}>🏟</div>
                <div>لا توجد ملاعب في هذه الولاية</div>
              </div>
            ) : (
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"20px"}}>
                {filteredStadiums.map(st => {
                  const free = HOURS.filter(h => !isBooked(st.id, today, h)).length;
                  return (
                    <div key={st.id} style={{background:"#111827", borderRadius:"20px", border:`1px solid ${st.color}33`, overflow:"hidden"}}>
                      <div style={{background:`${st.color}22`, padding:"24px", display:"flex", gap:"16px", alignItems:"center"}}>
                        <span style={{fontSize:"40px"}}>🏟</span>
                        <div>
                          <div style={{fontWeight:"700", fontSize:"18px"}}>{st.name}</div>
                          <div style={{color:"#9ca3af", fontSize:"13px"}}>📍 {st.wilaya} - {st.hood}</div>
                        </div>
                      </div>
                      <div style={{padding:"20px 24px"}}>
                        <div style={{color:st.color, fontWeight:"700", marginBottom:"8px"}}>💰 {st.price} اوقية/ساعة</div>
                        <div style={{color:"#6b7280", fontSize:"13px", marginBottom:"16px"}}>{free} ساعة متاحة اليوم</div>
                        <button onClick={() => { setSelected(st); setStep(1); setBookDate(today); }} style={{width:"100%", padding:"12px", background:st.color, border:"none", borderRadius:"12px", fontWeight:"700", fontSize:"15px", cursor:"pointer", fontFamily:"inherit"}}>احجز الان</button>
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
            <div style={{display:"flex", gap:"8px", marginBottom:"24px", background:"#111827", borderRadius:"12px", padding:"4px"}}>
              {[["pending","الطلبات","#FF6D00"],["stadiums","الملاعب","#7C4DFF"],["stats","الاحصائيات","#00C853"],["add","اضافة ملعب","#2979FF"]].map(([key,label,color]) => (
                <button key={key} onClick={() => setAdminTab(key)} style={{flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"13px", background: adminTab===key?color:"transparent", color: adminTab===key?"#fff":"#6b7280"}}>{label}</button>
              ))}
            </div>

            {adminTab==="pending" && (
              <div>
                {pendingBookings.length===0 ? (
                  <div style={{textAlign:"center", padding:"60px", color:"#4b5563"}}>لا توجد طلبات معلقة</div>
                ) : pendingBookings.map((b,i) => {
                  const pa = PAYMENT_APPS.find(p => p.id===b.pay_app);
                  return (
                    <div key={i} style={{background:"#111827", borderRadius:"12px", padding:"16px 20px", marginBottom:"12px", borderRight:"4px solid #FF6D00"}}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}>
                        <div>
                          <div style={{fontWeight:"700"}}>{b.client_name}</div>
                          <div style={{color:"#9ca3af", fontSize:"13px"}}>📞 {b.client_phone}</div>
                          <div style={{color:"#9ca3af", fontSize:"13px"}}>🏟 {b.stadium_name} - {b.date} - {b.hour}:00</div>
                        </div>
                        <div style={{background:`${pa?.color}22`, color:pa?.color, padding:"4px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"700", height:"fit-content"}}>{pa?.name}</div>
                      </div>
                      <div style={{background:"#1f2937", borderRadius:"10px", padding:"10px 14px", marginBottom:"12px", fontSize:"13px"}}>
                        الرقم التسلسلي: <span style={{color:"#00C853", fontWeight:"700"}}>{b.transaction_num}</span>
                      </div>
                      <div style={{display:"flex", gap:"10px"}}>
                        <button onClick={() => confirmBooking(b.id)} style={{flex:1, padding:"10px", background:"#00C853", border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>تاكيد</button>
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
                  <div style={{textAlign:"center", padding:"60px", color:"#4b5563"}}>لا توجد ملاعب</div>
                ) : stadiums.map(st => {
                  const stConfirmed = confirmedBookings.filter(b => b.stadium_id === st.id).length;
                  return (
                    <div key={st.id} style={{background:"#111827", borderRadius:"12px", padding:"16px 20px", marginBottom:"10px", display:"flex", justifyContent:"space-between", alignItems:"center", borderRight:`4px solid ${st.color}`}}>
                      <div>
                        <div style={{fontWeight:"700"}}>{st.name}</div>
                        <div style={{color:"#9ca3af", fontSize:"13px"}}>📍 {st.wilaya} - {st.hood} - {st.price} اوقية/ساعة</div>
                        <div style={{color:"#00C853", fontSize:"13px", marginTop:"4px"}}>✅ {stConfirmed} حجز مؤكد</div>
                      </div>
                      <button onClick={() => setConfirmDelete(st)} style={{padding:"8px 16px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>حذف</button>
                    </div>
                  );
                })}
              </div>
            )}

            {adminTab==="stats" && (
              <div>
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"16px", marginBottom:"24px"}}>
                  {[
                    { label:"عدد المسجلين", value: usersCount, icon:"👥", color:"#00C853" },
                    { label:"عدد الملاعب", value: stadiums.length, icon:"🏟", color:"#2979FF" },
                    { label:"الحجوزات المؤكدة", value: confirmedBookings.length, icon:"✅", color:"#7C4DFF" },
                    { label:"الحجوزات المعلقة", value: pendingBookings.length, icon:"⏳", color:"#FF6D00" },
                  ].map((stat,i) => (
                    <div key={i} style={{background:"#111827", borderRadius:"16px", padding:"20px", border:`1px solid ${stat.color}33`}}>
                      <div style={{fontSize:"32px", marginBottom:"8px"}}>{stat.icon}</div>
                      <div style={{color:"#9ca3af", fontSize:"13px", marginBottom:"4px"}}>{stat.label}</div>
                      <div style={{fontSize:"32px", fontWeight:"800", color:stat.color}}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"#111827", borderRadius:"16px", padding:"24px", border:"1px solid #1f2937"}}>
                  <div style={{fontWeight:"700", marginBottom:"16px", color:"#fff"}}>الحجوزات المؤكدة لكل ملعب</div>
                  {stadiums.map(st => {
                    const count = confirmedBookings.filter(b => b.stadium_id === st.id).length;
                    const max = Math.max(...stadiums.map(s => confirmedBookings.filter(b => b.stadium_id === s.id).length), 1);
                    return (
                      <div key={st.id} style={{marginBottom:"12px"}}>
                        <div style={{display:"flex", justifyContent:"space-between", marginBottom:"4px"}}>
                          <span style={{fontSize:"13px"}}>{st.name}</span>
                          <span style={{fontSize:"13px", color:st.color, fontWeight:"700"}}>{count} حجز</span>
                        </div>
                        <div style={{background:"#1f2937", borderRadius:"20px", height:"8px"}}>
                          <div style={{background:st.color, borderRadius:"20px", height:"8px", width:`${(count/max)*100}%`, transition:"width 0.3s"}}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {adminTab==="add" && (
              <div>
                <div style={{background:"#111827", borderRadius:"20px", border:"1px solid #1f2937", padding:"28px", marginBottom:"24px"}}>
                  <div style={{fontWeight:"700", color:"#00BCD4", marginBottom:"20px"}}>اضافة ولاية جديدة</div>
                  <div style={{display:"flex", gap:"12px"}}>
                    <input style={{...inp, marginBottom:0, flex:1}} placeholder="اسم الولاية" value={newWilaya} onChange={e => setNewWilaya(e.target.value)}/>
                    <button onClick={handleAddWilaya} style={{padding:"10px 20px", background:"#00BCD4", border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap"}}>اضافة</button>
                  </div>
                  <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"16px"}}>
                    {wilayas.map(w => <div key={w} style={{background:"#00BCD422", color:"#00BCD4", padding:"4px 14px", borderRadius:"20px", fontSize:"13px", fontWeight:"700"}}>{w}</div>)}
                  </div>
                </div>
                <div style={{background:"#111827", borderRadius:"20px", border:"1px solid #1f2937", padding:"28px"}}>
                  <div style={{fontWeight:"700", color:"#00C853", marginBottom:"20px"}}>اضافة ملعب جديد</div>
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
                  <div style={{fontWeight:"700", color:"#2979FF", margin:"16px 0 12px"}}>ارقام الحسابات البنكية</div>
                  {PAYMENT_APPS.map(p => (
                    <div key={p.id}>
                      <label style={lbl}>{p.name}</label>
                      <input style={inp} placeholder={"رقم حسابك في " + p.name} value={newPayments[p.id]||""} onChange={e => setNewPayments(prev => ({...prev, [p.id]: e.target.value}))}/>
                    </div>
                  ))}
                  <button onClick={handleAdd} style={{padding:"12px 24px", background:"#00C853", border:"none", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"15px"}}>اضافة الملعب</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ نافذة الملف الشخصي */}
      {showProfile && user && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && setShowProfile(false)}>
          <div style={{background:"#111827", borderRadius:"24px", border:"1px solid #1f2937", width:"100%", maxWidth:"400px", padding:"32px"}}>
            <div style={{textAlign:"center", marginBottom:"24px"}}>
              <div style={{fontSize:"56px", marginBottom:"8px"}}>👤</div>
              <div style={{fontSize:"20px", fontWeight:"800", color:"#00C853"}}>{user.name}</div>
            </div>
            <div style={{background:"#1f2937", borderRadius:"12px", padding:"16px", marginBottom:"12px"}}>
              <div style={{color:"#9ca3af", fontSize:"12px", marginBottom:"4px"}}>رقم الهاتف</div>
              <div style={{fontWeight:"700", fontSize:"16px"}}>📞 {user.phone}</div>
            </div>
            <div style={{background:"#1f2937", borderRadius:"12px", padding:"16px", marginBottom:"12px"}}>
              <div style={{color:"#9ca3af", fontSize:"12px", marginBottom:"4px"}}>كلمة السر</div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div style={{fontWeight:"700", fontSize:"16px", letterSpacing:"4px"}}>
                  {showPass ? user.password : "••••"}
                </div>
                <button onClick={() => setShowPass(!showPass)} style={{background:"none", border:"none", cursor:"pointer", fontSize:"20px", padding:"4px"}}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <div style={{background:"#1f2937", borderRadius:"12px", padding:"16px", marginBottom:"24px"}}>
              <div style={{color:"#9ca3af", fontSize:"12px", marginBottom:"4px"}}>الحجوزات المقبولة</div>
              <div style={{fontWeight:"800", fontSize:"32px", color:"#00C853"}}>✅ {myConfirmedBookings.length}</div>
            </div>
            <button onClick={() => setShowProfile(false)} style={{width:"100%", padding:"12px", background:"#1f2937", border:"none", borderRadius:"12px", color:"#9ca3af", fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>اغلاق</button>
          </div>
        </div>
      )}

      {/* نافذة الحجز */}
      {selected && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}} onClick={e => e.target===e.currentTarget && closeModal()}>
          <div style={{background:"#111827", borderRadius:"24px", border:"1px solid #1f2937", width:"100%", maxWidth:"520px", maxHeight:"90vh", overflow:"auto", padding:"32px"}}>
            <div style={{fontSize:"20px", fontWeight:"800", color:selected.color, marginBottom:"4px"}}>🏟 {selected.name}</div>
            <div style={{color:"#6b7280", fontSize:"13px", marginBottom:"24px"}}>📍 {selected.wilaya} - {selected.hood} - {selected.price} اوقية/ساعة</div>
            {step===1 && (
              <>
                <label style={lbl}>التاريخ</label>
                <input type="date" style={inp} value={bookDate} min={today} onChange={e => { setBookDate(e.target.value); setBookHour(null); }}/>
                <label style={lbl}>اختر الساعة</label>
                {/* ✅ 24 ساعة */}
                <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"8px", marginBottom:"20px"}}>
                  {HOURS.map(h => {
                    const taken = isBooked(selected.id, bookDate, h);
                    const s = bookHour===h;
                    return (
                      <button key={h} disabled={taken} onClick={() => !taken && setBookHour(h)} style={{padding:"10px 4px", borderRadius:"10px", border: s?`2px solid ${selected.color}`:"2px solid transparent", background: taken?"#1f2937":s?`${selected.color}22`:"#1f2937", color: taken?"#374151":s?selected.color:"#9ca3af", cursor:taken?"not-allowed":"pointer", fontSize:"12px", fontWeight:"600", fontFamily:"inherit"}}>
                        {h}:00
                        {taken && <span style={{display:"block", fontSize:"9px", color:"#4b5563"}}>محجوز</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={closeModal} style={{flex:1, padding:"12px", background:"#1f2937", border:"none", borderRadius:"12px", color:"#9ca3af", fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>الغاء</button>
                  <button disabled={bookHour===null} onClick={() => setStep(2)} style={{flex:2, padding:"12px", background:bookHour===null?"#1f2937":selected.color, border:"none", borderRadius:"12px", color:bookHour===null?"#4b5563":"#000", fontWeight:"700", cursor:bookHour===null?"not-allowed":"pointer", fontFamily:"inherit"}}>التالي</button>
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
                      <button key={p.id} onClick={() => setSelectedPayApp(p.id)} style={{padding:"14px", borderRadius:"12px", border: selectedPayApp===p.id?`2px solid ${p.color}`:"2px solid #374151", background: selectedPayApp===p.id?`${p.color}22`:"#1f2937", color: selectedPayApp===p.id?p.color:"#9ca3af", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"14px"}}>{p.name}</button>
                    );
                  })}
                </div>
                {selectedPayApp && stadiumPayNum && (
                  <div style={{background:"#1f2937", borderRadius:"12px", padding:"16px", marginBottom:"20px"}}>
                    <div style={{color:"#9ca3af", fontSize:"13px", marginBottom:"8px"}}>ارسل <strong style={{color:"#fff"}}>{selected.price} اوقية</strong> الى:</div>
                    <div style={{fontSize:"22px", fontWeight:"800", color:payApp?.color, letterSpacing:"2px"}}>{stadiumPayNum}</div>
                    <div style={{color:"#6b7280", fontSize:"12px", marginTop:"4px"}}>عبر {payApp?.name}</div>
                  </div>
                )}
                <label style={lbl}>الرقم التسلسلي للعملية</label>
                {/* ✅ maxLength 19 */}
                <input style={inp} placeholder="ادخل رقم العملية بعد الدفع" maxLength={19} value={transactionNum} onChange={e => setTransactionNum(e.target.value)}/>
                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={() => setStep(1)} style={{flex:1, padding:"12px", background:"#1f2937", border:"none", borderRadius:"12px", color:"#9ca3af", fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>رجوع</button>
                  <button disabled={!selectedPayApp||!transactionNum} onClick={handleBook} style={{flex:2, padding:"12px", background:!selectedPayApp||!transactionNum?"#1f2937":"#00C853", border:"none", borderRadius:"12px", color:!selectedPayApp||!transactionNum?"#4b5563":"#000", fontWeight:"700", cursor:!selectedPayApp||!transactionNum?"not-allowed":"pointer", fontFamily:"inherit"}}>تاكيد الحجز</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}}>
          <div style={{background:"#111827", borderRadius:"24px", border:"1px solid #FF444444", width:"100%", maxWidth:"400px", padding:"32px", textAlign:"center"}}>
            <div style={{fontSize:"48px", marginBottom:"16px"}}>🗑</div>
            <div style={{fontSize:"18px", fontWeight:"800", marginBottom:"8px"}}>حذف الملعب</div>
            <div style={{color:"#9ca3af", marginBottom:"24px"}}>هل انت متاكد من حذف {confirmDelete.name}؟</div>
            <div style={{display:"flex", gap:"12px"}}>
              <button onClick={() => setConfirmDelete(null)} style={{flex:1, padding:"12px", background:"#1f2937", border:"none", borderRadius:"12px", color:"#9ca3af", fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>الغاء</button>
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