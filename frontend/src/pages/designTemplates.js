// Dynamic Web Page Builder Engine
// Generates production-ready, fully responsive React JSX/TSX components.

export const defaultTemplates = [
  {
    id: 'luxury-gold',
    name: 'Luxury Gold & Obsidian',
    niche: 'High-End Brand, Agency, or Portfolio',
    theme: 'luxury',
    colors: {
      bgPrimary: '#050505',
      bgSecondary: '#0A0A0A',
      border: 'rgba(212, 175, 55, 0.15)',
      textPrimary: '#F5F5F4',
      textSecondary: '#A8A29E',
      accent: '#D4AF37',
      accentHover: '#E2BD4A',
    },
    typography: {
      display: 'Syne',
      body: 'Plus Jakarta Sans'
    },
    animations: {
      entry: true,
      scroll: true,
      hover: true
    },
    sections: [
      {
        id: 'nav-1',
        type: 'navbar',
        layout: 'sticky-glass',
        visible: true,
        content: {
          logo: 'GOLDEN.IO',
          links: [
            { label: 'Features', href: '#features' },
            { label: 'Showcase', href: '#showcase' },
            { label: 'Newsletter', href: '#subscribe' }
          ],
          ctaText: 'Launch App'
        }
      },
      {
        id: 'hero-1',
        type: 'hero',
        layout: 'centered-glow',
        visible: true,
        content: {
          badge: '✨ Absolute Luxury & Artistry',
          title: 'Crafting Digital Artifacts with',
          highlightText: 'Supreme Luxury',
          description: 'Experience a world-class workspace meticulously curated for high-end creators, designers, and luxury enterprises. Unmatched aesthetics meet flawless performance.',
          ctaPrimaryText: 'Get Started',
          ctaSecondaryText: 'Learn More',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        }
      },
      {
        id: 'features-1',
        type: 'features',
        layout: 'simple-3col',
        visible: true,
        content: {
          title: 'Elite Features',
          subtitle: 'Every detail engineered to fulfill your premium digital requirements.',
          items: [
            { icon: '⚜️', title: 'Exquisite Curation', desc: 'We curate assets, themes, and font pairings that align with absolute world-class standard guidelines.' },
            { icon: '✨', title: 'Flawless Animations', desc: 'Powered by GSAP for memory-safe, hardware-accelerated movements that enhance interactive pacing.' },
            { icon: '🏆', title: 'Gold Standard Codebase', desc: 'Fully responsive, accessible markup with seamless navigation and robust security protections.' }
          ]
        }
      },
      {
        id: 'contact-1',
        type: 'contact',
        layout: 'email-form',
        visible: true,
        content: {
          title: 'Join the Inner Circle',
          subtitle: 'Subscribe for exclusive insights, updates, and luxury digital design blueprints.',
          buttonText: 'Subscribe',
          formType: 'email'
        }
      },
      {
        id: 'footer-1',
        type: 'footer',
        layout: 'minimal-mono',
        visible: true,
        content: {
          copyright: 'GOLDEN.IO. ALL RIGHTS RESERVED.'
        }
      }
    ]
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk Grid',
    niche: 'Web3, Gaming, and Futuristic Tech',
    theme: 'cyberpunk',
    colors: {
      bgPrimary: '#07070C',
      bgSecondary: '#0B0B12',
      border: 'rgba(139, 92, 246, 0.2)',
      textPrimary: '#F1F5F9',
      textSecondary: '#94A3B8',
      accent: '#8B5CF6',
      accentHover: '#D946EF',
    },
    typography: {
      display: 'Space Grotesk',
      body: 'Inter'
    },
    animations: {
      entry: true,
      scroll: true,
      hover: true
    },
    sections: [
      {
        id: 'nav-2',
        type: 'navbar',
        layout: 'sticky-glass',
        visible: true,
        content: {
          logo: 'CYBER.NET',
          links: [
            { label: 'Nodes', href: '#nodes' },
            { label: 'Terminal', href: '#terminal' }
          ],
          ctaText: 'Connect Terminal'
        }
      },
      {
        id: 'hero-2',
        type: 'hero',
        layout: 'centered-glow',
        visible: true,
        content: {
          badge: '// WEB3 PROTOCOL ACTIVATED',
          title: 'Constructing the ',
          highlightText: 'Next Generation Matrix',
          description: 'De-centralized edge computing grids with ultra-low latency, quantum encryption standards, and native automated liquidity protocols. Enter the cyberpunk meta-layer.',
          ctaPrimaryText: 'Execute Node [G-19]',
          ctaSecondaryText: 'Query Sandbox',
          imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
        }
      },
      {
        id: 'features-2',
        type: 'features',
        layout: 'simple-3col',
        visible: true,
        content: {
          title: 'Core Protocol Modules',
          subtitle: 'Execute high-throughput node applications with zero overhead.',
          items: [
            { icon: '👾', title: 'Quantum Compute', desc: 'Leverage multi-threaded quantum calculations over distributed ledger nodes at a fraction of the cost.' },
            { icon: '🔒', title: 'Encrypted Vaults', desc: 'Double-blind zero-knowledge proofs verify execution validity without leaking metadata, headers, or state.' },
            { icon: '🌐', title: 'Neon Routing', desc: 'Dynamically load-balanced routers adapt routing targets within milliseconds, bypassing congested pathways.' }
          ]
        }
      },
      {
        id: 'contact-2',
        type: 'contact',
        layout: 'terminal-auth',
        visible: true,
        content: {
          title: 'CONSOLE TERMINAL',
          subtitle: 'Configure Wallet Address to sync communication channels.',
          buttonText: 'INITIALIZE SYNC',
          formType: 'wallet'
        }
      },
      {
        id: 'footer-2',
        type: 'footer',
        layout: 'minimal-mono',
        visible: true,
        content: {
          copyright: 'CYBER.NET // ALL SYSTEM OK.'
        }
      }
    ]
  },
  {
    id: 'minimalist',
    name: 'Sophisticated Minimalist',
    niche: 'Creative Agency, Designer, & Architect',
    theme: 'minimalist',
    colors: {
      bgPrimary: '#FAFFAFA',
      bgSecondary: '#F4F4F5',
      border: '#E4E4E7',
      textPrimary: '#09090B',
      textSecondary: '#71717A',
      accent: '#C2410C',
      accentHover: '#EA580C',
    },
    typography: {
      display: 'Playfair Display',
      body: 'Plus Jakarta Sans'
    },
    animations: {
      entry: true,
      scroll: true,
      hover: true
    },
    sections: [
      {
        id: 'nav-3',
        type: 'navbar',
        layout: 'floating-pill',
        visible: true,
        content: {
          logo: 'Studio Minimal',
          links: [
            { label: 'Work', href: '#work' },
            { label: 'Contact', href: '#contact' }
          ],
          ctaText: 'Inquire'
        }
      },
      {
        id: 'hero-3',
        type: 'hero',
        layout: 'minimalist-editorial',
        visible: true,
        content: {
          badge: '// CREATIVE PARTNER',
          title: 'We craft structures that combine ',
          highlightText: 'clarity, rhythm, and purpose',
          description: 'A design agency specialized in constructing clean, functional digital platforms. We believe that stripping away noise reveals the essence of high-impact products.',
          ctaPrimaryText: 'View Work',
          ctaSecondaryText: 'Start Project',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        }
      },
      {
        id: 'showcase-3',
        type: 'showcase',
        layout: 'cards-carousel',
        visible: true,
        content: {
          title: 'Selected Studies',
          items: [
            { imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', title: 'Villa Concrete', category: 'MODEL // 2026' },
            { imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', title: 'Object Red', category: 'SAAS // 2026' },
            { imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', title: 'Minimal Chronograph', category: 'GADGET // 2026' }
          ]
        }
      },
      {
        id: 'contact-3',
        type: 'contact',
        layout: 'email-form',
        visible: true,
        content: {
          title: 'Start a Project',
          subtitle: 'Drop us a line and tell us about your project parameters.',
          buttonText: 'Submit Request',
          formType: 'project'
        }
      },
      {
        id: 'footer-3',
        type: 'footer',
        layout: 'minimal-mono',
        visible: true,
        content: {
          copyright: 'STUDIO MINIMAL. ALL RIGHTS RESERVED.'
        }
      }
    ]
  },
  {
    id: 'corporate',
    name: 'Clean Corporate',
    niche: 'SaaS Startups & Modern Enterprise',
    theme: 'corporate',
    colors: {
      bgPrimary: '#0F172A',
      bgSecondary: '#1E293B',
      border: 'rgba(255, 255, 255, 0.08)',
      textPrimary: '#F8FAF6',
      textSecondary: '#94A3B8',
      accent: '#10B981',
      accentHover: '#34D399',
    },
    typography: {
      display: 'Outfit',
      body: 'Plus Jakarta Sans'
    },
    animations: {
      entry: true,
      scroll: true,
      hover: true
    },
    sections: [
      {
        id: 'nav-4',
        type: 'navbar',
        layout: 'sticky-glass',
        visible: true,
        content: {
          logo: 'EnterpriseSync',
          links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Demo', href: '#demo' }
          ],
          ctaText: 'Request Demo'
        }
      },
      {
        id: 'hero-4',
        type: 'hero',
        layout: 'split-right',
        visible: true,
        content: {
          badge: '📈 Enterprise Productivity Suite',
          title: 'Scale Operations with ',
          highlightText: 'Clean Automation',
          description: 'Consolidate your logs, data models, email automations, and files uploads into a unified production-grade command center. Built for secure enterprise operations.',
          ctaPrimaryText: 'Start 14-Day Free Trial',
          ctaSecondaryText: 'Speak to Architect',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
        }
      },
      {
        id: 'stats-4',
        type: 'stats',
        layout: 'horizontal-marquee',
        visible: true,
        content: {
          title: 'Infrastructure Integrity',
          items: [
            { value: '99.99%', label: 'Uptime SLA' },
            { value: '250M+', label: 'Requests/Day' },
            { value: '< 15ms', label: 'Average Latency' },
            { value: 'SOC2', label: 'Security Hardened' }
          ]
        }
      },
      {
        id: 'pricing-4',
        type: 'pricing',
        layout: 'cards-3tier',
        visible: true,
        content: {
          title: 'Flexible Plans for Scaling Teams',
          subtitle: 'Choose a package that aligns with your operational workloads.',
          items: [
            { name: 'Developer', price: '$29', period: '/mo', desc: 'Essential automation templates for single developers.', features: ['1 Core Integration', '10,000 requests', 'Community Support'], highlighted: false },
            { name: 'Scale-up', price: '$79', period: '/mo', desc: 'Production-ready servers for fast growing companies.', features: ['10 Integrations', '250,000 requests', 'Prioritized Support', '99.9% Uptime SLA'], highlighted: true },
            { name: 'Enterprise', price: '$299', period: '/mo', desc: 'Secure clusters matching bank-level metrics.', features: ['Unlimited Integrations', 'Multi-tenant networks', '24/7 Architect Hotline', 'SOC2 Reporting'], highlighted: false }
          ]
        }
      },
      {
        id: 'contact-4',
        type: 'contact',
        layout: 'email-form',
        visible: true,
        content: {
          title: 'Deploy Custom Sandbox',
          subtitle: 'Ready to analyze deployment topologies? Submit your organization metrics below.',
          buttonText: 'Deploy Sandbox',
          formType: 'company'
        }
      },
      {
        id: 'footer-4',
        type: 'footer',
        layout: 'sitemap-multi',
        visible: true,
        content: {
          copyright: 'EnterpriseSync. All systems operational.'
        }
      }
    ]
  }
];

// Helper to escape text for template literal insertion
const cleanText = (str) => {
  if (!str) return '';
  return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
};

export function generateJSX(config) {
  const cssVars = `
  const cssVariables = {
    '--bg-primary': '${config.colors.bgPrimary || '#0d0d1a'}',
    '--bg-secondary': '${config.colors.bgSecondary || '#12121f'}',
    '--bg-card': '${config.colors.bgSecondary || '#12121f'}',
    '--border': '${config.colors.border || 'rgba(255, 255, 255, 0.08)'}',
    '--text-primary': '${config.colors.textPrimary || '#f0f0ff'}',
    '--text-secondary': '${config.colors.textSecondary || '#9a9ab0'}',
    '--accent': '${config.colors.accent || '#6366f1'}',
    '--accent-hover': '${config.colors.accentHover || '#4f52e0'}',
    '--accent-light': '${config.colors.accent || '#6366f1'}20',
    '--font-display': "'${config.typography.display}', sans-serif",
    '--font-sans': "'${config.typography.body}', sans-serif",
  };`;

  const sectionsJSX = config.sections
    .filter(s => s.visible)
    .map(s => compileSectionCode(s, 'jsx'))
    .join('\n');

  return `import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GeneratedLandingPage() {
  const containerRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  ${cssVars}

  useGSAP(() => {
    // Page Entry Animation
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
    tl.from('.hero-badge-anim', { opacity: 0, y: -20 })
      .from('.hero-title-anim span', { y: '100%', stagger: 0.1 }, '-=0.8')
      .from('.hero-desc-anim', { opacity: 0, y: 20 }, '-=0.8')
      .from('.hero-cta-anim', { opacity: 0, scale: 0.9, stagger: 0.15 }, '-=0.8')
      .from('.hero-img-anim', { opacity: 0, scale: 1.03, y: 30 }, '-=1.0');

    // Scroll Trigger reveals
    gsap.from('.card-reveal', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.scroll-trigger-start',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });
  }, { scope: containerRef });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue) {
      setSubmitted(true);
      setInputValue('');
    }
  };

  return (
    <div 
      ref={containerRef} 
      style={cssVariables}
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans relative overflow-hidden"
    >
      {/* Visual background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-gradient-to-b from-[var(--accent)]/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--accent)_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02] pointer-events-none z-0" />

      ${sectionsJSX}

    </div>
  );
}`;
}

export function generateTSX(config) {
  const cssVars = `
  const cssVariables: React.CSSProperties = {
    '--bg-primary': '${config.colors.bgPrimary || '#0d0d1a'}',
    '--bg-secondary': '${config.colors.bgSecondary || '#12121f'}',
    '--bg-card': '${config.colors.bgSecondary || '#12121f'}',
    '--border': '${config.colors.border || 'rgba(255, 255, 255, 0.08)'}',
    '--text-primary': '${config.colors.textPrimary || '#f0f0ff'}',
    '--text-secondary': '${config.colors.textSecondary || '#9a9ab0'}',
    '--accent': '${config.colors.accent || '#6366f1'}',
    '--accent-hover': '${config.colors.accentHover || '#4f52e0'}',
    '--accent-light': '${config.colors.accent || '#6366f1'}20',
    '--font-display': "'${config.typography.display}', sans-serif",
    '--font-sans': "'${config.typography.body}', sans-serif",
  } as any;`;

  const sectionsJSX = config.sections
    .filter(s => s.visible)
    .map(s => compileSectionCode(s, 'tsx'))
    .join('\n');

  return `import React, { useState, useRef, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GeneratedLandingPage(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  ${cssVars}

  useGSAP(() => {
    // Page Entry Animation
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
    tl.from('.hero-badge-anim', { opacity: 0, y: -20 })
      .from('.hero-title-anim span', { y: '100%', stagger: 0.1 }, '-=0.8')
      .from('.hero-desc-anim', { opacity: 0, y: 20 }, '-=0.8')
      .from('.hero-cta-anim', { opacity: 0, scale: 0.9, stagger: 0.15 }, '-=0.8')
      .from('.hero-img-anim', { opacity: 0, scale: 1.03, y: 30 }, '-=1.0');

    // Scroll Trigger reveals
    gsap.from('.card-reveal', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.scroll-trigger-start',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });
  }, { scope: containerRef });

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (inputValue) {
      setSubmitted(true);
      setInputValue('');
    }
  };

  return (
    <div 
      ref={containerRef} 
      style={cssVariables}
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans relative overflow-hidden"
    >
      {/* Visual background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-gradient-to-b from-[var(--accent)]/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--accent)_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02] pointer-events-none z-0" />

      ${sectionsJSX}

    </div>
  );
}`;
}

// Section Code Compilers
function compileSectionCode(section, format) {
  const content = section.content || {};
  
  switch (section.type) {
    case 'navbar':
      if (section.layout === 'floating-pill') {
        return `
      {/* Floating Pill Navbar */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="flex justify-between items-center bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border)] py-3 px-6 rounded-full shadow-lg">
          <Link to="/" className="text-lg font-bold tracking-tight bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
            ${cleanText(content.logo)}
          </Link>
          <nav className="hidden md:flex gap-6 text-sm text-[var(--text-secondary)] font-medium">
            ${(content.links || []).map(l => `<a href="${l.href}" className="hover:text-[var(--accent)] transition-colors">${cleanText(l.label)}</a>`).join('\n            ')}
          </nav>
          <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors">
            ${cleanText(content.ctaText)}
          </button>
        </div>
      </header>
        `;
      }
      return `
      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)] py-4 px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
          ${cleanText(content.logo)}
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-[var(--text-secondary)]">
          ${(content.links || []).map(l => `<a href="${l.href}" className="hover:text-[var(--accent)] transition-colors">${cleanText(l.label)}</a>`).join('\n          ')}
        </nav>
        <button className="px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-[var(--bg-primary)] hover:opacity-95 transition-opacity">
          ${cleanText(content.ctaText)}
        </button>
      </header>
      `;

    case 'hero':
      if (section.layout === 'split-right') {
        return `
      {/* Split Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-left">
          <span className="hero-badge-anim inline-block px-3 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold tracking-wider uppercase">
            ${cleanText(content.badge)}
          </span>
          <h1 className="hero-title-anim text-4xl md:text-6xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="block overflow-hidden py-1">${cleanText(content.title)}</span>
            <span className="block bg-gradient-to-r from-[var(--accent)] via-[var(--accent-hover)] to-[var(--text-primary)] bg-clip-text text-transparent font-black leading-none">
              ${cleanText(content.highlightText)}
            </span>
          </h1>
          <p className="hero-desc-anim text-[var(--text-secondary)] text-lg leading-relaxed max-w-lg">
            ${cleanText(content.description)}
          </p>
          <div className="hero-cta-anim flex flex-wrap gap-4 pt-2">
            <button className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] font-bold rounded-xl transition-colors shadow-lg shadow-[var(--accent)]/20">
              ${cleanText(content.ctaPrimaryText)}
            </button>
            <button className="px-6 py-3 border border-[var(--border)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
              ${cleanText(content.ctaSecondaryText)}
            </button>
          </div>
        </div>

        <div className="hero-img-anim bg-[var(--bg-secondary)] border border-[var(--border)] p-4 rounded-2xl shadow-2xl relative overflow-hidden max-w-lg mx-auto w-full aspect-video md:aspect-[4/3] flex items-center justify-center">
          ${content.imageUrl ? `<img src="${content.imageUrl}" alt="Mockup" className="w-full h-full object-cover rounded-xl" />` : `
          <div className="space-y-3 w-full">
            <div className="h-6 bg-white/5 rounded w-1/3" />
            <div className="h-20 bg-white/5 rounded" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-10 bg-white/5 rounded" />
              <div className="h-10 bg-white/5 rounded" />
              <div className="h-10 bg-white/5 rounded" />
            </div>
          </div>`}
        </div>
      </section>
        `;
      }
      
      if (section.layout === 'minimalist-editorial') {
        return `
      {/* Minimalist Editorial Hero */}
      <section className="relative z-10 container mx-auto px-6 py-28 md:py-36 max-w-4xl text-left flex flex-col gap-6">
        <span className="hero-badge-anim text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          ${cleanText(content.badge)}
        </span>
        <h1 className="hero-title-anim text-4xl md:text-7xl font-light tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          ${cleanText(content.title)} <span className="italic font-normal text-[var(--accent)]">${cleanText(content.highlightText)}</span>.
        </h1>
        <p className="hero-desc-anim text-[var(--text-secondary)] text-lg md:text-xl font-light leading-relaxed max-w-2xl mt-4">
          ${cleanText(content.description)}
        </p>
        <div className="hero-cta-anim flex flex-wrap gap-4 pt-6">
          <button className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-semibold tracking-wider uppercase hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition-all">
            ${cleanText(content.ctaPrimaryText)}
          </button>
        </div>
      </section>
        `;
      }

      return `
      {/* Centered Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-24 pb-16 text-center flex flex-col items-center gap-6">
        <span className="hero-badge-anim px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 text-xs text-[var(--accent-hover)] tracking-wider uppercase font-semibold">
          ${cleanText(content.badge)}
        </span>
        <h1 className="hero-title-anim text-4xl md:text-7xl font-black tracking-tight max-w-4xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="block overflow-hidden py-1">${cleanText(content.title)}</span>
          <span className="block bg-gradient-to-r from-[var(--accent)] via-[var(--accent-hover)] to-[var(--text-primary)] bg-clip-text text-transparent">
            ${cleanText(content.highlightText)}
          </span>
        </h1>
        <p className="hero-desc-anim text-[var(--text-secondary)] text-lg md:text-xl max-w-2xl leading-relaxed mt-2">
          ${cleanText(content.description)}
        </p>

        <div className="hero-cta-anim flex flex-wrap gap-4 justify-center mt-4">
          <button className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-[var(--bg-primary)] shadow-[0_4px_20px_rgba(212,175,55,0.15)] hover:translate-y-[-2px] transition-all">
            ${cleanText(content.ctaPrimaryText)}
          </button>
          <button className="px-8 py-3.5 rounded-xl font-bold bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-colors">
            ${cleanText(content.ctaSecondaryText)}
          </button>
        </div>

        ${content.imageUrl ? `
        <div className="hero-img-anim w-full max-w-4xl aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--border)] mt-12 bg-[var(--bg-secondary)] relative shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <img 
            src="${content.imageUrl}" 
            alt="Dashboard" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
        </div>` : ''}
      </section>
      `;

    case 'features':
      return `
      {/* Features Grid */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-24 border-t border-[var(--border)] scroll-trigger-start">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>${cleanText(content.title)}</h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">${cleanText(content.subtitle)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${(content.items || []).map((item, idx) => `
          <div key="${idx}" className="card-reveal bg-[var(--bg-secondary)] border border-[var(--border)] p-8 rounded-2xl transition-all duration-300 hover:border-[var(--accent)]/30 group">
            <div className="text-3xl mb-4 text-[var(--accent)]">${cleanText(item.icon)}</div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>${cleanText(item.title)}</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">${cleanText(item.desc)}</p>
          </div>`).join('\n          ')}
        </div>
      </section>
      `;

    case 'showcase':
      return `
      {/* Portfolio/Showcase Grid */}
      <section id="showcase" className="relative z-10 container mx-auto px-6 py-24 border-t border-[var(--border)]">
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>${cleanText(content.title)}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${(content.items || []).map((item, idx) => `
          <div key="${idx}" className="group space-y-4">
            <div className="aspect-[4/5] bg-[var(--bg-secondary)] overflow-hidden relative border border-[var(--border)] rounded-2xl">
              <img 
                src="${item.imageUrl}" 
                alt="${cleanText(item.title)}" 
                className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-lg text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>${cleanText(item.title)}</h3>
              <span className="text-xs font-mono text-[var(--text-secondary)]">${cleanText(item.category)}</span>
            </div>
          </div>`).join('\n          ')}
        </div>
      </section>
      `;

    case 'stats':
      return `
      {/* Stats Section */}
      <section id="features" className="relative z-10 bg-[var(--bg-secondary)]/50 py-16 border-y border-[var(--border)] text-center">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          ${(content.items || []).map((item, idx) => `
          <div key="${idx}">
            <div className="text-3xl md:text-4xl font-extrabold text-[var(--accent)]" style={{ fontFamily: 'var(--font-display)' }}>${cleanText(item.value)}</div>
            <div className="text-[var(--text-secondary)] text-sm mt-1">${cleanText(item.label)}</div>
          </div>`).join('\n          ')}
        </div>
      </section>
      `;

    case 'pricing':
      return `
      {/* Pricing Table */}
      <section id="pricing" className="relative z-10 container mx-auto px-6 py-24 border-t border-[var(--border)]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>${cleanText(content.title)}</h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">${cleanText(content.subtitle)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          ${(content.items || []).map((plan, idx) => `
          <div 
            key="${idx}" 
            className={"bg-[var(--bg-secondary)] border rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 hover:scale-[1.01] " + (
              plan.highlighted ? "border-[var(--accent)] shadow-xl shadow-[var(--accent)]/5 md:-translate-y-4 z-10" : "border-[var(--border)]"
            )}
          >
            {plan.highlighted && (
              <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-[var(--accent)] text-[var(--bg-primary)] font-bold text-xs uppercase rounded-full">
                Most Popular
              </span>
            )}
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">${cleanText(plan.name)}</h3>
              <p className="text-[var(--text-secondary)] text-xs mb-6">${cleanText(plan.desc)}</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-black text-[var(--text-primary)]">${cleanText(plan.price)}</span>
                <span className="text-[var(--text-secondary)] text-sm ml-1">${cleanText(plan.period)}</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-[var(--text-secondary)]">
                ${(plan.features || []).map(f => `<li className="flex items-center gap-2">✓ ${cleanText(f)}</li>`).join('\n                ')}
              </ul>
            </div>
            <button className={"w-full py-3 font-semibold rounded-xl transition-all " + (
              plan.highlighted ? "bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)]" : "bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-white/5"
            )}>
              Get Started
            </button>
          </div>`).join('\n          ')}
        </div>
      </section>
      `;

    case 'contact':
      if (section.layout === 'terminal-auth') {
        return `
      {/* Cyberpunk Terminal Form */}
      <section id="terminal" className="relative z-10 container mx-auto px-6 py-16 max-w-xl bg-[var(--bg-secondary)] border border-[var(--accent)]/20 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] my-16">
        <div className="flex justify-between items-center border-b border-[var(--accent)]/20 pb-4 mb-6 font-mono text-xs text-[var(--text-secondary)]">
          <span>CONSOLE TERMINAL</span>
          <span className="text-[var(--accent)] animate-ping">●</span>
        </div>
        
        {submitted ? (
          <div className="text-center font-mono text-sm space-y-4 py-8">
            <p className="text-[var(--accent)] font-bold">// ACCESS GRANTED</p>
            <p className="text-[var(--text-secondary)] text-xs">Wallet Node linked successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div className="space-y-2">
              <label className="block text-xs uppercase text-[var(--text-secondary)] tracking-wider">Configure Wallet Address:</label>
              <input 
                type="text" 
                required
                placeholder="0x... or alphanumeric key"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-[var(--accent)] focus:outline-none focus:border-[var(--accent)] text-sm"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-[var(--accent)]/10 border border-[var(--accent)] text-[var(--accent)] font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition-all">
              ${cleanText(content.buttonText)}
            </button>
          </form>
        )}
      </section>
        `;
      }

      return `
      {/* Newsletter Form */}
      <section id="subscribe" className="relative z-10 container mx-auto px-6 py-20 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl my-12 max-w-4xl text-center">
        <h2 className="text-2xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>${cleanText(content.title)}</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">${cleanText(content.subtitle)}</p>
        
        {submitted ? (
          <div className="text-[var(--accent)] font-semibold text-lg py-4">
            ✓ Complete. Please check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              required
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-5 py-3.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm"
            />
            <button type="submit" className="px-6 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] font-bold rounded-xl transition-all">
              ${cleanText(content.buttonText)}
            </button>
          </form>
        )}
      </section>
      `;

    case 'footer':
      if (section.layout === 'sitemap-multi') {
        return `
      {/* Sitemap Multi Footer */}
      <footer className="border-t border-[var(--border)] py-16 bg-[var(--bg-secondary)]/30">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>Company</div>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><a href="#" className="hover:text-[var(--accent)]">About Us</a></li>
              <li><a href="#" className="hover:text-[var(--accent)]">Careers</a></li>
              <li><a href="#" className="hover:text-[var(--accent)]">Press</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>Resources</div>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><a href="#" className="hover:text-[var(--accent)]">Documentation</a></li>
              <li><a href="#" className="hover:text-[var(--accent)]">Guides</a></li>
              <li><a href="#" className="hover:text-[var(--accent)]">API Reference</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>Legal</div>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><a href="#" className="hover:text-[var(--accent)]">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[var(--accent)]">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[var(--accent)]">Security SLA</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>Connect</div>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><a href="#" className="hover:text-[var(--accent)]">Twitter / X</a></li>
              <li><a href="#" className="hover:text-[var(--accent)]">GitHub</a></li>
              <li><a href="#" className="hover:text-[var(--accent)]">Discord Node</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 border-t border-[var(--border)] pt-8 text-center text-xs text-[var(--text-secondary)]">
          <p>&copy; {new Date().getFullYear()} ${cleanText(content.copyright)}</p>
        </div>
      </footer>
        `;
      }

      return `
      {/* Minimal Footer */}
      <footer className="border-t border-[var(--border)] py-12 text-center text-[var(--text-secondary)] text-xs font-mono">
        <p>&copy; {new Date().getFullYear()} ${cleanText(content.copyright)}</p>
      </footer>
      `;

    default:
      return '';
  }
}
