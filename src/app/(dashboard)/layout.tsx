import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardChrome } from "@/components/dashboard/dashboard-chrome";
import { getActiveOwnerId, getTeamMemberships } from "@/lib/team";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileResult, memberships] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, username, has_seen_welcome")
      .eq("id", user.id)
      .single(),
    getTeamMemberships(user.id, supabase),
  ]);

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);

  return (
    <>
      <style>{`html, body { background: #131313 !important; }`}</style>
      <div className="flex h-screen overflow-hidden dark-theme" style={{ background: "#131313" }}>
        <DashboardChrome
          user={user}
          displayName={profileResult.data?.display_name}
          username={profileResult.data?.username}
          activeOwnerId={activeOwnerId}
          selfUsername={profileResult.data?.username ?? ""}
          teamMemberships={memberships}
          hasSeenWelcome={profileResult.data?.has_seen_welcome ?? true}
        >
          {children}
        </DashboardChrome>
      </div>
    </>
  );
}
