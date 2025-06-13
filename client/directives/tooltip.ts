import type { Directive } from "vue";
import {
  computePosition,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/dom";

/* --- Config --- */
const GAP = 4;
const FADE_MS = 100; // A standard transition duration

/* --- Types --- */
type Tip = HTMLDivElement & { _tm?: number };
interface Host extends HTMLElement {
  _tip?: Tip;
  _txt?: string;
}

/* --- State Management --- */
let activeState: { host: Host; cleanup: () => void } | null = null;

/* --- Utilities --- */
const mkTip = (t: string): Tip =>
  Object.assign(document.createElement("div"), {
    className: "tooltip",
    textContent: t,
  });

/* --- Core Functions --- */
function show(el: Host) {
  if (!el._txt) return;
  if (activeState) hide(activeState.host, true); // Hide previous instantly

  const tip = mkTip(el._txt);
  el._tip = tip;
  document.body.appendChild(tip);

  const cleanup = autoUpdate(el, tip, () => {
    computePosition(el, tip, {
      placement: "top", // Correct value for top-center alignment
      middleware: [offset(GAP), flip(), shift({ padding: 4 })],
    }).then(({ x, y }) => {
      Object.assign(tip.style, { left: `${x}px`, top: `${y}px` });
    });
  });

  activeState = { host: el, cleanup };

  requestAnimationFrame(() => {
    tip.classList.add("show");
  });
}

function hide(el: Host, instant = false) {
  const tip = el._tip;
  if (!tip) return;

  if (activeState && activeState.host === el) {
    activeState.cleanup();
    activeState = null;
  }

  el._tip = undefined;

  const removeTooltip = () => tip.remove();

  if (instant) {
    clearTimeout(tip._tm);
    removeTooltip();
    return;
  }

  tip.classList.remove("show");
  tip.addEventListener("transitionend", removeTooltip, { once: true });
  tip._tm = window.setTimeout(removeTooltip, FADE_MS * 2); // Fallback
}

/* --- Directive Definition --- */
export const vTooltip: Directive<Host, string> = {
  mounted(el, { value }) {
    el._txt = value;
    el.addEventListener("mouseenter", () => show(el));
    el.addEventListener("mouseleave", () => hide(el));
    el.addEventListener("focus", () => show(el));
    el.addEventListener("blur", () => hide(el));
    el.addEventListener("mousedown", () => hide(el));
  },
  updated(el, { value }) {
    el._txt = value;
    if (el._tip) el._tip.textContent = value;
  },
  beforeUnmount(el) {
    hide(el, true);
  },
};
