import { cache } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { AuthShell } from "@/app/(auth)/auth-shell";
import { AcceptInviteClient } from "./accept-client";

type Props = { searchParams: Promise<{ token?: string }> };

// Shared by generateMetadata and the page, so the lookups run once per request
const loadInvite = cache(async (token: string) => {
  const service = createServiceClient();
  const { data: invite } = await service
    .from("team_invites")
    .select("id, owner_id, email, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  // Owner is only shown for invites that can still be accepted
  if (!invite || invite.accepted_at || new Date(invite.expires_at) < new Date()) {
    return { invite, ownerUsername: null };
  }

  const { data: ownerProfile } = await service.from("profiles").select("username").eq("id", invite.owner_id).single();
  return { invite, ownerUsername: ownerProfile?.username ?? null };
});

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { token } = await searchParams;
  const ownerUsername = token ? (await loadInvite(token)).ownerUsername : null;

  return {
    title: ownerUsername ? `Join @${ownerUsername}'s team` : "Team invite",
    robots: { index: false, follow: false },
  };
}

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <InviteCard state="invalid" message="No invite token provided." />;
  }

  const { invite, ownerUsername: loadedOwner } = await loadInvite(token);

  if (!invite) {
    return <InviteCard state="invalid" message="This invite link is invalid or has already been used." />;
  }
  if (invite.accepted_at) {
    return <InviteCard state="invalid" message="This invite has already been accepted." />;
  }
  if (new Date(invite.expires_at) < new Date()) {
    return <InviteCard state="invalid" message="This invite has expired. Ask the owner to send a new one." />;
  }

  const ownerUsername = loadedOwner ?? "Someone";

  // Check current auth state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = `/login?next=${encodeURIComponent(`/invite/accept?token=${token}`)}&email=${encodeURIComponent(invite.email)}`;
    return <InviteCard state="unauthenticated" ownerUsername={ownerUsername} loginUrl={loginUrl} />;
  }

  if ((user.email ?? "").toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <InviteCard
        state="wrong-email"
        message={`This invite was sent to ${invite.email}. Sign out and sign in with that account to accept.`}
      />
    );
  }

  return <InviteCard state="ready" ownerUsername={ownerUsername} token={token} />;
}

// ─── Server-rendered card shells ──────────────────────────────────────────────

// Same frame as sign-in, so accepting an invite feels like part of the auth flow
function Card({ children }: { children: React.ReactNode }) {
  return (
    <AuthShell>
      <div style={{ textAlign: "center" }}>{children}</div>
    </AuthShell>
  );
}

function InviteCard({
  state,
  ownerUsername,
  message,
  loginUrl,
  token,
}: {
  state: "invalid" | "unauthenticated" | "wrong-email" | "ready";
  ownerUsername?: string;
  message?: string;
  loginUrl?: string;
  token?: string;
}) {
  if (state === "invalid" || state === "wrong-email") {
    return (
      <Card>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{ width: 24, height: 24, color: "#f87171" }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "#ffffff", margin: "0 0 12px" }}>
          {state === "wrong-email" ? "Wrong account" : "Invite invalid"}
        </h1>
        <p style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.6, margin: 0 }}>{message}</p>
      </Card>
    );
  }

  if (state === "unauthenticated") {
    return (
      <Card>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "#ffffff", margin: "0 0 12px" }}>
          You&apos;ve been invited.
        </h1>
        <p style={{ fontSize: 15, color: "#A1A1AA", lineHeight: 1.6, margin: "0 0 32px" }}>
          <strong style={{ color: "#ffffff" }}>{ownerUsername}</strong> invited you to collaborate on their Ultralink
          pages as an Editor.
        </p>
        <p style={{ fontSize: 13, color: "#71717A", margin: "0 0 20px" }}>Sign in or create an account to accept.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a
            href={loginUrl}
            style={{
              display: "block",
              padding: "13px 0",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              background: "#ffffff",
              color: "#0A0A0B",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Sign in / Create account
          </a>
        </div>
      </Card>
    );
  }

  // state === "ready"
  return (
    <Card>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "#ffffff", margin: "0 0 12px" }}>
        You&apos;ve been invited.
      </h1>
      <p style={{ fontSize: 15, color: "#A1A1AA", lineHeight: 1.6, margin: "0 0 32px" }}>
        <strong style={{ color: "#ffffff" }}>{ownerUsername}</strong> invited you to collaborate on their Ultralink
        pages as an Editor.
      </p>
      <AcceptInviteClient token={token!} />
    </Card>
  );
}
