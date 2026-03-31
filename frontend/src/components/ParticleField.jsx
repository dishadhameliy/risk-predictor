import { useEffect, useRef } from 'react'

/**
 * ParticleField — interactive canvas animation for the hero section.
 *
 * Behaviour:
 *  • Hundreds of small circular particles float gently around.
 *  • Particles within `REPEL_RADIUS` of the mouse are pushed away smoothly.
 *  • Particles outside the radius drift back to their home position.
 *  • Connected neighbours draw faint lines, giving a "neural network" feel.
 *  • Fully respects the light-theme palette.
 */

const CONFIG = {
    COUNT: 110,            // number of particles
    REPEL_RADIUS: 130,     // px — how far the cursor pushes particles
    REPEL_FORCE: 6,        // push strength multiplier
    RETURN_SPEED: 0.045,   // how quickly particles snap back (0–1)
    DRIFT_SPEED: 0.3,      // random float speed
    CONNECT_DIST: 110,     // px — max distance to draw a connecting line
    DOT_RADIUS_MIN: 1.5,
    DOT_RADIUS_MAX: 3.5,
    // Light-theme colours
    DOT_COLOR_A: '99,102,241',   // indigo
    DOT_COLOR_B: '14,165,233',   // sky-blue
    DOT_COLOR_C: '16,185,129',   // emerald (accent)
    LINE_COLOR: '99,102,241',
}

function rand(min, max) { return Math.random() * (max - min) + min }

function makeParticle(w, h) {
    const x = rand(0, w)
    const y = rand(0, h)
    const palette = [CONFIG.DOT_COLOR_A, CONFIG.DOT_COLOR_B, CONFIG.DOT_COLOR_C]
    return {
        x,
        y,
        homeX: x,
        homeY: y,
        vx: rand(-CONFIG.DRIFT_SPEED, CONFIG.DRIFT_SPEED),
        vy: rand(-CONFIG.DRIFT_SPEED, CONFIG.DRIFT_SPEED),
        r: rand(CONFIG.DOT_RADIUS_MIN, CONFIG.DOT_RADIUS_MAX),
        color: palette[Math.floor(Math.random() * palette.length)],
        opacity: rand(0.35, 0.75),
    }
}

export default function ParticleField() {
    const canvasRef = useRef(null)
    const mouse = useRef({ x: -9999, y: -9999 })
    const particles = useRef([])
    const rafId = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        // ── Size canvas to its container ──
        const resize = () => {
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
            // Re-home existing particles if any, otherwise init
            if (particles.current.length === 0) {
                particles.current = Array.from({ length: CONFIG.COUNT }, () =>
                    makeParticle(canvas.width, canvas.height)
                )
            } else {
                particles.current.forEach(p => {
                    // Clamp home positions inside new bounds
                    p.homeX = Math.min(p.homeX, canvas.width)
                    p.homeY = Math.min(p.homeY, canvas.height)
                })
            }
        }

        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(canvas)

        // ── Mouse tracking (on window so it works behind content layers) ──
        const onMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            if (
                e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom
            ) {
                mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
            } else {
                mouse.current = { x: -9999, y: -9999 }
            }
        }
        const onLeave = () => { mouse.current = { x: -9999, y: -9999 } }
        window.addEventListener('mousemove', onMove)

        // ── Touch support ──
        const onTouch = (e) => {
            const rect = canvas.getBoundingClientRect()
            const t = e.touches[0]
            mouse.current = { x: t.clientX - rect.left, y: t.clientY - rect.top }
        }
        window.addEventListener('touchmove', onTouch, { passive: true })
        window.addEventListener('touchend', onLeave)

        // ── Animation loop ──
        const draw = () => {
            const { width, height } = canvas
            ctx.clearRect(0, 0, width, height)

            const mx = mouse.current.x
            const my = mouse.current.y
            const pts = particles.current

            // Update positions
            pts.forEach(p => {
                const dx = p.x - mx
                const dy = p.y - my
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < CONFIG.REPEL_RADIUS && dist > 0) {
                    // Push away from cursor — stronger when closer
                    const force = (1 - dist / CONFIG.REPEL_RADIUS) * CONFIG.REPEL_FORCE
                    p.vx += (dx / dist) * force
                    p.vy += (dy / dist) * force
                }

                // Spring back toward home position
                p.vx += (p.homeX - p.x) * CONFIG.RETURN_SPEED
                p.vy += (p.homeY - p.y) * CONFIG.RETURN_SPEED

                // Dampen velocity (friction)
                p.vx *= 0.82
                p.vy *= 0.82

                p.x += p.vx
                p.y += p.vy
            })

            // Draw connecting lines first (behind dots)
            ctx.lineWidth = 0.6
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x
                    const dy = pts[i].y - pts[j].y
                    const d = Math.sqrt(dx * dx + dy * dy)
                    if (d < CONFIG.CONNECT_DIST) {
                        const alpha = (1 - d / CONFIG.CONNECT_DIST) * 0.18
                        ctx.stokeStyle = `rgba(${CONFIG.LINE_COLOR},${alpha})`
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(${CONFIG.LINE_COLOR},${alpha})`
                        ctx.moveTo(pts[i].x, pts[i].y)
                        ctx.lineTo(pts[j].x, pts[j].y)
                        ctx.stroke()
                    }
                }
            }

            // Draw dots
            pts.forEach(p => {
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${p.color},${p.opacity})`
                ctx.fill()
            })

            // Cursor glow ring
            if (mx > 0 && mx < width && my > 0 && my < height) {
                const grad = ctx.createRadialGradient(mx, my, 0, mx, my, CONFIG.REPEL_RADIUS * 0.9)
                grad.addColorStop(0, 'rgba(79,70,229,0.06)')
                grad.addColorStop(0.5, 'rgba(79,70,229,0.03)')
                grad.addColorStop(1, 'rgba(79,70,229,0)')
                ctx.beginPath()
                ctx.arc(mx, my, CONFIG.REPEL_RADIUS * 0.9, 0, Math.PI * 2)
                ctx.fillStyle = grad
                ctx.fill()
            }

            rafId.current = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(rafId.current)
            ro.disconnect()
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('touchmove', onTouch)
            window.removeEventListener('touchend', onLeave)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                display: 'block',
                cursor: 'default',
            }} />
    )
}
