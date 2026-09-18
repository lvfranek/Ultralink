"use client";

import { useState, useEffect } from "react";
import { card, cardHeader, cardBody, label, input, saveBtn, SectionTitle, FieldRow } from "./settings-ui";

function getTzOffset(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    return raw.replace("GMT", "UTC");
  } catch {
    return "UTC";
  }
}

function getTzLabel(tz: string): string {
  const offset = getTzOffset(tz);
  const name = tz.replace(/_/g, " ").replace("/", " / ");
  return `(${offset}) ${name}`;
}

// ─── Preferences card ─────────────────────────────────────────────────────────

export function PreferencesCard() {
  const STORAGE_KEY = "ultralink:timezone";
  const [timezone, setTimezone] = useState("");
  const [saved, setSaved] = useState(false);

  const timezones = [
    "Pacific/Midway",
    "Pacific/Honolulu",
    "America/Anchorage",
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Sao_Paulo",
    "Atlantic/Azores",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Helsinki",
    "Europe/Moscow",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Bangkok",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage and the browser's timezone are only available after hydration
      setTimezone(stored);
    } else {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(detected);
      } catch {
        setTimezone("UTC");
      }
    }
  }, []);

  const handleSave = () => {
    if (!timezone) return;
    localStorage.setItem(STORAGE_KEY, timezone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={card}>
      <div style={cardHeader}>
        <SectionTitle>Preferences</SectionTitle>
      </div>
      <div style={cardBody}>
        <FieldRow>
          <label style={label}>Timezone</label>
          <select
            value={timezone}
            onChange={(e) => {
              setTimezone(e.target.value);
              setSaved(false);
            }}
            style={{
              ...input,
              appearance: "none",
              WebkitAppearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%239A9A9A' stroke-width='1.5'%3E%3Cpath d='M4 6l4 4 4-4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: 16,
              paddingRight: 32,
              cursor: "pointer",
            }}
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz} style={{ background: "#1A1A1A" }}>
                {getTzLabel(tz)}
              </option>
            ))}
            {timezone && !timezones.includes(timezone) && (
              <option value={timezone} style={{ background: "#1A1A1A" }}>
                {getTzLabel(timezone)}
              </option>
            )}
          </select>
          <p style={{ marginTop: 6, fontSize: 12, color: "#6B6B6B" }}>
            Used for analytics time displays. Saved locally.
          </p>
        </FieldRow>
        <div style={{ marginTop: 4 }}>
          <button type="button" onClick={handleSave} disabled={!timezone} style={saveBtn(!timezone)}>
            {saved ? "Saved!" : "Save preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Danger zone ──────────────────────────────────────────────────────────────
