/**
 * The product's argument, drawn.
 *
 * A session of candles with a moving average and volume underneath — then the
 * read written over it. That pairing IS the About page's thesis: coverage is
 * solved, comprehension is not, so the reasoning has to travel with the data
 * rather than be left as an exercise for whoever is looking at the chart.
 *
 * Server-rendered SVG, no canvas and no client JS: it is a picture, it should
 * cost a picture. Colour comes entirely from classes in app/pages.css, so it
 * follows the light/dark switch like everything else.
 *
 * The series is generated from sines rather than Math.random for two reasons:
 * a random walk would differ between the server render and the browser's, and
 * a fixed shape can be composed — this one steps up on the highlighted bar so
 * there is something for the annotation to point at.
 */

const N = 26;
/** The bar the callout is about — the gap-up the read explains. */
const MARK = 18;

const W = 560;
const H = 300;
const PAD = { l: 10, r: 52, t: 14, b: 24 };

const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;
/** Price takes the top, volume a strip beneath it, with air between. */
const priceH = plotH * 0.72;
const volH = plotH * 0.2;
const volTop = PAD.t + plotH - volH;

type Candle = { o: number; h: number; l: number; c: number; v: number };

function series(): Candle[] {
  const out: Candle[] = [];
  let prev = 100;
  for (let i = 0; i < N; i++) {
    // A drifting base, plus a step at MARK so the chart has an event on it.
    const base =
      100 + Math.sin(i * 0.52) * 3.1 + Math.sin(i * 0.19) * 4.6 + i * 0.28 + (i >= MARK ? 6.4 : 0);
    const o = prev;
    const c = base;
    const wick = 1.1 + Math.abs(Math.sin(i * 1.7)) * 1.5;
    out.push({
      o,
      c,
      h: Math.max(o, c) + wick,
      l: Math.min(o, c) - wick,
      // Volume swells into the event and fades after it.
      v: 0.42 + Math.abs(Math.sin(i * 0.9)) * 0.3 + (i === MARK ? 0.52 : i === MARK - 1 ? 0.2 : 0),
    });
    prev = c;
  }
  return out;
}

const candles = series();
const lo = Math.min(...candles.map((c) => c.l));
const hi = Math.max(...candles.map((c) => c.h));

const slot = plotW / N;
const bodyW = Math.min(10, slot * 0.56);
const x = (i: number) => PAD.l + slot * (i + 0.5);
const y = (p: number) => PAD.t + (1 - (p - lo) / (hi - lo)) * priceH;

/** 5-period mean of closes — the line the eye follows, not a signal. */
const ma = candles.map((_, i) => {
  const from = Math.max(0, i - 4);
  const win = candles.slice(from, i + 1);
  return win.reduce((s, c) => s + c.c, 0) / win.length;
});
const maPath = ma.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

/** Four horizontal rules, priced on the right the way a terminal would. */
const rules = [0, 1, 2, 3].map((k) => {
  const p = lo + ((hi - lo) * k) / 3;
  return { p, y: y(p) };
});

/** The strip under the chart, reworded per page — the picture is the same
 *  argument either way, but it should answer the page it is standing on. */
type Props = {
  /** The terminal's title bar, e.g. "MOVERS · 1D". */
  label?: string;
  /** The read written under the chart. */
  read?: string;
};

export function MarketChart({
  label = "MOVERS · 1D",
  read = "Gap higher on a beat-and-raise; volume ran 2.1x the twenty-day median and breadth confirmed, so the move is sector-wide rather than single-name.",
}: Props = {}) {
  return (
    <figure className="mcp-chart">
      <div className="mcp-chart-bar">
        <span className="mcp-chart-dots">
          <i />
          <i />
          <i />
        </span>
        <span>{label}</span>
        <span className="mcp-chart-live">LIVE</span>
      </div>

      <svg
        className="mcp-ch"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="An illustrative price chart: a session of candlesticks with a moving average and volume, with one bar marked as the move the platform explains."
      >
        {rules.map((r) => (
          <g key={r.p}>
            <line className="mcp-ch-grid" x1={PAD.l} x2={PAD.l + plotW} y1={r.y} y2={r.y} />
            <text className="mcp-ch-lbl" x={PAD.l + plotW + 8} y={r.y + 3.5}>
              {r.p.toFixed(2)}
            </text>
          </g>
        ))}

        {/* The marked session, called out behind the bars. */}
        <rect
          className="mcp-ch-band"
          x={x(MARK) - slot / 2}
          y={PAD.t}
          width={slot}
          height={plotH}
          rx="2"
        />

        <path className="mcp-ch-ma" d={maPath} />

        {candles.map((c, i) => {
          const up = c.c >= c.o;
          const top = y(Math.max(c.o, c.c));
          const h = Math.max(1.5, Math.abs(y(c.o) - y(c.c)));
          const tone = up ? "mcp-ch-up" : "mcp-ch-dn";
          return (
            <g key={i} className={`${tone}${i === MARK ? " is-mark" : ""}`}>
              <line className="mcp-ch-wick" x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} />
              <rect className="mcp-ch-body" x={x(i) - bodyW / 2} y={top} width={bodyW} height={h} rx="1" />
              <rect
                className="mcp-ch-vol"
                x={x(i) - bodyW / 2}
                y={volTop + volH * (1 - c.v)}
                width={bodyW}
                height={volH * c.v}
                rx="1"
              />
            </g>
          );
        })}

        {/* The pin on the bar the read is about. */}
        <line
          className="mcp-ch-pin"
          x1={x(MARK)}
          x2={x(MARK)}
          y1={PAD.t}
          y2={y(candles[MARK].h) - 7}
        />
        <circle className="mcp-ch-pip" cx={x(MARK)} cy={y(candles[MARK].h) - 11} r="3.4" />
      </svg>

      {/* The same strip the product puts under every view: what moved, and
          why, over the figures that are already on screen. */}
      <figcaption className="mcp-read">
        <b>ai read</b>
        <span>{read}</span>
      </figcaption>
    </figure>
  );
}
