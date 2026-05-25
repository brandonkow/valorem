import { del } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "url query param required" });
  }

  await del(url);
  return res.status(200).json({ ok: true });
}
