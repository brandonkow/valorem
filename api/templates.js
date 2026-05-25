import { list } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { blobs } = await list({ prefix: "templates/" });

  const result = {};
  blobs.forEach((blob) => {
    const parts = blob.pathname.split("/");
    if (parts.length >= 4) {
      const key = `${parts[1]}__${parts[2]}`;
      result[key] = {
        url: blob.url,
        name: parts.slice(3).join("/"),
        size: blob.size ? (blob.size / 1024).toFixed(1) + "KB" : "—",
        date: new Date(blob.uploadedAt).toLocaleDateString("en-MY", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    }
  });

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(result);
}
