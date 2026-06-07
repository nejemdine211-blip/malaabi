import { useState } from "react";

const PAYMENT_APPS = [
  { id: "bankily", name: "Bankily", color: "#00A651" },
  { id: "masrvi", name: "Masrvi", color: "#FF6B00" },
  { id: "sedad", name: "SEDAD", color: "#0066CC" },
  { id: "click", name: "Click", color: "#FF0000" },
  { id: "bimbank", name: "Bimbank", color: "#6B21A8" },
  { id: "moov", name: "Moov Money", color: "#FFD700" },
];

const HOURS = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
const today = new Date().toISOString().split("T")[0];
const getKey = (sid, date, hour) => `${sid}_${date}_${hour}`;
const genCode = () => Math.random().toString(36).substring(2,8).toUpperCase();

export default function App() {
  const [tab, setTab] = useState("client");
  const [wilayas, setWilayas] = useState(["انواكشوط", "انواذيبو", "ازويرات"]);
  const [newWilaya, setNewWilaya] = useState("");
  const [stadiums, setStadiums] = useState([]);
  const [bookings, setBookings] = useState({});
  const [selected, setSelected] = useState(null);
  const [bookDate, setBookDate] = useState(today);
  const [bookHour, setBookHour] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [step, setStep] = useState(1);
  const [selectedPayApp, setSelectedPayApp] = useState(null);
  const [transactionNum, setTransactionNum] = useState("");
  const [toast, setToast] = useState(null);
  const [newName, setNewName] = useState("");
  const [newWilayaSelect, setNewWilayaSelect] = useState("");
  const [newHood, setNewHood] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newPayments, setNewPayments] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterWilaya, setFilterWilaya] = useState("الكل");

  const showToast = (msg, color="#00C853") => {
    setToast({msg, color});
    setTimeout(() => setToast(null), 4000);
  };

  const closeModal = () => {
    setSelected(null); setStep(1);
    setBookHour(null); setClientName("");
    setClientPhone(""); setSelectedPayApp(null);
    setTransactionNum("");
  };

  const handleDelete = (id) => {
    setStadiums(prev => prev.filter(s => s.id !== id));
    setConfirmDelete(null);
    showToast("تم حذف الملعب", "#FF4444");
  };

  const handleBook = () => {
    if (!clientName || !clientPhone || !bookHour || !selectedPayApp || !transactionNum) return;
    const key = getKey(selected.id, bookDate, bookHour);
    setBookings(prev => ({
      ...prev,
      [key]: { clientName, clientPhone, stadiumId: selected.id, stadium: selected.name, date: bookDate, hour: bookHour, payApp: selectedPayApp, transactionNum, status: "pending", code: null, key }
    }));
    closeModal();
    showToast("تم ارسال طلب الحجز انتظر التاكيد");
  };

  const confirmBooking = (key) => {
    const code = genCode();
    setBookings(prev => ({ ...prev, [key]: { ...prev[key], status: "confirmed", code } }));
    showToast("تم التاكيد الكود: " + code);
  };

  const rejectBooking = (key) => {
    setBookings(prev => ({ ...prev, [key]: { ...prev[key], status: "rejected" } }));
    showToast("تم رفض الحجز", "#FF4444");
  };

  const handleAdd = () => {
    if (!newName || !newWilayaSelect || !newHood || !newPrice) return;
    const colors = ["#00C853","#2979FF","#FF6D00","#FF4081","#7C4DFF","#00BCD4"];
    setStadiums(prev => [...prev, { id: Date.now(), name: newName, wilaya: newWilayaSelect, hood: newHood, price: parseInt(newPrice), color: colors[prev.length % colors.length], payments: { ...newPayments } }]);
    setNewName(""); setNewWilayaSelect(""); setNewHood(""); setNewPrice(""); setNewPayments({});
    showToast("تمت الاضافة");
  };

  const handleAddWilaya = () => {
    if (!newWilaya || wilayas.includes(newWilaya)) return;
    setWilayas(prev => [...prev, newWilaya]);
    setNewWilaya("");
    showToast("تمت اضافة الولاية");
  };

  const filteredStadiums = filterWilaya === "الكل" ? stadiums : stadiums.filter(s => s.wilaya === filterWilaya);
  const allBookings = Object.values(bookings);
  const pendingBookings = allBookings.filter(b => b.status === "pending");
  const payApp = selectedPayApp ? PAYMENT_APPS.find(p => p.id === selectedPayApp) : null;
  const stadiumPayNum = selected && payApp ? (selected.payments?.[selectedPayApp] || "") : "";

  const inp = { width:"100%", background:"#1f2937", border:"1px solid #374151", borderRadius:"10px", padding:"10px 14px", color:"#fff", fontSize:"14px", fontFamily:"inherit", marginBottom:"12px", boxSizing:"border-box", outline:"none" };
  const lbl = { color:"#9ca3af", fontSize:"13px", marginBottom:"6px", display:"block" };
  const sel = { width:"100%", background:"#1f2937", border:"1px solid #374151", borderRadius:"10px", padding:"10px 14px", color:"#fff", fontSize:"14px", fontFamily:"inherit", marginBottom:"12px", boxSizing:"border-box", outline:"none" };

  return (
    <div style={{minHeight:"100vh", background:"#0a0a0f", fontFamily:"Tajawal,sans-serif", direction:"rtl", color:"#fff"}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{background:"#111827", borderBottom:"1px solid #1f2937", padding:"20px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50}}>
        <div style={{fontSize:"22px", fontWeight:"800", color:"#00C853"}}>ملاعبي</div>
        <div style={{display:"flex", gap:"8px", background:"#0a0a0f", borderRadius:"10px", padding:"4px"}}>
          {["client","admin"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{padding:"8px 20px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", background:tab===t?"#00C853":"transparent", color:tab===t?"#000":"#6b7280"}}>
              {t==="client"?"للزبناء":"لوحة التحكم"}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:"1100px", margin:"0 auto", padding:"32px 24px"}}>

        {/* CLIENT */}
        {tab==="client" && (
          <>
            <div style={{fontSize:"28px", fontWeight:"800", marginBottom:"8px"}}>احجز ملعبك</div>
            <div style={{color:"#6b7280", marginBottom:"24px"}}>اختر الولاية والملعب المناسب</div>

            {/* Filter */}
            <div style={{display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"28px"}}>
              {["الكل", ...wilayas].map(w => (
                <button key={w} onClick={() => setFilterWilaya(w)}
                  style={{padding:"8px 18px", borderRadius:"20px", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"14px", background: filterWilaya===w?"#00C853":"#1f2937", color: filterWilaya===w?"#000":"#9ca3af"}}>
                  {w}
                </button>
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
                  const free = HOURS.filter(h => { const b = bookings[getKey(st.id,today,h)]; return !b || b.status==="rejected"; }).length;
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
                        <button onClick={() => { setSelected(st); setStep(1); setBookDate(today); }}
                          style={{width:"100%", padding:"12px", background:st.color, border:"none", borderRadius:"12px", fontWeight:"700", fontSize:"15px", cursor:"pointer", fontFamily:"inherit"}}>
                          احجز الان
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ADMIN */}
        {tab==="admin" && (
          <>
            <div style={{fontSize:"28px", fontWeight:"800", marginBottom:"32px"}}>لوحة التحكم</div>

            {/* Pending */}
            {pendingBookings.length>0 && (
              <div style={{background:"#111827", borderRadius:"20px", border:"1px solid #FF6D0033", padding:"28px", marginBottom:"24px"}}>
                <div style={{fontWeight:"700", color:"#FF6D00", marginBottom:"20px"}}>طلبات تنتظر التاكيد ({pendingBookings.length})</div>
                {pendingBookings.map((b,i) => {
                  const pa = PAYMENT_APPS.find(p => p.id===b.payApp);
                  return (
                    <div key={i} style={{background:"#1f2937", borderRadius:"12px", padding:"16px 20px", marginBottom:"12px", borderRight:"4px solid #FF6D00"}}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}>
                        <div>
                          <div style={{fontWeight:"700"}}>{b.clientName}</div>
                          <div style={{color:"#9ca3af", fontSize:"13px"}}>📞 {b.clientPhone}</div>
                          <div style={{color:"#9ca3af", fontSize:"13px"}}>🏟 {b.stadium} - {b.date} - {b.hour}:00</div>
                        </div>
                        <div style={{background:`${pa?.color}22`, color:pa?.color, padding:"4px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"700", height:"fit-content"}}>
                          {pa?.name}
                        </div>
                      </div>
                      <div style={{background:"#111827", borderRadius:"10px", padding:"10px 14px", marginBottom:"12px", fontSize:"13px"}}>
                        الرقم التسلسلي: <span style={{color:"#00C853", fontWeight:"700"}}>{b.transactionNum}</span>
                      </div>
                      <div style={{display:"flex", gap:"10px"}}>
                        <button onClick={() => confirmBooking(b.key)} style={{flex:1, padding:"10px", background:"#00C853", border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>تاكيد</button>
                        <button onClick={() => rejectBooking(b.key)} style={{flex:1, padding:"10px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>رفض</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Wilaya */}
            <div style={{background:"#111827", borderRadius:"20px", border:"1px solid #1f2937", padding:"28px", marginBottom:"24px"}}>
              <div style={{fontWeight:"700", color:"#00BCD4", marginBottom:"20px"}}>اضافة ولاية جديدة</div>
              <div style={{display:"flex", gap:"12px"}}>
                <input style={{...inp, marginBottom:0, flex:1}} placeholder="اسم الولاية" value={newWilaya} onChange={e => setNewWilaya(e.target.value)}/>
                <button onClick={handleAddWilaya} style={{padding:"10px 20px", background:"#00BCD4", border:"none", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap"}}>اضافة</button>
              </div>
              <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"16px"}}>
                {wilayas.map(w => (
                  <div key={w} style={{background:"#00BCD422", color:"#00BCD4", padding:"4px 14px", borderRadius:"20px", fontSize:"13px", fontWeight:"700"}}>{w}</div>
                ))}
              </div>
            </div>

            {/* Stadiums List */}
            {stadiums.length>0 && (
              <div style={{background:"#111827", borderRadius:"20px", border:"1px solid #1f2937", padding:"28px", marginBottom:"24px"}}>
                <div style={{fontWeight:"700", color:"#7C4DFF", marginBottom:"20px"}}>الملاعب المسجلة ({stadiums.length})</div>
                {stadiums.map(st => (
                  <div key={st.id} style={{background:"#1f2937", borderRadius:"12px", padding:"16px 20px", marginBottom:"10px", display:"flex", justifyContent:"space-between", alignItems:"center", borderRight:`4px solid ${st.color}`}}>
                    <div>
                      <div style={{fontWeight:"700"}}>{st.name}</div>
                      <div style={{color:"#9ca3af", fontSize:"13px"}}>📍 {st.wilaya} - {st.hood} - {st.price} اوقية/ساعة</div>
                    </div>
                    <button onClick={() => setConfirmDelete(st)} style={{padding:"8px 16px", background:"#FF444422", color:"#FF4444", border:"1px solid #FF444444", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Stadium */}
            <div style={{background:"#111827", borderRadius:"20px", border:"1px solid #1f2937", padding:"28px", marginBottom:"24px"}}>
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
              <button onClick={handleAdd} style={{padding:"12px 24px", background:"#00C853", border:"none", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", fontSize:"15px"}}>
                اضافة الملعب
              </button>
            </div>

            {/* All Bookings */}
            <div style={{background:"#111827", borderRadius:"20px", border:"1px solid #1f2937", padding:"28px"}}>
              <div style={{fontWeight:"700", color:"#2979FF", marginBottom:"20px"}}>كل الحجوزات ({allBookings.length})</div>
              {allBookings.length===0 ? (
                <div style={{color:"#4b5563", textAlign:"center", padding:"32px"}}>لا توجد حجوزات بعد</div>
              ) : allBookings.map((b,i) => (
                <div key={i} style={{background:"#1f2937", borderRadius:"12px", padding:"16px 20px", marginBottom:"10px", borderRight:`4px solid ${b.status==="confirmed"?"#00C853":b.status==="rejected"?"#FF4444":"#FF6D00"}`}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:"700"}}>{b.clientName}</div>
                      <div style={{color:"#9ca3af", fontSize:"13px"}}>{b.stadium} - {b.date} - {b.hour}:00</div>
                      {b.code && <div style={{color:"#00C853", fontWeight:"700", fontSize:"13px", marginTop:"4px"}}>الكود: {b.code}</div>}
                    </div>
                    <div style={{background: b.status==="confirmed"?"#00C85322":b.status==="rejected"?"#FF444422":"#FF6D0022", color: b.status==="confirmed"?"#00C853":b.status==="rejected"?"#FF4444":"#FF6D00", padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"700"}}>
                      {b.status==="confirmed"?"مؤكد":b.status==="rejected"?"مرفوض":"انتظار"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* BOOKING MODAL */}
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
                <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"8px", marginBottom:"20px"}}>
                  {HOURS.map(h => {
                    const b = bookings[getKey(selected.id, bookDate, h)];
                    const taken = b && b.status !== "rejected";
                    const s = bookHour===h;
                    return (
                      <button key={h} disabled={taken} onClick={() => !taken && setBookHour(h)} style={{padding:"10px 4px", borderRadius:"10px", border: s?`2px solid ${selected.color}`:"2px solid transparent", background: taken?"#1f2937":s?`${selected.color}22`:"#1f2937", color: taken?"#374151":s?selected.color:"#9ca3af", cursor:taken?"not-allowed":"pointer", fontSize:"13px", fontWeight:"600", fontFamily:"inherit"}}>
                        {h}:00
                        {taken && <span style={{display:"block", fontSize:"9px", color:"#4b5563"}}>محجوز</span>}
                      </button>
                    );
                  })}
                </div>
                <label style={lbl}>الاسم الكامل</label>
                <input style={inp} placeholder="ادخل اسمك" value={clientName} onChange={e => setClientName(e.target.value)}/>
                <label style={lbl}>رقم الهاتف</label>
                <input style={inp} placeholder="رقم هاتفك" value={clientPhone} onChange={e => setClientPhone(e.target.value)}/>
                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={closeModal} style={{flex:1, padding:"12px", background:"#1f2937", border:"none", borderRadius:"12px", color:"#9ca3af", fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>الغاء</button>
                  <button disabled={!bookHour||!clientName||!clientPhone} onClick={() => setStep(2)} style={{flex:2, padding:"12px", background:!bookHour||!clientName||!clientPhone?"#1f2937":selected.color, border:"none", borderRadius:"12px", color:!bookHour||!clientName||!clientPhone?"#4b5563":"#000", fontWeight:"700", cursor:!bookHour||!clientName||!clientPhone?"not-allowed":"pointer", fontFamily:"inherit"}}>
                    التالي
                  </button>
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
                      <button key={p.id} onClick={() => setSelectedPayApp(p.id)} style={{padding:"14px", borderRadius:"12px", border: selectedPayApp===p.id?`2px solid ${p.color}`:"2px solid #374151", background: selectedPayApp===p.id?`${p.color}22`:"#1f2937", color: selectedPayApp===p.id?p.color:"#9ca3af", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", fontSize:"14px"}}>
                        {p.name}
                      </button>
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
                <input style={inp} placeholder="ادخل رقم العملية بعد الدفع" value={transactionNum} onChange={e => setTransactionNum(e.target.value)}/>
                <div style={{display:"flex", gap:"12px"}}>
                  <button onClick={() => setStep(1)} style={{flex:1, padding:"12px", background:"#1f2937", border:"none", borderRadius:"12px", color:"#9ca3af", fontWeight:"600", cursor:"pointer", fontFamily:"inherit"}}>رجوع</button>
                  <button disabled={!selectedPayApp||!transactionNum} onClick={handleBook} style={{flex:2, padding:"12px", background:!selectedPayApp||!transactionNum?"#1f2937":"#00C853", border:"none", borderRadius:"12px", color:!selectedPayApp||!transactionNum?"#4b5563":"#000", fontWeight:"700", cursor:!selectedPayApp||!transactionNum?"not-allowed":"pointer", fontFamily:"inherit"}}>
                    تاكيد الحجز
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
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

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", background:toast.color, color:"#fff", padding:"14px 28px", borderRadius:"16px", fontWeight:"700", zIndex:999}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}