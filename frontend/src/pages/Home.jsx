import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { defaultTemplates, generateJSX, generateTSX } from './designTemplates'

// Helper to copy code to clipboard
function copyToClipboard(text, callback) {
  navigator.clipboard.writeText(text).then(() => {
    callback(true)
    setTimeout(() => callback(false), 2000)
  }).catch(() => {
    alert('Failed to copy to clipboard.')
  })
}

export default function Home() {
  // Page configurations state
  const [pages, setPages] = useState([])
  const [activePageId, setActivePageId] = useState(null)
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [activeTab, setActiveTab] = useState('preview') // preview, jsx, tsx
  const [deviceView, setDeviceView] = useState('desktop') // desktop, tablet, mobile
  const [copied, setCopied] = useState(false)
  const [customizerTab, setCustomizerTab] = useState('style') // style, sections, edit-section
  
  // Terminal state for contact preview
  const [address, setAddress] = useState('')
  const [connected, setConnected] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [activeFaq, setActiveFaq] = useState(null)
  
  // Load pages from localStorage or load defaultTemplates
  useEffect(() => {
    const stored = localStorage.getItem('designer_pages')
    if (stored) {
      try {
        setPages(JSON.parse(stored))
      } catch (e) {
        setPages(defaultTemplates)
      }
    } else {
      setPages(defaultTemplates)
      localStorage.setItem('designer_pages', JSON.stringify(defaultTemplates))
    }
  }, [])

  // Sync back to localStorage
  const savePages = (updatedPages) => {
    setPages(updatedPages)
    localStorage.setItem('designer_pages', JSON.stringify(updatedPages))
  }

  // Active page selection
  const activePage = pages.find(p => p.id === activePageId)

  // Actions
  const handleCreatePage = (templateId = 'luxury-gold') => {
    const template = defaultTemplates.find(t => t.id === templateId) || defaultTemplates[0]
    const newPage = JSON.parse(JSON.stringify(template)) // deep copy
    newPage.id = `page_${Date.now()}`
    newPage.name = `My Custom ${newPage.name}`
    const updated = [...pages, newPage]
    savePages(updated)
    setActivePageId(newPage.id)
    setSelectedSectionId(null)
    setCustomizerTab('style')
  }

  const handleClonePage = (pageId, e) => {
    e.stopPropagation()
    const page = pages.find(p => p.id === pageId)
    if (!page) return
    const cloned = JSON.parse(JSON.stringify(page))
    cloned.id = `page_${Date.now()}`
    cloned.name = `${cloned.name} (Copy)`
    const updated = [...pages, cloned]
    savePages(updated)
  }

  const handleDeletePage = (pageId, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this page design?')) {
      const updated = pages.filter(p => p.id !== pageId)
      savePages(updated)
      if (activePageId === pageId) {
        setActivePageId(null)
      }
    }
  }

  const handleResetToDefault = () => {
    if (window.confirm('Reset this page to its default template structure?')) {
      const template = defaultTemplates.find(t => t.id === activePage?.theme) || defaultTemplates[0]
      const resetPage = JSON.parse(JSON.stringify(template))
      resetPage.id = activePage.id
      resetPage.name = activePage.name
      const updated = pages.map(p => p.id === activePage.id ? resetPage : p)
      savePages(updated)
      setSelectedSectionId(null)
      setCustomizerTab('style')
    }
  }

  const handleUpdatePageField = (field, value) => {
    if (!activePage) return
    const updatedPage = { ...activePage, [field]: value }
    const updated = pages.map(p => p.id === activePage.id ? updatedPage : p)
    savePages(updated)
  }

  const handleUpdateColor = (colorKey, hexValue) => {
    if (!activePage) return
    const updatedColors = { ...activePage.colors, [colorKey]: hexValue }
    handleUpdatePageField('colors', updatedColors)
  }

  const handleUpdateSectionContent = (sectionId, contentKey, value) => {
    if (!activePage) return
    const updatedSections = activePage.sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          content: {
            ...sec.content,
            [contentKey]: value
          }
        }
      }
      return sec
    })
    handleUpdatePageField('sections', updatedSections)
  }

  const handleSectionOrder = (index, direction) => {
    if (!activePage) return
    const newSections = [...activePage.sections]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newSections.length) return
    
    // Swap
    const temp = newSections[index]
    newSections[index] = newSections[targetIndex]
    newSections[targetIndex] = temp
    
    handleUpdatePageField('sections', newSections)
  }

  const handleToggleSectionVisibility = (sectionId) => {
    if (!activePage) return
    const newSections = activePage.sections.map(s => 
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    )
    handleUpdatePageField('sections', newSections)
  }

  const handleAddSection = (type) => {
    if (!activePage) return
    const newSection = {
      id: `sec_${Date.now()}`,
      type: type,
      layout: type === 'hero' ? 'centered-glow' : 
              type === 'navbar' ? 'sticky-glass' :
              type === 'contact' ? 'email-form' : 
              type === 'footer' ? 'minimal-mono' : 'simple-3col',
      visible: true,
      content: getSampleContentForType(type)
    }
    const updatedSections = [...activePage.sections, newSection]
    handleUpdatePageField('sections', updatedSections)
    setSelectedSectionId(newSection.id)
    setCustomizerTab('edit-section')
  }

  const handleDeleteSection = (sectionId) => {
    if (!activePage) return
    const newSections = activePage.sections.filter(s => s.id !== sectionId)
    handleUpdatePageField('sections', newSections)
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null)
      setCustomizerTab('sections')
    }
  }

  const getSampleContentForType = (type) => {
    switch(type) {
      case 'navbar':
        return { logo: 'LOGO.IO', links: [{ label: 'Home', href: '#' }, { label: 'Features', href: '#features' }], ctaText: 'Get Code' }
      case 'hero':
        return { badge: '✨ NEW DESIGN LAUNCH', title: 'Start Building Live Layouts', highlightText: 'Instantly', description: 'Modify this paragraph and select custom presets to preview dynamic color variables on mobile screens.', ctaPrimaryText: 'Get Started', ctaSecondaryText: 'Sandbox', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' }
      case 'features':
        return { title: 'Modular Capabilities', subtitle: 'Fully extensible blocks designed for responsive applications.', items: [{ icon: '⚡', title: 'Real-time Sync', desc: 'Edits propagate immediately to code panels and device screens.' }, { icon: '📱', title: 'Responsive Grid', desc: 'Pre-tested grids collapse dynamically into stack layouts for phones.' }] }
      case 'stats':
        return { title: 'Metrics Integrity', items: [{ value: '99.9%', label: 'Mobile Score' }, { value: '0ms', label: 'Layout Shift' }] }
      case 'showcase':
        return { title: 'Interactive Showcase', items: [{ imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', title: 'Product One', category: 'GADGET' }] }
      case 'pricing':
        return { title: 'Scale-up pricing', subtitle: 'Simple pricing schemas configured dynamically.', items: [{ name: 'Basic', price: '$9', period: '/mo', desc: 'Single site licenses.', features: ['1 Site', 'Community Forum'], highlighted: false }, { name: 'Pro', price: '$29', period: '/mo', desc: 'Growth operations.', features: ['5 Sites', 'Priority Support', 'API Token'], highlighted: true }] }
      case 'testimonials':
        return { title: 'Verified Creator Feedback', items: [{ name: 'Sarah Chen', role: 'UX Architect', feedback: 'The inline CSS variables make styling dynamic templates a breeze. Absolutely jaw-dropping code outputs.', rating: 5 }] }
      case 'faq':
        return { title: 'Frequently Asked questions', items: [{ question: 'Is the generated output responsive?', answer: 'Yes! All elements stack vertically on mobile viewports using standard Tailwind CSS modifiers.' }] }
      case 'contact':
        return { title: 'Provision Sandbox', subtitle: 'Enter your credentials to verify security access logs.', buttonText: 'Launch Sandbox', formType: 'email' }
      case 'footer':
        return { copyright: 'MYAPP. ALL RIGHTS SECURED.' }
      default:
        return {}
    }
  }

  const handleCopy = () => {
    const code = activeTab === 'jsx' ? generateJSX(activePage) : generateTSX(activePage)
    copyToClipboard(code, setCopied)
  }

  return (
    <div className="min-h-screen bg-[#07070F] text-slate-100 flex flex-col font-sans">
      
      {/* ────────────────────────────────────────────────────────
          TOP CONTROL PANEL
          ──────────────────────────────────────────────────────── */}
      <header className="bg-neutral-900/95 border-b border-white/5 py-4 px-6 sticky top-0 z-50 flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {activePageId ? (
            <button 
              onClick={() => setActivePageId(null)}
              className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-neutral-950 text-xs font-semibold text-slate-300 transition-colors"
            >
              ← Back to Designs
            </button>
          ) : null}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-[#D4AF37]">⚜️</span> 
              {activePageId ? (
                <input 
                  type="text" 
                  value={activePage?.name || ''} 
                  onChange={(e) => handleUpdatePageField('name', e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-white/15 focus:border-[#D4AF37] focus:outline-none font-bold text-white py-0.5 px-1 rounded transition-colors text-base max-w-[200px]"
                />
              ) : 'Responsive Web Workspace'}
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
              {activePageId ? `${activePage?.niche} // edit settings` : 'Manage & Create Responsive Designs'}
            </p>
          </div>
        </div>

        {activePageId ? (
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-neutral-950 p-1 rounded-lg border border-white/5 text-xs font-semibold">
              <button 
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'preview' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                👁️ Live Design
              </button>
              <button 
                onClick={() => setActiveTab('jsx')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'jsx' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                💻 React JSX
              </button>
              <button 
                onClick={() => setActiveTab('tsx')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'tsx' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                ⚙️ React TSX
              </button>
            </div>

            {/* Responsive Viewport Switcher */}
            {activeTab === 'preview' && (
              <div className="flex bg-neutral-950 p-1 rounded-lg border border-white/5 text-xs font-semibold">
                <button 
                  onClick={() => setDeviceView('desktop')}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${deviceView === 'desktop' ? 'bg-[#D4AF37]/25 text-[#E2BD4A] border border-[#D4AF37]/30' : 'text-slate-400 hover:text-white border border-transparent'}`}
                  title="Monitor View"
                >
                  🖥️ <span className="hidden md:inline">Desktop</span>
                </button>
                <button 
                  onClick={() => setDeviceView('tablet')}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${deviceView === 'tablet' ? 'bg-[#D4AF37]/25 text-[#E2BD4A] border border-[#D4AF37]/30' : 'text-slate-400 hover:text-white border border-transparent'}`}
                  title="Tablet View"
                >
                  📟 <span className="hidden md:inline">Tablet</span>
                </button>
                <button 
                  onClick={() => setDeviceView('mobile')}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${deviceView === 'mobile' ? 'bg-[#D4AF37]/25 text-[#E2BD4A] border border-[#D4AF37]/30' : 'text-slate-400 hover:text-white border border-transparent'}`}
                  title="Mobile View"
                >
                  📱 <span className="hidden md:inline">Mobile</span>
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handleResetToDefault}
                className="px-3 py-2 bg-neutral-900 border border-white/10 hover:border-red-500/30 hover:bg-red-950/20 text-slate-300 hover:text-red-400 rounded-lg text-xs font-medium transition-all"
              >
                Reset
              </button>
              {activeTab !== 'preview' ? (
                <button 
                  onClick={handleCopy}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#E2BD4A] text-neutral-950 font-bold rounded-lg text-xs hover:opacity-95 shadow-md shadow-[#D4AF37]/10 active:scale-95 transition-all"
                >
                  {copied ? '✓ COPIED' : '📋 COPY CODE'}
                </button>
              ) : (
                <button 
                  onClick={() => setActiveTab('jsx')}
                  className="px-4 py-2 bg-white text-neutral-950 font-bold rounded-lg text-xs hover:bg-slate-100 transition-colors"
                >
                  🚀 Export Code
                </button>
              )}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => handleCreatePage('luxury-gold')}
            className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#E2BD4A] text-neutral-950 font-bold rounded-lg text-xs hover:opacity-95 shadow-lg shadow-[#D4AF37]/20 transition-all active:scale-95"
          >
            + Create New Page Design
          </button>
        )}
      </header>

      {/* ────────────────────────────────────────────────────────
          MAIN WORKSPACE LAYOUT
          ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden">
        
        {activePageId ? (
          /* ========================================================
             ACTIVE PAGE BUILDER WORKSPACE
             ======================================================== */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* LEFT SIDEBAR: CUSTOMIZER */}
            <aside className="w-full lg:w-[360px] bg-neutral-900 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col h-auto lg:h-full overflow-y-auto z-10 shrink-0">
              
              {/* Tabs selector */}
              <div className="flex border-b border-white/5 p-2 bg-neutral-950 text-xs font-semibold">
                <button 
                  onClick={() => setCustomizerTab('style')}
                  className={`flex-1 py-2 rounded-md transition-all text-center ${customizerTab === 'style' ? 'bg-white/5 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  🎨 Style & Theme
                </button>
                <button 
                  onClick={() => setCustomizerTab('sections')}
                  className={`flex-1 py-2 rounded-md transition-all text-center ${customizerTab === 'sections' ? 'bg-white/5 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  🧱 Sections List
                </button>
                {selectedSectionId && (
                  <button 
                    onClick={() => setCustomizerTab('edit-section')}
                    className={`flex-1 py-2 rounded-md transition-all text-center ${customizerTab === 'edit-section' ? 'bg-white/5 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    ✏️ Edit Section
                  </button>
                )}
              </div>

              {/* Tab Contents */}
              <div className="p-5 flex-1 flex flex-col gap-6">

                {/* 1. STYLE TAB */}
                {customizerTab === 'style' && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-semibold text-slate-500 font-mono">Website Niche</label>
                      <input 
                        type="text" 
                        value={activePage.niche} 
                        onChange={(e) => handleUpdatePageField('niche', e.target.value)}
                        placeholder="e.g. Agency, SaaS Showcase, Restaurant"
                        className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs uppercase font-semibold text-slate-500 font-mono">Theme Presets</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button 
                          onClick={() => {
                            const p = defaultTemplates.find(t => t.id === 'luxury-gold')
                            if (p) {
                              handleUpdatePageField('colors', p.colors)
                              handleUpdatePageField('typography', p.typography)
                            }
                          }}
                          className="p-2 border border-white/5 bg-neutral-950 rounded-lg hover:border-[#D4AF37] text-left transition-all"
                        >
                          ⚜️ Luxury Gold
                        </button>
                        <button 
                          onClick={() => {
                            const p = defaultTemplates.find(t => t.id === 'cyberpunk')
                            if (p) {
                              handleUpdatePageField('colors', p.colors)
                              handleUpdatePageField('typography', p.typography)
                            }
                          }}
                          className="p-2 border border-white/5 bg-neutral-950 rounded-lg hover:border-violet-500 text-left transition-all"
                        >
                          ⚡ Cyberpunk
                        </button>
                        <button 
                          onClick={() => {
                            const p = defaultTemplates.find(t => t.id === 'minimalist')
                            if (p) {
                              handleUpdatePageField('colors', p.colors)
                              handleUpdatePageField('typography', p.typography)
                            }
                          }}
                          className="p-2 border border-white/5 bg-neutral-950 rounded-lg hover:border-orange-500 text-left transition-all"
                        >
                          🌾 Minimalist
                        </button>
                        <button 
                          onClick={() => {
                            const p = defaultTemplates.find(t => t.id === 'corporate')
                            if (p) {
                              handleUpdatePageField('colors', p.colors)
                              handleUpdatePageField('typography', p.typography)
                            }
                          }}
                          className="p-2 border border-white/5 bg-neutral-950 rounded-lg hover:border-emerald-500 text-left transition-all"
                        >
                          📊 Corporate
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs uppercase font-semibold text-slate-500 font-mono">Custom Theme Colors</label>
                      <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-4 border border-white/5 rounded-xl text-xs">
                        <div className="flex flex-col gap-1">
                          <span>Primary BG:</span>
                          <div className="flex items-center gap-2">
                            <input type="color" value={activePage.colors.bgPrimary} onChange={(e) => handleUpdateColor('bgPrimary', e.target.value)} className="w-6 h-6 border-none cursor-pointer rounded" />
                            <span className="font-mono text-[10px]">{activePage.colors.bgPrimary}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span>Secondary BG:</span>
                          <div className="flex items-center gap-2">
                            <input type="color" value={activePage.colors.bgSecondary} onChange={(e) => handleUpdateColor('bgSecondary', e.target.value)} className="w-6 h-6 border-none cursor-pointer rounded" />
                            <span className="font-mono text-[10px]">{activePage.colors.bgSecondary}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                          <span>Accent Link:</span>
                          <div className="flex items-center gap-2">
                            <input type="color" value={activePage.colors.accent} onChange={(e) => handleUpdateColor('accent', e.target.value)} className="w-6 h-6 border-none cursor-pointer rounded" />
                            <span className="font-mono text-[10px]">{activePage.colors.accent}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                          <span>Accent Hover:</span>
                          <div className="flex items-center gap-2">
                            <input type="color" value={activePage.colors.accentHover} onChange={(e) => handleUpdateColor('accentHover', e.target.value)} className="w-6 h-6 border-none cursor-pointer rounded" />
                            <span className="font-mono text-[10px]">{activePage.colors.accentHover}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 mt-2 col-span-2">
                          <span>Fine Border:</span>
                          <div className="flex items-center gap-2">
                            <input type="color" value={activePage.colors.border.startsWith('rgba') ? '#1c1c1e' : activePage.colors.border} onChange={(e) => handleUpdateColor('border', e.target.value)} className="w-6 h-6 border-none cursor-pointer rounded" />
                            <span className="font-mono text-[10px]">{activePage.colors.border}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs uppercase font-semibold text-slate-500 font-mono">Typography & Motion</label>
                      <div className="space-y-3 bg-neutral-950 p-4 border border-white/5 rounded-xl text-xs">
                        <div className="flex flex-col gap-1.5">
                          <span>Display Font:</span>
                          <select 
                            value={activePage.typography.display}
                            onChange={(e) => handleUpdatePageField('typography', { ...activePage.typography, display: e.target.value })}
                            className="bg-neutral-900 border border-white/10 rounded p-1.5 focus:outline-none"
                          >
                            <option value="Syne">Avant-Garde (Syne)</option>
                            <option value="Space Grotesk">Future Tech (Space Grotesk)</option>
                            <option value="Playfair Display">Editorial Serif (Playfair)</option>
                            <option value="Outfit">Clean Corporate (Outfit)</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-2">
                          <span>Body Font:</span>
                          <select 
                            value={activePage.typography.body}
                            onChange={(e) => handleUpdatePageField('typography', { ...activePage.typography, body: e.target.value })}
                            className="bg-neutral-900 border border-white/10 rounded p-1.5 focus:outline-none"
                          >
                            <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                            <option value="Inter">Inter</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                          <span>Enable Scroll Animations</span>
                          <input 
                            type="checkbox" 
                            checked={activePage.animations.scroll}
                            onChange={(e) => handleUpdatePageField('animations', { ...activePage.animations, scroll: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SECTIONS TAB */}
                {customizerTab === 'sections' && (
                  <div className="space-y-5 animate-fade-in-up">
                    <label className="text-xs uppercase font-semibold text-slate-500 font-mono block">Layout Sections</label>
                    <div className="space-y-2.5">
                      {activePage.sections.map((section, idx) => (
                        <div 
                          key={section.id} 
                          className={`flex items-center justify-between bg-neutral-950 border p-3.5 rounded-xl transition-colors cursor-pointer group ${selectedSectionId === section.id ? 'border-[#D4AF37] bg-neutral-900' : 'border-white/5 hover:border-white/10'}`}
                          onClick={() => {
                            setSelectedSectionId(section.id)
                            setCustomizerTab('edit-section')
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-xs font-mono">#{idx+1}</span>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold capitalize text-stone-200">{section.type}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-mono">{section.layout}</span>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => handleSectionOrder(idx, -1)}
                              disabled={idx === 0}
                              className="text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none p-1 text-xs"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button 
                              onClick={() => handleSectionOrder(idx, 1)}
                              disabled={idx === activePage.sections.length - 1}
                              className="text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none p-1 text-xs"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <button 
                              onClick={() => handleToggleSectionVisibility(section.id)}
                              className={`p-1 text-xs ${section.visible ? 'text-green-400 hover:text-green-300' : 'text-red-500 hover:text-red-400'}`}
                              title={section.visible ? 'Hide Section' : 'Show Section'}
                            >
                              {section.visible ? '👁️' : '🕶️'}
                            </button>
                            <button 
                              onClick={() => handleDeleteSection(section.id)}
                              className="text-red-500 hover:text-red-400 p-1 text-xs"
                              title="Delete Section"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Section dropdown-like selector */}
                    <div className="border-t border-white/5 pt-4 mt-4 space-y-2.5">
                      <span className="text-xs uppercase font-semibold text-slate-500 font-mono block">Add New Section</span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                        {['navbar', 'hero', 'features', 'stats', 'showcase', 'pricing', 'testimonials', 'faq', 'contact', 'footer'].map(type => (
                          <button 
                            key={type}
                            onClick={() => handleAddSection(type)}
                            className="p-2 border border-white/5 bg-neutral-950 rounded-lg hover:border-[#D4AF37] hover:bg-neutral-900 transition-all text-left capitalize"
                          >
                            + {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EDIT SELECTED SECTION TAB */}
                {customizerTab === 'edit-section' && selectedSectionId && (
                  <div className="space-y-6 animate-fade-in-up">
                    {(() => {
                      const section = activePage.sections.find(s => s.id === selectedSectionId)
                      if (!section) return <p className="text-xs text-slate-500">No section selected</p>
                      
                      return (
                        <div className="space-y-5">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-xs uppercase font-bold text-[#D4AF37] font-mono capitalize">
                              Edit {section.type} Properties
                            </span>
                            <button 
                              onClick={() => setCustomizerTab('sections')}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              ← Back
                            </button>
                          </div>

                          {/* Layout select */}
                          <div className="space-y-2">
                            <label className="text-xs uppercase font-semibold text-slate-500 font-mono">Layout Style</label>
                            <select 
                              value={section.layout}
                              onChange={(e) => {
                                const newSecs = activePage.sections.map(s => s.id === selectedSectionId ? { ...s, layout: e.target.value } : s)
                                handleUpdatePageField('sections', newSecs)
                              }}
                              className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm focus:outline-none"
                            >
                              {section.type === 'navbar' && (
                                <>
                                  <option value="sticky-glass">Sticky Glassmorphic Navbar</option>
                                  <option value="floating-pill">Floating Pill Navbar</option>
                                </>
                              )}
                              {section.type === 'hero' && (
                                <>
                                  <option value="centered-glow">Centered radial glow Hero</option>
                                  <option value="split-right">Split Columns Hero (mockup on right)</option>
                                  <option value="minimalist-editorial">Minimalist text-heavy editorial Hero</option>
                                </>
                              )}
                              {section.type === 'features' && (
                                <>
                                  <option value="simple-3col">Simple 3-Column Grid Cards</option>
                                </>
                              )}
                              {section.type === 'showcase' && (
                                <>
                                  <option value="cards-carousel">Cards Grid Gallery</option>
                                </>
                              )}
                              {section.type === 'stats' && (
                                <>
                                  <option value="horizontal-marquee">Horizontal stats marquee</option>
                                </>
                              )}
                              {section.type === 'pricing' && (
                                <>
                                  <option value="cards-3tier">Highlighted 3-tier card Comparison</option>
                                </>
                              )}
                              {section.type === 'contact' && (
                                <>
                                  <option value="email-form">Clean Email Focus newsletter form</option>
                                  <option value="terminal-auth">Terminal dashboard wallet connector</option>
                                </>
                              )}
                              {section.type === 'footer' && (
                                <>
                                  <option value="minimal-mono">Minimal centered row copyright</option>
                                  <option value="sitemap-multi">Multi-column Sitemap list footer</option>
                                </>
                              )}
                            </select>
                          </div>

                          {/* Dynamic Inputs based on section content */}
                          <div className="space-y-4 pt-2 border-t border-white/5">
                            {/* Logo for navbar */}
                            {section.content.logo !== undefined && (
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Logo Text</label>
                                <input type="text" value={section.content.logo} onChange={e => handleUpdateSectionContent(section.id, 'logo', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm" />
                              </div>
                            )}

                            {/* Badge */}
                            {section.content.badge !== undefined && (
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Badge/Tagline</label>
                                <input type="text" value={section.content.badge} onChange={e => handleUpdateSectionContent(section.id, 'badge', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm" />
                              </div>
                            )}

                            {/* Title */}
                            {section.content.title !== undefined && (
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Header Title</label>
                                <input type="text" value={section.content.title} onChange={e => handleUpdateSectionContent(section.id, 'title', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm" />
                              </div>
                            )}

                            {/* Highlight text */}
                            {section.content.highlightText !== undefined && (
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Highlighted / Gradient Title Text</label>
                                <input type="text" value={section.content.highlightText} onChange={e => handleUpdateSectionContent(section.id, 'highlightText', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm" />
                              </div>
                            )}

                            {/* Subtitle */}
                            {section.content.subtitle !== undefined && (
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Section Subtitle</label>
                                <input type="text" value={section.content.subtitle} onChange={e => handleUpdateSectionContent(section.id, 'subtitle', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm" />
                              </div>
                            )}

                            {/* Description */}
                            {section.content.description !== undefined && (
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Description Body Text</label>
                                <textarea rows="3" value={section.content.description} onChange={e => handleUpdateSectionContent(section.id, 'description', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm font-sans" />
                              </div>
                            )}

                            {/* Image URL */}
                            {section.content.imageUrl !== undefined && (
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Asset / Image URL</label>
                                <input type="text" value={section.content.imageUrl} onChange={e => handleUpdateSectionContent(section.id, 'imageUrl', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm font-mono text-xs" />
                              </div>
                            )}

                            {/* CTA buttons */}
                            {section.content.ctaPrimaryText !== undefined && (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-xs text-slate-400">Primary Button</label>
                                  <input type="text" value={section.content.ctaPrimaryText} onChange={e => handleUpdateSectionContent(section.id, 'ctaPrimaryText', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs text-slate-400">Secondary Button</label>
                                  <input type="text" value={section.content.ctaSecondaryText} onChange={e => handleUpdateSectionContent(section.id, 'ctaSecondaryText', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm" />
                                </div>
                              </div>
                            )}

                            {/* CTA Navbar button */}
                            {section.type === 'navbar' && section.content.ctaText !== undefined && (
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Navbar Call To Action</label>
                                <input type="text" value={section.content.ctaText} onChange={e => handleUpdateSectionContent(section.id, 'ctaText', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm" />
                              </div>
                            )}

                            {/* Contact Submit button */}
                            {section.type === 'contact' && section.content.buttonText !== undefined && (
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Form Submit Button</label>
                                <input type="text" value={section.content.buttonText} onChange={e => handleUpdateSectionContent(section.id, 'buttonText', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm" />
                              </div>
                            )}

                            {/* Copyright */}
                            {section.content.copyright !== undefined && (
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Copyright Banner Text</label>
                                <input type="text" value={section.content.copyright} onChange={e => handleUpdateSectionContent(section.id, 'copyright', e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-sm" />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

              </div>
            </aside>

            {/* CENTER CANVAS & EXPORTER PANEL */}
            <div className="flex-1 flex flex-col bg-[#05050A] overflow-hidden relative">
              
              {activeTab === 'preview' ? (
                /* ────────────────────────────────────────────────────────
                   LIVE RESPONSIVE SIMULATION PREVIEW
                   ──────────────────────────────────────────────────────── */
                <div className="flex-1 overflow-auto p-6 flex justify-center items-start scrollbar-thin">
                  
                  <div className="w-full flex justify-center items-center py-6">
                    {/* Device outline triggers wrapper */}
                    <div className={`transition-all duration-300 bg-neutral-950 border border-white/10 relative shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-y-auto overflow-x-hidden ${
                      deviceView === 'mobile' ? 'w-[375px] h-[740px] rounded-[36px] border-[12px] border-neutral-800' :
                      deviceView === 'tablet' ? 'w-[768px] h-[960px] rounded-3xl border-[16px] border-neutral-800' :
                      'w-full min-h-[700px] border-x-0'
                    }`}>
                      
                      {/* Live rendered components inside simulation */}
                      <div 
                        style={{
                          '--bg-primary': activePage.colors.bgPrimary,
                          '--bg-secondary': activePage.colors.bgSecondary,
                          '--bg-card': activePage.colors.bgSecondary,
                          '--border': activePage.colors.border,
                          '--text-primary': activePage.colors.textPrimary,
                          '--text-secondary': activePage.colors.textSecondary,
                          '--accent': activePage.colors.accent,
                          '--accent-hover': activePage.colors.accentHover,
                          '--accent-light': `${activePage.colors.accent}15`,
                          '--font-display': `'${activePage.typography.display}', sans-serif`,
                          '--font-sans': `'${activePage.typography.body}', sans-serif`,
                          fontFamily: 'var(--font-sans)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          minHeight: '100%'
                        }}
                        className="relative w-full h-full flex flex-col text-left"
                      >
                        
                        {/* Radial background glows */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-gradient-to-b from-[var(--accent)]/10 to-transparent blur-[100px] pointer-events-none z-0" />
                        <div className="absolute inset-0 bg-[radial-gradient(var(--accent)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.02] pointer-events-none z-0" />

                        {activePage.sections
                          .filter(sec => sec.visible)
                          .map((sec) => (
                            <PreviewSection 
                              key={sec.id} 
                              section={sec} 
                              colors={activePage.colors}
                              typography={activePage.typography}
                              // Form actions state
                              address={address}
                              setAddress={setAddress}
                              connected={connected}
                              setConnected={setConnected}
                              emailInput={emailInput}
                              setEmailInput={setEmailInput}
                              emailSubmitted={emailSubmitted}
                              setEmailSubmitted={setEmailSubmitted}
                              activeFaq={activeFaq}
                              setActiveFaq={setActiveFaq}
                            />
                          ))
                        }

                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                /* ────────────────────────────────────────────────────────
                   STANDALONE EXPORT CODE VIEW PANEL
                   ──────────────────────────────────────────────────────── */
                <div className="flex-1 overflow-hidden flex flex-col p-6 animate-fade-in">
                  <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                    <div className="flex justify-between items-center bg-neutral-900 border-t border-x border-white/10 px-5 py-3 rounded-t-xl font-mono text-[10px] text-slate-400">
                      <span>EXPORTED_PAGE.{activeTab}</span>
                      <span>UTF-8 // READY FOR COPY & RUN</span>
                    </div>
                    <div className="bg-neutral-950 border border-white/10 rounded-b-xl flex-1 overflow-hidden relative shadow-2xl">
                      <button 
                        onClick={handleCopy}
                        className="absolute top-4 right-4 px-3 py-1.5 text-xs font-mono rounded-lg bg-neutral-900 border border-white/10 text-white hover:bg-neutral-800 transition-colors z-10"
                      >
                        {copied ? '✓ COPIED' : '📋 COPY'}
                      </button>
                      <pre className="p-6 overflow-auto h-full font-mono text-[11px] text-emerald-400 leading-relaxed scrollbar-thin select-all">
                        <code>
                          {activeTab === 'jsx' ? generateJSX(activePage) : generateTSX(activePage)}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          /* ========================================================
             WORKSPACE MANAGER PAGE LIST (n-PAGE DASHBOARD)
             ======================================================== */
          <div className="flex-1 overflow-auto p-8 max-w-6xl mx-auto w-full animate-fade-in">
            <div className="flex flex-col gap-2 mb-10 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-mono">
                ✨ Live Responsive Template Workspace
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                Configure Unlimited Web Designs
              </h2>
              <p className="text-slate-400 text-sm max-w-xl">
                Select one of the premium core starting structures below to entering the builder workspace. Modify color variables, change headings, configure forms, toggle viewports, and export code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pages.map((page) => (
                <div 
                  key={page.id} 
                  className="bg-neutral-900/80 border border-white/5 hover:border-white/10 p-6 rounded-2xl flex flex-col justify-between gap-6 shadow-xl transition-all hover:translate-y-[-2px] group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold text-stone-100 group-hover:text-[#D4AF37] transition-colors">{page.name}</h3>
                        <span className="text-xs text-slate-400">{page.niche}</span>
                      </div>
                      
                      {/* Small Swatch Preview */}
                      <div className="flex gap-1 bg-neutral-950 p-1.5 rounded-lg border border-white/5">
                        <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: page.colors.bgPrimary }} title="Primary BG" />
                        <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: page.colors.bgSecondary }} title="Secondary BG" />
                        <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: page.colors.accent }} title="Accent" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {page.sections.map((s) => (
                        <span key={s.id} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] uppercase tracking-wider text-stone-400 font-mono">
                          {s.type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleClonePage(page.id, e)}
                        className="px-3 py-1.5 bg-neutral-950 border border-white/5 hover:border-white/10 text-xs font-semibold rounded-lg text-slate-300 transition-colors"
                      >
                        👥 Clone
                      </button>
                      <button 
                        onClick={(e) => handleDeletePage(page.id, e)}
                        className="px-3 py-1.5 bg-neutral-950 border border-white/5 hover:border-red-500/30 text-xs font-semibold rounded-lg text-red-400 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        setActivePageId(page.id)
                        setSelectedSectionId(null)
                        setCustomizerTab('style')
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#E2BD4A] text-neutral-950 font-bold rounded-lg text-xs hover:opacity-95 shadow-md shadow-[#D4AF37]/5 transition-all"
                    >
                      Open Builder →
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Grid Card */}
              <div 
                onClick={() => handleCreatePage('luxury-gold')}
                className="border-2 border-dashed border-white/10 hover:border-[#D4AF37]/40 bg-neutral-900/20 hover:bg-neutral-900/40 p-8 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-[180px]"
              >
                <span className="text-3xl text-slate-400 group-hover:text-white">+</span>
                <span className="text-sm font-bold text-slate-300">Create New Landing Page Configuration</span>
                <span className="text-xs text-slate-500 text-center">Scaffold a responsive web layout styled to specifications.</span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

/* ============================================================================
   PREVIEW SECTION COMPONENT
   ============================================================================ */
function PreviewSection({ 
  section, colors, typography,
  address, setAddress, connected, setConnected,
  emailInput, setEmailInput, emailSubmitted, setEmailSubmitted,
  activeFaq, setActiveFaq
}) {
  const content = section.content || {}

  switch (section.type) {
    case 'navbar':
      if (section.layout === 'floating-pill') {
        return (
          <header className="relative w-full px-4 pt-4 pb-2 z-20">
            <div className="flex justify-between items-center bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border)] py-3 px-6 rounded-full shadow-lg">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
                {content.logo}
              </span>
              <nav className="hidden md:flex gap-6 text-sm text-[var(--text-secondary)] font-medium">
                {(content.links || []).map((l, i) => (
                  <a key={i} href={l.href} className="hover:text-[var(--accent)] transition-colors">{l.label}</a>
                ))}
              </nav>
              <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 transition-all">
                {content.ctaText}
              </button>
            </div>
          </header>
        )
      }
      return (
        <header className="sticky top-0 z-20 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)] py-4 px-6 md:px-12 flex justify-between items-center">
          <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
            {content.logo}
          </span>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-[var(--text-secondary)]">
            {(content.links || []).map((l, i) => (
              <a key={i} href={l.href} className="hover:text-[var(--accent)] transition-colors">{l.label}</a>
            ))}
          </nav>
          <button className="px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-[var(--bg-primary)] hover:opacity-95 transition-opacity">
            {content.ctaText}
          </button>
        </header>
      )

    case 'hero':
      if (section.layout === 'split-right') {
        return (
          <section className="relative z-10 container mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <span className="hero-badge-anim inline-block px-3 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold tracking-wider uppercase">
                {content.badge}
              </span>
              <h1 className="hero-title-anim text-4xl md:text-6xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {content.title}
                <span className="block bg-gradient-to-r from-[var(--accent)] via-[var(--accent-hover)] to-[var(--text-primary)] bg-clip-text text-transparent font-black">
                  {content.highlightText}
                </span>
              </h1>
              <p className="hero-desc-anim text-[var(--text-secondary)] text-base leading-relaxed">
                {content.description}
              </p>
              <div className="hero-cta-anim flex flex-wrap gap-4 pt-2">
                <button className="px-6 py-3 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-xl hover:opacity-95 transition-opacity shadow-lg shadow-[var(--accent)]/15">
                  {content.ctaPrimaryText}
                </button>
                <button className="px-6 py-3 border border-[var(--border)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                  {content.ctaSecondaryText}
                </button>
              </div>
            </div>

            <div className="hero-img-anim bg-[var(--bg-secondary)] border border-[var(--border)] p-4 rounded-2xl shadow-2xl relative overflow-hidden aspect-video md:aspect-[4/3] flex items-center justify-center">
              {content.imageUrl ? (
                <img src={content.imageUrl} alt="Dashboard mockup" className="w-full h-full object-cover rounded-xl opacity-90" />
              ) : (
                <div className="space-y-3 w-full opacity-50">
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                  <div className="h-16 bg-white/5 rounded" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-8 bg-white/5 rounded" />
                    <div className="h-8 bg-white/5 rounded" />
                    <div className="h-8 bg-white/5 rounded" />
                  </div>
                </div>
              )}
            </div>
          </section>
        )
      }
      
      if (section.layout === 'minimalist-editorial') {
        return (
          <section className="relative z-10 container mx-auto px-6 py-20 md:py-28 max-w-4xl text-left flex flex-col gap-6">
            <span className="hero-badge-anim text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              {content.badge}
            </span>
            <h1 className="hero-title-anim text-4xl md:text-7xl font-light tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {content.title} <span className="italic font-normal text-[var(--accent)]">{content.highlightText}</span>.
            </h1>
            <p className="hero-desc-anim text-[var(--text-secondary)] text-base md:text-lg font-light leading-relaxed max-w-2xl mt-2">
              {content.description}
            </p>
            <div className="hero-cta-anim flex flex-wrap gap-4 pt-4">
              <button className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-all">
                {content.ctaPrimaryText}
              </button>
            </div>
          </section>
        )
      }

      return (
        <section className="relative z-10 container mx-auto px-6 py-20 text-center flex flex-col items-center gap-6">
          <span className="hero-badge-anim px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 text-xs text-[var(--accent-hover)] tracking-wider uppercase font-semibold">
            {content.badge}
          </span>
          <h1 className="hero-title-anim text-4xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            {content.title}
            <span className="block bg-gradient-to-r from-[var(--accent)] via-[var(--accent-hover)] to-[var(--text-primary)] bg-clip-text text-transparent font-black mt-2">
              {content.highlightText}
            </span>
          </h1>
          <p className="hero-desc-anim text-[var(--text-secondary)] text-base md:text-lg max-w-2xl leading-relaxed">
            {content.description}
          </p>

          <div className="hero-cta-anim flex flex-wrap gap-4 justify-center mt-2">
            <button className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-[var(--bg-primary)] shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:translate-y-[-1px] transition-all">
              {content.ctaPrimaryText}
            </button>
            <button className="px-8 py-3.5 rounded-xl font-bold bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-colors">
              {content.ctaSecondaryText}
            </button>
          </div>

          {content.imageUrl && (
            <div className="hero-img-anim w-full max-w-4xl aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--border)] mt-10 bg-[var(--bg-secondary)] relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <img 
                src={content.imageUrl} 
                alt="Architecture" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
            </div>
          )}
        </section>
      )

    case 'features':
      return (
        <section id="features" className="relative z-10 container mx-auto px-6 py-16 border-t border-[var(--border)] scroll-trigger-start">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>{content.title}</h2>
            <p className="text-[var(--text-secondary)] text-sm max-w-lg mx-auto">{content.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(content.items || []).map((item, idx) => (
              <div key={idx} className="card-reveal bg-[var(--bg-secondary)] border border-[var(--border)] p-6 rounded-2xl transition-all duration-300 hover:border-[var(--accent)]/30">
                <div className="text-3xl mb-3 text-[var(--accent)]">{item.icon}</div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )

    case 'showcase':
      return (
        <section id="showcase" className="relative z-10 container mx-auto px-6 py-16 border-t border-[var(--border)]">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{content.title}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(content.items || []).map((item, idx) => (
              <div key={idx} className="space-y-3">
                <div className="aspect-[4/5] bg-[var(--bg-secondary)] overflow-hidden relative border border-[var(--border)] rounded-2xl">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-bold text-base text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )

    case 'stats':
      return (
        <section className="relative z-10 bg-[var(--bg-secondary)]/50 py-12 border-y border-[var(--border)] text-center">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {(content.items || []).map((item, idx) => (
              <div key={idx}>
                <div className="text-2xl md:text-3xl font-extrabold text-[var(--accent)]" style={{ fontFamily: 'var(--font-display)' }}>{item.value}</div>
                <div className="text-[var(--text-secondary)] text-xs mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </section>
      )

    case 'pricing':
      return (
        <section id="pricing" className="relative z-10 container mx-auto px-6 py-16 border-t border-[var(--border)]">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>{content.title}</h2>
            <p className="text-[var(--text-secondary)] text-xs max-w-lg mx-auto">{content.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-4xl mx-auto">
            {(content.items || []).map((plan, idx) => (
              <div 
                key={idx} 
                className={`bg-[var(--bg-secondary)] border rounded-2xl p-6 flex flex-col justify-between relative transition-all ${
                  plan.highlighted ? 'border-[var(--accent)] shadow-xl shadow-[var(--accent)]/5 scale-[1.01] z-10' : 'border-[var(--border)]'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-2.5 py-0.5 bg-[var(--accent)] text-[var(--bg-primary)] font-bold text-[9px] uppercase rounded-full">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{plan.name}</h3>
                  <p className="text-[var(--text-secondary)] text-[10px] mb-4">{plan.desc}</p>
                  <div className="flex items-baseline mb-4">
                    <span className="text-3xl font-black text-[var(--text-primary)]">{plan.price}</span>
                    <span className="text-[var(--text-secondary)] text-xs ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-xs text-[var(--text-secondary)]">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">✓ {f}</li>
                    ))}
                  </ul>
                </div>
                <button className={`w-full py-2.5 font-semibold text-xs rounded-xl transition-all ${
                  plan.highlighted ? 'bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90' : 'bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-white/5'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </section>
      )

    case 'contact':
      if (section.layout === 'terminal-auth') {
        return (
          <section id="terminal" className="relative z-10 container mx-auto px-6 py-12 max-w-md bg-[var(--bg-secondary)] border border-[var(--accent)]/20 rounded-2xl shadow-xl my-10 text-left">
            <div className="flex justify-between items-center border-b border-[var(--accent)]/20 pb-3 mb-4 font-mono text-[10px] text-[var(--text-secondary)]">
              <span>CONSOLE TERMINAL</span>
              <span className="text-[var(--accent)] animate-ping">●</span>
            </div>
            
            {connected ? (
              <div className="text-center font-mono text-xs space-y-3 py-6">
                <p className="text-[var(--accent)] font-bold">// ACCESS GRANTED</p>
                <p className="text-[var(--text-secondary)] text-[10px]">Wallet Node synced successfully.</p>
                <button onClick={() => setConnected(false)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded border border-[var(--border)] text-[10px]">
                  Disconnect
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (address) setConnected(true); }} className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase text-[var(--text-secondary)] tracking-wider">Configure Wallet Address:</label>
                  <input 
                    type="text" 
                    required
                    placeholder="0x... or keys"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--accent)] focus:outline-none focus:border-[var(--accent)] text-xs"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-[var(--accent)]/10 border border-[var(--accent)] text-[var(--accent)] font-bold uppercase tracking-wider text-[10px] rounded-lg hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition-all">
                  {content.buttonText}
                </button>
              </form>
            )}
          </section>
        )
      }

      return (
        <section id="subscribe" className="relative z-10 container mx-auto px-6 py-16 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl my-10 max-w-3xl text-center">
          <h2 className="text-xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>{content.title}</h2>
          <p className="text-[var(--text-secondary)] text-xs mb-6 max-w-md mx-auto">{content.subtitle}</p>
          
          {emailSubmitted ? (
            <div className="text-[var(--accent)] font-semibold text-sm py-2">
              ✓ Registration logged. Welcome aboard!
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (emailInput) setEmailSubmitted(true); }} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter email address" 
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-xs"
              />
              <button type="submit" className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] font-bold text-xs rounded-xl transition-all">
                {content.buttonText}
              </button>
            </form>
          )}
        </section>
      )

    case 'footer':
      if (section.layout === 'sitemap-multi') {
        return (
          <footer className="border-t border-[var(--border)] py-10 bg-[var(--bg-secondary)]/30 text-left">
            <div className="container mx-auto px-6 grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="font-bold text-xs uppercase text-stone-200 mb-2">Company</div>
                <ul className="space-y-1 text-[10px] text-[var(--text-secondary)]">
                  <li>About</li>
                  <li>Careers</li>
                </ul>
              </div>
              <div>
                <div className="font-bold text-xs uppercase text-stone-200 mb-2">Connect</div>
                <ul className="space-y-1 text-[10px] text-[var(--text-secondary)]">
                  <li>Twitter / X</li>
                  <li>GitHub</li>
                </ul>
              </div>
            </div>
            <div className="container mx-auto px-6 border-t border-[var(--border)] pt-4 text-center text-[9px] text-[var(--text-secondary)]">
              <p>&copy; {new Date().getFullYear()} {content.copyright}</p>
            </div>
          </footer>
        )
      }

      return (
        <footer className="border-t border-[var(--border)] py-8 text-center text-[var(--text-secondary)] text-[10px] font-mono">
          <p>&copy; {new Date().getFullYear()} {content.copyright}</p>
        </footer>
      )

    default:
      return null
  }
}
