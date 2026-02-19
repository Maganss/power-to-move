// ─── PARTICLE CANVAS ─────────────────────────────────────
const canvas = document.getElementById('hero-canvas');
const mouse = { x: -999, y: -999 };

// Global mouse listener for custom cursor
document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
    if (ring) {
        ring.style.left = e.clientX + 'px';
        ring.style.top = e.clientY + 'px';
    }
});

if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        initParticles();
    }
    window.addEventListener('resize', resize);

    let particles = [];
    function initParticles() {
        const N = Math.min(Math.floor(W * H / 6000), 260);
        particles = Array.from({ length: N }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
            size: .9 + Math.random() * 1.5,
            opacity: .18 + Math.random() * .5,
            charge: Math.random(),
            angle: Math.random() * Math.PI * 2,
            angleSpeed: (Math.random() - .5) * .01,
            drift: .2 + Math.random() * .4
        }));
    }

    let arcs = [], arcT = 0;

    function spawnArc() {
        const pool = [...particles].sort(() => Math.random() - .5).slice(0, 30);
        for (let i = 0; i < pool.length; i++) {
            for (let j = i + 1; j < pool.length; j++) {
                const dx = pool[j].x - pool[i].x, dy = pool[j].y - pool[i].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d > 60 && d < 180) {
                    const pts = [{ x: pool[i].x, y: pool[i].y }];
                    const segs = 3 + Math.floor(Math.random() * 4);
                    for (let k = 1; k < segs; k++) {
                        const t = k / segs;
                        pts.push({
                            x: pool[i].x + (pool[j].x - pool[i].x) * t + (Math.random() - .5) * d * .2,
                            y: pool[i].y + (pool[j].y - pool[i].y) * t + (Math.random() - .5) * d * .2
                        });
                    }
                    pts.push({ x: pool[j].x, y: pool[j].y });
                    arcs.push({ pts, elapsed: 0, maxLife: .1 + Math.random() * .18 });
                    return;
                }
            }
        }
    }

    function heroLoop() {
        requestAnimationFrame(heroLoop);
        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(123,192,67,0.022)'; ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 55) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 55) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        particles.forEach(p => {
            p.angle += p.angleSpeed;
            p.vx += Math.cos(p.angle) * .01 * p.drift;
            p.vy += Math.sin(p.angle) * .01 * p.drift;
            const mdx = p.x - mouse.x, mdy = p.y - mouse.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
            if (md < 160 && md > 1) {
                const f = (160 - md) / 160, dir = p.charge > .5 ? -1 : 1;
                p.vx += (mdx / md) * f * .3 * dir; p.vy += (mdy / md) * f * .3 * dir;
            }
            p.vx *= .96; p.vy *= .96;
            p.x += p.vx; p.y += p.vy;
            if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
            if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        });

        // Connections
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = q.x - p.x, dy = q.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
                if (d > 110) continue;
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
                ctx.strokeStyle = `rgba(123,192,67,${(1 - d / 110) * .15})`; ctx.lineWidth = .55; ctx.stroke();
            }
            const mdx = p.x - mouse.x, mdy = p.y - mouse.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
            if (md < 155) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.strokeStyle = `rgba(123,192,67,${(1 - md / 155) * .42})`; ctx.lineWidth = .7; ctx.stroke(); }
        }

        // Particles
        particles.forEach(p => {
            const prox = Math.max(0, 1 - Math.hypot(p.x - mouse.x, p.y - mouse.y) / 160);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size + prox * 1.5, 0, Math.PI * 2);
            if (prox > .3) { ctx.shadowColor = '#7BC043'; ctx.shadowBlur = 8; }
            const r = Math.round(145 + prox * 30), g2 = Math.round(195 + prox * 55), b = Math.round(148 - prox * 80);
            ctx.fillStyle = `rgba(${r},${g2},${b},${p.opacity + prox * .35})`; ctx.fill(); ctx.shadowBlur = 0;
        });

        // Arcs
        arcT += 0.016;
        if (arcT > 0.18) { spawnArc(); arcT = 0; }
        arcs = arcs.filter(a => a.elapsed < a.maxLife);
        arcs.forEach(a => {
            a.elapsed += 0.016;
            const alpha = Math.sin((a.elapsed / a.maxLife) * Math.PI) * .7;
            ctx.beginPath(); ctx.moveTo(a.pts[0].x, a.pts[0].y);
            a.pts.forEach(pt => ctx.lineTo(pt.x, pt.y));
            ctx.strokeStyle = `rgba(175,255,110,${alpha})`; ctx.lineWidth = .85;
            ctx.shadowColor = '#7BC043'; ctx.shadowBlur = 5; ctx.stroke(); ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(255,255,255,${alpha * .4})`; ctx.lineWidth = .35; ctx.stroke();
        });

        // Mouse glow
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 110);
        g.addColorStop(0, 'rgba(123,192,67,0.055)'); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    resize();
    heroLoop();
}

// ─── NAVBAR SCROLL ───────────────────────────────────────
const navbarHeader = document.getElementById('navbar');
if (navbarHeader) {
    window.addEventListener('scroll', () => {
        navbarHeader.classList.toggle('scrolled', window.scrollY > 60);
    });
}

// ─── REVEAL ON SCROLL ────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
if (reveals.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: .12 });
    reveals.forEach(el => observer.observe(el));
}

// ─── COUNT UP ────────────────────────────────────────────
const counters = document.querySelectorAll('[data-count]');
if (counters.length > 0) {
    const countObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target, target = parseInt(el.dataset.count);
            const suffix = target >= 100 ? '+' : '';
            let start = null;
            const step = ts => {
                if (!start) start = ts;
                const p = Math.min((ts - start) / 1800, 1), ease = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(ease * target) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            countObs.unobserve(el);
        });
    }, { threshold: .3 });
    counters.forEach(el => countObs.observe(el));
}

// ─── CURSOR RING EXPAND ──────────────────────────────────
document.querySelectorAll('a,button,input,label,.modelo-tag').forEach(el => {
    el.addEventListener('mouseenter', () => {
        const ring = document.getElementById('cursor-ring');
        if (ring) {
            ring.style.width = '46px';
            ring.style.height = '46px';
            ring.style.borderColor = 'rgba(123,192,67,.65)';
        }
    });
    el.addEventListener('mouseleave', () => {
        const ring = document.getElementById('cursor-ring');
        if (ring) {
            ring.style.width = '28px';
            ring.style.height = '28px';
            ring.style.borderColor = 'rgba(123,192,67,.38)';
        }
    });
});

// ─── MODEL TAGS ──────────────────────────────────────────
document.querySelectorAll('.modelo-tag').forEach(t => {
    t.addEventListener('click', () => {
        document.querySelectorAll('.modelo-tag').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
    });
});
