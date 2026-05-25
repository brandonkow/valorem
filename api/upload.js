import { handleUpload } from "@vercel/blob/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "application/octet-stream",
        ],
        addRandomSuffix: false,
        maximumSizeInBytes: 50 * 1024 * 1024,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("Blob upload completed:", blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (err) {
    console.error("Upload handler error:", err);
    return res.status(400).json({
      error: err?.message || "Upload failed",
    });
  }
}
