// client/src/utils/anim.js
export const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
}

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 6px 20px rgba(11,11,13,0.06)' },
  hover: { scale: 1.01, boxShadow: '0 12px 30px rgba(11,11,13,0.12)', transition: { duration: 0.22 } }
}
