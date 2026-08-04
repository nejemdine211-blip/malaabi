// ============================================
// 🏟 stadium-api — دالة الملاعب والحجوزات الخادمية
// كل ما يخص أكواد المالكين والمستحقات والعمولات يمر من هنا
// المتصفح يقرأ stadiums_public فقط — بلا حقول حساسة
// ============================================

import { createClient } from "jsr:@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

// 🔑 توليد الأكواد
const genCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();
const genOwnerCode = () => "M" + Math.random().toString(36).substring(2, 8).toUpperCase();

// 🧹 بيانات الملعب التي يحق لصاحبه رؤيتها
const ownerView = (s: Record<string, unknown>) => ({
  id: s.id, name: s.name, wilaya: s.wilaya, hood: s.hood,
  price: s.price, color: s.color, image: s.image,
  working_hours: s.working_hours, payments: s.payments,
  latitude: s.latitude, longitude: s.longitude,
  status: s.status, balance_due: s.balance_due,
  commission_rate: s.commission_rate,
  // ملاحظة: owner_code لا يُعاد بعد الدخول — الجلسة تُحفظ بالمعرّف
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const ADMIN_PASS = Deno.env.get("ADMIN_PASS") ?? "";

  try {
    const body = await req.json();
    const { action, ownerCode, stadiumId, bookingId, adminPass, payload } = body;

    // 🔒 التحقق من صلاحية المشرف
    const isAdmin = () => ADMIN_PASS.length > 0 && adminPass === ADMIN_PASS;

    // 🔒 التحقق من ملكية الملعب — يُستدعى قبل كل عملية لصاحب ملعب
    const verifyOwner = async (sid: number) => {
      if (!ownerCode) return null;
      const { data } = await db
        .from("stadiums")
        .select("*")
        .eq("owner_code", String(ownerCode).trim().toUpperCase())
        .maybeSingle();
      if (!data) return null;
      if (sid != null && data.id !== sid) return null;
      return data;
    };

    // ============ دخول صاحب الملعب ============
    if (action === "owner-login") {
      if (!ownerCode) return reply({ error: "missing_code" }, 400);
      const { data } = await db
        .from("stadiums")
        .select("*")
        .eq("owner_code", String(ownerCode).trim().toUpperCase())
        .maybeSingle();
      if (!data) return reply({ error: "wrong_code" }, 401);
      if (data.status === "suspended") return reply({ error: "suspended" }, 403);
      return reply({ stadium: ownerView(data) });
    }

    // ============ تحديث بيانات صاحب الملعب ============
    if (action === "owner-refresh") {
      const st = await verifyOwner(stadiumId);
      if (!st) return reply({ error: "unauthorized" }, 401);
      if (st.status === "suspended") return reply({ error: "suspended" }, 403);
      return reply({ stadium: ownerView(st) });
    }

    // ============ قبول حجز — صاحب الملعب فقط ============
    if (action === "confirm-booking") {
      const st = await verifyOwner(null);
      if (!st) return reply({ error: "unauthorized" }, 401);

      const { data: bk } = await db
        .from("bookings").select("*").eq("id", bookingId).maybeSingle();
      if (!bk) return reply({ error: "not_found" }, 404);
      // الحجز يجب أن يكون لملعب هذا المالك
      if (bk.stadium_id !== st.id) return reply({ error: "unauthorized" }, 403);
      if (bk.status !== "pending") return reply({ error: "already_handled" }, 409);

      const rate = st.commission_rate ?? 12;
      const comm = Math.round((st.price || 0) * rate / 100);
      const code = genCode();

      const { error: e1 } = await db.from("bookings")
        .update({ status: "confirmed", code, handled_by: "owner", commission: comm })
        .eq("id", bookingId);
      if (e1) return reply({ error: "update_failed" }, 500);

      const newBalance = (st.balance_due || 0) + comm;
      await db.from("stadiums").update({ balance_due: newBalance }).eq("id", st.id);

      return reply({ ok: true, code, commission: comm, balance_due: newBalance });
    }

    // ============ رفض حجز — صاحب الملعب فقط ============
    if (action === "reject-booking") {
      const st = await verifyOwner(null);
      if (!st) return reply({ error: "unauthorized" }, 401);

      const { data: bk } = await db
        .from("bookings").select("*").eq("id", bookingId).maybeSingle();
      if (!bk) return reply({ error: "not_found" }, 404);
      if (bk.stadium_id !== st.id) return reply({ error: "unauthorized" }, 403);
      if (bk.status !== "pending") return reply({ error: "already_handled" }, 409);

      const { error } = await db.from("bookings")
        .update({ status: "rejected", handled_by: "owner" })
        .eq("id", bookingId);
      if (error) return reply({ error: "update_failed" }, 500);

      return reply({ ok: true });
    }

    // ============ حجوزات صاحب الملعب ============
    if (action === "owner-bookings") {
      const st = await verifyOwner(null);
      if (!st) return reply({ error: "unauthorized" }, 401);
      const { data } = await db.from("bookings")
        .select("*").eq("stadium_id", st.id).order("id");
      return reply({ bookings: data ?? [], stadium: ownerView(st) });
    }

    // ============ حجوزات الزبون ============
    if (action === "client-bookings") {
      const phone = String(payload?.phone ?? "");
      const pass = String(payload?.password ?? "");
      if (!/^[234]\d{7}$/.test(phone)) return reply({ error: "unauthorized" }, 401);
      // نتحقق من هوية الزبون قبل إعطائه حجوزاته
      const { data: u } = await db.from("users")
        .select("password").eq("phone", phone).maybeSingle();
      if (!u) return reply({ error: "unauthorized" }, 401);
      const ok = await bcrypt.compare(pass, String(u.password));
      if (!ok) return reply({ error: "unauthorized" }, 401);

      const { data } = await db.from("bookings")
        .select("*").eq("client_phone", phone).order("id");
      return reply({ bookings: data ?? [] });
    }

    // ============ رابط مؤقت للقطة الدفع ============
    if (action === "proof-url") {
      const bid = payload?.bookingId ?? bookingId;
      const { data: bk } = await db.from("bookings")
        .select("stadium_id, proof_url").eq("id", bid).maybeSingle();
      if (!bk?.proof_url) return reply({ error: "not_found" }, 404);

      // إما مشرف، وإما صاحب الملعب الذي يخصه الحجز
      let allowed = isAdmin();
      if (!allowed) {
        const st = await verifyOwner(null);
        allowed = !!st && st.id === bk.stadium_id;
      }
      if (!allowed) return reply({ error: "unauthorized" }, 403);

      // استخراج مسار الملف من الرابط المخزّن
      const parts = String(bk.proof_url).split("/proofs/");
      const path = parts.length > 1 ? parts[1].split("?")[0] : String(bk.proof_url);

      const { data: signed, error } = await db.storage
        .from("proofs").createSignedUrl(decodeURIComponent(path), 300);
      if (error || !signed) return reply({ error: "sign_failed" }, 500);
      return reply({ url: signed.signedUrl });
    }

    // ============ تغيير كود صاحب الملعب ============
    if (action === "owner-change-code") {
      const st = await verifyOwner(null);
      if (!st) return reply({ error: "unauthorized" }, 401);
      const fresh = genOwnerCode();
      const { error } = await db.from("stadiums")
        .update({ owner_code: fresh }).eq("id", st.id);
      if (error) return reply({ error: "update_failed" }, 500);
      return reply({ ok: true, owner_code: fresh });
    }

    // ============ إرسال تقييم ============
    if (action === "rate-booking") {
      const phone = String(payload?.phone ?? "");
      const pass = String(payload?.password ?? "");
      const stars = parseInt(payload?.stars);
      const comment = String(payload?.comment ?? "").trim().slice(0, 300);
      const bid = payload?.bookingId;

      if (!(stars >= 1 && stars <= 5)) return reply({ error: "invalid_stars" }, 400);

      // نتحقق من هوية الزبون
      const { data: u } = await db.from("users")
        .select("name, password").eq("phone", phone).maybeSingle();
      if (!u) return reply({ error: "unauthorized" }, 401);
      const okPass = await bcrypt.compare(pass, String(u.password));
      if (!okPass) return reply({ error: "unauthorized" }, 401);

      // الحجز يجب أن يكون له، ومؤكداً، ومنتهي الوقت
      const { data: bk } = await db.from("bookings")
        .select("id, stadium_id, client_phone, status, date, hour")
        .eq("id", bid).maybeSingle();
      if (!bk) return reply({ error: "not_found" }, 404);
      if (bk.client_phone !== phone) return reply({ error: "unauthorized" }, 403);
      if (bk.status !== "confirmed") return reply({ error: "not_confirmed" }, 403);

      // انتهاء الموعد: تاريخ الحجز وساعته + ساعة اللعب
      const end = new Date(`${bk.date}T${String(bk.hour).padStart(2, "0")}:00:00`);
      end.setHours(end.getHours() + 1);
      if (Date.now() < end.getTime()) return reply({ error: "too_early" }, 403);

      const { error } = await db.from("ratings").insert({
        booking_id: bk.id, stadium_id: bk.stadium_id,
        client_phone: phone, client_name: u.name,
        stars, comment: comment || null,
      });
      if (error) return reply({ error: "already_rated" }, 409);

      return reply({ ok: true, stars, comment });
    }

    // ============ تقييمات الزبون — لمعرفة ما قيّمه ============
    if (action === "my-ratings") {
      const phone = String(payload?.phone ?? "");
      const pass = String(payload?.password ?? "");
      const { data: u } = await db.from("users")
        .select("password").eq("phone", phone).maybeSingle();
      if (!u) return reply({ error: "unauthorized" }, 401);
      const okPass = await bcrypt.compare(pass, String(u.password));
      if (!okPass) return reply({ error: "unauthorized" }, 401);

      const { data } = await db.from("ratings")
        .select("booking_id, stars, comment").eq("client_phone", phone);
      return reply({ ratings: data ?? [] });
    }

    // ============ تقييمات ملعب — لصاحبه أو للمشرف ============
    if (action === "stadium-ratings") {
      const sid = payload?.stadiumId ?? stadiumId;
      let allowed = isAdmin();
      if (!allowed) {
        const st = await verifyOwner(null);
        allowed = !!st && st.id === sid;
      }
      if (!allowed) return reply({ error: "unauthorized" }, 403);

      const { data } = await db.from("ratings")
        .select("*").eq("stadium_id", sid).order("created_at", { ascending: false });
      return reply({ ratings: data ?? [] });
    }

    // ============ حذف تقييم — المشرف فقط ============
    if (action === "admin-delete-rating") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const { error } = await db.from("ratings").delete().eq("id", payload?.ratingId);
      if (error) return reply({ error: "delete_failed" }, 500);
      return reply({ ok: true });
    }

    // ============ 🚫 الساعات المغلقة لملعب ============
    if (action === "owner-blocked") {
      const st = await verifyOwner(null);
      if (!st) return reply({ error: "unauthorized" }, 401);
      const { data } = await db.from("blocked_slots")
        .select("*").eq("stadium_id", st.id).order("date").order("hour");
      return reply({ blocked: data ?? [] });
    }

    // ============ 🚫 إغلاق ساعات ليوم محدد ============
    if (action === "owner-block-hours") {
      const st = await verifyOwner(null);
      if (!st) return reply({ error: "unauthorized" }, 401);
      const date = String(payload?.date ?? "");
      const hours: number[] = Array.isArray(payload?.hours) ? payload.hours : [];
      if (!date || hours.length === 0) return reply({ error: "missing_data" }, 400);

      // لا نغلق ساعة محجوزة فعلاً
      const { data: taken } = await db.from("bookings")
        .select("hour").eq("stadium_id", st.id).eq("date", date).neq("status", "rejected");
      const takenHours = new Set((taken ?? []).map((x: Record<string, unknown>) => x.hour));
      const clean = hours.filter(h => !takenHours.has(h));
      if (clean.length === 0) return reply({ error: "all_taken" }, 409);

      const rows = clean.map(h => ({ stadium_id: st.id, date, hour: h }));
      const { error } = await db.from("blocked_slots").upsert(rows, {
        onConflict: "stadium_id,date,hour", ignoreDuplicates: true,
      });
      if (error) return reply({ error: "insert_failed" }, 500);

      const { data } = await db.from("blocked_slots")
        .select("*").eq("stadium_id", st.id).order("date").order("hour");
      return reply({ ok: true, added: clean.length, blocked: data ?? [] });
    }

    // ============ 🚫 إلغاء إغلاق ============
    if (action === "owner-unblock") {
      const st = await verifyOwner(null);
      if (!st) return reply({ error: "unauthorized" }, 401);
      const ids: number[] = Array.isArray(payload?.ids) ? payload.ids : [payload?.id];
      const { error } = await db.from("blocked_slots")
        .delete().eq("stadium_id", st.id).in("id", ids);
      if (error) return reply({ error: "delete_failed" }, 500);

      const { data } = await db.from("blocked_slots")
        .select("*").eq("stadium_id", st.id).order("date").order("hour");
      return reply({ ok: true, blocked: data ?? [] });
    }

    // ============ 🛒 فحص تعارض مواعيد متعددة ============
    if (action === "check-slots-multi") {
      const sid = payload?.stadiumId;
      const slots: { date: string; hour: number }[] = Array.isArray(payload?.slots) ? payload.slots : [];
      if (!sid || slots.length === 0) return reply({ busy: [] });

      const dates = [...new Set(slots.map(s => s.date))];
      const { data: bk } = await db.from("bookings")
        .select("date, hour").eq("stadium_id", sid).in("date", dates).neq("status", "rejected");
      const { data: bl } = await db.from("blocked_slots")
        .select("date, hour").eq("stadium_id", sid).in("date", dates);

      const taken = new Set([
        ...(bk ?? []).map((x: Record<string, unknown>) => `${x.date}|${x.hour}`),
        ...(bl ?? []).map((x: Record<string, unknown>) => `${x.date}|${x.hour}`),
      ]);
      const busy = slots.filter(s => taken.has(`${s.date}|${s.hour}`));
      return reply({ busy });
    }

    // ============ 🔁 فحص التعارض قبل الحجز المتكرر ============
    if (action === "check-slots") {
      const sid = payload?.stadiumId;
      const dates: string[] = Array.isArray(payload?.dates) ? payload.dates : [];
      const hour = parseInt(payload?.hour);
      if (!sid || dates.length === 0) return reply({ error: "missing_data" }, 400);

      const { data: bk } = await db.from("bookings")
        .select("date").eq("stadium_id", sid).eq("hour", hour)
        .in("date", dates).neq("status", "rejected");
      const { data: bl } = await db.from("blocked_slots")
        .select("date").eq("stadium_id", sid).eq("hour", hour).in("date", dates);

      const busy = new Set([
        ...(bk ?? []).map((x: Record<string, unknown>) => x.date),
        ...(bl ?? []).map((x: Record<string, unknown>) => x.date),
      ]);
      return reply({ busy: [...busy] });
    }

    // ============ 🔁 قبول أو رفض مجموعة حجوزات ============
    if (action === "handle-group") {
      const st = await verifyOwner(null);
      if (!st) return reply({ error: "unauthorized" }, 401);
      const gid = String(payload?.groupId ?? "");
      const accept = payload?.accept === true;
      if (!gid) return reply({ error: "missing_data" }, 400);

      const { data: rows } = await db.from("bookings")
        .select("*").eq("group_id", gid).eq("stadium_id", st.id).eq("status", "pending");
      if (!rows || rows.length === 0) return reply({ error: "not_found" }, 404);

      if (!accept) {
        await db.from("bookings")
          .update({ status: "rejected", handled_by: "owner" }).eq("group_id", gid);
        return reply({ ok: true, rejected: rows.length });
      }

      // القبول: عمولة على كل موعد
      const rate = st.commission_rate ?? 12;
      const per = Math.round((st.price || 0) * rate / 100);
      const code = genCode();   // رمز واحد للمجموعة كلها

      await db.from("bookings")
        .update({ status: "confirmed", code, handled_by: "owner", commission: per })
        .eq("group_id", gid);

      const total = per * rows.length;
      const newBalance = (st.balance_due || 0) + total;
      await db.from("stadiums").update({ balance_due: newBalance }).eq("id", st.id);

      return reply({ ok: true, code, commission: per, count: rows.length, balance_due: newBalance });
    }

    // ============ التحقق من كلمة سر المشرف ============
    if (action === "admin-check") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      return reply({ ok: true });
    }

    // ============ بيانات المشرف الكاملة ============
    if (action === "admin-data") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const [st, bk, uc] = await Promise.all([
        db.from("stadiums").select("*").order("id"),
        db.from("bookings").select("*").order("id"),
        db.from("users").select("*", { count: "exact", head: true }),
      ]);
      const { data: rt } = await db.from("ratings")
        .select("*").order("created_at", { ascending: false });
      return reply({
        stadiums: st.data ?? [],
        bookings: bk.data ?? [],
        usersCount: uc.count ?? 0,
        ratings: rt ?? [],
      });
    }

    // ============ إضافة ملعب ============
    if (action === "admin-add-stadium") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const p = payload ?? {};
      if (!p.name || !p.wilaya || !p.hood || !p.price)
        return reply({ error: "missing_data" }, 400);

      const { data, error } = await db.from("stadiums").insert({
        name: p.name, wilaya: p.wilaya, hood: p.hood, price: parseInt(p.price),
        color: p.color, payments: p.payments ?? {}, owner_phone: p.owner_phone ?? "",
        working_hours: p.working_hours, image: p.image,
        latitude: p.latitude ?? null, longitude: p.longitude ?? null,
        owner_code: genOwnerCode(), commission_rate: 12,
        balance_due: 0, status: "active",
      }).select().single();

      if (error) return reply({ error: "insert_failed" }, 500);
      return reply({ stadium: data });
    }

    // ============ تعديل ملعب ============
    if (action === "admin-edit-stadium") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const p = payload ?? {};
      const { data, error } = await db.from("stadiums").update({
        name: p.name, wilaya: p.wilaya, hood: p.hood, price: parseInt(p.price),
        owner_phone: p.owner_phone ?? "", payments: p.payments ?? {},
        working_hours: p.working_hours, image: p.image,
        latitude: p.latitude ?? null, longitude: p.longitude ?? null,
      }).eq("id", stadiumId).select().single();

      if (error) return reply({ error: "update_failed" }, 500);
      return reply({ stadium: data });
    }

    // ============ حذف ملعب ============
    if (action === "admin-delete-stadium") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const { error } = await db.from("stadiums").delete().eq("id", stadiumId);
      if (error) return reply({ error: "delete_failed" }, 500);
      return reply({ ok: true });
    }

    // ============ تصفير المستحقات ============
    if (action === "admin-reset-due") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const { error } = await db.from("stadiums")
        .update({ balance_due: 0 }).eq("id", stadiumId);
      if (error) return reply({ error: "update_failed" }, 500);
      return reply({ ok: true });
    }

    // ============ تعديل نسبة العمولة ============
    if (action === "admin-set-rate") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const rate = parseFloat(payload?.rate);
      if (isNaN(rate) || rate < 0 || rate > 100)
        return reply({ error: "invalid_rate" }, 400);
      const { error } = await db.from("stadiums")
        .update({ commission_rate: rate }).eq("id", stadiumId);
      if (error) return reply({ error: "update_failed" }, 500);
      return reply({ ok: true, rate });
    }

    // ============ تعليق أو تفعيل ملعب ============
    if (action === "admin-toggle-suspend") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const { data: st } = await db.from("stadiums")
        .select("status").eq("id", stadiumId).maybeSingle();
      if (!st) return reply({ error: "not_found" }, 404);
      const ns = st.status === "suspended" ? "active" : "suspended";
      const { error } = await db.from("stadiums")
        .update({ status: ns }).eq("id", stadiumId);
      if (error) return reply({ error: "update_failed" }, 500);
      return reply({ ok: true, status: ns });
    }

    // ============ عدّ ملاعب ولاية قبل حذفها ============
    if (action === "admin-wilaya-info") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const name = String(payload?.name ?? "").trim();
      const { data } = await db.from("stadiums").select("id, name").eq("wilaya", name);
      return reply({ count: data?.length ?? 0, stadiums: data ?? [] });
    }

    // ============ حذف ولاية مع ملاعبها وحجوزاتها ============
    if (action === "admin-delete-wilaya") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const name = String(payload?.name ?? "").trim();
      if (!name) return reply({ error: "missing_data" }, 400);

      // نجلب ملاعب الولاية أولاً
      const { data: sts } = await db.from("stadiums").select("id").eq("wilaya", name);
      const ids = (sts ?? []).map((x: Record<string, unknown>) => x.id);

      // نحذف حجوزات تلك الملاعب ثم الملاعب نفسها
      if (ids.length > 0) {
        await db.from("bookings").delete().in("stadium_id", ids);
        await db.from("stadiums").delete().in("id", ids);
      }

      const { error } = await db.from("wilayas").delete().eq("name", name);
      if (error) return reply({ error: "delete_failed" }, 500);

      return reply({ ok: true, deletedStadiums: ids.length });
    }

    // ============ إضافة ولاية ============
    if (action === "admin-add-wilaya") {
      if (!isAdmin()) return reply({ error: "wrong_pass" }, 401);
      const name = String(payload?.name ?? "").trim();
      if (!name) return reply({ error: "missing_data" }, 400);
      const { error } = await db.from("wilayas").insert({ name });
      if (error) return reply({ error: "insert_failed" }, 500);
      return reply({ ok: true, name });
    }

    return reply({ error: "unknown_action" }, 400);
  } catch (_e) {
    return reply({ error: "bad_request" }, 400);
  }
});
