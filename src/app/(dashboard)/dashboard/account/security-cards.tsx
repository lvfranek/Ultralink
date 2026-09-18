"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { updateEmail, updatePassword } from "@/app/actions/account";
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

export function EmailCard({ email }: { email: string }) {
  const [expanded, setExpanded] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success" | "info"; msg: string } | null>(null);

  const handleSave = async () => {
    if (!newEmail || !currentPassword) return;
    setSaving(true);
    setStatus(null);
    const result = await updateEmail(newEmail, currentPassword);
    setSaving(false);
    if (result.error) {
      setStatus({ type: "error", msg: result.error });
    } else {
      setStatus({ type: "success", msg: result.message ?? "Email change requested." });
      setExpanded(false);
      setNewEmail("");
      setCurrentPassword("");
    }
  };

  return (
    <div style={card}>
      <div style={cardHeader}>
        <SectionTitle>Email</SectionTitle>
      </div>
      <div style={cardBody}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, color: "#ffffff" }}>{email}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B6B6B" }}>Your sign-in email address</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setExpanded((v) => !v);
              setStatus(null);
            }}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#9A9A9A",
              background: "none",
              border: "1px solid rgba(255,255,255,.10)",
              borderRadius: 7,
              padding: "6px 12px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Change email
          </button>
        </div>

        {expanded && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <FieldRow>
              <label style={label}>New email address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
                style={input}
              />
            </FieldRow>
            <FieldRow>
              <label style={label}>Current password</label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Verify it's you"
                autoComplete="current-password"
                style={input}
                toggleColor="#6B6B6B"
              />
            </FieldRow>
            {status && <StatusMsg type={status.type}>{status.msg}</StatusMsg>}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !newEmail || !currentPassword}
                style={saveBtn(saving || !newEmail || !currentPassword)}
              >
                {saving ? "Sending…" : "Confirm change"}
              </button>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#9A9A9A",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Password card ────────────────────────────────────────────────────────────

export function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSave = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);
    const result = await updatePassword(currentPassword, newPassword);
    setSaving(false);
    if (result.error) {
      setStatus({ type: "error", msg: result.error });
    } else {
      setStatus({ type: "success", msg: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div style={card}>
      <div style={cardHeader}>
        <SectionTitle>Password</SectionTitle>
      </div>
      <div style={cardBody}>
        <FieldRow>
          <label style={label}>Current password</label>
          <PasswordInput
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Your current password"
            style={input}
            toggleColor="#6B6B6B"
          />
        </FieldRow>
        <FieldRow>
          <label style={label}>
            New password <span style={{ fontWeight: 400, color: "#6B6B6B" }}>(min. 8 characters)</span>
          </label>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            style={input}
            toggleColor="#6B6B6B"
          />
        </FieldRow>
        <FieldRow>
          <label style={label}>Confirm new password</label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Repeat new password"
            style={mismatch ? inputError : input}
            toggleColor="#6B6B6B"
          />
          {mismatch && <p style={{ marginTop: 6, fontSize: 12, color: "#ef4444" }}>Passwords don&apos;t match.</p>}
        </FieldRow>
        {status && <StatusMsg type={status.type}>{status.msg}</StatusMsg>}
        <div style={{ marginTop: 20 }}>
          <button type="button" onClick={handleSave} disabled={!canSave || saving} style={saveBtn(!canSave || saving)}>
            {saving ? "Updating…" : "Update password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Timezone helpers ─────────────────────────────────────────────────────────
