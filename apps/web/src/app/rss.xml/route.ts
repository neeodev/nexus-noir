import { fetchStories } from "@/lib/api";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

  let stories = await fetchStories().catch(() => []);

  const items = stories
    .filter((s) => s.publishedAt)
    .map(
      (s) => `    <item>
      <title><![CDATA[${s.title}]]></title>
      <link>${siteUrl}/nouvelles/${s.slug}</link>
      <guid isPermaLink="true">${siteUrl}/nouvelles/${s.slug}</guid>
      <description><![CDATA[${s.summaryShort ?? ""}]]></description>
      <pubDate>${new Date(s.publishedAt!).toUTCString()}</pubDate>
      ${s.coverImage ? `<enclosure url="${escapeXml(s.coverImage)}" type="image/jpeg"/>` : ""}
      ${s.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("\n      ")}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Nexus Noir — Archives</title>
    <link>${siteUrl}</link>
    <description>Nouvelles noires de l'univers Nexus Noir.</description>
    <language>fr</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
