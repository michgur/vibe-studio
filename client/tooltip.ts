// tooltip.ts  – robust cleanup: hides on scroll / resize / click-outside
import type { Directive } from 'vue'

/* config */
const GAP = 4
const MARGIN = 4
const FADE_MS = 100

/* types */
type Tip = HTMLDivElement & { _tm?: number }
interface Host extends HTMLElement { _tip?: Tip; _txt?: string }

/* util */
const mkTip = (t: string): Tip =>
  Object.assign(document.createElement('div'), { className: 'tooltip', textContent: t })

const place = (tip: Tip, el: HTMLElement) => {
  const h = el.getBoundingClientRect(), w = tip.getBoundingClientRect().width
  const cx = Math.min(Math.max(h.left + h.width / 2, w / 2 + MARGIN), innerWidth - w / 2 - MARGIN)
  tip.style.left = `${cx}px`
  tip.style.top = `${h.top - tip.getBoundingClientRect().height - GAP}px`
}

/* one set of globals active only while a tooltip is visible */
let activeHost: Host | null = null
const offGlobal = () => {
  window.removeEventListener('scroll', hideGlobal, true)
  window.removeEventListener('resize', hideGlobal)
  document.removeEventListener('pointerdown', hideGlobal, true)
}
const hideGlobal = () => activeHost && hide(activeHost)

function show(el: Host) {
  if (!el._txt) return
  hideGlobal()                    // close previous
  const tip = mkTip(el._txt)
  el._tip = tip
  document.body.appendChild(tip)
  place(tip, el)
  requestAnimationFrame(() => tip.classList.add('show'))

  activeHost = el
  window.addEventListener('scroll', hideGlobal, true)
  window.addEventListener('resize', hideGlobal)
  document.addEventListener('pointerdown', hideGlobal, true)
}

function hide(el: Host, instant = false) {
  const tip = el._tip
  if (!tip) return
  el._tip = undefined
  activeHost = activeHost === el ? null : activeHost
  if (!activeHost) offGlobal()

  const rm = () => tip.remove()
  if (instant) { clearTimeout(tip._tm); rm(); return }

  tip.classList.remove('show')
  tip.addEventListener('transitionend', rm, { once: true })
  tip._tm = window.setTimeout(rm, FADE_MS * 2)
}

/* directive */
export const vTooltip: Directive<Host, string> = {
  mounted(el, { value }) {
    el._txt = value
    el.addEventListener('mouseenter', () => show(el))
    el.addEventListener('mouseleave', () => hide(el))
    el.addEventListener('focus', () => show(el))
    el.addEventListener('blur', () => hide(el))
    el.addEventListener('mousedown', () => hide(el))
  },
  updated(el, { value }) {
    el._txt = value
    if (el._tip) el._tip.textContent = value
  },
  beforeUnmount(el) { hide(el, true) },
}
