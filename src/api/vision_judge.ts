import { askJevVision } from "../lib/jev";

/**
 * Local API route: POST jev-enconvo/vision_judge
 * Body: { image: string (data URI, base64 or file path), statement: string,
 *         context_label?: string, threshold?: number (default 0.7) }
 * Returns: { yes, probability, band, model }
 *
 * This exposes askJevVision to other plugins, workflows and agents — the
 * composable vision judgment surface the SKILL references.
 */
export default async function main(request: Request) {
  const body = (await request.json()) as {
    image?: string;
    statement?: string;
    context_label?: string;
    threshold?: number;
  };
  if (!body.image || !body.statement) {
    return Response.json({ error: "image and statement are required" }, { status: 400 });
  }
  const threshold = typeof body.threshold === "number" && body.threshold >= 0 && body.threshold <= 1 ? body.threshold : 0.7;
  try {
    const verdict = await askJevVision(body.image, body.statement, body.context_label || "an image", {
      commandKey: "jev-enconvo|vision_judge",
      commandTitle: "Jev Vision Judge",
      threshold
    });
    return Response.json(verdict);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 502 });
  }
}
