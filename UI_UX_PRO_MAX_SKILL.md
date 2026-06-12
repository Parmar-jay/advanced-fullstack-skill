# 🎨 UI/UX Pro Max Skill — Premium Frontend Design Manual

This manual enables coding agents to construct jaw-dropping, production-ready, highly interactive landing pages and full websites (E-commerce, Portfolio, SaaS, Agency, etc.) using **React (JSX) + Tailwind CSS + GSAP**. 

---

## 💎 Design Tokens & Themes

Always select a cohesive, high-contrast premium theme at the start of generation. Do not mix palettes haphazardly.

### 1. Luxury Dark (Obsidian & Gold)
- **Backgrounds**: Deep blacks and dark greys (`bg-obsidian-950` / `bg-obsidian-900` / `bg-obsidian-800`).
- **Foregrounds**: Soft warm whites (`text-stone-100` / `text-stone-300`).
- **Accents**: Premium gold gradients (`bg-gradient-to-r from-gold-600 to-gold-400`, `text-gold`, `border-gold/30`).
- **Best For**: High-end portfolios, agency landing pages, luxury e-commerce.

### 2. Neon Cyberpunk (Dark & Glowing)
- **Backgrounds**: Rich navy-blacks (`bg-cyber-dark`, `bg-slate-950`).
- **Foregrounds**: Crisp white and neon tints (`text-slate-100` / `text-slate-400`).
- **Accents**: High-voltage neon gradients (`from-cyber-violet via-cyber-fuchsia to-cyber-cyan`).
- **Best For**: Web3, SaaS products, gaming, technology dashboards.

### 3. Sophisticated Minimalist (Clean & Clay)
- **Backgrounds**: Ultra-clean greys and warm creams (`bg-zinc-50` / `bg-zinc-100` for light, `bg-zinc-950` / `bg-zinc-900` for dark).
- **Foregrounds**: Solid dark slate (`text-zinc-900` / `text-zinc-500` for light).
- **Accents**: Terracotta, burnt orange, or deep forest green (`text-orange-700`, `bg-emerald-800`, `border-zinc-200`).
- **Best For**: Creative studios, designer portfolios, modern blogs.

---

## 🔤 Premium Typography Combinations

Leverage the pre-loaded custom font families in `tailwind.config.js` to create contrast between structural headings and readable body copies:

| Title Style | Heading Font | Body Font | Usage & Aura |
|---|---|---|---|
| **Avant-Garde** | `font-display` (Syne) | `font-sans` (Satoshi / Inter) | Bold, artistic, modern. Excellent for creative agencies. |
| **Tech/Future** | `font-display` (Space Grotesk) | `font-sans` (Inter) | Clean, geometric, futuristic. Ideal for SaaS/Web3. |
| **Editorial/Premium** | `font-serif` (Playfair Display) | `font-sans` (Plus Jakarta Sans) | Sophisticated, high-end, elegant. Ideal for Luxury Brand/Fashion. |
| **Clean/Corporate** | `font-display` (Outfit) | `font-sans` (Plus Jakarta Sans) | Friendly, modern, professional. Perfect for E-commerce & Startups. |

### Typography Styling Rules:
- **Heading 1**: `text-5xl md:text-7xl font-extrabold tracking-tight leading-none`
- **Heading 2**: `text-3xl md:text-5xl font-bold tracking-tight`
- **Body Copy**: `text-base md:text-lg text-slate-400 leading-relaxed font-normal`
- **Text Reveal Container**: To animate headings, wrap characters or words in `overflow-hidden` blocks:
  ```jsx
  <h1 className="overflow-hidden py-2">
    <span className="block translate-y-full select-none" ref={textRef}>
      Elevate Your Digital Space
    </span>
  </h1>
  ```

---

## 🌀 GSAP Animation & ScrollTrigger Suite

We utilize `gsap` along with the official React integration `@gsap/react`.
Always register the `ScrollTrigger` plugin inside your components when doing scroll animations.

### Crucial Memory-Safe Rules for React:
1. **Always use the `useGSAP` hook**: Do not write raw `useEffect` blocks for GSAP. `useGSAP` automatically cleans up animations and prevents memory leaks, scroll-trigger duplicates, and page lags.
2. **Scoping**: Provide a wrapper `scope` (ref) to `useGSAP` so it only queries elements inside that container.
3. **ScrollTrigger markers**: Never leave `markers: true` in production.

### Animation Recipes:

#### 1. Page Entry Timeline (Mount Animation)
Animate header, hero text, CTA buttons, and main illustration sequentially on load.
```jsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function HeroSection() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
    
    tl.from('.hero-badge', { opacity: 0, y: -20 })
      .from('.hero-title span', { y: '100%', stagger: 0.1 }, '-=0.8')
      .from('.hero-desc', { opacity: 0, y: 20 }, '-=0.8')
      .from('.hero-cta', { opacity: 0, scale: 0.9, stagger: 0.15 }, '-=0.8')
      .from('.hero-image', { opacity: 0, scale: 1.05, y: 30 }, '-=1.0');
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-obsidian-950 flex items-center">
      {/* Elements matching classes: .hero-badge, .hero-title, .hero-desc, etc. */}
    </div>
  );
}
```

#### 2. Reveal on Scroll (ScrollTrigger)
Reveal cards or grid blocks dynamically as they scroll into view.
```jsx
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesGrid() {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from('.feature-card', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%', // fires when the top of the container is 80% down the screen
        toggleActions: 'play none none reverse', // resets if scrolled backward
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-obsidian-900">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="feature-card bg-obsidian-800 p-8 rounded-2xl border border-white/5">...</div>
        <div className="feature-card bg-obsidian-800 p-8 rounded-2xl border border-white/5">...</div>
        <div className="feature-card bg-obsidian-800 p-8 rounded-2xl border border-white/5">...</div>
      </div>
    </section>
  );
}
```

#### 3. Horizontal Scroll Gallery
A classic interactive agency effect: scroll vertically to slide horizontal project panels.
```jsx
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalPortfolio() {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);

  useGSAP(() => {
    const scrollWidth = sectionRef.current.scrollWidth;
    const viewportWidth = window.innerWidth;
    
    gsap.to(sectionRef.current, {
      x: () => -(scrollWidth - viewportWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: triggerRef.current,
        pin: true,
        scrub: 1, // ties motion directly to scrollbar
        start: 'top top',
        end: () => `+=${scrollWidth - viewportWidth}`,
        invalidateOnRefresh: true, // handles screen resize
      }
    });
  }, { scope: triggerRef });

  return (
    <div ref={triggerRef} className="overflow-hidden">
      <div ref={sectionRef} className="flex h-screen w-[300vw]">
        <div className="w-screen h-screen bg-red-900 flex-shrink-0 flex items-center justify-center">Panel 1</div>
        <div className="w-screen h-screen bg-blue-900 flex-shrink-0 flex items-center justify-center">Panel 2</div>
        <div className="w-screen h-screen bg-green-900 flex-shrink-0 flex items-center justify-center">Panel 3</div>
      </div>
    </div>
  );
}
```

#### 4. Magnetic Interactive Elements
Makes buttons follow the mouse pointer within a specific radius, adding a highly premium micro-interaction feel.
```jsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function MagneticButton({ children, className }) {
  const buttonRef = useRef(null);

  const { contextSafe } = useGSAP({ scope: buttonRef });

  const handleMouseMove = contextSafe((e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    // Magnetic pull (strength divider)
    gsap.to(buttonRef.current, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: 'power2.out' });
  });

  const handleMouseLeave = contextSafe(() => {
    // Return to center
    gsap.to(buttonRef.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  });

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </button>
  );
}
```

---

## 🖼️ Premium Visuals & Theme-Based Image Strategy

To ensure generated templates are immediately impressive, align layout positions and assets perfectly.

### 1. High-Quality Static Image URLs (Unsplash Fallbacks)
Never write broken or placeholder image tags. Use these high-resolution, theme-appropriate, curated stock images:

- **E-Commerce / Gadgets**:
  - Headphone/Sound: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80`
  - Sneaker/Fashion: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80`
  - Smartwatch/Tech: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80`
- **SaaS / Digital Mockups**:
  - Abstract Dashboard mockup: `https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80`
  - Workspace/Collaboration: `https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80`
  - Coding/Cyberpunk desk: `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80`
- **Portfolio / Portrait**:
  - Designer/Creator Portrait (Male): `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80`
  - Developer/Architect (Female): `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80`
  - Minimal Architecture (for structural fills): `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80`

### 2. SVG Decorative Patterns
Add premium geometric structures to card and hero backgrounds inline. Do not use external files:
- **Dot Grid Pattern**:
  ```jsx
  <div className="absolute inset-0 bg-[radial-gradient(#e2bd4a_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
  ```
- **Line Grid Overlay**:
  ```jsx
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
  ```

---

## 🏬 Specific Niche Components

### 1. E-Commerce (Luxury/Glow Style)
- **Product Card**: Combine a dark glassmorphic card with a scale animation.
  ```jsx
  <div className="group relative bg-obsidian-900 border border-white/5 rounded-2xl overflow-hidden p-4 transition-all duration-300 hover:border-gold/30 hover:shadow-2xl">
    <div className="aspect-square w-full overflow-hidden rounded-xl bg-obsidian-800 relative">
      <img src={imgUrl} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
      <span className="absolute top-3 left-3 bg-gold text-obsidian-950 font-display text-xs font-bold px-2 py-1 rounded">New</span>
    </div>
    <div className="mt-4 flex justify-between items-start">
      <div>
        <h3 className="font-display font-bold text-stone-200 text-lg">{title}</h3>
        <p className="text-slate-400 text-sm mt-1">{niche}</p>
      </div>
      <p className="font-sans font-bold text-gold">${price}</p>
    </div>
  </div>
  ```

### 2. Creative Portfolio (Hero Parallax Split)
- **Intro Reveal**: Split layout with text slide-ins and interactive floating graphics.
- **Project Cards**: Stack cards with asymmetrical layout (e.g., column-1 offsets down `translate-y-12` relative to column-2) for editorial rhythm.

### 3. SaaS Landing Page (Interactive Value Prop)
- **Bento Grid Layout**: Combine multi-size grid items (e.g. `col-span-2 row-span-1` and `col-span-1 row-span-2`) with subtle glow borders.
- **Pricing Cards**: A comparative tier card layout with a highly stylized, highlighted central card containing a radial glow.

---

## ⚡ World-Class Landing Page Blueprint System

To create an enormous variety of unique, high-conversion websites, use the dynamic layout blueprints documented below. Each contains specialized structures for headers, heroes, core content, forms, auth states, and footers. They can be fetched in either JSX (standard React) or TSX (TypeScript React) formats directly from the Home page UI:

### 1. The Luxury Obsidian & Gold Template
- **Aesthetic**: Premium Dark, High-End SaaS, Agency, and E-Commerce.
- **Typography**: Display: `font-display` (Syne), Body: `font-sans` (Satoshi / Inter).
- **Structure**:
  - *Navbar*: Fixed glassmorphic dark header with fine gold border and interactive hover triggers.
  - *Hero*: Centered high-contrast typography, text reveal, magnetic CTA buttons, and a slow-drifting gold radial glow background.
  - *Main*: Bento grids displaying feature sets, floating gold cards, and parallax product displays.
  - *Auth/Forms*: Integrated glass-card login modal / feedback-driven newsletter form with golden focus rings.
  - *Footer*: Multi-column minimal gold links with interactive hovering states.

### 2. The Neon Cyberpunk (Web3 & Tech) Template
- **Aesthetic**: Dark Futuristic, Web3, Gaming, and SaaS Dashboard.
- **Typography**: Display: `font-display` (Space Grotesk), Body: `font-sans` (Inter).
- **Structure**:
  - *Navbar*: Sticky dark slate container with violet/cyan border.
  - *Hero*: Multi-color neon glow background (`from-cyber-violet via-cyber-fuchsia to-cyber-cyan`), matrix-like dot grid SVG overlay, and typewriter hero animation.
  - *Main*: Asymmetric grids with neon border-glow cards, interactive statistics grids.
  - *Auth/Forms*: Cyberpunk terminal input fields with neon green validation badges.
  - *Footer*: High-tech index list showing status indicators and code-like copyright widgets.

### 3. The Sophisticated Minimalist (Creative & Editorial) Template
- **Aesthetic**: Neutral Cream/Sand Light Mode with Burnt Terracotta or Forest Green.
- **Typography**: Display: `font-display` (Playfair Display / Serif), Body: `font-sans` (Plus Jakarta Sans).
- **Structure**:
  - *Navbar*: Completely transparent flat header, shifting to slide-in menu panel.
  - *Hero*: Asymmetrical left-aligned serif typography, large clean spaces (`py-36`), and custom-masked layout offsets.
  - *Main*: Clean grids with generous paddings, photo frames with thin black borders, and editorial narratives.
  - *Auth/Forms*: Minimal underline input fields with fluid label-float animations.
  - *Footer*: Giant serif copyright banner with clean social listings.

### 4. The Clean Corporate (Startup & Enterprise) Template
- **Aesthetic**: Modern Professional, E-Commerce Showcase, and Tech Corporate.
- **Typography**: Display: `font-display` (Outfit), Body: `font-sans` (Plus Jakarta Sans).
- **Structure**:
  - *Navbar*: Clean white/slate layout, structured drop-downs, and a quick-action button.
  - *Hero*: Split 2-column layout (bold text block on left, high-fidelity mockups/interactive cards on right).
  - *Main*: Customer logos scroll-marquee, detailed analytics list, interactive pricing table with tabs.
  - *Auth/Forms*: Structured card-based signin/signup layouts with auto-focus and clear input helpers.
  - *Footer*: Corporate Sitemap style with extensive directories.

---

## ⚡ Performance, Load Time, and CLS Checklist

Ensure that the web experience feels fluid and does not lag:
1. **Layout Shifts (CLS)**: Always set an aspect ratio on image containers (`aspect-square`, `aspect-video`, or custom tailwind values like `h-[400px] w-full object-cover`).
2. **Lazy Loading**: Set `loading="lazy"` on all offscreen images.
3. **GPU Hardware Acceleration**: In GSAP, always animate properties that can be offloaded to the GPU:
   - Use `x` and `y` instead of `left` and `top`.
   - Use `scale` instead of `width` and `height` inside scroll triggers.
4. **Hardware Acceleration CSS**: For layers with heavy animations (like parallax images or infinite marquee loops), add Tailwind class `will-change-transform`.
