"use server";

import { revalidatePath } from "next/cache";

import { isAdministrator, isUserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

export async function updateUserRole(formData: FormData) {
  const locale = formData.get("locale") === "ro" ? "ro" : "ru";
  const targetUserId = formData.get("userId");
  const nextRole = formData.get("role");

  if (typeof targetUserId !== "string" || !/^[0-9a-f-]{36}$/i.test(targetUserId) || !isUserRole(nextRole)) {
    throw new Error("Invalid role update");
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("Authentication required");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (!isAdministrator(isUserRole(profile?.role) ? profile.role : null)) throw new Error("Administrator access required");

  const { error } = await supabase.rpc("set_user_role", { p_user_id: targetUserId, p_role: nextRole });
  if (error) throw new Error("Role update failed");

  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/profile`);
}

export async function toggleUserIpBlock(formData: FormData) {
  const locale = formData.get("locale") === "ro" ? "ro" : "ru";
  const targetUserId = formData.get("userId");
  const shouldBlock = formData.get("blocked") === "true";

  if (typeof targetUserId !== "string" || !/^[0-9a-f-]{36}$/i.test(targetUserId)) {
    throw new Error("Invalid IP block update");
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("Authentication required");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (!isAdministrator(isUserRole(profile?.role) ? profile.role : null)) throw new Error("Administrator access required");

  const { error } = await supabase.rpc("set_user_ip_block", {
    p_user_id: targetUserId,
    p_blocked: shouldBlock,
    p_reason: shouldBlock ? "Blocked from the InfoQuest admin dashboard" : null,
  });
  if (error) throw new Error("IP block update failed");

  revalidatePath(`/${locale}/admin`);
}
