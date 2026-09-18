"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateUsername } from "@/app/actions/account";
import {
  card,
  cardHeader,
  cardBody,
  label,
  input,
  inputError,
  saveBtn,
  SectionTitle,
  FieldRow,
  StatusMsg,
} from "./settings-ui";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
type UsernameState = "idle" | "checking" | "available" | "taken" | "invalid" | "unchanged";

export function ProfileCard({ initialUsername }: { initialUsername: string }) {
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const [username, setUsername] = useState(initialUsername);
  const [usernameState, setUsernameState] = useState<UsernameState>("unchanged");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = useCallback(
    async (value: string) => {
      if (!USERNAME_RE.test(value)) {
        setUsernameState("invalid");
        return;
      }
      if (value === initialUsername) {
        setUsernameState("unchanged");
        return;
      }
      setUsernameState("checking");
      const { data } = await supabaseRef.current.from("profiles").select("id").eq("username", value).maybeSingle();
      setUsernameState(data ? "taken" : "available");
    },
    [initialUsername],
  );

  const handleUsernameChange = (value: string) => {
    const s = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(s);
    setStatus(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (s.length < 3) {
      setUsernameState(s.length === 0 ? "idle" : "invalid");
      return;
    }
    if (s === initialUsername) {
      setUsernameState("unchanged");
      return;
    }
    setUsernameState("checking");
    debounceRef.current = setTimeout(() => checkUsername(s), 400);
  };

  const canSave = username !== initialUsername && usernameState === "available";

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);
    try {
      const result = await updateUsername(username);
      if (result.error) {
        setStatus({ type: "error", msg: result.error });
      } else {
        setStatus({ type: "success", msg: "Username saved." });
        router.refresh();
      }
    } catch (e) {
      setStatus({ type: "error", msg: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  const usernameHint =
    usernameState === "invalid"
      ? { color: "#ef4444", text: "3–20 characters, lowercase letters, numbers, underscores." }
      : usernameState === "taken"
        ? { color: "#ef4444", text: "That username is already taken." }
        : usernameState === "available"
          ? { color: "#10b981", text: "Username is available." }
          : { color: "#6B6B6B", text: "3–20 characters, lowercase letters, numbers, underscores." };

  return (
    <div style={card}>
      <div style={cardHeader}>
        <SectionTitle>Profile</SectionTitle>
      </div>
      <div style={cardBody}>
        <FieldRow>
          <label style={label}>Username</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              style={{
                ...(usernameState === "invalid" || usernameState === "taken" ? inputError : input),
                paddingRight: 36,
              }}
            />
            {usernameState === "checking" && (
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 14,
                  height: 14,
                  border: "2px solid #9A9A9A",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.75s linear infinite",
                }}
                aria-hidden="true"
              />
            )}
            {usernameState === "available" && (
              <svg
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 16,
                  height: 16,
                  color: "#10b981",
                }}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 8l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {(usernameState === "taken" || usernameState === "invalid") && (
              <svg
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 16,
                  height: 16,
                  color: "#ef4444",
                }}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <p style={{ marginTop: 6, fontSize: 12, color: usernameHint.color }}>{usernameHint.text}</p>
        </FieldRow>
        {status && <StatusMsg type={status.type}>{status.msg}</StatusMsg>}
        <div style={{ marginTop: 20 }}>
          <button type="button" onClick={handleSave} disabled={!canSave || saving} style={saveBtn(!canSave || saving)}>
            {saving ? "Saving…" : "Save username"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email card ───────────────────────────────────────────────────────────────
