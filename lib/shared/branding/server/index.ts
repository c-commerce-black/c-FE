import { cache } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const getLogoDataUrl = cache(async () => {
  const file = await readFile(join(process.cwd(), "public", "logo", "c-commerce.png"));
  return `data:image/png;base64,${file.toString("base64")}`;
});
