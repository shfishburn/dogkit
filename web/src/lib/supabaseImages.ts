type RenderFormat = "webp" | "png" | "jpg";

type RenderResize = "cover" | "contain";

type RenderOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: RenderResize;
  format?: RenderFormat;
};

export function supabaseRenderImageUrl(publicUrl: string, opts: RenderOptions = {}): string {
  try {
    const url = new URL(publicUrl);

    const marker = "/storage/v1/object/public/";
    const idx = url.pathname.indexOf(marker);
    if (idx < 0) return publicUrl;

    const bucketAndPath = url.pathname.slice(idx + marker.length); // <bucket>/<path>
    url.pathname = url.pathname.slice(0, idx) + "/storage/v1/render/image/public/" + bucketAndPath;

    const params = new URLSearchParams();
    if (opts.width) params.set("width", String(opts.width));
    if (opts.height) params.set("height", String(opts.height));
    if (opts.resize) params.set("resize", opts.resize);
    if (opts.quality) params.set("quality", String(opts.quality));
    if (opts.format) params.set("format", opts.format);

    url.search = params.toString();
    url.hash = "";

    return url.toString();
  } catch {
    return publicUrl;
  }
}

export function supabaseSrcSet(publicUrl: string, widths: number[], opts: Omit<RenderOptions, "width"> = {}): string {
  return widths
    .map((w) => `${supabaseRenderImageUrl(publicUrl, { ...opts, width: w })} ${w}w`)
    .join(", ");
}

export function supabaseSrcSetWH(
  publicUrl: string,
  entries: Array<{ width: number; height: number }>,
  opts: Omit<RenderOptions, "width" | "height"> = {}
): string {
  return entries
    .map(({ width, height }) => `${supabaseRenderImageUrl(publicUrl, { ...opts, width, height })} ${width}w`)
    .join(", ");
}
