/*!
 * liquid-glass.ts - Apple-style liquid glass refraction engine.
 * Exact implementation from https://github.com/deepika-builds/liquid-glass
 */

export interface LiquidGlassOptions {
  /** Displacement strength (negative = magnifying bulge). Default: -112 */
  scale?: number;
  /** Per-channel scale stagger for chromatic fringe. Default: 6 */
  chroma?: number;
  /** Neutral inset as a fraction of the smaller side. Default: 0.07 */
  border?: number;
  /** Edge-curvature softness (px) of the map's gray inset. Default: 12 */
  mapBlur?: number;
  /** Backdrop blur (px) behind the glass interior. Default: 3 */
  blur?: number;
  /** Backdrop saturation boost. Default: 1.5 */
  saturate?: number;
  /** Corner radius override (px); default reads computed border-radius. */
  radius?: number | null;
  /** Frosted blur (px) where SVG refraction is unsupported. Default: 16 */
  fallbackBlur?: number;
}

export interface LiquidGlassInstance {
  supported: boolean;
  refresh: () => void;
  destroy: () => void;
}

const SVG_NS = "http://www.w3.org/2000/svg";
let uid = 0;
let svgDefs: SVGDefsElement | null = null;

function isSupported(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  if (isSafari || isFirefox) return false;
  return (
    CSS.supports("backdrop-filter", "blur(1px)") ||
    CSS.supports("-webkit-backdrop-filter", "blur(1px)")
  );
}

function ensureDefs(): SVGDefsElement {
  if (svgDefs && document.body.contains(svgDefs)) return svgDefs;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  svg.style.pointerEvents = "none";
  svgDefs = document.createElementNS(SVG_NS, "defs");
  svg.appendChild(svgDefs);
  document.body.appendChild(svg);
  return svgDefs;
}

function makeMap(w: number, h: number, radius: number, border: number, mapBlur: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, "rgb(0,0,0)");
  gx.addColorStop(1, "rgb(255,0,0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);

  const gy = ctx.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, "rgb(0,0,0)");
  gy.addColorStop(1, "rgb(0,0,255)");
  ctx.globalCompositeOperation = "difference";
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "source-over";
  const inset = border * Math.min(w, h);
  ctx.filter = `blur(${mapBlur}px)`;
  ctx.fillStyle = "rgba(128,128,128,0.93)";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, Math.max(radius - inset, 2));
  } else {
    ctx.rect(inset, inset, w - inset * 2, h - inset * 2);
  }
  ctx.fill();
  ctx.filter = "none";
  return canvas.toDataURL();
}

function buildFilter(id: string, scales: number[]) {
  const filter = document.createElementNS(SVG_NS, "filter");
  filter.setAttribute("id", id);
  filter.setAttribute("x", "-20%");
  filter.setAttribute("y", "-20%");
  filter.setAttribute("width", "140%");
  filter.setAttribute("height", "140%");
  filter.setAttribute("color-interpolation-filters", "sRGB");

  const feImage = document.createElementNS(SVG_NS, "feImage");
  feImage.setAttribute("x", "0");
  feImage.setAttribute("y", "0");
  feImage.setAttribute("result", "map");
  feImage.setAttribute("preserveAspectRatio", "none");
  filter.appendChild(feImage);

  const keep = [
    "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
  ];
  const channels: string[] = [];
  for (let i = 0; i < 3; i++) {
    const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "map");
    disp.setAttribute("scale", String(scales[i]));
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "B");
    disp.setAttribute("result", `d${i}`);
    filter.appendChild(disp);

    const cm = document.createElementNS(SVG_NS, "feColorMatrix");
    cm.setAttribute("in", `d${i}`);
    cm.setAttribute("type", "matrix");
    cm.setAttribute("values", keep[i]!);
    cm.setAttribute("result", `c${i}`);
    filter.appendChild(cm);
    channels.push(`c${i}`);
  }

  const blend1 = document.createElementNS(SVG_NS, "feBlend");
  blend1.setAttribute("in", channels[0]!);
  blend1.setAttribute("in2", channels[1]!);
  blend1.setAttribute("mode", "screen");
  blend1.setAttribute("result", "c01");
  filter.appendChild(blend1);

  const blend2 = document.createElementNS(SVG_NS, "feBlend");
  blend2.setAttribute("in", "c01");
  blend2.setAttribute("in2", channels[2]!);
  blend2.setAttribute("mode", "screen");
  filter.appendChild(blend2);

  ensureDefs().appendChild(filter);
  return { filter, feImage };
}

function resolveRadius(el: HTMLElement, w: number, h: number, override?: number | null): number {
  if (override != null) return override;
  const raw = getComputedStyle(el).borderTopLeftRadius || "0px";
  const v = parseFloat(raw) || 0;
  return raw.trim().endsWith("%") ? (v / 100) * Math.min(w, h) : v;
}

export function applyLiquidGlass(el: HTMLElement, opts?: LiquidGlassOptions): LiquidGlassInstance {
  const o: Required<LiquidGlassOptions> = {
    scale: -120,
    chroma: 6,
    border: 0.08,
    mapBlur: 14,
    blur: 4,
    saturate: 1.4,
    radius: null,
    fallbackBlur: 16,
    ...opts,
  };

  const supported = isSupported();

  if (!supported) {
    const frosted = `blur(${o.fallbackBlur}px) saturate(${o.saturate})`;
    el.style.backdropFilter = frosted;
    (el.style as unknown as { webkitBackdropFilter: string }).webkitBackdropFilter = frosted;
    el.classList.add("lg-fallback");
    return {
      supported: false,
      refresh: () => {},
      destroy: () => {
        el.style.backdropFilter = "";
        (el.style as unknown as { webkitBackdropFilter: string }).webkitBackdropFilter = "";
        el.classList.remove("lg-fallback");
      },
    };
  }

  const id = `lg-filter-${++uid}`;
  const scales = [o.scale, o.scale + o.chroma, o.scale + 2 * o.chroma];
  const parts = buildFilter(id, scales);

  function refresh() {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return;
    const radius = resolveRadius(el, w, h, o.radius);
    const mapUrl = makeMap(w, h, radius, o.border, o.mapBlur);
    parts.feImage.setAttribute("href", mapUrl);
    parts.feImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", mapUrl);
    parts.feImage.setAttribute("width", String(w));
    parts.feImage.setAttribute("height", String(h));
  }

  refresh();
  const backdrop = `url(#${id}) blur(${o.blur}px) saturate(${o.saturate})`;
  el.style.backdropFilter = backdrop;
  (el.style as unknown as { webkitBackdropFilter: string }).webkitBackdropFilter = backdrop;

  let timer: ReturnType<typeof setTimeout> | null = null;
  const ro = new ResizeObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(refresh, 120);
  });
  ro.observe(el);

  return {
    supported: true,
    refresh,
    destroy: () => {
      ro.disconnect();
      if (timer) clearTimeout(timer);
      parts.filter.remove();
      el.style.backdropFilter = "";
      (el.style as unknown as { webkitBackdropFilter: string }).webkitBackdropFilter = "";
    },
  };
}
