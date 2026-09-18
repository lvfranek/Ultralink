"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/app/actions/team";

export function AcceptInviteClient({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvite(token);
      if ("error" in result) {
        setError(result.error ?? "Something went wrong.");
      } else {
        router.push("/dashboard");
      }
    });
  };

  return (
    <div>
      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.25)",
            fontSize: 13,
            color: "#ef4444",
            textAlign: "left",
          }}
        >
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleAccept}
        disabled={pending}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "13px 0",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 10,
          border: "none",
          background: pending ? "rgba(255,255,255,.12)" : "#ffffff",
          color: pending ? "#9A9A9A" : "#000000",
          cursor: pending ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {pending ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                border: "2px solid currentColor",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.75s linear infinite",
              }}
              aria-hidden="true"
            />
            Joining…
          </>
        ) : (
          "Join team"
        )}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
