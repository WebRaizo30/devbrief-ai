"use client";

type FlowKind = "a" | "b";

type Trace = {
  d: string;
  dash: string;
  flow: FlowKind;
  delayClass: string;
};

/**
 * Full-viewport fine traces: multiple independent paths so “current” reads
 * across the whole screen (vector, stroke-dashoffset only).
 */
const TRACES: Trace[] = [
  {
    d: "M -220 96 H 520 V 248 H 1680",
    dash: "8 640",
    flow: "a",
    delayClass: "neo-conduit-d0",
  },
  {
    d: "M 1700 132 H 420 V 412 H -180",
    dash: "7 588",
    flow: "b",
    delayClass: "neo-conduit-d1",
  },
  {
    d: "M -160 892 H 720 V 636 H 1700",
    dash: "6 702",
    flow: "a",
    delayClass: "neo-conduit-d2",
  },
  {
    d: "M 680 -140 V 196 H 180 V 568 H 1660",
    dash: "7 548",
    flow: "b",
    delayClass: "neo-conduit-d3",
  },
  {
    d: "M -200 470 H 940 L 840 682 H 1680",
    dash: "6 620",
    flow: "a",
    delayClass: "neo-conduit-d4",
  },
  {
    d: "M 1540 -80 V 340 H 860 V 860 H -140",
    dash: "7 590",
    flow: "b",
    delayClass: "neo-conduit-d5",
  },
  {
    d: "M -260 692 C 340 716, 220 392, 640 392 S 1020 820, 1680 520",
    dash: "8 668",
    flow: "a",
    delayClass: "neo-conduit-d6",
  },
  {
    d: "M 920 -160 V 120 H 440 V 486 H 1280 V 980",
    dash: "6 724",
    flow: "b",
    delayClass: "neo-conduit-d7",
  },
  {
    d: "M -240 320 H 1080",
    dash: "5 512",
    flow: "a",
    delayClass: "neo-conduit-d8",
  },
  {
    d: "M 820 1020 V 744 H 240 V 420 H 1620 V 164",
    dash: "7 698",
    flow: "b",
    delayClass: "neo-conduit-d9",
  },
  {
    d: "M -120 204 H 760 V -40",
    dash: "6 480",
    flow: "a",
    delayClass: "neo-conduit-d10",
  },
];

export function NeoConduitBackdrop() {
  return (
    <svg
      aria-hidden
      className="neo-conduit-svg"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      viewBox="0 0 1440 900"
    >
      <defs>
        <linearGradient
          id="neo-flow-pulse"
          gradientUnits="userSpaceOnUse"
          x1="-260"
          y1="380"
          x2="1200"
          y2="180"
        >
          <stop offset="0%" stopColor="#ff0000" stopOpacity={0} />
          <stop offset="43%" stopColor="#ff3838" stopOpacity={0.85} />
          <stop offset="50%" stopColor="#ffecec" stopOpacity={0.5} />
          <stop offset="58%" stopColor="#ff3838" stopOpacity={0.82} />
          <stop offset="100%" stopColor="#ff0000" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id="neo-flow-pulse-b"
          gradientUnits="userSpaceOnUse"
          x1="1100"
          y1="-60"
          x2="-200"
          y2="820"
        >
          <stop offset="0%" stopColor="#ff0000" stopOpacity={0} />
          <stop offset="43%" stopColor="#ff4848" stopOpacity={0.78} />
          <stop offset="51%" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="60%" stopColor="#ff3333" stopOpacity={0.78} />
          <stop offset="100%" stopColor="#ff0000" stopOpacity={0} />
        </linearGradient>
      </defs>

      {TRACES.map((t, i) => (
        <g key={i} className={`neo-conduit-arm ${t.delayClass}`}>
          <path
            className="neo-conduit-bg"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            d={t.d}
          />
          <path
            className={t.flow === "a" ? "neo-flow-a" : "neo-flow-b"}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke={t.flow === "a" ? "url(#neo-flow-pulse)" : "url(#neo-flow-pulse-b)"}
            strokeDasharray={t.dash}
            d={t.d}
          />
        </g>
      ))}
    </svg>
  );
}
