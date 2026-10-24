/** Extract image blocks, including images nested in callouts. */
export function postImages(blocks: unknown[]): string[] {
  const images = new Set<string>();
  function walk(items: unknown[]) {
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const block = item as { type?: string; props?: { url?: unknown }; children?: unknown[] };
      if (block.type === "image" && typeof block.props?.url === "string" && /^(https?:\/\/|\/)/.test(block.props.url)) images.add(block.props.url);
      if (Array.isArray(block.children)) walk(block.children);
    }
  }
  walk(blocks);
  return [...images];
}
