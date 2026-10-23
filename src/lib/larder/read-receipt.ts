import { createServerFn } from "@tanstack/react-start";

type ReadResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export const readReceiptImage = createServerFn({ method: "POST" })
  .validator((input: unknown): { imageDataUrl: string } => {
    if (!input || typeof input !== "object") throw new Error("Need an image");
    const imageDataUrl = (input as { imageDataUrl?: unknown }).imageDataUrl;
    if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
      throw new Error("Need an image");
    }
    if (imageDataUrl.length > 2_500_000) throw new Error("That photo is too large. Try a closer crop.");
    return { imageDataUrl };
  })
  .handler(async ({ data }): Promise<ReadResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Photo reading isn't available. Paste the receipt text instead." };

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 700,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Read this grocery receipt. Reply with plain text only, one item per line, as: ITEM NAME  PRICE. Skip tax, total, store header, payment, and non-food fees. Do not add commentary.",
              },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      return { ok: false, error: "Couldn't read that photo. Paste the receipt text instead." };
    }
    const body = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false, error: "No items found in that photo." };
    return { ok: true, text };
  });
