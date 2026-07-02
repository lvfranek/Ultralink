type DiscordEmbed = {
  title: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
  footer?: { text: string };
};

export async function sendDiscordNotification(embed: DiscordEmbed): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            ...embed,
            timestamp: embed.timestamp ?? new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.error("[discord] webhook failed:", err);
  }
}
