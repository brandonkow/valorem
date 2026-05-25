import { put, list } from "@vercel/blob";

const STATS_PATH = "meta/stats.json";

async function readStats() {
  try {
    const { blobs } = await list({ prefix: "meta/" });
    const stats = blobs.find((b) => b.pathname === STATS_PATH);
    if (!stats) return { downloads: {}, uploads: {}, lastUpdated: {} };
    const response = await fetch(`${stats.url}?_=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) return { downloads: {}, uploads: {}, lastUpdated: {} };
    return await response.json();
  } catch {
    return { downloads: {}, uploads: {}, lastUpdated: {} };
  }
}

async function writeStats(data) {
  await put(STATS_PATH, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json(await readStats());
  }

  if (req.method === "POST") {
    const { action, catId, typeId } = req.body || {};
    if (!action || !catId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const stats = await readStats();
    stats.downloads = stats.downloads || {};
    stats.uploads = stats.uploads || {};
    stats.lastUpdated = stats.lastUpdated || {};

    if (action === "download" && typeId) {
      const key = `${catId}__${typeId}`;
      stats.downloads[key] = (stats.downloads[key] || 0) + 1;
    } else if (action === "upload") {
      stats.uploads[catId] = (stats.uploads[catId] || 0) + 1;
      stats.lastUpdated[catId] = new Date().toISOString();
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    await writeStats(stats);
    return res.status(200).json(stats);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
