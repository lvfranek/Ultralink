import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface TeamEntry {
  ownerId: string;
  ownerUsername: string;
  ownerDisplayName: string | null;
}

export async function getActiveOwnerId(
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  const cookieStore = await cookies();
  const cookieOwnerId = cookieStore.get("ultralink_active_owner")?.value;

  const { data: memberships } = await supabase
    .from("team_members")
    .select("owner_id")
    .eq("editor_id", userId);

  const memberOwnerIds: string[] = (memberships ?? []).map(
    (m: { owner_id: string }) => m.owner_id
  );

  const validOwnerIds = new Set([userId, ...memberOwnerIds]);

  if (cookieOwnerId && validOwnerIds.has(cookieOwnerId)) {
    return cookieOwnerId;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .single();

  if ((profile?.subscription_status ?? "none") !== "none") return userId;

  const { count } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", userId);

  if ((count ?? 0) > 0) return userId;

  if (memberOwnerIds.length > 0) return memberOwnerIds[0];

  return userId;
}

export async function getTeamMemberships(
  userId: string,
  supabase: SupabaseClient
): Promise<TeamEntry[]> {
  const { data } = await supabase
    .from("team_members")
    .select("owner_id")
    .eq("editor_id", userId)
    .order("created_at", { ascending: true });

  if (!data || data.length === 0) return [];

  const ownerIds = data.map((m: { owner_id: string }) => m.owner_id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", ownerIds);

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; username: string; display_name: string | null }) => [
      p.id,
      p,
    ])
  );

  return ownerIds
    .map((ownerId: string) => {
      const p = profileMap.get(ownerId);
      if (!p) return null;
      return {
        ownerId,
        ownerUsername: p.username,
        ownerDisplayName: p.display_name,
      };
    })
    .filter(Boolean) as TeamEntry[];
}
