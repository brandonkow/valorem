import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename } = req.query;
  if (!filename) {
    return res.status(400).json({ error: "filename query param required" });
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  const blob = await put(filename, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return res.status(200).json({ url: blob.url, pathname: blob.pathname });
}
