"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, CopyPlus, GripVertical, Heading, ImagePlus, Link2, Loader2, Plus, Trash2, X } from "lucide-react";
import { ANIMATIONS } from "@/lib/config/theme";
import { SOCIAL_PLATFORMS } from "@/lib/config/socials";
import { SlugInput, type useSlugField } from "@/components/app/slug-dialog";
import { useToast } from "@/components/app/toast";
import { Avatar, BrandIcon, cx, Segmented, usePopover } from "@/components/app/ui";
import { BIO_MAX, hostOf, tidyUrl, urlError, type Draft, type EdLink, type EdSocial } from "./draft";
import { Card, CropDialog, IconPicker, imageProblem, Switch, uploadMedia } from "./parts";
import s from "@/components/app/app.module.css";

let uid = 0;
const tempId = (prefix: string) => `new-${prefix}-${Date.now()}-${++uid}`;

function useListSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export function ProfileCard({
  draft,
  set,
  slugField,
  userId,
}: {
  draft: Draft;
  set: (p: Partial<Draft>) => void;
  slugField: ReturnType<typeof useSlugField>;
  userId: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [coverHint, setCoverHint] = useState(false);
  const nameMissing = !draft.name.trim();

  const apply = async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);
    setPhotoError(null);
    try {
      set({ avatarUrl: await uploadMedia(`${userId}/avatars/${Date.now()}.jpg`, blob, "image/jpeg") });
    } catch {
      setPhotoError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card title="Profile">
      <div className={s.avatarRow}>
        {draft.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded image (Supabase Storage URL)
          <img
            src={draft.avatarUrl}
            alt=""
            className={s.avatarPhoto}
            style={{ borderRadius: draft.avatarStyle === "circle" ? "50%" : 16 }}
          />
        ) : (
          <Avatar name={draft.name || "?"} size={64} round />
        )}
        <div className={s.avatarActions}>
          <button
            type="button"
            className={cx(s.btnGhost, s.btnSm)}
            disabled={uploading}
            onClick={() => input.current?.click()}
          >
            {uploading ? (
              <Loader2 size={14} className={s.spin} aria-hidden="true" />
            ) : (
              <ImagePlus size={14} aria-hidden="true" />
            )}
            {draft.avatarUrl ? "Change photo" : "Upload photo"}
          </button>
          {draft.avatarUrl && (
            <button
              type="button"
              className={cx(s.btnGhost, s.btnSm)}
              onClick={() => set({ avatarUrl: null, avatarStyle: "circle" })}
            >
              Remove
            </button>
          )}
          <Segmented
            label="Photo style"
            value={draft.avatarStyle}
            onChange={(avatarStyle) => {
              // Cover shows the photo full width, so it needs one
              const ok = !!draft.avatarUrl || avatarStyle === "circle";
              setCoverHint(!ok);
              if (ok) set({ avatarStyle });
            }}
            options={[
              { value: "circle", label: "Circle" },
              { value: "hero", label: "Cover" },
            ]}
          />
        </div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={s.srOnly}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const problem = imageProblem(file);
            if (problem) return setPhotoError(problem);
            setPhotoError(null);
            const reader = new FileReader();
            reader.onload = () => setCropSrc(reader.result as string);
            reader.readAsDataURL(file);
          }}
        />
      </div>
      {photoError && <p className={cx(s.hint, s.err)}>{photoError}</p>}
      {coverHint && !draft.avatarUrl && (
        <p className={cx(s.hint, s.warn)} style={{ marginTop: -8, marginBottom: 10 }}>
          Cover needs a photo. Upload one first.
        </p>
      )}

      <div className={s.field}>
        <label className={s.label} htmlFor="ed-name">
          Name
        </label>
        <input
          id="ed-name"
          className={cx(s.input, nameMissing && s.inputError)}
          value={draft.name}
          maxLength={60}
          aria-invalid={nameMissing}
          onChange={(e) => set({ name: e.target.value })}
        />
        {nameMissing && <p className={cx(s.hint, s.err)}>Your page needs a name.</p>}
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="ed-bio">
          Bio
        </label>
        <textarea
          id="ed-bio"
          className={cx(s.input, s.textarea)}
          value={draft.bio}
          rows={2}
          maxLength={BIO_MAX}
          placeholder="A line about you"
          onChange={(e) => set({ bio: e.target.value })}
        />
        <p className={s.hint} style={{ justifyContent: "flex-end" }}>
          {draft.bio.length} / {BIO_MAX}
        </p>
      </div>

      <div className={s.field} style={{ marginTop: 0 }}>
        <label className={s.label} htmlFor="ed-slug">
          Link
        </label>
        <SlugInput id="ed-slug" field={slugField} quiet />
        {slugField.status === "available" && slugField.hint && (
          <p className={s.hint} style={{ marginTop: 2 }}>
            The old link stops working when you save.
          </p>
        )}
      </div>

      {cropSrc && <CropDialog src={cropSrc} onApply={apply} onClose={() => setCropSrc(null)} />}
    </Card>
  );
}

// ─── Links ───────────────────────────────────────────────────────────────────

export function LinksCard({
  links,
  edit,
  clicks,
  userId,
  onHighlight,
}: {
  links: EdLink[];
  /** Functional update, so Undo and drags never work from a stale list */
  edit: (fn: (links: EdLink[]) => EdLink[]) => void;
  /** Clicks per link in the last 30 days (Pro) */
  clicks: Record<string, number> | null;
  userId: string;
  onHighlight: (id: string | null) => void;
}) {
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const sensors = useListSensors();
  const { open: menuOpen, setOpen: setMenuOpen, ref: menuRef } = usePopover();

  const add = (kind: EdLink["kind"]) => {
    const link: EdLink = {
      id: tempId("l"),
      isNew: true,
      kind,
      label: "",
      url: "",
      active: true,
      adult: false,
      animation: "none",
      icon: null,
    };
    edit((ls) => [link, ...ls]);
    setOpen(link.id);
    setFresh(link.id);
    setMenuOpen(false);
  };

  const update = (id: string, patch: Partial<EdLink>) =>
    edit((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const remove = (link: EdLink) => {
    const index = links.findIndex((l) => l.id === link.id);
    edit((ls) => ls.filter((l) => l.id !== link.id));
    onHighlight(null);
    toast(`${link.kind === "heading" ? "Heading" : "Button"} removed`, {
      label: "Undo",
      // Puts it back where it was, in whatever the list looks like by then
      run: () =>
        edit((ls) => (ls.some((l) => l.id === link.id) ? ls : [...ls.slice(0, index), link, ...ls.slice(index)])),
    });
  };

  const duplicate = (link: EdLink) => {
    const copy: EdLink = { ...link, id: tempId("l"), isNew: true, label: link.label ? `${link.label} (copy)` : "" };
    edit((ls) => {
      const i = ls.findIndex((l) => l.id === link.id);
      return [...ls.slice(0, i + 1), copy, ...ls.slice(i + 1)];
    });
    setOpen(copy.id);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    edit((ls) =>
      arrayMove(
        ls,
        ls.findIndex((l) => l.id === active.id),
        ls.findIndex((l) => l.id === over.id),
      ),
    );
  };

  const buttons = links.filter((l) => l.kind === "button").length;

  return (
    <Card
      title="Links"
      aside={
        <div className={s.popWrap} ref={menuRef}>
          <button
            type="button"
            className={cx(s.btnLight, s.btnSm)}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <Plus size={15} strokeWidth={2.5} aria-hidden="true" /> Add
          </button>
          {menuOpen && (
            <div className={s.menu} role="menu" style={{ minWidth: 250 }}>
              <button type="button" role="menuitem" className={s.menuItem} onClick={() => add("button")}>
                <span className={s.addIcon}>
                  <Link2 size={15} aria-hidden="true" />
                </span>
                <span>
                  Button
                  <span className={s.menuDesc}>Opens a link when tapped</span>
                </span>
              </button>
              <button type="button" role="menuitem" className={s.menuItem} onClick={() => add("heading")}>
                <span className={s.addIcon}>
                  <Heading size={15} aria-hidden="true" />
                </span>
                <span>
                  Heading
                  <span className={s.menuDesc}>Groups your buttons into sections</span>
                </span>
              </button>
            </div>
          )}
        </div>
      }
    >
      <p className={s.edCardSub}>
        {buttons} {buttons === 1 ? "button" : "buttons"} · drag to reorder
      </p>

      {links.length === 0 ? (
        <div className={s.edEmpty}>
          <Link2 size={18} aria-hidden="true" />
          <p>No buttons yet. Add the first place you want to send your audience.</p>
          <button type="button" className={cx(s.btnLight, s.btnSm)} onClick={() => add("button")}>
            <Plus size={15} strokeWidth={2.5} aria-hidden="true" /> Add button
          </button>
        </div>
      ) : (
        <DndContext id="ed-links" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <ul className={s.linkList}>
              {links.map((link) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  clicks={clicks?.[link.id]}
                  userId={userId}
                  open={open === link.id}
                  autoFocus={fresh === link.id}
                  onToggle={() => setOpen((o) => (o === link.id ? null : link.id))}
                  onChange={(patch) => update(link.id, patch)}
                  onRemove={() => remove(link)}
                  onDuplicate={() => duplicate(link)}
                  onHighlight={onHighlight}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </Card>
  );
}

function LinkRow({
  link,
  clicks,
  userId,
  open,
  autoFocus,
  onToggle,
  onChange,
  onRemove,
  onDuplicate,
  onHighlight,
}: {
  link: EdLink;
  clicks?: number;
  userId: string;
  open: boolean;
  autoFocus: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<EdLink>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onHighlight: (id: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const heading = link.kind === "heading";
  const error = heading ? null : urlError(link.url);
  const labelMissing = !heading && !link.label.trim();
  // Only nag once the user has had a chance to type
  const [touched, setTouched] = useState(!autoFocus);
  const showError = !!error && (touched || !open);
  const showLabelError = labelMissing && (touched || !open);
  const panelId = `${link.id}-panel`;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition } as CSSProperties}
      className={cx(s.linkRow, open && s.linkRowOpen, isDragging && s.linkRowDrag, !link.active && s.linkRowOff)}
      onPointerEnter={() => onHighlight(link.id)}
      onPointerLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(link.id)}
    >
      <div className={s.linkRowMain}>
        <button
          type="button"
          className={s.grip}
          aria-label={`Reorder ${link.label || "item"}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
        <span className={cx(s.linkIcon, heading && s.linkIconHeading)} aria-hidden="true">
          {heading ? (
            <Heading size={15} />
          ) : link.icon ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-uploaded image (Supabase Storage URL)
            <img src={link.icon} alt="" className={s.linkIconImg} />
          ) : (
            <Link2 size={15} />
          )}
        </span>
        <button type="button" className={s.linkText} onClick={onToggle} aria-expanded={open} aria-controls={panelId}>
          <span className={s.linkLabel}>
            {link.label || <span className={s.placeholder}>{heading ? "Untitled heading" : "Untitled button"}</span>}
            {link.adult && <span className={s.adultTag}>18+</span>}
          </span>
          <span className={cx(s.linkSub, (showError || showLabelError) && s.err)}>
            {heading ? "Heading" : showLabelError ? "Add a label" : showError ? error : hostOf(link.url)}
          </span>
        </button>
        {!heading && clicks !== undefined && (
          <span className={s.linkClicks} title="Clicks in the last 30 days">
            {clicks.toLocaleString("en-US")} {clicks === 1 ? "click" : "clicks"}
          </span>
        )}
        <Switch
          checked={link.active}
          onChange={(active) => onChange({ active })}
          label={`Show ${link.label || "item"} on your page`}
        />
        <button
          type="button"
          className={cx(s.iconBtn, s.iconBtnBare, s.chev, open && s.chevOpen)}
          onClick={onToggle}
          aria-label={open ? "Close" : "Edit"}
          tabIndex={-1}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>

      <div id={panelId} className={cx(s.expand, open && s.expandOpen)} inert={!open}>
        <div>
          <div className={s.linkEdit}>
            <div className={heading ? undefined : s.row2}>
              <div>
                <label className={s.label} htmlFor={`${link.id}-label`}>
                  {heading ? "Heading" : "Label"}
                </label>
                <input
                  id={`${link.id}-label`}
                  className={cx(s.input, showLabelError && s.inputError)}
                  value={link.label}
                  autoFocus={autoFocus}
                  maxLength={80}
                  placeholder={heading ? "e.g. Shop" : "e.g. Watch my newest video"}
                  onChange={(e) => onChange({ label: e.target.value })}
                />
              </div>
              {!heading && (
                <div>
                  <label className={s.label} htmlFor={`${link.id}-url`}>
                    URL
                  </label>
                  <input
                    id={`${link.id}-url`}
                    className={cx(s.input, showError && s.inputError)}
                    value={link.url}
                    inputMode="url"
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="https://"
                    aria-invalid={showError}
                    aria-describedby={`${link.id}-url-hint`}
                    onChange={(e) => onChange({ url: e.target.value })}
                    onBlur={() => {
                      setTouched(true);
                      onChange({ url: tidyUrl(link.url) });
                    }}
                  />
                  <p id={`${link.id}-url-hint`} className={cx(s.hint, showError && s.err)}>
                    {showError ? error : ""}
                  </p>
                </div>
              )}
            </div>

            {!heading && (
              <div className={s.styleRow}>
                <div>
                  <span className={s.label}>Icon</span>
                  <IconPicker
                    icon={link.icon}
                    label={link.label}
                    userId={userId}
                    onChange={(icon) => onChange({ icon })}
                  />
                </div>
                <div>
                  <span className={s.label}>Animation</span>
                  <Segmented
                    label="Animation"
                    value={link.animation}
                    onChange={(animation) => onChange({ animation })}
                    options={ANIMATIONS.map((a) => ({ value: a.id, label: a.label }))}
                  />
                </div>
              </div>
            )}

            <div className={s.linkFoot}>
              {!heading && (
                <label className={s.inlineSwitch}>
                  <Switch checked={link.adult} onChange={(adult) => onChange({ adult })} label="18+ content" />
                  <span>
                    18+ content
                    <span className={s.menuDesc}>Visitors confirm their age first</span>
                  </span>
                </label>
              )}
              <div className={s.linkActions}>
                <button type="button" className={cx(s.btnGhost, s.btnSm)} onClick={onDuplicate}>
                  <CopyPlus size={14} aria-hidden="true" /> Duplicate
                </button>
                <button type="button" className={cx(s.btnGhost, s.btnSm, s.btnGhostDanger)} onClick={onRemove}>
                  <Trash2 size={14} aria-hidden="true" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

// ─── Socials ─────────────────────────────────────────────────────────────────

const MAX_SOCIALS = 20;
const platformLabel = (id: string) => SOCIAL_PLATFORMS.find((p) => p.id === id)?.label.replace(" / Twitter", "") ?? id;

export function SocialsCard({ socials, onChange }: { socials: EdSocial[]; onChange: (s: EdSocial[]) => void }) {
  const sensors = useListSensors();
  const { open: menuOpen, setOpen: setMenuOpen, ref: menuRef } = usePopover();
  const [fresh, setFresh] = useState<string | null>(null);
  const used = new Set(socials.map((x) => x.platform));
  const available = SOCIAL_PLATFORMS.filter((p) => !used.has(p.id));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(
      arrayMove(
        socials,
        socials.findIndex((x) => x.id === active.id),
        socials.findIndex((x) => x.id === over.id),
      ),
    );
  };

  return (
    <Card
      title="Social icons"
      aside={
        socials.length < MAX_SOCIALS &&
        available.length > 0 && (
          <div className={s.popWrap} ref={menuRef}>
            <button
              type="button"
              className={cx(s.btnGhost, s.btnSm)}
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <Plus size={15} strokeWidth={2.5} aria-hidden="true" /> Add
            </button>
            {menuOpen && (
              <div className={cx(s.menu, s.platformMenu)} role="menu">
                {available.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="menuitem"
                    className={s.platformItem}
                    onClick={() => {
                      const social = { id: tempId("s"), isNew: true, platform: p.id, url: "" };
                      onChange([...socials, social]);
                      setFresh(social.id);
                      setMenuOpen(false);
                    }}
                  >
                    <BrandIcon id={p.id} size={18} />
                    {platformLabel(p.id)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      }
    >
      <p className={s.edCardSub}>Shown as icons under your bio</p>
      {socials.length === 0 ? (
        <div className={s.edEmpty}>
          <p>Add Instagram, TikTok and the rest so fans can follow you everywhere.</p>
        </div>
      ) : (
        <DndContext id="ed-socials" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={socials.map((x) => x.id)} strategy={verticalListSortingStrategy}>
            <ul className={s.linkList}>
              {socials.map((social) => (
                <SocialRow
                  key={social.id}
                  social={social}
                  autoFocus={fresh === social.id}
                  onChange={(url) => onChange(socials.map((x) => (x.id === social.id ? { ...x, url } : x)))}
                  onRemove={() => onChange(socials.filter((x) => x.id !== social.id))}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </Card>
  );
}

function SocialRow({
  social,
  autoFocus,
  onChange,
  onRemove,
}: {
  social: EdSocial;
  autoFocus: boolean;
  onChange: (url: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: social.id });
  const platform = SOCIAL_PLATFORMS.find((p) => p.id === social.platform);
  const email = social.platform === "email";
  const [touched, setTouched] = useState(!autoFocus);
  const error = urlError(social.url, { allowMailto: email });
  const showError = !!error && touched;
  const label = platformLabel(social.platform);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition } as CSSProperties}
      className={cx(s.socialRow, isDragging && s.linkRowDrag)}
    >
      <button type="button" className={s.grip} aria-label={`Reorder ${label}`} {...attributes} {...listeners}>
        <GripVertical size={16} aria-hidden="true" />
      </button>
      <span className={s.socialIcon} aria-hidden="true">
        <BrandIcon id={social.platform} size={16} />
      </span>
      <div className={s.socialField}>
        <input
          className={cx(s.input, showError && s.inputError)}
          value={social.url}
          autoFocus={autoFocus}
          inputMode={email ? "email" : "url"}
          spellCheck={false}
          placeholder={email ? "you@example.com" : platform?.placeholder}
          aria-label={`${label} ${email ? "address" : "URL"}`}
          aria-invalid={showError}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            setTouched(true);
            const v = social.url.trim();
            // Typing a plain address for the Email icon is enough
            if (email && /^[^\s@:]+@[^\s@]+\.[^\s@]+$/.test(v)) onChange(`mailto:${v}`);
            else onChange(tidyUrl(social.url));
          }}
        />
        {showError && (
          <p className={cx(s.hint, s.err)}>{email ? "Enter an email address like you@example.com." : error}</p>
        )}
      </div>
      <button type="button" className={cx(s.iconBtn, s.iconBtnBare)} onClick={onRemove} aria-label={`Remove ${label}`}>
        <X size={15} aria-hidden="true" />
      </button>
    </li>
  );
}
