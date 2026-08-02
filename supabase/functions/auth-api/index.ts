// ============================================
// 🔐 auth-api — دالة المصادقة الخادمية لتطبيق ملاعبي
// كل ما يخص حسابات الزبائن يمر من هنا فقط
// جدول users مقفل تماماً أمام المتصفح
// ============================================

import { createClient } from "jsr:@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 📞 التحقق من صيغة الرقم الموريتاني
const isValidPhone = (p: string) => /^[234]\d{7}$/.test(p ?? "");

// 🔤 توحيد صيغة الجواب السري
const normAnswer = (a: string) => (a ?? "").trim().toLowerCase().replace(/\s+/g, " ");

// 📤 رد موحّد
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

// 🧹 لا نُرجع أبداً كلمة السر ولا الجواب السري للمتصفح
const safeUser = (u: Record<string, unknown>) => ({
  id: u.id,
  name: u.name,
  phone: u.phone,
  created_at: u.created_at,
  security_question: u.security_question,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { action, phone, password, name, answer, newPassword, question } = await req.json();

    // ============ إنشاء حساب ============
    if (action === "register") {
      if (!name?.trim()) return reply({ error: "missing_name" }, 400);
      if (!isValidPhone(phone)) return reply({ error: "invalid_phone" }, 400);
      if (!/^\d{4}$/.test(password ?? "")) return reply({ error: "invalid_password" }, 400);

      const { data: exists } = await db.from("users").select("id").eq("phone", phone).maybeSingle();
      if (exists) return reply({ error: "phone_exists" }, 409);

      const row: Record<string, unknown> = {
        name: name.trim(),
        phone,
        password: await bcrypt.hash(password, 10),
      };

      // السؤال السري اختياري عند الإنشاء لكنه مستحسن
      if (question && answer?.trim()) {
        row.security_question = question;
        row.security_answer = await bcrypt.hash(normAnswer(answer), 10);
      }

      const { data, error } = await db.from("users").insert(row).select().single();
      if (error) return reply({ error: "insert_failed" }, 500);
      return reply({ user: safeUser(data) });
    }

    // ============ تسجيل الدخول ============
    if (action === "login") {
      if (!isValidPhone(phone) || !/^\d{4}$/.test(password ?? ""))
        return reply({ error: "invalid_credentials" }, 401);

      const { data } = await db.from("users").select("*").eq("phone", phone).maybeSingle();
      // نفس الرسالة سواء الرقم غير موجود أو كلمة السر خاطئة — حتى لا يُعرف أي الأرقام مسجلة
      if (!data) return reply({ error: "invalid_credentials" }, 401);

      const ok = await bcrypt.compare(password, String(data.password));
      if (!ok) return reply({ error: "invalid_credentials" }, 401);

      return reply({ user: safeUser(data) });
    }

    // ============ جلب السؤال السري ============
    if (action === "get-question") {
      if (!isValidPhone(phone)) return reply({ error: "invalid_phone" }, 400);

      const { data } = await db
        .from("users")
        .select("security_question")
        .eq("phone", phone)
        .maybeSingle();

      if (!data) return reply({ error: "not_found" }, 404);
      if (!data.security_question) return reply({ error: "no_question" }, 404);

      return reply({ question: data.security_question });
    }

    // ============ التحقق من الجواب وتغيير كلمة السر ============
    if (action === "reset-password") {
      if (!isValidPhone(phone)) return reply({ error: "invalid_phone" }, 400);
      if (!/^\d{4}$/.test(newPassword ?? "")) return reply({ error: "invalid_password" }, 400);
      if (!answer?.trim()) return reply({ error: "wrong_answer" }, 401);

      const { data } = await db
        .from("users")
        .select("id, security_answer")
        .eq("phone", phone)
        .maybeSingle();

      if (!data?.security_answer) return reply({ error: "wrong_answer" }, 401);

      const ok = await bcrypt.compare(normAnswer(answer), String(data.security_answer));
      if (!ok) return reply({ error: "wrong_answer" }, 401);

      const hashed = await bcrypt.hash(newPassword, 10);
      const { error } = await db.from("users").update({ password: hashed }).eq("id", data.id);
      if (error) return reply({ error: "update_failed" }, 500);

      return reply({ ok: true });
    }

    // ============ تحديد السؤال السري لحساب موجود ============
    if (action === "set-question") {
      if (!isValidPhone(phone) || !/^\d{4}$/.test(password ?? ""))
        return reply({ error: "invalid_credentials" }, 401);
      if (!question || !answer?.trim()) return reply({ error: "missing_data" }, 400);

      const { data } = await db.from("users").select("*").eq("phone", phone).maybeSingle();
      if (!data) return reply({ error: "invalid_credentials" }, 401);

      // نطلب كلمة السر مجدداً حتى لا يغيّر أحد سؤال حساب ليس له
      const ok = await bcrypt.compare(password, String(data.password));
      if (!ok) return reply({ error: "invalid_credentials" }, 401);

      const { data: updated, error } = await db
        .from("users")
        .update({
          security_question: question,
          security_answer: await bcrypt.hash(normAnswer(answer), 10),
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) return reply({ error: "update_failed" }, 500);
      return reply({ user: safeUser(updated) });
    }

    return reply({ error: "unknown_action" }, 400);
  } catch (_e) {
    return reply({ error: "bad_request" }, 400);
  }
});
