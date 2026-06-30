import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
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
      .select("display_name, username")
      .eq("id", user.id)
      .single(),
    getTeamMemberships(user.id, supabase),
  ]);

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);

  return (
    <>
      <style>{`html, body { background: #131313 !important; }`}</style>
      <div className="flex h-screen overflow-hidden dark-theme" style={{ background: "#131313" }}>
        <Sidebar
          user={user}
          displayName={profileResult.data?.display_name}
          username={profileResult.data?.username}
          activeOwnerId={activeOwnerId}
          selfUsername={profileResult.data?.username ?? ""}
          teamMemberships={memberships}
        />
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </>
  );
}
