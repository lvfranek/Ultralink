"use client";

interface YouTubeThumbnailProps {
  youtubeId: string;
  title: string;
  onPlay: () => void;
  comingSoon?: boolean;
}

export function YouTubeThumbnail({ youtubeId, title, onPlay, comingSoon }: YouTubeThumbnailProps) {
  if (comingSoon) {
    return (
      <div
        className="relative w-full aspect-video rounded-[12px] flex items-center justify-center overflow-hidden"
        style={{ background: "#1E1E1E", border: "1px solid rgba(255,255,255,.06)" }}
      >
        <span className="text-xs font-medium" style={{ color: "#9A9A9A" }}>
          Coming soon
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Play: ${title}`}
      className="relative w-full aspect-video rounded-[12px] overflow-hidden cursor-pointer group"
      style={{ background: "#000", border: "1px solid rgba(255,255,255,.06)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail; img.youtube.com isn't configured for next/image */}
      <img
        src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
      />
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,.15)" }}>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
          style={{ background: "rgba(255,255,255,.92)" }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#0A0A0A" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  );
}
