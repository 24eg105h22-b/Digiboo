import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { themeDefinitions } from './themeLibrary'
import { getNaturePhotoPath, isNaturePhotoTheme } from './naturePhotoLibrary'
import './App.css'

const THEME_CATEGORIES = ['Classic', 'Retro', 'Party', 'Cute', 'Love']
const PHOTO_FILTER_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'bw', label: 'Black & White' },
  { value: 'warm', label: 'Warm Film' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'nineties', label: '90s' },
  { value: 'y2k', label: 'Y2K' },
  { value: 'soft', label: 'Soft Matte' },
  { value: 'contrast', label: 'High Contrast' },
  { value: 'grain', label: 'Grain' },
  { value: 'light-leak', label: 'Light Leak' },
  { value: 'cctv', label: 'CCTV' },
  { value: 'thermal', label: 'Thermal' },
  { value: 'night-vision', label: 'Night Vision' },
  { value: 'glitch', label: 'Glitch' },
]
const FRAME_OPTIONS = [
  { value: 'theme', label: 'Theme frame' },
  { value: 'none', label: 'No outer frame' },
  { value: 'keyline', label: 'Fine keyline' },
  { value: 'bold', label: 'Bold accent' },
  { value: 'dashed', label: 'Dashed ticket' },
]
const DESIGN_BACKGROUND_OPTIONS = [
  { value: 'theme', label: 'Theme default' },
  { value: 'theme-frame', label: 'Theme frame tint' },
  { value: 'theme-accent', label: 'Theme accent' },
  { value: 'solid-blush', label: 'Blush' },
  { value: 'solid-cream', label: 'Cream' },
  { value: 'solid-red', label: 'Deep red' },
  { value: 'solid-charcoal', label: 'Charcoal' },
  { value: 'solid-white', label: 'White' },
  { value: 'gradient-rose', label: 'Rose gradient' },
  { value: 'gradient-berry', label: 'Berry gradient' },
  { value: 'pattern-hearts', label: 'Heart print' },
  { value: 'pattern-stars', label: 'Star print' },
  { value: 'pattern-dots', label: 'Dot print' },
  { value: 'pattern-film', label: 'Film print' },
]
const CUSTOM_STICKERS = [
  { id: 'heart', label: 'Heart', category: 'Hearts', kind: 'hearts' },
  { id: 'heart-outline', label: 'Little love', category: 'Hearts', kind: 'heart-outline' },
  { id: 'star', label: 'Star', category: 'Stars', kind: 'sparkles' },
  { id: 'twinkle', label: 'Twinkle', category: 'Stars', kind: 'stars' },
  { id: 'flower', label: 'Flower', category: 'Flowers', kind: 'flowers' },
  { id: 'daisy', label: 'Daisy', category: 'Flowers', kind: 'daisy' },
  { id: 'confetti', label: 'Confetti', category: 'Party', kind: 'confetti' },
  { id: 'party-star', label: 'Party spark', category: 'Party', kind: 'pennants' },
  { id: 'tape', label: 'Tape', category: 'Retro', kind: 'tape' },
  { id: 'stamp', label: 'Stamp', category: 'Retro', kind: 'stamp' },
  { id: 'cap', label: 'Grad cap', category: 'College', kind: 'pennants' },
  { id: 'leaf', label: 'Leaf', category: 'Seasonal', kind: 'flowers' },
  { id: 'snow', label: 'Snow star', category: 'Seasonal', kind: 'sparkles' },
]
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024
const MAX_UPLOAD_SIZE = 30 * 1024 * 1024
const MAX_IMAGE_PIXELS = 40_000_000

const originalThemes = [
  {
    name: 'Silver Halide',
    category: 'Classic',
    description: 'Cream stock, quiet details, forever kind of light.',
    background: '#f5f2e8', frame: '#fffdf7', accent: '#c96e51', text: '#27362e',
    borderStyle: { kind: 'double', weight: 3, inset: 18, innerInset: 8 },
    decorationStyle: { kind: 'dots', size: 3, count: 5 },
    photoLayout: { aspectRatio: 1.33, gap: 16, inset: 9, captionHeight: 27, margin: 52 },
  },
  {
    name: 'Portrait Room',
    category: 'Classic',
    description: 'A little gallery polish for your favorite faces.',
    background: '#e8eee7', frame: '#fffefa', accent: '#bd775c', text: '#29483c',
    borderStyle: { kind: 'keyline', weight: 2, inset: 23, innerInset: 0 },
    decorationStyle: { kind: 'corners', size: 9, count: 4 },
    photoLayout: { aspectRatio: 1.2, gap: 19, inset: 12, captionHeight: 29, margin: 56 },
  },
  {
    name: 'Super 8',
    category: 'Retro',
    description: 'Faded film warmth with a little afterglow.',
    background: '#e9c99b', frame: '#f8edda', accent: '#b95c3e', text: '#633f31',
    borderStyle: { kind: 'film', weight: 3, inset: 18, innerInset: 8 },
    decorationStyle: { kind: 'sunburst', size: 10, count: 4 },
    photoLayout: { aspectRatio: 1.28, gap: 17, inset: 8, captionHeight: 25, margin: 52 },
  },
  {
    name: 'Sunday Contact Sheet',
    category: 'Retro',
    description: 'Contact-sheet labels and softroom nostalgia.',
    background: '#e0e4ce', frame: '#f7f3df', accent: '#b96f42', text: '#394a39',
    borderStyle: { kind: 'perforated', weight: 2, inset: 17, innerInset: 9 },
    decorationStyle: { kind: 'halftone', size: 2, count: 4 },
    photoLayout: { aspectRatio: 1.36, gap: 15, inset: 8, captionHeight: 28, margin: 52 },
  },
  {
    name: 'Disco Pop',
    category: 'Party',
    description: 'Mirror-ball shine, punchy color, zero chill.',
    background: '#ef735b', frame: '#fff1d0', accent: '#f4df73', text: '#fff5dd',
    borderStyle: { kind: 'ticket', weight: 6, inset: 16, innerInset: 8 },
    decorationStyle: { kind: 'confetti', size: 8, count: 8 },
    photoLayout: { aspectRatio: 1.32, gap: 15, inset: 8, captionHeight: 26, margin: 49 },
  },
  {
    name: 'After Hours',
    category: 'Party',
    description: 'Electric color for the night that ran long.',
    background: '#263c53', frame: '#f9e8d4', accent: '#ff8066', text: '#fff1d8',
    borderStyle: { kind: 'dashed', weight: 3, inset: 19, innerInset: 0 },
    decorationStyle: { kind: 'sparkles', size: 9, count: 6 },
    photoLayout: { aspectRatio: 1.22, gap: 18, inset: 10, captionHeight: 29, margin: 56 },
  },
  {
    name: 'Cherry Sprinkles',
    category: 'Cute',
    description: 'Soda-shop cherry red with extra sweetness.',
    background: '#f3d6cf', frame: '#fff8eb', accent: '#c94d51', text: '#773d48',
    borderStyle: { kind: 'scallop', weight: 3, inset: 18, innerInset: 8 },
    decorationStyle: { kind: 'flowers', size: 8, count: 4 },
    photoLayout: { aspectRatio: 1.31, gap: 17, inset: 9, captionHeight: 27, margin: 52 },
  },
  {
    name: 'Daisy Daydream',
    category: 'Cute',
    description: 'Soft sunshine, happy petals, little-day magic.',
    background: '#f4edc8', frame: '#fffbea', accent: '#75a77b', text: '#415b42',
    borderStyle: { kind: 'dotted', weight: 4, inset: 18, innerInset: 0 },
    decorationStyle: { kind: 'daisy', size: 8, count: 5 },
    photoLayout: { aspectRatio: 1.24, gap: 20, inset: 11, captionHeight: 30, margin: 55 },
  },
  {
    name: 'Varsity Yearbook',
    category: 'College',
    description: 'Letter-jacket green and yearbook gold.',
    background: '#275448', frame: '#f3eedb', accent: '#e0bd70', text: '#f6f0dc',
    borderStyle: { kind: 'stripe', weight: 4, inset: 18, innerInset: 8 },
    decorationStyle: { kind: 'pennants', size: 10, count: 5 },
    photoLayout: { aspectRatio: 1.33, gap: 15, inset: 8, captionHeight: 26, margin: 51 },
  },
  {
    name: 'Campus Press',
    category: 'College',
    description: 'A little student-paper ink for your crew.',
    background: '#ece6d8', frame: '#fffdf5', accent: '#9a4d3f', text: '#343b35',
    borderStyle: { kind: 'newspaper', weight: 2, inset: 18, innerInset: 7 },
    decorationStyle: { kind: 'halftone', size: 2, count: 6 },
    photoLayout: { aspectRatio: 1.38, gap: 14, inset: 7, captionHeight: 26, margin: 50 },
  },
  {
    name: 'Love Note',
    category: 'Love',
    description: 'Blush paper and a tiny note from the heart.',
    background: '#f0d7d3', frame: '#fff8ef', accent: '#bd5265', text: '#653d4a',
    borderStyle: { kind: 'scallop', weight: 3, inset: 18, innerInset: 8 },
    decorationStyle: { kind: 'hearts', size: 9, count: 5 },
    photoLayout: { aspectRatio: 1.25, gap: 18, inset: 10, captionHeight: 29, margin: 54 },
  },
  {
    name: 'First Dance',
    category: 'Love',
    description: 'Soft rose, warm ink, and the song you remember.',
    background: '#e8dce3', frame: '#fffaf1', accent: '#9b5665', text: '#513f50',
    borderStyle: { kind: 'keyline', weight: 2, inset: 21, innerInset: 0 },
    decorationStyle: { kind: 'ribbons', size: 10, count: 4 },
    photoLayout: { aspectRatio: 1.3, gap: 21, inset: 11, captionHeight: 30, margin: 55 },
  },
]

const themes = themeDefinitions.map((settings) => {
  const original = originalThemes.find((theme) => theme.name === settings.styleSource) ?? originalThemes[0]
  return {
    ...original,
    ...settings,
    requiredPhotoCount: settings.photoCount,
    photoLayout: settings.layout,
  }
})

function getCustomStripPhotoSlots(count) {
  const n = Math.max(1, Math.min(6, Number(count) || 4))
  const config = {
    1: { margin: 0.08, gap: 0, height: 0.84, width: 0.88, x: 0.06 },
    2: { margin: 0.04, gap: 0.04, height: 0.44, width: 0.84, x: 0.08 },
    3: { margin: 0.03, gap: 0.03, height: 0.293, width: 0.82, x: 0.09 },
    4: { margin: 0.015, gap: 0.028, height: 0.22, width: 0.78, x: 0.11 },
    5: { margin: 0.015, gap: 0.02, height: 0.178, width: 0.76, x: 0.12 },
    6: { margin: 0.012, gap: 0.016, height: 0.149, width: 0.74, x: 0.13 },
  }[n]

  return Array.from({ length: n }, (_, index) => ({
    x: config.x,
    y: config.margin + index * (config.height + config.gap),
    width: config.width,
    height: config.height,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    minWidth: 0.06,
    minHeight: 0.06,
    minAspectRatio: 0.2,
    maxAspectRatio: 4.5,
    preferredWidth: config.width,
    preferredHeight: config.height,
    preferredAspectRatio: config.width / config.height,
    fitStrategy: 'filled-frame',
    zIndex: 10,
    layer: 'photo',
  }))
}

let activeCustomStripPhotoCount = 4

const customStripThemeCache = new Map()

function getCustomStripTheme(photoCount) {
  const count = Math.max(1, Math.min(6, Number(photoCount ?? activeCustomStripPhotoCount) || 4))
  if (customStripThemeCache.has(count)) {
    return customStripThemeCache.get(count)
  }
  const slots = getCustomStripPhotoSlots(count)
  const theme = {
    ...themes[0],
    id: `custom-photo-strip-${count}`,
    name: 'Custom Photo Strip',
    category: 'Classic',
    description: 'Create a classic photobooth strip with your own photos',
    photoCount: count,
    requiredPhotoCount: count,
    orientation: 'vertical',
    photoHeaderSpace: false,
    visualFamily: 'Classic & Minimal',
    layout: 'vertical-strip',
    visualStyle: 'vertical-strip',
    background: '#faf6f0',
    frame: '#ffffff',
    accent: '#cf3557',
    text: '#2b2124',
    backgroundStyle: 'clean-cream',
    slotFrameStyle: 'clean',
    borderStyle: { kind: 'keyline', weight: 2, inset: 18, innerInset: 6 },
    decorationStyle: { kind: 'dots', size: 3, count: 0 },
    decorations: [],
    photoSlots: slots,
    alternatePhotoSlots: slots,
    composition: {
      layout: 'vertical-strip',
      orientation: 'vertical',
      photoCount: count,
      canvasFormat: 'portrait',
      photoSlots: slots,
      background: 'clean-cream',
      defaultFilter: 'original',
      frame: 'clean',
      visualFamily: 'Classic & Minimal',
      decorations: { kind: 'dots', size: 3, count: 0 },
      stickerCategory: 'Classic',
    },
  }
  customStripThemeCache.set(count, theme)
  return theme
}

function getThemeByName(name, photoCount) {
  if (name === 'Custom Photo Strip') return getCustomStripTheme(photoCount)
  return themes.find((theme) => theme.name === name) ?? themes[0]
}

function validateSingleImageFile(file) {
  if (!file || !SUPPORTED_IMAGE_TYPES.has(file.type)) {
    return 'Use JPEG, PNG, or WebP images only.'
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_FILE_SIZE) {
    return 'Each image must be smaller than 10 MB.'
  }
  return ''
}

function validateImageFiles(files, requiredCount, themeName) {
  if (files.length !== requiredCount) return `Choose exactly ${requiredCount} photos for ${themeName}.`
  if (files.some((file) => !SUPPORTED_IMAGE_TYPES.has(file.type))) {
    return 'Use JPEG, PNG, or WebP images only.'
  }
  if (files.some((file) => file.size <= 0 || file.size > MAX_IMAGE_FILE_SIZE)) {
    return 'Each image must be smaller than 10 MB.'
  }
  if (files.reduce((total, file) => total + file.size, 0) > MAX_UPLOAD_SIZE) {
    return 'The selected images must total 30 MB or less.'
  }
  return ''
}

function stopMediaStream(stream) {
  stream?.getTracks().forEach((track) => track.stop())
}

function clearVideoSource(video) {
  if (!video) return
  try {
    video.pause()
  } catch {
    // Ignore browser-specific playback errors during teardown.
  }
  video.srcObject = null
  try {
    video.removeAttribute('src')
  } catch {
    // Ignore render cleanup edge cases.
  }
  try {
    video.load()
  } catch {
    // Ignore browser-specific load cleanup edge cases.
  }
}

function getCameraErrorMessage(error) {
  if (error?.name === 'NotAllowedError') {
    return 'Camera permission was denied. Allow camera access for this site, then try again.'
  }
  if (error?.name === 'SecurityError') {
    return 'Camera access is blocked by this browser or page security policy. Use localhost or HTTPS and try again.'
  }
  if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
    return 'No camera was found. Connect a camera and try again.'
  }
  if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
    return 'Your camera may be in use by another app. Close it there, then try again.'
  }
  if (error?.name === 'OverconstrainedError') {
    return 'This camera does not support the requested settings. Try again with the browser default camera.'
  }
  if (error?.name === 'TypeError') {
    return 'Camera access is unavailable in this browser or context. Open the app on localhost or HTTPS.'
  }
  return `The camera could not start${error?.name ? ` (${error.name})` : ''}. Check your device and browser permissions, then try again.`
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

function ThemeArtwork({ theme }) {
  const ornaments = {
    flowers: '✿', daisy: '✿', hearts: '♡', sparkles: '✦', stars: '✦',
    confetti: '✳', pennants: '▾', ribbons: '⌁', halftone: '•••', dots: '· · ·',
    tape: '▰', stamp: '✉', corners: '⌜', sunflower: '✿', petal: '✿', blossom: '✿',
    rose: '✿', lavender: '✿', leaves: '❧', 'dry-leaf': '❧',
  }
  const sceneSource = getNaturePhotoPath(theme)

  return (
    <span
      aria-hidden="true"
      className={`theme-artwork visual-${theme.visualStyle} orientation-${theme.orientation} mood-${theme.backgroundStyle} border-${theme.borderStyle.kind}${theme.photoHeaderSpace ? ' reserves-photo-header' : ''}`}
      style={{
        '--art-background': theme.background,
        '--art-frame': theme.frame,
        '--art-accent': theme.accent,
        '--art-ink': theme.text,
        '--photo-count': theme.photoCount,
      }}
    >
      {sceneSource && <img className="theme-scene-photo" src={sceneSource} alt="" aria-hidden="true" draggable="false" />}
      <span className="artwork-photos" aria-hidden="true">
        {theme.photoSlots.map((photoSlot, index) => (
          <i
            className={`artwork-photo frame-${theme.slotFrameStyle}`}
            key={index}
            style={{
              left: `${(photoSlot.x + photoSlot.offsetX) * 100}%`,
              top: `${(photoSlot.y + photoSlot.offsetY) * 100}%`,
              width: `${photoSlot.width * 100}%`,
              height: `${photoSlot.height * 100}%`,
              transform: `rotate(${photoSlot.rotation}deg)`,
            }}
          >
            <b />
          </i>
        ))}
      </span>
      <span className="artwork-footer">
        <i />
      </span>
      <span className="artwork-ornaments">
        {theme.decorations.map((decoration, index) => (
          <i
            key={index}
            style={{
              left: `${decoration.x * 100}%`,
              top: `${decoration.y * 100}%`,
              fontSize: `${Math.max(8, decoration.size)}px`,
              transform: `rotate(${decoration.rotation}deg)`,
            }}
          >
            {ornaments[decoration.kind] ?? '✦'}
          </i>
        ))}
      </span>
    </span>
  )
}

function LandingPage({ selectedTheme, setSelectedTheme, onContinue, customPhotoCount, setCustomPhotoCount }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPhotoCountModal, setShowPhotoCountModal] = useState(false)
  const [selectedPhotoCount, setSelectedPhotoCount] = useState(customPhotoCount ?? 4)
  const [cursorHearts, setCursorHearts] = useState([])
  const cursorHeartId = useRef(0)
  const lastCursorHeartAt = useRef(0)
  const visibleThemes = themes.filter((theme) => {
    const matchesCategory = activeCategory === 'All' || theme.category === activeCategory
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch = !query || `${theme.name} ${theme.category} ${theme.description}`.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  useEffect(() => {
    const motionAllowed = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    const handlePointerMove = (event) => {
      if (event.pointerType !== 'mouse') return
      const now = performance.now()
      if (now - lastCursorHeartAt.current < 150) return
      lastCursorHeartAt.current = now
      const heart = {
        id: cursorHeartId.current + 1,
        x: event.clientX + (Math.random() - 0.5) * 18,
        y: event.clientY + (Math.random() - 0.5) * 14,
        glyph: cursorHeartId.current % 3 === 0 ? '♡' : '♥',
      }
      cursorHeartId.current += 1
      setCursorHearts((current) => [...current.slice(-7), heart])
    }

    const syncPointerEffect = () => {
      if (motionAllowed.matches && window.innerWidth > 620) window.addEventListener('pointermove', handlePointerMove, { passive: true })
      else {
        window.removeEventListener('pointermove', handlePointerMove)
        setCursorHearts([])
      }
    }

    syncPointerEffect()
    motionAllowed.addEventListener('change', syncPointerEffect)
    window.addEventListener('resize', syncPointerEffect)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      motionAllowed.removeEventListener('change', syncPointerEffect)
      window.removeEventListener('resize', syncPointerEffect)
    }
  }, [])

  return (
    <>
      <div className="ambient-scene" aria-hidden="true">
        <span className="ambient-glow glow-one" />
        <span className="ambient-glow glow-two" />
        <span className="ambient-frame float-frame-one"><i /></span>
        <span className="ambient-frame float-frame-two"><i /></span>
        <span className="ambient-film">▰ ▰ ▰ ▰ ▰</span>
        <span className="ambient-sparkle sparkle-one">✧</span>
        <span className="ambient-sparkle sparkle-two">✳</span>
        <span className="ambient-flash" />
      </div>
      <div className="cursor-heart-layer" aria-hidden="true">
        {cursorHearts.map((heart) => (
          <span
            className="cursor-heart"
            key={heart.id}
            style={{ left: heart.x, top: heart.y, transform: `rotate(${heart.id % 2 ? -8 : 8}deg)` }}
            onAnimationEnd={() => setCursorHearts((current) => current.filter((item) => item.id !== heart.id))}
          >
            {heart.glyph}
          </span>
        ))}
      </div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Snap Studio home">
          <BrandMark />
          <span>snap studio</span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#themes">The looks</a>
          <a className="nav-cta" href="#themes">
            Make a photo strip <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> YOUR DIGITAL PHOTOBOOTH</p>
            <h1 id="hero-title">
              Big memories.
              <em>Little photo strips.</em>
            </h1>
            <p className="hero-description">
              Gather your favorite people, find your angle, and make a keepsake
              worth sticking on the fridge.
            </p>
            <button className="button button-primary" type="button" onClick={() => document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth' })}>
              Start Photobooth <span aria-hidden="true">↗</span>
            </button>
            <a className="button button-secondary" href="#themes">Explore Themes <span aria-hidden="true">↓</span></a>
            <p className="hero-note">
              <span className="note-star" aria-hidden="true">✳</span>
              {themes.length} looks. Your people. One very good photo strip.
            </p>
          </div>

          <div className="photo-scene" aria-label="A preview of photo booth prints">
            <div className="scene-sun" aria-hidden="true" />
            <div className="scene-sticker sticker-top">SAY CHEESE!</div>
            <div className="print print-back print-back-left">
              <img src="/hero-portrait.svg" alt="Abstract portrait photo booth print" />
              <span>the good stuff</span>
            </div>
            <div className="print print-back print-back-right">
              <img src="/hero-friends.svg" alt="Abstract friends photo booth print" />
              <span>all together</span>
            </div>
            <div className="print print-main">
              <div className="main-photo">
                <img src="/hero-party.svg" alt="Abstract party photo booth print" />
              </div>
              <span className="print-caption">a moment to keep</span>
              <span className="print-date">EST. TODAY</span>
            </div>
            <div className="scene-sticker sticker-bottom"><span>✳</span> KEEP THIS ONE</div>
          </div>
        </section>

        <section className="themes-section" id="themes" aria-labelledby="custom-strip-title">
          <div
            className={`custom-strip-card${selectedTheme === 'Custom Photo Strip' ? ' is-selected' : ''}`}
            onClick={() => setSelectedTheme('Custom Photo Strip')}
            role="region"
            aria-label="Custom Photo Strip option"
          >
            <div className="custom-strip-content">
              <div className="custom-strip-badge">
                <span className="custom-strip-badge-dot" aria-hidden="true" />
                <span>ORIGINAL PHOTOBOOTH FORMAT</span>
              </div>
              <h2 className="custom-strip-title" id="custom-strip-title">
                CUSTOM PHOTO STRIP
              </h2>
              <p className="custom-strip-subtitle">
                Create a classic photobooth strip with your own photos
              </p>
              <ul className="custom-strip-features">
                <li><span className="feature-check" aria-hidden="true">✓</span> 4 vertical photos in classic booth format</li>
                <li><span className="feature-check" aria-hidden="true">✓</span> Capture live with webcam or upload photos</li>
                <li><span className="feature-check" aria-hidden="true">✓</span> Move, rotate, add text & stickers</li>
              </ul>
              <div className="custom-strip-actions">
                <button
                  className="button button-primary custom-strip-cta"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelectedTheme('Custom Photo Strip')
                    setShowPhotoCountModal(true)
                  }}
                >
                  Create Custom Strip <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>

            <div className="custom-strip-preview-wrapper" aria-hidden="true">
              <div className="custom-strip-preview-strip">
                <div className="preview-strip-header">
                  <span className="preview-strip-logo">SNAP STUDIO</span>
                  <span className="preview-strip-stars">✦ ✦ ✦</span>
                </div>
                <div className="preview-strip-slots">
                  {[1, 2, 3, 4].map((slotNum) => (
                    <div className="preview-strip-slot" key={slotNum}>
                      <div className="preview-strip-slot-box">
                        <svg className="preview-slot-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="preview-slot-label">PHOTO {slotNum}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="preview-strip-footer">
                  <span>EST. TODAY</span>
                  <span>4 PHOTOS</span>
                </div>
              </div>
            </div>
          </div>

          {showPhotoCountModal && (
            <div
              className="custom-count-backdrop"
              onClick={() => setShowPhotoCountModal(false)}
              role="presentation"
            >
              <div
                className="custom-count-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="photo-count-heading"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close-button"
                  type="button"
                  aria-label="Close"
                  onClick={() => setShowPhotoCountModal(false)}
                >
                  ×
                </button>
                <p className="eyebrow"><span className="eyebrow-dot" /> CUSTOM PHOTO STRIP</p>
                <h3 id="photo-count-heading">How many photos?</h3>
                <p className="custom-count-description">
                  Choose how many photos to include on your vertical strip.
                </p>

                <div className="photo-count-selector" role="group" aria-label="How many photos?">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`photo-count-btn${selectedPhotoCount === num ? ' is-active is-selected' : ''}`}
                      aria-pressed={selectedPhotoCount === num}
                      onClick={() => setSelectedPhotoCount(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <p className="photo-count-hint">
                  {selectedPhotoCount === 1 && '1 photo · Large vertical showcase'}
                  {selectedPhotoCount === 2 && '2 photos · Generous dual-frame layout'}
                  {selectedPhotoCount === 3 && '3 photos · Classic vertical trio'}
                  {selectedPhotoCount === 4 && '4 photos · Classic photobooth proportions'}
                  {selectedPhotoCount === 5 && '5 photos · Extended memory strip'}
                  {selectedPhotoCount === 6 && '6 photos · Six-frame story strip'}
                </p>

                <div className="custom-count-actions">
                  <button
                    className="button button-primary custom-count-continue"
                    type="button"
                    onClick={() => {
                      activeCustomStripPhotoCount = selectedPhotoCount
                      if (setCustomPhotoCount) setCustomPhotoCount(selectedPhotoCount)
                      setSelectedTheme('Custom Photo Strip')
                      setShowPhotoCountModal(false)
                      onContinue()
                    }}
                  >
                    Continue with {selectedPhotoCount} {selectedPhotoCount === 1 ? 'Photo' : 'Photos'} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="themes-gallery-divider">
            <span className="divider-line" />
            <span className="divider-badge">OR CHOOSE FROM 115 THEMES</span>
            <span className="divider-line" />
          </div>

          <div className="section-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" /> PICK YOUR PICTURE-PERFECT MOOD</p>
              <h2 id="themes-title">Choose a theme</h2>
            </div>
            <p className="section-description">
              Choose a look for your strip. The only wrong move is not getting in the frame.
            </p>
          </div>

          <div className="theme-browser-controls">
            <div className="theme-category-filters" role="group" aria-label="Filter themes by category">
              <button
                className={`category-filter${activeCategory === 'All' ? ' is-active' : ''}`}
                type="button"
                aria-pressed={activeCategory === 'All'}
                onClick={() => setActiveCategory('All')}
              >
                All <span>{themes.length}</span>
              </button>
              {THEME_CATEGORIES.map((category) => (
                <button
                  className={`category-filter${activeCategory === category ? ' is-active' : ''}`}
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category} <span>{themes.filter((theme) => theme.category === category).length}</span>
                </button>
              ))}
            </div>
            <label className="theme-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search themes"
                aria-label="Search themes"
              />
            </label>
          </div>

          <p className="theme-result-count" aria-live="polite">
            {visibleThemes.length} {visibleThemes.length === 1 ? 'look' : 'looks'}
          </p>
          {visibleThemes.length ? (
            <div className="theme-grid">
              {visibleThemes.map((theme) => (
                <button
                  className={`theme-card visual-${theme.visualStyle} orientation-${theme.orientation} theme-${theme.category.toLowerCase()}${selectedTheme === theme.name ? ' is-selected' : ''}`}
                  key={theme.name}
                  type="button"
                  aria-pressed={selectedTheme === theme.name}
                  onClick={() => setSelectedTheme(theme.name)}
                  style={{
                    '--theme-background': theme.background,
                    '--theme-accent': theme.accent,
                    '--theme-text': theme.text,
                  }}
                >
                  <span className="theme-card-heading">
                    <span className="theme-name">{theme.name}</span>
                    <span className="theme-swatches" aria-hidden="true">
                      <i style={{ backgroundColor: theme.background }} />
                      <i style={{ backgroundColor: theme.frame }} />
                      <i style={{ backgroundColor: theme.accent }} />
                    </span>
                  </span>
                  <span className="theme-image">
                    <ThemeArtwork theme={theme} />
                    <span className="theme-category-label">{theme.category}</span>
                    <span className="theme-count-label">{theme.photoCount} Photos</span>
                    <span className="theme-selected-indicator" aria-hidden="true">
                      {selectedTheme === theme.name ? '✓ Selected' : '+'}
                    </span>
                  </span>
                  <span className="theme-info">
                    <span className="theme-description">{theme.description}</span>
                    <span className="theme-meta">
                      <span className={`orientation-indicator orientation-${theme.orientation}`}>
                        {theme.orientation === 'vertical' ? '↕ Vertical' : '↔ Horizontal'}
                      </span>
                      <span className="layout-indicator">{theme.layout}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="theme-empty-state">No themes match “{searchQuery.trim()}”. Try another search.</p>
          )}
          <div className="theme-continue-row">
            <p aria-live="polite">{selectedTheme ? `${selectedTheme} · ${getThemeByName(selectedTheme, customPhotoCount).requiredPhotoCount} photos` : 'Choose a theme to get started.'}</p>
            <button
              className="button button-primary"
              type="button"
              onClick={() => {
                if (selectedTheme === 'Custom Photo Strip') {
                  setShowPhotoCountModal(true)
                } else {
                  onContinue()
                }
              }}
              disabled={!selectedTheme}
            >
              Continue <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top">
          <BrandMark />
          <span>snap studio</span>
        </a>
        <p>Made for the moments you keep.</p>
        <a href="#top" className="back-to-top">Back to top ↑</a>
      </footer>
    </>
  )
}

function SourceChooser({ selectedTheme, onTakePhotos, onUploadPhotos, customPhotoCount, onSetCustomPhotoCount }) {
  const [uploadError, setUploadError] = useState('')
  const [uploadExpanded, setUploadExpanded] = useState(false)
  const theme = getThemeByName(selectedTheme, customPhotoCount)
  const [uploadSlots, setUploadSlots] = useState(() => Array.from({ length: theme.requiredPhotoCount }, () => null))
  const [activeUploadSlot, setActiveUploadSlot] = useState(0)
  const uploadSlotsRef = useRef(uploadSlots)

  useEffect(() => {
    uploadSlotsRef.current = uploadSlots
  }, [uploadSlots])

  useEffect(() => () => {
    uploadSlotsRef.current.forEach((slot) => {
      if (slot?.previewUrl) URL.revokeObjectURL(slot.previewUrl)
    })
  }, [])

  const filledCount = uploadSlots.filter(Boolean).length
  const completed = filledCount === theme.requiredPhotoCount
  const firstEmptySlot = uploadSlots.findIndex((slot) => !slot)
  const currentPromptSlot = firstEmptySlot === -1 ? theme.requiredPhotoCount - 1 : firstEmptySlot

  const handleSlotSelection = (event, slotIndex) => {
    const file = event.target.files?.[0] ?? null
    event.target.value = ''

    if (!file) return

    const fileError = validateSingleImageFile(file)
    if (fileError) {
      setUploadError(fileError)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setUploadSlots((currentSlots) => {
      const nextSlots = [...currentSlots]
      const previousSlot = nextSlots[slotIndex]
      if (previousSlot?.previewUrl) URL.revokeObjectURL(previousSlot.previewUrl)
      nextSlots[slotIndex] = { file, previewUrl }
      return nextSlots
    })
    setUploadError('')
    const nextEmptyIndex = uploadSlots.findIndex((slot, index) => index > slotIndex && !slot)
    setActiveUploadSlot(nextEmptyIndex >= 0 ? nextEmptyIndex : slotIndex)
  }

  const handleRemoveSlot = (slotIndex) => {
    setUploadSlots((currentSlots) => {
      const nextSlots = [...currentSlots]
      const target = nextSlots[slotIndex]
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      nextSlots[slotIndex] = null
      return nextSlots
    })
    setUploadError('')
    setActiveUploadSlot(slotIndex)
  }

  const handleContinue = () => {
    const selectedFiles = uploadSlots.map((slot) => slot?.file).filter(Boolean)
    const validationError = validateImageFiles(selectedFiles, theme.requiredPhotoCount, theme.name)
    if (validationError) {
      setUploadError(validationError)
      return
    }
    setUploadError('')
    Promise.resolve(onUploadPhotos(selectedFiles)).catch(() => setUploadError('A selected image could not be read. Please try another file.'))
  }

  return (
    <main className="booth-main source-main">
      <div className="booth-intro">
        <p className="eyebrow"><span className="eyebrow-dot" /> {theme.requiredPhotoCount} {theme.requiredPhotoCount === 1 ? 'PHOTO' : 'PHOTOS'} · {theme.name.toUpperCase()}</p>
        <h1>How do you want to <em>make it?</em></h1>
        <p>Take {theme.requiredPhotoCount} {theme.requiredPhotoCount === 1 ? 'photo' : 'photos'} with your camera, or upload them one at a time from your device.</p>
        {selectedTheme === 'Custom Photo Strip' && onSetCustomPhotoCount && (
          <div className="source-count-bar">
            <span className="source-count-label">How many photos?</span>
            <div className="source-count-pills" role="group" aria-label="Select photo count">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`source-count-pill${theme.requiredPhotoCount === num ? ' is-active' : ''}`}
                  aria-pressed={theme.requiredPhotoCount === num}
                  onClick={() => onSetCustomPhotoCount(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="source-options">
        <button className="source-option" type="button" onClick={onTakePhotos}>
          <span className="source-icon" aria-hidden="true">◎</span>
          <span><strong>Take Photos</strong><small>Use your camera, one shot at a time</small></span>
          <span className="source-arrow" aria-hidden="true">→</span>
        </button>
        <button className="source-option source-upload-button" type="button" onClick={() => setUploadExpanded((open) => !open)}>
          <span className="source-icon" aria-hidden="true">↑</span>
          <span><strong>Upload Photos</strong><small>Select exactly {theme.requiredPhotoCount} images</small></span>
          <span className="source-arrow" aria-hidden="true">→</span>
        </button>
      </div>
      {uploadExpanded && (
        <div className="source-upload-panel" aria-live="polite">
          <div className="source-upload-summary">
            <div>
              <span className="source-upload-progress">{filledCount} / {theme.requiredPhotoCount} photos added</span>
              {!completed && <strong>Next: Photo {currentPromptSlot + 1}</strong>}
            </div>
            {completed && <span className="source-upload-complete">All set</span>}
          </div>
          <div className="upload-slot-list">
            {uploadSlots.map((slot, slotIndex) => {
              const isActive = activeUploadSlot === slotIndex && !slot
              return (
                <div key={`upload-slot-${slotIndex}`} className={`upload-slot${slot ? ' is-filled' : ''}${isActive ? ' is-active' : ''}`}>
                  <div className="upload-slot-header">
                    <span>Photo {slotIndex + 1} of {theme.requiredPhotoCount}</span>
                    <span>{slot ? '✓ Added' : 'Waiting'}</span>
                  </div>
                  {slot ? (
                    <div className="upload-slot-preview-wrap">
                      <img className="upload-slot-preview" src={slot.previewUrl} alt={`Selected photo ${slotIndex + 1}`} />
                      <div className="upload-slot-actions">
                        <label className="upload-slot-action upload-slot-action-primary">
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleSlotSelection(event, slotIndex)} aria-label={`Replace photo ${slotIndex + 1}`} />
                          Replace
                        </label>
                        <button className="upload-slot-action upload-slot-action-secondary" type="button" onClick={() => handleRemoveSlot(slotIndex)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className={`upload-slot-picker${isActive ? ' is-highlighted' : ''}`}>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleSlotSelection(event, slotIndex)} aria-label={`Select photo ${slotIndex + 1} of ${theme.requiredPhotoCount}`} />
                      <span>{isActive ? `Select Photo ${slotIndex + 1} of ${theme.requiredPhotoCount}` : `Select Photo ${slotIndex + 1}`}</span>
                    </label>
                  )}
                </div>
              )
            })}
          </div>
          {completed && (
            <button className="button button-primary upload-submit-button" type="button" onClick={handleContinue}>
              Continue <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      )}
      <p className="source-privacy-note">Photos stay in this browser session and are not uploaded or stored by Snap Studio.</p>
      {uploadError && <p className="source-error" role="alert">{uploadError}</p>}
    </main>
  )
}

function BoothHeader({ selectedTheme, onBack }) {
  return (
    <header className="booth-header">
      <a className="brand" href="#top" onClick={onBack} aria-label="Snap Studio home">
        <BrandMark />
        <span>snap studio</span>
      </a>
      <p className="booth-header-label">PHOTOBOOTH <span>/</span> {selectedTheme.toUpperCase()}</p>
      <button className="booth-back-link" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to looks
      </button>
    </header>
  )
}

function CameraWorkspace({
  cameraDiagnostics,
  cameraError,
  cameraStatus,
  cameraStream,
  capturedPhotos,
  countdown,
  onBack,
  onRetry,
  photoNumber,
  requiredPhotoCount,
  selectedTheme,
  videoRef,
}) {
  const activeTheme = getThemeByName(selectedTheme)

  return (
    <main className="booth-main">
      <div className="booth-intro">
        <p className="eyebrow"><span className="eyebrow-dot" /> YOUR {selectedTheme.toUpperCase()} SESSION</p>
        <h1>Find your <em>camera face.</em></h1>
        <p>Get everyone in the frame. We’ll count you in for each shot.</p>
      </div>
      <div className="camera-layout">
        <div className={`camera-frame theme-${activeTheme.category.toLowerCase()}`}>
          {cameraStream && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Live camera preview"
            />
          )}
          {cameraStatus !== 'ready' && (
            <div className="camera-placeholder" role={cameraStatus === 'error' ? 'alert' : 'status'}>
              {cameraStatus === 'requesting' ? (
                <>
                  <span className="camera-spinner" aria-hidden="true" />
                  <strong>Waiting for camera access</strong>
                  <span>Check your browser for a permission prompt.</span>
                </>
              ) : (
                <>
                  <span className="camera-error-mark" aria-hidden="true">!</span>
                  <strong>We couldn’t turn on your camera.</strong>
                  <span>{cameraError}</span>
                </>
              )}
            </div>
          )}
          <span className={`camera-live-label${cameraStatus === 'ready' ? ' is-live' : ''}`}>
            <span /> {cameraStatus === 'ready' ? 'LIVE PREVIEW' : 'CAMERA'}
          </span>
          {cameraStatus === 'ready' && countdown !== null && (
            <div className="camera-countdown" aria-live="assertive" aria-label={`${countdown}`}>
              {countdown}
            </div>
          )}
          {import.meta.env.DEV && (
            <details className="camera-diagnostics">
              <summary>Camera diagnostics</summary>
              <span>mediaDevices: {cameraDiagnostics.mediaDevices ? 'yes' : 'no'}</span>
              <span>getUserMedia: {cameraDiagnostics.getUserMedia ? 'yes' : 'no'}</span>
              <span>state: {cameraDiagnostics.state}</span>
              <span>device: {cameraDiagnostics.deviceLabel || 'not available yet'}</span>
              {cameraDiagnostics.errorName && <span>error: {cameraDiagnostics.errorName}: {cameraDiagnostics.errorMessage}</span>}
            </details>
          )}
        </div>

        <aside className="camera-sidebar" aria-label="Photo session progress">
          <div className="camera-progress-heading">
            <span className="camera-progress-title" aria-live="polite">
              Photo {photoNumber} of {requiredPhotoCount}
            </span>
            <span className="camera-progress-count">{capturedPhotos.length} / {requiredPhotoCount}</span>
          </div>
          <div
            className="camera-progress-track"
            role="progressbar"
            aria-label="Photos captured"
            aria-valuemin="0"
            aria-valuemax={requiredPhotoCount}
            aria-valuenow={capturedPhotos.length}
          >
            <span style={{ width: `${(capturedPhotos.length / requiredPhotoCount) * 100}%` }} />
          </div>
          <div className="camera-shot-list" aria-label="Photo captures">
            {Array.from({ length: requiredPhotoCount }, (_, index) => (
              <div
                className={`camera-shot${capturedPhotos[index] ? ' is-captured' : ''}${index === photoNumber - 1 && cameraStatus === 'ready' ? ' is-next' : ''}`}
                key={index}
              >
                {capturedPhotos[index] ? (
                  <img src={capturedPhotos[index]} alt={`Captured photo ${index + 1}`} />
                ) : (
                  <span>{String(index + 1).padStart(2, '0')}</span>
                )}
              </div>
            ))}
          </div>

          {cameraStatus === 'error' ? (
            <div className="camera-error-actions">
              <button className="booth-button booth-button-primary" type="button" onClick={onRetry}>
                Try again <span aria-hidden="true">↗</span>
              </button>
              <button className="booth-button booth-button-secondary" type="button" onClick={onBack}>
                Back to looks
              </button>
            </div>
          ) : (
            <div className="camera-guidance" aria-live="polite">
              <span className="guidance-mark" aria-hidden="true">✳</span>
              <p>
                {cameraStatus === 'requesting'
                  ? 'Allow camera access to start your photo strip.'
                  : countdown === null
                    ? 'Getting your preview ready…'
                    : 'You have three seconds to strike a pose.'}
              </p>
              <button className="booth-button booth-button-secondary" type="button" onClick={onBack}>
                Leave session
              </button>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}

function PhotoReview({ capturedPhotos, onContinue, onRetake, selectedTheme, customPhotoCount }) {
  const activeTheme = getThemeByName(selectedTheme, customPhotoCount)

  return (
    <main className="booth-main review-main">
      <div className="booth-intro">
        <p className="eyebrow"><span className="eyebrow-dot" /> {activeTheme.requiredPhotoCount} SHOTS, ONE VERY GOOD TIME</p>
        <h1>Okay, these are <em>good.</em></h1>
        <p>Your {selectedTheme.toLowerCase()} set is ready. Happy with your shots?</p>
      </div>
      <div className={`review-photos${capturedPhotos.length === 4 ? ' is-four' : ''}`}>
        {capturedPhotos.map((photo, index) => (
          <figure className={`review-photo theme-${activeTheme.category.toLowerCase()}`} key={`${index}-${photo}`}>
            <img src={photo} alt={`Captured photo ${index + 1} of ${activeTheme.requiredPhotoCount}`} />
            <figcaption>PHOTO {String(index + 1).padStart(2, '0')}</figcaption>
          </figure>
        ))}
      </div>
      <div className="review-actions">
        <button className="booth-button booth-button-secondary" type="button" onClick={onRetake}>
          <span aria-hidden="true">↻</span> Retake
        </button>
        <button className="booth-button booth-button-primary" type="button" onClick={onContinue}>
          Continue <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  )
}

function loadCapturedPhoto(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('A captured photo could not be loaded.'))
    image.src = source
  })
}

async function normalizeImageFile(file) {
  const imageUrl = URL.createObjectURL(file)
  try {
    const image = await loadCapturedPhoto(imageUrl)
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
      throw new Error('The selected image dimensions are not supported.')
    }

    const scale = Math.min(1, 4096 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('This browser could not prepare the selected image.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.92)
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

function drawPhotoCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  const sourceX = (image.width - sourceWidth) / 2
  const sourceY = (image.height - sourceHeight) / 2
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
}

function drawPhotoContain(context, image, x, y, width, height) {
  const imageWidth = image.naturalWidth || image.width
  const imageHeight = image.naturalHeight || image.height
  const scale = Math.min(width / imageWidth, height / imageHeight)
  const drawWidth = imageWidth * scale
  const drawHeight = imageHeight * scale
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  )
}

function drawPrintStar(context, x, y, size, color) {
  context.save()
  context.translate(x, y)
  context.fillStyle = color
  context.beginPath()
  for (let point = 0; point < 8; point += 1) {
    const radius = point % 2 === 0 ? size : size * 0.28
    const angle = (Math.PI * point) / 4 - Math.PI / 2
    const pointX = Math.cos(angle) * radius
    const pointY = Math.sin(angle) * radius
    if (point === 0) context.moveTo(pointX, pointY)
    else context.lineTo(pointX, pointY)
  }
  context.closePath()
  context.fill()
  context.restore()
}

function drawLeafMotif(context, x, y, size, color, rotation = 0) {
  context.save()
  context.translate(x, y)
  context.rotate((rotation * Math.PI) / 180)
  context.globalAlpha = 0.16
  context.fillStyle = color
  context.strokeStyle = color
  context.lineWidth = 1.2
  context.beginPath()
  context.moveTo(0, size)
  context.lineTo(0, -size)
  context.stroke()
  for (let index = 0; index < 3; index += 1) {
    const offsetY = size * (0.55 - index * 0.55)
    for (const direction of [-1, 1]) {
      context.beginPath()
      context.ellipse(direction * size * 0.38, offsetY, size * 0.3, size * 0.62, direction * 0.65, 0, Math.PI * 2)
      context.fill()
    }
  }
  context.restore()
}

function drawCloudMotif(context, x, y, size, color) {
  context.save()
  context.globalAlpha = 0.32
  context.fillStyle = color
  context.beginPath()
  context.ellipse(x - size * 0.35, y, size * 0.42, size * 0.26, 0, 0, Math.PI * 2)
  context.ellipse(x, y - size * 0.12, size * 0.38, size * 0.34, 0, 0, Math.PI * 2)
  context.ellipse(x + size * 0.37, y, size * 0.4, size * 0.25, 0, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawFlowerHead(context, x, y, size, petalColor, centerColor, petalCount = 8) {
  context.save()
  context.translate(x, y)
  context.globalAlpha = 0.72
  context.fillStyle = petalColor
  for (let petal = 0; petal < petalCount; petal += 1) {
    context.save()
    context.rotate((Math.PI * 2 * petal) / petalCount)
    context.beginPath()
    context.ellipse(0, -size * 0.58, size * 0.22, size * 0.52, 0, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
  context.fillStyle = centerColor
  context.beginPath()
  context.arc(0, 0, size * 0.25, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawBlossomBranch(context, x, y, length, branchColor, blossomColor, rotation = 0) {
  context.save()
  context.translate(x, y)
  context.rotate((rotation * Math.PI) / 180)
  context.globalAlpha = 0.62
  context.strokeStyle = branchColor
  context.lineWidth = Math.max(2, length * 0.025)
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(0, 0)
  context.bezierCurveTo(length * 0.28, -length * 0.12, length * 0.55, -length * 0.42, length, -length * 0.52)
  context.stroke()
  for (const [branchAt, side] of [[0.25, -1], [0.48, 1], [0.7, -1], [0.88, 1]]) {
    const branchX = length * branchAt
    const branchY = -length * (0.12 + branchAt * 0.4)
    context.beginPath()
    context.moveTo(branchX, branchY)
    context.quadraticCurveTo(branchX + length * 0.1, branchY + side * length * 0.02, branchX + length * 0.13, branchY + side * length * 0.18)
    context.stroke()
    drawFlowerHead(context, branchX + length * 0.13, branchY + side * length * 0.18, length * 0.055, blossomColor, '#d6ad71', 5)
  }
  for (const branchAt of [0.16, 0.37, 0.61, 0.8, 0.98]) {
    drawFlowerHead(context, length * branchAt, -length * (0.1 + branchAt * 0.42), length * 0.045, blossomColor, '#e0c28a', 5)
  }
  context.restore()
}

function drawDryLeaf(context, x, y, size, color, rotation = 0) {
  context.save()
  context.translate(x, y)
  context.rotate((rotation * Math.PI) / 180)
  context.globalAlpha = 0.54
  context.fillStyle = color
  context.strokeStyle = color
  context.lineWidth = Math.max(1, size * 0.055)
  context.beginPath()
  context.moveTo(0, size)
  context.lineTo(-size * 0.22, size * 0.48)
  context.lineTo(-size * 0.72, size * 0.5)
  context.lineTo(-size * 0.48, size * 0.08)
  context.lineTo(-size, -size * 0.16)
  context.lineTo(-size * 0.44, -size * 0.32)
  context.lineTo(-size * 0.36, -size * 0.9)
  context.lineTo(0, -size * 0.58)
  context.lineTo(size * 0.36, -size * 0.9)
  context.lineTo(size * 0.44, -size * 0.32)
  context.lineTo(size, -size * 0.16)
  context.lineTo(size * 0.48, size * 0.08)
  context.lineTo(size * 0.72, size * 0.5)
  context.lineTo(size * 0.22, size * 0.48)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(0, size * 0.86)
  context.lineTo(0, -size * 0.62)
  context.stroke()
  context.restore()
}

function drawMeadowGrass(context, width, height, color, opacity) {
  context.save()
  context.strokeStyle = color
  context.globalAlpha = opacity
  context.lineWidth = 1.5
  for (let x = -4; x < width + 8; x += 17) {
    const baseY = height - 116 + (x * 7 % 25)
    const bladeHeight = 12 + (x * 11 % 17)
    context.beginPath()
    context.moveTo(x, baseY)
    context.quadraticCurveTo(x + ((x % 3) - 1) * 8, baseY - bladeHeight * 0.6, x + ((x % 5) - 2) * 5, baseY - bladeHeight)
    context.stroke()
  }
  context.restore()
}

function drawLavenderSprig(context, x, y, length, color) {
  context.save()
  context.strokeStyle = color
  context.fillStyle = '#8974a4'
  context.globalAlpha = 0.44
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(x, y + length * 0.42)
  context.quadraticCurveTo(x + 4, y, x, y - length * 0.5)
  context.stroke()
  for (let bud = 0; bud < 6; bud += 1) {
    const direction = bud % 2 ? 1 : -1
    const budY = y + length * 0.24 - bud * length * 0.12
    context.beginPath()
    context.ellipse(x + direction * 4, budY, 2.6, 5.5, direction * 0.4, 0, Math.PI * 2)
    context.fill()
  }
  context.restore()
}

function drawGardenVine(context, x, top, length, color, direction) {
  context.save()
  context.strokeStyle = color
  context.globalAlpha = 0.48
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(x, top)
  context.bezierCurveTo(x + direction * 28, top + length * 0.22, x - direction * 10, top + length * 0.64, x + direction * 18, top + length)
  context.stroke()
  for (let index = 0; index < 7; index += 1) {
    const y = top + length * (index / 7)
    const leafX = x + direction * (index % 2 ? 12 : -8)
    drawLeafMotif(context, leafX, y, 9, color, direction * (index % 2 ? 42 : -42))
  }
  context.restore()
}

function drawSceneTree(context, edgeX, height, direction, trunkColor, canopyColor, scale = 1) {
  const trunkWidth = 45 * scale
  const trunkCenter = edgeX + direction * trunkWidth * 0.42
  context.save()
  const trunkGradient = context.createLinearGradient(trunkCenter - trunkWidth / 2, 0, trunkCenter + trunkWidth / 2, 0)
  trunkGradient.addColorStop(0, `${trunkColor}55`)
  trunkGradient.addColorStop(0.48, trunkColor)
  trunkGradient.addColorStop(1, `${trunkColor}aa`)
  context.fillStyle = trunkGradient
  context.beginPath()
  context.moveTo(edgeX, height)
  context.lineTo(edgeX, height * 0.06)
  context.bezierCurveTo(edgeX + direction * 12 * scale, height * 0.15, trunkCenter - direction * 14 * scale, height * 0.36, trunkCenter, height * 0.45)
  context.lineTo(trunkCenter + direction * trunkWidth * 0.42, height)
  context.closePath()
  context.fill()
  context.strokeStyle = `${trunkColor}88`
  context.lineWidth = 8 * scale
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(trunkCenter, height * 0.34)
  context.bezierCurveTo(trunkCenter + direction * 24 * scale, height * 0.23, trunkCenter + direction * 92 * scale, height * 0.21, trunkCenter + direction * 162 * scale, height * 0.11)
  context.moveTo(trunkCenter + direction * 35 * scale, height * 0.26)
  context.quadraticCurveTo(trunkCenter + direction * 56 * scale, height * 0.14, trunkCenter + direction * 82 * scale, height * 0.08)
  context.stroke()
  drawLeafMotif(context, trunkCenter + direction * 128 * scale, height * 0.11, 17 * scale, canopyColor, direction * -34)
  drawLeafMotif(context, trunkCenter + direction * 66 * scale, height * 0.2, 13 * scale, canopyColor, direction * 35)
  context.restore()
}

function drawCanopyFringe(context, width, color, density = 1) {
  context.save()
  context.fillStyle = color
  context.globalAlpha = 0.27 * Math.min(1.5, density)
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(width, 0)
  context.lineTo(width, 28 * density)
  context.bezierCurveTo(width * 0.82, 58 * density, width * 0.77, 18 * density, width * 0.61, 44 * density)
  context.bezierCurveTo(width * 0.46, 68 * density, width * 0.42, 16 * density, width * 0.27, 44 * density)
  context.bezierCurveTo(width * 0.16, 62 * density, width * 0.09, 30 * density, 0, 54 * density)
  context.closePath()
  context.fill()
  context.globalAlpha = 0.5 * Math.min(1.2, density)
  context.strokeStyle = color
  context.lineWidth = 9 * density
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(width * 0.02, 22 * density)
  context.bezierCurveTo(width * 0.28, 74 * density, width * 0.6, -2 * density, width * 0.98, 35 * density)
  context.stroke()
  context.restore()
  for (let index = 0; index < 9; index += 1) {
    const x = width * (index / 8)
    const y = 24 + (index % 3) * 15
    drawLeafMotif(context, x, y, (19 + (index % 3) * 5) * density, color, index % 2 ? 30 : -35)
  }
}

function drawOpenPath(context, width, height, color, opacity = 0.18) {
  context.save()
  context.globalAlpha = opacity
  const pathGradient = context.createLinearGradient(width * 0.5, height * 0.36, width * 0.5, height)
  pathGradient.addColorStop(0, `${color}aa`)
  pathGradient.addColorStop(1, color)
  context.fillStyle = pathGradient
  context.beginPath()
  context.moveTo(width * 0.29, height)
  context.bezierCurveTo(width * 0.36, height * 0.72, width * 0.46, height * 0.56, width * 0.47, height * 0.4)
  context.quadraticCurveTo(width * 0.49, height * 0.35, width * 0.53, height * 0.4)
  context.bezierCurveTo(width * 0.55, height * 0.57, width * 0.66, height * 0.72, width * 0.73, height)
  context.closePath()
  context.fill()
  context.restore()
}

function drawFernCluster(context, x, y, size, color, rotation = 0) {
  context.save()
  context.translate(x, y)
  context.rotate((rotation * Math.PI) / 180)
  context.globalAlpha = 0.46
  context.strokeStyle = color
  context.fillStyle = color
  context.lineWidth = Math.max(1.4, size * 0.055)
  context.beginPath()
  context.moveTo(0, size)
  context.quadraticCurveTo(-size * 0.18, 0, 0, -size)
  context.stroke()
  for (let frond = 0; frond < 6; frond += 1) {
    const progress = frond / 6
    const stemY = size * (0.7 - progress * 1.55)
    const stemX = -size * 0.12 * progress
    const reach = size * (0.34 + progress * 0.2)
    for (const side of [-1, 1]) {
      context.beginPath()
      context.ellipse(stemX + side * reach * 0.52, stemY - size * 0.12, reach * 0.48, size * 0.105, side * 0.38, 0, Math.PI * 2)
      context.fill()
    }
  }
  context.restore()
}

function drawForestDepth(context, width, height, colors, clearing = false) {
  const layers = [
    { y: height * 0.17, step: 170, alpha: 0.16, size: 0.8 },
    { y: height * 0.23, step: 205, alpha: 0.2, size: 0.98 },
    { y: height * 0.29, step: 240, alpha: 0.16, size: 1.12 },
  ]
  layers.forEach((layer, layerIndex) => {
    context.save()
    context.fillStyle = colors[layerIndex % colors.length]
    context.globalAlpha = layer.alpha
    for (let x = -layer.step / 2; x < width + layer.step; x += layer.step) {
      const center = x + (layerIndex % 2 ? layer.step * 0.27 : 0)
      const gap = clearing ? width * (layerIndex === 0 ? 0.19 : 0.13) : 0
      const inOpening = clearing && center > width / 2 - gap && center < width / 2 + gap
      if (inOpening) continue
      const treeWidth = 52 * layer.size
      const treeHeight = 190 * layer.size
      context.beginPath()
      context.moveTo(center - treeWidth, layer.y + treeHeight)
      context.lineTo(center, layer.y)
      context.lineTo(center + treeWidth, layer.y + treeHeight)
      context.lineTo(center + treeWidth * 0.45, layer.y + treeHeight * 0.72)
      context.lineTo(center - treeWidth * 0.42, layer.y + treeHeight * 0.76)
      context.closePath()
      context.fill()
    }
    context.restore()
  })
}

function drawSunRays(context, width, height, color) {
  context.save()
  context.globalAlpha = 0.1
  const gradient = context.createRadialGradient(width * 0.52, height * 0.13, 5, width * 0.52, height * 0.13, width * 0.62)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, 'rgba(255, 249, 224, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height * 0.72)
  context.restore()
}

function drawThemeDecoration(context, decoration, x, y, color) {
  const size = decoration.size ?? 8
  context.save()
  context.fillStyle = color
  context.strokeStyle = color

  if (decoration.kind === 'dots' || decoration.kind === 'halftone') {
    const radius = decoration.kind === 'halftone' ? size * 0.55 : size * 0.35
    for (let row = -1; row <= 1; row += 1) {
      for (let column = -1; column <= 1; column += 1) {
        context.beginPath()
        context.arc(x + column * size * 1.8, y + row * size * 1.8, radius, 0, Math.PI * 2)
        context.fill()
      }
    }
  } else if (decoration.kind === 'flowers' || decoration.kind === 'daisy') {
    for (let petal = 0; petal < 8; petal += 1) {
      const angle = (Math.PI * 2 * petal) / 8
      context.beginPath()
      context.arc(x + Math.cos(angle) * size * 0.8, y + Math.sin(angle) * size * 0.8, size * 0.38, 0, Math.PI * 2)
      context.fill()
    }
    context.fillStyle = '#fff3bf'
    context.beginPath()
    context.arc(x, y, size * 0.38, 0, Math.PI * 2)
    context.fill()
  } else if (decoration.kind === 'sunflower') {
    drawFlowerHead(context, x, y, size, '#d8a638', '#654d2d', 12)
  } else if (decoration.kind === 'rose') {
    drawFlowerHead(context, x, y, size, '#a94f5f', '#75464b', 9)
    context.strokeStyle = '#f0c8bd'
    context.lineWidth = Math.max(1, size * 0.08)
    context.beginPath()
    context.arc(x, y, size * 0.3, 0.2, Math.PI * 1.7)
    context.stroke()
  } else if (decoration.kind === 'blossom' || decoration.kind === 'petal') {
    drawFlowerHead(context, x, y, size, '#f3dce1', '#d2a76f', 5)
  } else if (decoration.kind === 'leaves') {
    drawLeafMotif(context, x, y, size, color, decoration.rotation ?? 0)
  } else if (decoration.kind === 'dry-leaf') {
    drawDryLeaf(context, x, y, size, color, decoration.rotation ?? 0)
  } else if (decoration.kind === 'lavender') {
    context.save()
    context.strokeStyle = color
    context.lineWidth = Math.max(1, size * 0.1)
    context.beginPath()
    context.moveTo(x, y + size)
    context.lineTo(x, y - size)
    context.stroke()
    for (let bud = 0; bud < 4; bud += 1) {
      context.fillStyle = bud % 2 ? '#9c88b5' : '#b2a1c5'
      context.beginPath()
      context.ellipse(x + (bud % 2 ? size * 0.2 : -size * 0.2), y - size * 0.68 + bud * size * 0.38, size * 0.22, size * 0.38, 0, 0, Math.PI * 2)
      context.fill()
    }
    context.restore()
  } else if (decoration.kind === 'hearts') {
    context.beginPath()
    context.moveTo(x, y + size * 0.8)
    context.bezierCurveTo(x - size * 1.5, y - size * 0.1, x - size * 0.8, y - size, x, y - size * 0.35)
    context.bezierCurveTo(x + size * 0.8, y - size, x + size * 1.5, y - size * 0.1, x, y + size * 0.8)
    context.fill()
  } else if (decoration.kind === 'confetti' || decoration.kind === 'pennants') {
    context.translate(x, y)
    context.rotate(-0.35)
    context.fillRect(-size * 0.45, -size, size * 0.9, size * 2)
    context.beginPath()
    context.moveTo(size * 1.1, -size)
    context.lineTo(size * 2.2, 0)
    context.lineTo(size * 1.1, size)
    context.closePath()
    context.fill()
  } else if (decoration.kind === 'corners') {
    context.lineWidth = Math.max(1.5, size * 0.2)
    context.beginPath()
    context.moveTo(x - size, y + size)
    context.lineTo(x - size, y - size)
    context.lineTo(x + size, y - size)
    context.stroke()
  } else if (decoration.kind === 'ribbons') {
    context.lineWidth = Math.max(1.5, size * 0.18)
    context.beginPath()
    context.moveTo(x - size * 1.6, y)
    context.bezierCurveTo(x - size * 0.5, y - size, x + size * 0.5, y + size, x + size * 1.6, y)
    context.stroke()
    drawPrintStar(context, x, y, size * 0.5, color)
  } else if (decoration.kind === 'tape') {
    context.translate(x, y)
    context.rotate(-0.3)
    context.globalAlpha = 0.72
    context.fillRect(-size * 1.5, -size * 0.35, size * 3, size * 0.7)
  } else if (decoration.kind === 'stamp') {
    context.lineWidth = Math.max(1.5, size * 0.16)
    context.setLineDash([3, 2])
    context.strokeRect(x - size, y - size, size * 2, size * 2)
    context.setLineDash([])
    drawPrintStar(context, x, y, size * 0.45, color)
  } else {
    drawPrintStar(context, x, y, size, color)
  }

  context.restore()
}

function drawThemeBorder(context, theme, width, height, photoPositions, frameChoice = 'theme') {
  if (frameChoice === 'none') return
  const border = theme.borderStyle
  const frameOverride = {
    keyline: { ...border, kind: 'keyline', weight: 2 },
    bold: { ...border, kind: 'keyline', weight: 8 },
    dashed: { ...border, kind: 'dashed', weight: 3 },
  }[frameChoice]
  const activeBorder = frameOverride ?? border
  const inset = border.inset
  const firstPhotoY = Math.min(...photoPositions.map((position) => position.y))
  context.save()
  context.strokeStyle = theme.accent
  context.lineWidth = activeBorder.weight
  context.setLineDash(activeBorder.kind === 'dashed' || activeBorder.kind === 'stitched' ? [7, 6] : activeBorder.kind === 'dotted' ? [1, 6] : [])
  context.lineCap = activeBorder.kind === 'dotted' ? 'round' : 'butt'
  context.strokeRect(inset, inset, width - inset * 2, height - inset * 2)
  context.setLineDash([])

  if (activeBorder.innerInset) {
    context.strokeStyle = theme.text
    context.lineWidth = activeBorder.kind === 'newspaper' ? 1 : Math.max(1, activeBorder.weight * 0.45)
    context.strokeRect(inset + activeBorder.innerInset, inset + activeBorder.innerInset, width - (inset + activeBorder.innerInset) * 2, height - (inset + activeBorder.innerInset) * 2)
  }

  if (border.kind === 'film' || border.kind === 'perforated') {
    context.fillStyle = theme.background
    for (let y = firstPhotoY - 12; y < height - 110; y += 30) {
      for (const x of [inset + 10, width - inset - 10]) {
        context.beginPath()
        context.arc(x, y, border.kind === 'film' ? 3.2 : 2.4, 0, Math.PI * 2)
        context.fill()
      }
    }
  } else if (border.kind === 'ticket') {
    context.fillStyle = theme.background
    for (const position of photoPositions) {
      const y = position.y + position.height / 2
      for (const x of [inset, width - inset]) {
        context.beginPath()
        context.arc(x, y, 8, 0, Math.PI * 2)
        context.fill()
      }
    }
  } else if (border.kind === 'stripe') {
    context.fillStyle = theme.accent
    for (let line = 0; line < 3; line += 1) {
      const offset = inset + 8 + line * 6
      context.fillRect(width / 2 - 45, offset, 90, 2)
      context.fillRect(width / 2 - 45, height - offset - 2, 90, 2)
    }
  }

  context.restore()
}

function drawThemeDecorations(context, theme, width, height) {
  theme.decorations.forEach((decoration) => {
    context.save()
    context.translate(decoration.x * width, decoration.y * height)
    context.rotate((decoration.rotation * Math.PI) / 180)
    drawThemeDecoration(
      context,
      decoration,
      0,
      0,
      decoration.color ?? theme.accent,
    )
    context.restore()
  })
}

function drawFooterSeparator(context, theme, width, y) {
  context.strokeStyle = theme.accent
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(72, y)
  context.lineTo(width - 72, y)
  context.stroke()
}

function drawThemeBackground(context, theme, width, height) {
  const style = theme.backgroundStyle
  let fill = theme.background

  if (['sunset', 'birthday', 'burst', 'disco', 'neon', 'noir', 'scrapbook', 'gallery', 'paper-grain', 'clouds', 'coast', 'chrome', 'banyan-canopy', 'secret-garden-arch', 'cherry-blossom-walk', 'forest-clearing', 'wildflower-path', 'monsoon-green', 'autumn-grove', 'dry-leaves-bottom', 'tropical-canopy', 'rose-tree-garden', 'golden-forest', 'lavender-woods', 'daisy-meadow', 'lakeside-trees', 'enchanted-woodland'].includes(style)) {
    const gradient = context.createLinearGradient(0, 0, width, height)
    if (style === 'sunset') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.58, theme.background)
      gradient.addColorStop(1, theme.accent)
    } else if (style === 'disco' || style === 'neon' || style === 'noir') {
      gradient.addColorStop(0, '#211721')
      gradient.addColorStop(0.58, theme.background)
      gradient.addColorStop(1, theme.accent)
    } else if (style === 'clouds') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.46, theme.background)
      gradient.addColorStop(1, theme.frame)
    } else if (style === 'coast') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.62, theme.background)
      gradient.addColorStop(1, theme.background)
    } else if (style === 'chrome') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.34, theme.background)
      gradient.addColorStop(0.68, theme.frame)
      gradient.addColorStop(1, theme.background)
    } else if (style === 'monsoon-green' || style === 'forest-clearing' || style === 'enchanted-woodland') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.46, theme.background)
      gradient.addColorStop(1, style === 'monsoon-green' ? '#4c665b' : '#465e51')
    } else if (style === 'autumn-grove' || style === 'dry-leaves-bottom') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.58, theme.background)
      gradient.addColorStop(1, style === 'dry-leaves-bottom' ? '#c49b69' : '#a9784f')
    } else if (style === 'golden-forest') {
      gradient.addColorStop(0, '#f7e7b7')
      gradient.addColorStop(0.5, theme.background)
      gradient.addColorStop(1, '#82906a')
    } else if (style === 'lakeside-trees') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.42, theme.background)
      gradient.addColorStop(0.68, '#a9c7bf')
      gradient.addColorStop(1, '#7da6a1')
    } else if (style === 'lavender-woods') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.6, theme.background)
      gradient.addColorStop(1, '#b1a1bb')
    } else if (style === 'banyan-canopy' || style === 'tropical-canopy') {
      gradient.addColorStop(0, '#b8c8a2')
      gradient.addColorStop(0.42, theme.background)
      gradient.addColorStop(1, theme.frame)
    } else if (style === 'daisy-meadow' || style === 'wildflower-path') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.62, theme.background)
      gradient.addColorStop(1, '#c6d3a9')
    } else if (style === 'secret-garden-arch' || style === 'cherry-blossom-walk' || style === 'rose-tree-garden') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.55, theme.background)
      gradient.addColorStop(1, theme.frame)
    } else if (style === 'lavender-field') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.36, theme.background)
      gradient.addColorStop(0.78, theme.accent)
      gradient.addColorStop(1, theme.background)
    } else if (style === 'forest-morning') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.28, theme.background)
      gradient.addColorStop(0.76, '#526d5d')
      gradient.addColorStop(1, theme.background)
    } else if (style === 'mountain-sunset') {
      gradient.addColorStop(0, '#e8a47f')
      gradient.addColorStop(0.42, theme.frame)
      gradient.addColorStop(0.72, theme.background)
      gradient.addColorStop(1, theme.accent)
    } else if (style === 'lakeside-escape') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.3, theme.background)
      gradient.addColorStop(0.68, '#accbc5')
      gradient.addColorStop(1, theme.accent)
    } else if (style === 'greenhouse') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.55, theme.background)
      gradient.addColorStop(1, '#c8d8c4')
    } else if (style === 'tropical-garden') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.5, theme.background)
      gradient.addColorStop(1, '#b6c9a2')
    } else if (style === 'autumn-park' || style === 'dry-leaves') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.5, theme.background)
      gradient.addColorStop(1, style === 'dry-leaves' ? '#d7bd94' : '#d1aa76')
    } else if (style === 'sunflower-meadow') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.62, theme.background)
      gradient.addColorStop(1, '#d6d49b')
    } else if (style === 'wildflower-meadow' || style === 'daisy-field') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.62, theme.background)
      gradient.addColorStop(1, '#d5dfb9')
    } else if (style === 'spring-branches' || style === 'blooming-garden' || style === 'cherry-blossom' || style === 'rose-garden') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(0.55, theme.background)
      gradient.addColorStop(1, theme.frame)
    } else if (style === 'birthday') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(1, theme.background)
    } else if (style === 'scrapbook') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(1, theme.background)
    } else if (style === 'gallery') {
      gradient.addColorStop(0, theme.frame)
      gradient.addColorStop(1, theme.background)
    } else {
      gradient.addColorStop(0, theme.background)
      gradient.addColorStop(1, theme.accent)
    }
    fill = gradient
  }

  context.fillStyle = fill
  context.fillRect(0, 0, width, height)

  if (style === 'stars' || style === 'disco' || style === 'neon') {
    const starCount = style === 'neon' ? 20 : 54
    for (let index = 0; index < starCount; index += 1) {
      const x = (index * 137 + 31) % width
      const y = (index * 197 + 47) % height
      drawPrintStar(context, x, y, index % 3 === 0 ? 8 : 4, index % 2 ? theme.accent : theme.frame)
    }
  } else if (style === 'film') {
    context.save()
    context.globalAlpha = 0.12
    context.fillStyle = theme.accent
    for (let x = 45; x < width; x += 28) context.fillRect(x, 0, 2, height)
    context.restore()
    context.fillStyle = theme.accent
    for (let y = 34; y < height - 34; y += 35) {
      for (const x of [25, width - 25]) {
        context.fillRect(x - 5, y - 7, 10, 14)
      }
    }
  } else if (style === 'white-grid' || style === 'editorial') {
    context.save()
    context.strokeStyle = `${theme.accent}33`
    context.lineWidth = 1
    const spacing = style === 'white-grid' ? 56 : 72
    for (let x = spacing; x < width; x += spacing) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, height)
      context.stroke()
    }
    if (style === 'white-grid') {
      for (let y = spacing; y < height; y += spacing) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(width, y)
        context.stroke()
      }
    }
    context.restore()
  } else if (style === 'postcard' || style === 'scrapbook') {
    context.save()
    context.strokeStyle = `${theme.accent}2b`
    context.lineWidth = 1
    for (let y = 45; y < height; y += style === 'postcard' ? 30 : 24) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y)
      context.stroke()
    }
    context.restore()
  } else if (style === 'burst') {
    context.save()
    context.globalAlpha = 0.15
    context.fillStyle = theme.frame
    context.beginPath()
    context.arc(width / 2, height / 2, Math.min(width, height) * 0.4, 0, Math.PI * 2)
    context.fill()
    context.restore()
  } else if (style === 'birthday') {
    for (let index = 0; index < 56; index += 1) {
      const x = (index * 113 + 29) % width
      const y = (index * 167 + 53) % height
      drawThemeDecoration(context, { kind: 'confetti', size: index % 3 === 0 ? 8 : 5 }, x, y, index % 2 ? theme.accent : theme.frame)
    }
  } else if (style === 'floral') {
    for (let y = 45; y < height; y += 88) {
      for (let x = 42; x < width; x += 104) {
        drawThemeDecoration(context, { kind: 'flowers', size: 7 }, x, y, theme.accent)
      }
    }
  } else if (style === 'heart-paper' || style === 'paper-grain') {
    context.save()
    context.globalAlpha = 0.12
    context.fillStyle = theme.accent
    for (let index = 0; index < 90; index += 1) {
      const x = (index * 83 + 23) % width
      const y = (index * 127 + 41) % height
      context.beginPath()
      context.arc(x, y, index % 4 === 0 ? 2 : 1, 0, Math.PI * 2)
      context.fill()
    }
    context.restore()
  } else if (style === 'clouds') {
    drawCloudMotif(context, width * 0.12, height * 0.09, 28, theme.frame)
    drawCloudMotif(context, width * 0.86, height * 0.16, 22, theme.frame)
    drawCloudMotif(context, width * 0.2, height * 0.91, 18, theme.frame)
  } else if (style === 'coast') {
    context.save()
    context.strokeStyle = theme.accent
    context.globalAlpha = 0.18
    context.lineWidth = 2
    for (let row = 0; row < 4; row += 1) {
      const y = height - 158 + row * 11
      context.beginPath()
      context.moveTo(0, y)
      context.bezierCurveTo(width * 0.22, y - 8, width * 0.34, y + 8, width * 0.52, y)
      context.bezierCurveTo(width * 0.7, y - 8, width * 0.82, y + 8, width, y)
      context.stroke()
    }
    context.restore()
  } else if (style === 'botanical' || style === 'tropical') {
    const size = style === 'tropical' ? 17 : 13
    for (let y = 94; y < height - 210; y += style === 'tropical' ? 170 : 210) {
      drawLeafMotif(context, 36, y, size, theme.accent, -8)
      drawLeafMotif(context, width - 36, y + 48, size, theme.accent, 188)
    }
  } else if (style === 'lavender') {
    for (const x of [32, width - 32]) {
      for (let y = 110; y < height - 210; y += 220) {
        context.save()
        context.globalAlpha = 0.26
        context.strokeStyle = theme.accent
        context.fillStyle = theme.accent
        context.lineWidth = 1.5
        context.beginPath()
        context.moveTo(x, y + 24)
        context.lineTo(x, y - 24)
        context.stroke()
        for (let bud = 0; bud < 4; bud += 1) {
          context.beginPath()
          context.ellipse(x + (bud % 2 ? 4 : -4), y - 18 + bud * 10, 2.2, 4, 0, 0, Math.PI * 2)
          context.fill()
        }
        context.restore()
      }
    }
  } else if (style === 'wildflower') {
    for (const x of [30, width - 30]) {
      for (const y of [62, height * 0.28, height * 0.7, height - 62]) {
        drawThemeDecoration(context, { kind: 'flowers', size: 5 }, x, y, theme.accent)
      }
    }
  } else if (style === 'rose-petal') {
    context.save()
    context.fillStyle = theme.accent
    context.globalAlpha = 0.18
    for (let index = 0; index < 22; index += 1) {
      const x = (index * 173 + 32) % width
      const y = index % 2 ? 46 + (index * 29) % 94 : height - 230 + (index * 31) % 90
      context.save()
      context.translate(x, y)
      context.rotate((index % 2 ? 35 : -28) * Math.PI / 180)
      context.beginPath()
      context.ellipse(0, 0, 4, 8, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }
    context.restore()
  } else if (style === 'autumn') {
    for (let y = 72; y < height - 220; y += 175) {
      drawLeafMotif(context, 32, y, 11, theme.accent, -14)
      drawLeafMotif(context, width - 32, y + 46, 11, theme.accent, 194)
    }
  } else if (style === 'celebration') {
    context.save()
    const colors = [theme.accent, theme.frame]
    context.globalAlpha = 0.4
    for (let index = 0; index < 28; index += 1) {
      const edge = index % 2 === 0
      const x = (index * 137 + 35) % width
      const y = edge ? 26 + (index * 23) % 70 : height - 100 + (index * 19) % 70
      context.fillStyle = colors[index % colors.length]
      context.save()
      context.translate(x, y)
      context.rotate((index % 2 ? 1 : -1) * 0.4)
      context.fillRect(-2, -5, 4, 10)
      context.restore()
    }
    context.restore()
  } else if (style === 'chrome') {
    context.save()
    context.strokeStyle = theme.accent
    context.globalAlpha = 0.12
    context.lineWidth = 1
    for (let x = -height; x < width; x += 46) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x + height, height)
      context.stroke()
    }
    context.restore()
  } else if (style === 'banyan-canopy') {
    drawCanopyFringe(context, width, '#486d4d', 1.4)
    drawSceneTree(context, 4, height, 1, '#665544', '#436949', 1.15)
    drawSceneTree(context, width - 4, height, -1, '#5e4f43', '#4b714e', 1.05)
    context.save()
    context.strokeStyle = '#665544'
    context.globalAlpha = 0.5
    context.lineWidth = 4
    for (let root = 0; root < 5; root += 1) {
      const x = root % 2 ? 32 + root * 11 : width - 34 - root * 12
      const length = 120 + (root % 3) * 42
      context.beginPath()
      context.moveTo(x, 0)
      context.bezierCurveTo(x - 10, length * 0.3, x + 16, length * 0.6, x + (root % 2 ? 7 : -8), length)
      context.stroke()
    }
    context.restore()
  } else if (style === 'secret-garden-arch') {
    drawForestDepth(context, width, height, ['#64765e', '#526b54', '#6f805e'])
    drawSunRays(context, width, height, '#f4e2ad')
    context.save()
    context.strokeStyle = '#617454'
    context.lineWidth = 17
    context.globalAlpha = 0.52
    context.beginPath()
    context.moveTo(78, height - 115)
    context.lineTo(78, 200)
    context.bezierCurveTo(78, 82, width * 0.28, 48, width * 0.5, 58)
    context.bezierCurveTo(width * 0.72, 48, width - 78, 82, width - 78, 200)
    context.lineTo(width - 78, height - 115)
    context.stroke()
    context.restore()
    for (let index = 0; index < 13; index += 1) {
      const angle = Math.PI + Math.PI * index / 12
      const x = width * 0.5 + Math.cos(angle) * width * 0.37
      const y = 202 + Math.sin(angle) * 144
      drawLeafMotif(context, x, y, 12, '#66805a', index * 12)
      if (index % 2 === 0) drawFlowerHead(context, x, y, 12, index % 4 ? '#c97980' : '#eed9c7', '#d6ad71', 8)
    }
    drawGardenVine(context, 78, 210, height * 0.54, '#617454', 1)
    drawGardenVine(context, width - 78, 210, height * 0.54, '#617454', -1)
  } else if (style === 'cherry-blossom-walk') {
    drawSceneTree(context, 0, height, 1, '#765c60', '#9b6874', 0.9)
    drawSceneTree(context, width, height, -1, '#765c60', '#a56e7b', 0.9)
    drawBlossomBranch(context, 30, 250, width * 0.4, '#765c60', '#f3d8df', -10)
    drawBlossomBranch(context, width - 30, 235, width * 0.38, '#765c60', '#fff1eb', 188)
    for (let petal = 0; petal < 18; petal += 1) {
      const side = petal % 2 ? 1 : -1
      const x = side > 0 ? 52 + (petal * 17) % 114 : width - 52 - (petal * 19) % 114
      const y = 78 + (petal * 71) % (height - 290)
      context.save()
      context.globalAlpha = 0.5
      context.fillStyle = petal % 3 ? '#e9beca' : '#fff2ec'
      context.translate(x, y)
      context.rotate(petal * 0.4)
      context.beginPath()
      context.ellipse(0, 0, 4, 8, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }
  } else if (style === 'forest-clearing') {
    drawSunRays(context, width, height, '#fff7d8')
    drawForestDepth(context, width, height, ['#718064', '#566f5c', '#435f50'], true)
    for (let tree = 0; tree < 5; tree += 1) {
      const leftSide = tree % 2 === 0
      const x = leftSide ? 8 + tree * 12 : width - 8 - tree * 12
      const color = tree % 2 ? '#62765f' : '#3f5f4d'
      context.save()
      context.globalAlpha = 0.24 + (tree % 2) * 0.08
      context.fillStyle = color
      context.beginPath()
      context.moveTo(x, height)
      context.lineTo(x, 0)
      context.lineTo(x + (leftSide ? 34 : -34), 0)
      context.lineTo(x + (leftSide ? 49 : -49), height)
      context.closePath()
      context.fill()
      context.restore()
      if (tree < 2) drawSceneTree(context, leftSide ? 0 : width, height, leftSide ? 1 : -1, '#584e43', '#527153', 0.9)
    }
    drawOpenPath(context, width, height, '#d7cba8', 0.1)
  } else if (style === 'wildflower-path') {
    drawCanopyFringe(context, width, '#55714b', 0.95)
    drawForestDepth(context, width, height, ['#728266', '#5c755d', '#728262'], true)
    drawSceneTree(context, 0, height, 1, '#685843', '#4f714b', 0.72)
    drawSceneTree(context, width, height, -1, '#685843', '#55764e', 0.72)
    drawOpenPath(context, width, height, '#d6c69f', 0.14)
    const bloomColors = ['#d58a84', '#e6bd58', '#8b9ca2', '#b18eae']
    for (let bloom = 0; bloom < 24; bloom += 1) {
      const x = bloom % 2 ? 32 + (bloom * 19) % 92 : width - 32 - (bloom * 23) % 92
      const y = height - 145 + (bloom * 17) % 86
      drawFlowerHead(context, x, y, 6 + bloom % 3, bloomColors[bloom % bloomColors.length], '#d1a64e', 5)
    }
  } else if (style === 'monsoon-green') {
    drawSceneTree(context, 0, height, 1, '#3b4038', '#315d4d', 1.1)
    drawSceneTree(context, width, height, -1, '#353c36', '#3d7056', 1.1)
    for (let leaf = 0; leaf < 14; leaf += 1) {
      const x = leaf % 2 ? 30 + (leaf * 13) % 100 : width - 30 - (leaf * 17) % 100
      const y = 48 + (leaf * 83) % (height - 240)
      drawLeafMotif(context, x, y, 20 + leaf % 3 * 3, leaf % 2 ? '#346c56' : '#567956', leaf * 22)
    }
    drawFernCluster(context, 53, height - 145, 72, '#416f53', -18)
    drawFernCluster(context, width - 50, height - 153, 78, '#527c5b', 21)
    drawForestDepth(context, width, height, ['#637665', '#546e5e', '#78907a'])
    for (let mist = 0; mist < 3; mist += 1) {
      drawCloudMotif(context, width * (0.3 + mist * 0.2), 190 + mist * 180, 50, '#e6eee0')
    }
    context.save()
    context.strokeStyle = '#c9d6ca'
    context.globalAlpha = 0.12
    for (let drop = 0; drop < 40; drop += 1) {
      const x = (drop * 83 + 17) % width
      const y = (drop * 137 + 31) % height
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x - 2, y + 13)
      context.stroke()
    }
    context.restore()
  } else if (style === 'autumn-grove') {
    drawForestDepth(context, width, height, ['#b18450', '#977648', '#ae8750'])
    drawSceneTree(context, 0, height, 1, '#66513c', '#b2763f', 1)
    drawSceneTree(context, width, height, -1, '#6d553b', '#c28a43', 0.94)
    drawCanopyFringe(context, width, '#bd8745', 1.2)
    for (let leaf = 0; leaf < 28; leaf += 1) {
      const x = 20 + (leaf * 79) % (width - 40)
      const y = height - 130 + (leaf * 23) % 96
      drawDryLeaf(context, x, y, 8 + leaf % 5, ['#b66f3b', '#ce9849', '#8c6748'][leaf % 3], leaf * 31)
    }
  } else if (style === 'dry-leaves-bottom') {
    context.save()
    context.globalAlpha = 0.09
    context.fillStyle = '#70553b'
    for (let grain = 0; grain < 170; grain += 1) {
      const x = (grain * 83 + 23) % width
      const y = (grain * 127 + 41) % height
      context.fillRect(x, y, grain % 4 === 0 ? 2 : 1, 1)
    }
    context.restore()
    const leafPalette = ['#a95e38', '#c18445', '#d0a45e', '#8d6547', '#b87943']
    for (let leaf = 0; leaf < 46; leaf += 1) {
      const x = 14 + (leaf * 47) % (width - 28)
      const y = height - 132 + (leaf * 31) % 86
      drawDryLeaf(context, x, y, 7 + leaf % 5, leafPalette[leaf % leafPalette.length], leaf * 23)
    }
    for (let leaf = 0; leaf < 10; leaf += 1) {
      const x = leaf % 2 ? 18 + leaf * 7 : width - 18 - leaf * 7
      drawDryLeaf(context, x, 72 + leaf * 25, 10, leafPalette[(leaf + 2) % leafPalette.length], leaf * 33)
    }
  } else if (style === 'tropical-canopy') {
    drawForestDepth(context, width, height, ['#6a8a5b', '#4d7958', '#749462'])
    drawSceneTree(context, 0, height, 1, '#554b3a', '#3d7855', 0.82)
    drawSceneTree(context, width, height, -1, '#554b3a', '#357653', 0.82)
    for (let frond = 0; frond < 8; frond += 1) {
      const right = frond % 2 === 1
      const x = right ? width - 12 : 12
      const y = 25 + Math.floor(frond / 2) * 28
      const inward = right ? -1 : 1
      context.save()
      context.strokeStyle = '#347451'
      context.globalAlpha = 0.62
      context.lineWidth = 3
      context.beginPath()
      context.moveTo(x, y)
      context.quadraticCurveTo(x + inward * 90, y + 18, x + inward * 190, y + 12)
      context.stroke()
      for (let leaflet = 0; leaflet < 7; leaflet += 1) {
        const fx = x + inward * (25 + leaflet * 22)
        const fy = y + 3 + Math.sin(leaflet * 0.55) * 13
        drawLeafMotif(context, fx, fy, 12, leaflet % 2 ? '#3d8157' : '#67945d', inward * (leaflet * 13 - 35))
      }
      context.restore()
    }
    drawFlowerHead(context, 63, height - 126, 10, '#df9672', '#e4c56d', 6)
    drawFlowerHead(context, width - 64, height - 158, 9, '#e9b178', '#d1a95d', 6)
    drawFernCluster(context, 45, height - 115, 67, '#4a8057', -24)
    drawFernCluster(context, width - 45, height - 118, 63, '#558960', 24)
  } else if (style === 'rose-tree-garden') {
    drawForestDepth(context, width, height, ['#73806a', '#5f725a', '#839078'])
    drawSceneTree(context, 0, height, 1, '#6a5548', '#577354', 0.92)
    drawSceneTree(context, width, height, -1, '#6b5547', '#647a55', 0.9)
    drawGardenVine(context, 35, 90, height * 0.7, '#55734e', 1)
    drawGardenVine(context, width - 35, 112, height * 0.68, '#55734e', -1)
    for (const [x, y, size] of [[48, 125, 17], [width - 53, 176, 15], [58, height - 211, 14], [width - 50, height - 178, 16]]) {
      drawFlowerHead(context, x, y, size, '#b75664', '#e7bd98', 9)
    }
  } else if (style === 'golden-forest') {
    drawSunRays(context, width, height, '#ffdf91')
    drawForestDepth(context, width, height, ['#b19559', '#908450', '#a89b61'])
    drawSceneTree(context, 0, height, 1, '#65513c', '#817b4e', 0.86)
    drawSceneTree(context, width, height, -1, '#6a553d', '#8d8550', 0.84)
    for (let tree = 0; tree < 3; tree += 1) {
      const x = width * (0.22 + tree * 0.28)
      context.save()
      context.globalAlpha = 0.2
      context.fillStyle = '#716048'
      context.fillRect(x, 0, 15, height * 0.28)
      context.restore()
    }
    drawCanopyFringe(context, width, '#b19559', 0.86)
  } else if (style === 'lavender-woods') {
    drawForestDepth(context, width, height, ['#858078', '#736d71', '#8b8390'])
    drawSceneTree(context, 0, height, 1, '#655b50', '#6f6c5d', 0.86)
    drawSceneTree(context, width, height, -1, '#655b50', '#77715d', 0.86)
    for (let sprig = 0; sprig < 14; sprig += 1) {
      const x = sprig % 2 ? 34 + (sprig * 9) % 68 : width - 34 - (sprig * 11) % 68
      const y = height - 174 + (sprig * 19) % 105
      drawLavenderSprig(context, x, y, 44, '#82729a')
    }
    drawCanopyFringe(context, width, '#746b78', 0.68)
  } else if (style === 'daisy-meadow') {
    drawForestDepth(context, width, height, ['#88916f', '#707f60', '#8c9871'])
    drawSceneTree(context, 0, height, 1, '#665947', '#5d7550', 0.82)
    drawSceneTree(context, width, height, -1, '#665947', '#647a52', 0.82)
    drawMeadowGrass(context, width, height, '#83945e', 0.28)
    for (let bloom = 0; bloom < 22; bloom += 1) {
      const x = bloom % 2 ? 22 + (bloom * 17) % 93 : width - 22 - (bloom * 21) % 93
      const y = height - 153 + (bloom * 13) % 86
      drawFlowerHead(context, x, y, 7 + bloom % 4, '#fff9e9', '#e4c258', 8)
    }
  } else if (style === 'lakeside-trees') {
    drawForestDepth(context, width, height, ['#718270', '#5d7866', '#81917a'], true)
    drawSceneTree(context, 0, height, 1, '#5a5144', '#4c7054', 0.86)
    drawSceneTree(context, width, height, -1, '#5c5345', '#557857', 0.82)
    const horizon = height * 0.24
    context.save()
    context.globalAlpha = 0.3
    context.fillStyle = '#547a6f'
    context.beginPath()
    context.moveTo(0, horizon + 12)
    context.lineTo(0, horizon - 12)
    for (let x = 0; x <= width; x += width / 10) context.lineTo(x, horizon - 20 + Math.sin(x / width * Math.PI * 3) * 13)
    context.lineTo(width, horizon + 20)
    context.closePath()
    context.fill()
    context.restore()
    context.save()
    context.strokeStyle = '#f7f2e2'
    context.globalAlpha = 0.24
    for (let ripple = 0; ripple < 8; ripple += 1) {
      const y = horizon + 60 + ripple * 26
      context.beginPath()
      context.moveTo(width * 0.15, y)
      context.quadraticCurveTo(width * 0.38, y - 5, width * 0.62, y)
      context.quadraticCurveTo(width * 0.79, y + 5, width * 0.91, y)
      context.stroke()
    }
    context.restore()
    drawCloudMotif(context, width * 0.72, 75, 23, theme.frame)
  } else if (style === 'enchanted-woodland') {
    drawSunRays(context, width, height, '#f3dfae')
    drawForestDepth(context, width, height, ['#66755a', '#4f6a54', '#728064'])
    drawSceneTree(context, 0, height, 1, '#4d4b3f', '#3f6950', 1.05)
    drawSceneTree(context, width, height, -1, '#514b3d', '#456c51', 1.02)
    drawCanopyFringe(context, width, '#3c634b', 1.1)
    drawGardenVine(context, 45, 75, height * 0.58, '#52744f', 1)
    drawGardenVine(context, width - 45, 90, height * 0.55, '#52744f', -1)
    drawFernCluster(context, 54, height - 120, 60, '#4c7451', -15)
    drawFernCluster(context, width - 54, height - 130, 65, '#557a54', 18)
    for (let light = 0; light < 23; light += 1) {
      const x = light % 2 ? 45 + (light * 23) % 125 : width - 45 - (light * 29) % 125
      const y = 72 + (light * 67) % (height - 245)
      context.save()
      context.globalAlpha = 0.52
      context.fillStyle = light % 3 ? '#f1df9b' : '#f2d4b7'
      context.shadowColor = context.fillStyle
      context.shadowBlur = 12
      context.beginPath()
      context.arc(x, y, light % 4 === 0 ? 3 : 2, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }
  }
}

function drawCustomizedBackground(context, theme, width, height, choice, natureSceneImage = null) {
  if (choice === 'theme') {
    if (natureSceneImage) context.drawImage(natureSceneImage, 0, 0, width, height)
    else if (isNaturePhotoTheme(theme)) {
      context.fillStyle = theme.background
      context.fillRect(0, 0, width, height)
    }
    else drawThemeBackground(context, theme, width, height)
    return
  }

  const solidColors = {
    'solid-blush': '#f2d8df',
    'solid-cream': '#fff5e9',
    'solid-red': '#922b43',
    'solid-charcoal': '#282228',
    'solid-white': '#fffdfa',
    'theme-frame': theme.frame,
    'theme-accent': theme.accent,
  }
  if (solidColors[choice]) {
    context.fillStyle = solidColors[choice]
    context.fillRect(0, 0, width, height)
    return
  }

  if (choice === 'gradient-rose' || choice === 'gradient-berry') {
    const gradient = context.createLinearGradient(0, 0, width, height)
    if (choice === 'gradient-rose') {
      gradient.addColorStop(0, '#fff4f5')
      gradient.addColorStop(0.52, '#f1bfd0')
      gradient.addColorStop(1, '#c94361')
    } else {
      gradient.addColorStop(0, '#30202b')
      gradient.addColorStop(0.56, '#8d2b48')
      gradient.addColorStop(1, '#ed7d9e')
    }
    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)
    return
  }

  context.fillStyle = choice === 'pattern-dots' ? theme.frame : theme.background
  context.fillRect(0, 0, width, height)
  if (choice === 'pattern-hearts') {
    for (let y = 55; y < height; y += 115) {
      for (let x = 55; x < width; x += 125) {
        drawThemeDecoration(context, { kind: 'heart-outline', size: 8 }, x, y, theme.accent)
      }
    }
  } else if (choice === 'pattern-stars') {
    for (let index = 0; index < 60; index += 1) {
      const x = (index * 137 + 31) % width
      const y = (index * 197 + 47) % height
      drawPrintStar(context, x, y, index % 4 === 0 ? 9 : 5, index % 2 ? theme.accent : theme.frame)
    }
  } else if (choice === 'pattern-dots') {
    context.fillStyle = theme.accent
    context.globalAlpha = 0.25
    for (let y = 24; y < height; y += 34) {
      for (let x = 24; x < width; x += 34) {
        context.beginPath()
        context.arc(x, y, 2.2, 0, Math.PI * 2)
        context.fill()
      }
    }
    context.globalAlpha = 1
  } else if (choice === 'pattern-film') {
    context.fillStyle = theme.accent
    context.globalAlpha = 0.18
    for (let x = 35; x < width; x += 28) context.fillRect(x, 0, 2, height)
    context.globalAlpha = 1
    for (let y = 34; y < height - 34; y += 35) {
      context.fillRect(18, y - 7, 10, 14)
      context.fillRect(width - 28, y - 7, 10, 14)
    }
  }
}

function getPhotoFilter(filter) {
  const filters = {
    original: '',
    bw: 'grayscale(1)',
    warm: 'sepia(0.2) saturate(1.12)',
    vintage: 'sepia(0.48) saturate(0.82) contrast(0.96)',
    nineties: 'sepia(0.14) saturate(0.78) contrast(0.92) hue-rotate(-8deg)',
    y2k: 'saturate(1.5) contrast(1.08) hue-rotate(8deg)',
    soft: 'brightness(1.08) saturate(0.86)',
    contrast: 'contrast(1.3) saturate(1.08)',
    grain: 'contrast(1.08) saturate(0.9)',
    'light-leak': 'sepia(0.18) saturate(1.28) brightness(1.08)',
    cctv: 'grayscale(0.8) contrast(1.55) brightness(0.86)',
    thermal: 'invert(1) sepia(1) saturate(5) hue-rotate(290deg)',
    'night-vision': 'grayscale(0.55) sepia(1) hue-rotate(65deg) saturate(3) brightness(0.9)',
    glitch: 'contrast(1.45) saturate(1.6) hue-rotate(18deg)',
  }
  return filters[filter] ?? ''
}

function getTextFont(textObject) {
  return `${textObject.weight === 'bold' ? '700' : '400'} ${textObject.fontSize}px ${textObject.fontFamily}`
}

function wrapCanvasText(context, text, maxWidth) {
  const lines = []
  String(text).split('\n').forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push('')
      return
    }
    let line = ''
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word
      if (line && context.measureText(candidate).width <= maxWidth) {
        line = candidate
        return
      }
      if (line) lines.push(line)
      line = ''
      for (const character of word) {
        const next = line + character
        if (line && context.measureText(next).width > maxWidth) {
          lines.push(line)
          line = character
        } else {
          line = next
        }
      }
    })
    lines.push(line)
  })
  return lines
}

function drawUserTextObjects(context, textObjects, width, height) {
  const maxTextDimension = Math.min(width, height) * 0.72
  textObjects.forEach((textObject) => {
    if (!textObject.text) return
    context.save()
    context.globalAlpha = textObject.opacity
    context.fillStyle = textObject.color
    context.font = getTextFont(textObject)
    context.textBaseline = 'middle'
    if ('letterSpacing' in context) context.letterSpacing = `${textObject.letterSpacing}px`
    const lines = wrapCanvasText(context, textObject.text, maxTextDimension).slice(0, Math.max(1, Math.floor(maxTextDimension / (textObject.fontSize * 1.15))))
    const lineHeight = textObject.fontSize * 1.15
    const blockHeight = lines.length * lineHeight
    context.translate(textObject.x * width, textObject.y * height)
    context.rotate((textObject.rotation * Math.PI) / 180)
    context.beginPath()
    context.rect(-maxTextDimension / 2, -maxTextDimension / 2, maxTextDimension, maxTextDimension)
    context.clip()
    context.textAlign = textObject.alignment
    const lineWidths = lines.map((line) => context.measureText(line).width)
    const blockWidth = Math.max(1, ...lineWidths)
    const x = textObject.alignment === 'left' ? -blockWidth / 2 : textObject.alignment === 'right' ? blockWidth / 2 : 0
    const y = -blockHeight / 2 + lineHeight / 2
    lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight))
    context.restore()
  })
}

function drawFilmGrain(context, x, y, width, height, seed) {
  context.save()
  context.globalAlpha = 0.12
  for (let index = 0; index < 150; index += 1) {
    const grainX = x + ((index * 83 + seed * 29) % Math.max(1, Math.floor(width)))
    const grainY = y + ((index * 127 + seed * 17) % Math.max(1, Math.floor(height)))
    context.fillStyle = index % 2 ? '#fffaf4' : '#171216'
    context.fillRect(grainX, grainY, index % 5 === 0 ? 2 : 1, 1)
  }
  context.restore()
}

function drawCustomStickers(context, theme, stickerIds, width, height, customization = {}) {
  const selected = stickerIds.map((id) => CUSTOM_STICKERS.find((sticker) => sticker.id === id)).filter(Boolean).slice(0, 5)
  const scale = Math.min(1.5, Math.max(0.65, customization.stickerScale ?? 1))
  const rotation = Math.max(-18, Math.min(18, customization.stickerRotation ?? 0))
  const offsetX = Math.max(-0.08, Math.min(0.08, customization.stickerOffsetX ?? 0))
  const offsetY = Math.max(-0.08, Math.min(0.08, customization.stickerOffsetY ?? 0))
  selected.forEach((sticker, index) => {
    const x = width * (0.24 + index * 0.13 + offsetX)
    const y = height * (0.94 + offsetY)
    context.save()
    context.translate(x, y)
    context.rotate((rotation * Math.PI) / 180)
    drawThemeDecoration(context, { kind: sticker.kind, size: 13 * scale }, 0, 0, theme.accent)
    context.restore()
  })
}

function createSourceAwareSlots(images, orientation, contentAspectRatio) {
  const margin = 0.025
  const count = images.length
  const slots = images.map((image) => ({
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  }))

  if (orientation === 'horizontal') {
    const gap = 0.012
    const slotWidth = (1 - margin * 2 - gap * (count - 1)) / count
    const slotHeight = Math.min(0.94, (slotWidth * contentAspectRatio) / 0.7)
    const top = (1 - slotHeight) / 2
    return slots.map((_, index) => ({
      x: margin + index * (slotWidth + gap), y: top, width: slotWidth, height: slotHeight,
      offsetX: 0, offsetY: 0, rotation: 0, fitStrategy: 'filled-frame',
      minWidth: 0.12, minHeight: 0.12, minAspectRatio: 0.42, maxAspectRatio: 2.4,
      preferredWidth: slotWidth, preferredHeight: slotHeight, preferredAspectRatio: slotWidth / slotHeight,
    }))
  }

  const gap = 0.018
  const slotHeight = (1 - margin * 2 - gap * (count - 1)) / count
  const slotWidth = Math.min(0.92, (slotHeight * 1.7) / contentAspectRatio)
  const left = (1 - slotWidth) / 2
  return slots.map((_, index) => ({
    x: left, y: margin + index * (slotHeight + gap), width: slotWidth, height: slotHeight,
    offsetX: 0, offsetY: 0, rotation: 0, fitStrategy: 'filled-frame',
    minWidth: 0.12, minHeight: 0.12, minAspectRatio: 0.42, maxAspectRatio: 2.4,
    preferredWidth: slotWidth, preferredHeight: slotHeight, preferredAspectRatio: slotWidth / slotHeight,
  }))
}

function getPhotoPositions(theme, width, height, images, contentTop, footerY) {
  const contentLeft = width * 0.07
  const contentWidth = width * 0.86
  const contentHeight = footerY - contentTop - 24
  const contentAspectRatio = contentWidth / contentHeight
  if (theme.name === 'Custom Photo Strip') {
    return theme.photoSlots.slice(0, images.length).map((photoSlot) => ({
      x: contentLeft + (photoSlot.x + (photoSlot.offsetX ?? 0)) * contentWidth,
      y: contentTop + (photoSlot.y + (photoSlot.offsetY ?? 0)) * contentHeight,
      width: photoSlot.width * contentWidth,
      height: photoSlot.height * contentHeight,
      angle: ((photoSlot.rotation ?? 0) * Math.PI) / 180,
      fitStrategy: photoSlot.fitStrategy,
      preferredAspectRatio: (photoSlot.preferredAspectRatio ?? (photoSlot.width / photoSlot.height)) * contentAspectRatio,
    }))
  }
  const preferredSlots = theme.photoSlots
  const portraitCount = images.filter((image) => (image.naturalHeight || image.height) > (image.naturalWidth || image.width)).length
  const landscapeCount = images.length - portraitCount
  const mixedOrientations = portraitCount > 0 && landscapeCount > 0
  const needsAdaptiveLayout = mixedOrientations || preferredSlots.some((photoSlot, index) => {
    const image = images[index]
    const imageWidth = image.naturalWidth || image.width
    const imageHeight = image.naturalHeight || image.height
    const imageAspectRatio = imageWidth / imageHeight
    const slotAspectRatio = (photoSlot.preferredAspectRatio ?? photoSlot.width / photoSlot.height) * contentAspectRatio
    const fullImageCoverage = Math.min(slotAspectRatio / imageAspectRatio, imageAspectRatio / slotAspectRatio)
    return photoSlot.width < photoSlot.minWidth
      || photoSlot.height < photoSlot.minHeight
      || slotAspectRatio < photoSlot.minAspectRatio
      || slotAspectRatio > photoSlot.maxAspectRatio
      || fullImageCoverage < 0.5
  })
  const sourceOrientationCount = Math.ceil(images.length * 0.75)
  let photoSlots = preferredSlots
  if (needsAdaptiveLayout) {
    if (theme.orientation === 'horizontal' && portraitCount === images.length && portraitCount >= sourceOrientationCount) {
      photoSlots = createSourceAwareSlots(images, 'horizontal', contentAspectRatio)
    } else if (theme.orientation === 'vertical' && landscapeCount === images.length && landscapeCount >= sourceOrientationCount) {
      photoSlots = createSourceAwareSlots(images, 'vertical', contentAspectRatio)
    } else {
      photoSlots = theme.alternatePhotoSlots
    }
  }

  return photoSlots.slice(0, images.length).map((photoSlot) => ({
    x: contentLeft + (photoSlot.x + photoSlot.offsetX) * contentWidth,
    y: contentTop + (photoSlot.y + photoSlot.offsetY) * contentHeight,
    width: photoSlot.width * contentWidth,
    height: photoSlot.height * contentHeight,
    angle: (photoSlot.rotation * Math.PI) / 180,
    fitStrategy: photoSlot.fitStrategy,
    preferredAspectRatio: photoSlot.preferredAspectRatio * contentAspectRatio,
  }))
}

function getPhotoStripDimensions(theme, images) {
  const portraitPhotos = images.filter((image) => (image.naturalHeight || image.height) > (image.naturalWidth || image.width)).length
  const landscapePhotos = images.length - portraitPhotos
  const mixedOrientations = portraitPhotos > 0 && landscapePhotos > 0
  return {
    width: theme.orientation === 'vertical'
      ? mixedOrientations ? 1100 : landscapePhotos > portraitPhotos ? 1050 : 900
      : 1400,
    height: theme.orientation === 'vertical'
      ? 1500
      : mixedOrientations ? 1250 : portraitPhotos > landscapePhotos ? 1200 : 1000,
  }
}

const natureSceneImageCache = new Map()

function loadNatureSceneImage(theme, width, height) {
  if (!isNaturePhotoTheme(theme)) return Promise.resolve(null)
  const cacheKey = `${theme.backgroundStyle}:${width}:${height}`
  if (natureSceneImageCache.has(cacheKey)) return natureSceneImageCache.get(cacheKey)

  const promise = new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`The nature background for ${theme.backgroundStyle} could not be loaded.`))
    image.src = getNaturePhotoPath(theme)
  })
  natureSceneImageCache.set(cacheKey, promise)
  return promise
}

function getDefaultPhotoTransform() {
  return { offsetX: 0, offsetY: 0, rotation: 0 }
}

function getAdjustedPhotoPosition(position, photoTransform = getDefaultPhotoTransform()) {
  return {
    ...position,
    x: position.x + (photoTransform.offsetX ?? 0),
    y: position.y + (photoTransform.offsetY ?? 0),
    angle: (position.angle ?? 0) + (photoTransform.rotation ?? 0),
  }
}

function clampPhotoTransform(position, photoTransform, canvasWidth, canvasHeight) {
  const transform = {
    offsetX: Number(photoTransform?.offsetX ?? 0),
    offsetY: Number(photoTransform?.offsetY ?? 0),
    rotation: Number(photoTransform?.rotation ?? 0),
  }
  const radians = (position.angle ?? 0) + transform.rotation
  const halfWidth = (Math.abs(Math.cos(radians)) * position.width + Math.abs(Math.sin(radians)) * position.height) / 2
  const halfHeight = (Math.abs(Math.sin(radians)) * position.width + Math.abs(Math.cos(radians)) * position.height) / 2
  const defaultCenterX = position.x + position.width / 2
  const defaultCenterY = position.y + position.height / 2
  const centerX = defaultCenterX + transform.offsetX
  const centerY = defaultCenterY + transform.offsetY
  const clampedCenterX = Math.min(Math.max(centerX, halfWidth), canvasWidth - halfWidth)
  const clampedCenterY = Math.min(Math.max(centerY, halfHeight), canvasHeight - halfHeight)

  return {
    offsetX: clampedCenterX - defaultCenterX,
    offsetY: clampedCenterY - defaultCenterY,
    rotation: transform.rotation,
  }
}

function renderPhotoStrip(canvas, images, theme, customization = {}, natureSceneImage = null, photoTransforms = []) {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot render the photo strip.')

  const photoFilters = [theme.photoFilter, getPhotoFilter(customization.filter)].filter(Boolean).join(' ') || 'none'
  const { width, height } = getPhotoStripDimensions(theme, images)
  const footerY = height - 180
  const contentTop = theme.photoHeaderSpace ? 250 : 210
  const positions = getPhotoPositions(theme, width, height, images, contentTop, footerY)
  canvas.width = width
  canvas.height = height
  drawCustomizedBackground(context, theme, width, height, customization.background ?? 'theme', natureSceneImage)
  drawThemeBorder(context, theme, width, height, positions, customization.frame)
  drawThemeDecorations(context, theme, width, height)

  positions.forEach((position, index) => {
    const adjustedPosition = getAdjustedPhotoPosition(position, photoTransforms[index] ?? getDefaultPhotoTransform())
    const { x, y, width: frameWidth, height: frameHeight, angle = 0, fitStrategy } = adjustedPosition
    const frameStyle = theme.slotFrameStyle
    const polaroid = frameStyle === 'polaroid'
    const padding = frameStyle === 'polaroid' ? 15 : frameStyle === 'contact' ? 12 : frameStyle === 'tape' ? 11 : 9
    context.save()
    context.translate(x + frameWidth / 2, y + frameHeight / 2)
    context.rotate(angle)
    context.shadowColor = 'rgb(30 35 29 / 20%)'
    context.shadowBlur = ['polaroid', 'floating', 'tape'].includes(frameStyle) ? 20 : 8
    context.shadowOffsetY = 7
    context.fillStyle = theme.frame
    context.fillRect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight)
    context.shadowColor = 'transparent'
    context.shadowBlur = 0
    const captionHeight = polaroid ? Math.min(62, frameHeight * 0.2) : frameStyle === 'contact' ? Math.min(42, frameHeight * 0.15) : Math.min(36, frameHeight * 0.14)
    const photoWidth = frameWidth - padding * 2
    const photoHeight = frameHeight - padding * 2 - captionHeight
    const photoX = -frameWidth / 2 + padding
    const photoY = -frameHeight / 2 + padding
    context.save()
    context.beginPath()
    context.rect(photoX, photoY, photoWidth, photoHeight)
    context.clip()
    context.fillStyle = theme.photoBackground ?? theme.background
    context.fillRect(photoX, photoY, photoWidth, photoHeight)
    context.filter = photoFilters
    if (fitStrategy === 'filled-frame') {
      drawPhotoCover(context, images[index], photoX, photoY, photoWidth, photoHeight)
    } else {
      drawPhotoContain(context, images[index], photoX, photoY, photoWidth, photoHeight)
    }
    if (customization.filter === 'grain') drawFilmGrain(context, photoX, photoY, photoWidth, photoHeight, index + 1)
    context.restore()
    context.strokeStyle = theme.accent
    context.lineWidth = polaroid ? 1 : 1.5
    context.strokeRect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight)
    context.restore()
  })

  drawFooterSeparator(context, theme, width, footerY)
  drawCustomStickers(context, theme, customization.stickers ?? [], width, height, customization)
  drawUserTextObjects(context, customization.textObjects ?? [], width, height)
}

function FinishedStrip({ capturedPhotos, onExpire, onRetake, onCreateNewStrip, selectedTheme, customPhotoCount }) {
  const canvasRef = useRef(null)
  const baseCanvasRef = useRef(null)
  const stageRef = useRef(null)
  const photoFrameRefs = useRef(new Map())
  const textHitRefs = useRef(new Map())
  const textObjectRefs = useRef(new Map())
  const activeGestureRef = useRef(null)
  const textIdRef = useRef(0)
  const [renderStatus, setRenderStatus] = useState('rendering')
  const [renderError, setRenderError] = useState('')
  const [generatedBlob, setGeneratedBlob] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [isFinished, setIsFinished] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(60)
  const [expired, setExpired] = useState(false)
  const [photoTransforms, setPhotoTransforms] = useState([])
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null)
  const [photoFrames, setPhotoFrames] = useState([])
  const [activeEditorTab, setActiveEditorTab] = useState('text')
  const [mobileEditorExpanded, setMobileEditorExpanded] = useState(false)
  const [selectedTextId, setSelectedTextId] = useState(null)
  const [isManipulatingText, setIsManipulatingText] = useState(false)
  const activeTheme = getThemeByName(selectedTheme, customPhotoCount)
  const [previewDimensions, setPreviewDimensions] = useState(() => activeTheme.orientation === 'vertical' ? { width: 900, height: 1500 } : { width: 1400, height: 1000 })
  const [designOptions, setDesignOptions] = useState(() => ({
    background: 'theme',
    filter: 'original',
    frame: 'theme',
    stickers: [],
    stickerScale: 1,
    stickerRotation: 0,
    stickerOffsetX: 0,
    stickerOffsetY: 0,
    textObjects: [],
  }))
  const exportResourcesRef = useRef({ blob: null, url: null, expiresAt: null })
  const expiredRef = useRef(false)

  const clearExpiredDownloadState = useCallback(() => {
    expiredRef.current = false
    setExpired(false)
  }, [])

  const releaseExportResources = useCallback(() => {
    const resources = exportResourcesRef.current
    if (resources.url) URL.revokeObjectURL(resources.url)
    resources.blob = null
    resources.url = null
    resources.expiresAt = null
    setDownloadUrl(null)
    setGeneratedBlob(null)
    clearExpiredDownloadState()
  }, [clearExpiredDownloadState])

  const updateDesignOptions = useCallback((update) => {
    releaseExportResources()
    setDesignOptions((current) => ({ ...current, ...update }))
    setRenderError('')
    setDownloadError('')
    setRenderStatus('rendering')
    setGeneratedBlob(null)
    setDownloadUrl(null)
    setSecondsRemaining(60)
  }, [releaseExportResources])

  const updateTextObject = (textId, patch) => {
    updateDesignOptions({
      textObjects: designOptions.textObjects.map((textObject) => textObject.id === textId ? { ...textObject, ...patch } : textObject),
    })
  }

  const addTextObject = () => {
    textIdRef.current += 1
    const id = `text-${textIdRef.current}`
    const textObject = {
      id,
      text: 'Your text',
      x: 0.5,
      y: 0.5,
      fontFamily: 'Georgia, serif',
      fontSize: 52,
      color: '#292329',
      weight: 'normal',
      alignment: 'center',
      letterSpacing: 0,
      opacity: 1,
      rotation: 0,
    }
    updateDesignOptions({ textObjects: [...designOptions.textObjects, textObject] })
    setSelectedTextId(id)
    setActiveEditorTab('text')
    setMobileEditorExpanded(true)
  }

  const clampTextPosition = (textObject, x, y, element) => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return { x, y }
    const scale = stage.clientWidth / canvas.width
    const radians = (textObject.rotation * Math.PI) / 180
    const boxWidth = element.offsetWidth / scale
    const boxHeight = element.offsetHeight / scale
    const extentX = (Math.abs(Math.cos(radians)) * boxWidth + Math.abs(Math.sin(radians)) * boxHeight) / 2
    const extentY = (Math.abs(Math.sin(radians)) * boxWidth + Math.abs(Math.cos(radians)) * boxHeight) / 2
    return {
      x: Math.min(1 - extentX / canvas.width, Math.max(extentX / canvas.width, x)),
      y: Math.min(1 - extentY / canvas.height, Math.max(extentY / canvas.height, y)),
    }
  }

  const drawLiveTextPreview = (manipulation) => {
    const canvas = canvasRef.current
    const baseCanvas = baseCanvasRef.current
    if (!canvas || !baseCanvas || baseCanvas.width !== canvas.width || baseCanvas.height !== canvas.height) return
    const context = canvas.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(baseCanvas, 0, 0)
    const textObjects = designOptions.textObjects.map((textObject) => textObject.id === manipulation.id
      ? { ...textObject, x: manipulation.x, y: manipulation.y, rotation: manipulation.rotation }
      : textObject)
    drawUserTextObjects(context, textObjects, canvas.width, canvas.height)
  }

  const updateTextManipulation = (manipulation, clientX, clientY) => {
    const stage = stageRef.current
    const element = textHitRefs.current.get(manipulation.id)
    const objectElement = textObjectRefs.current.get(manipulation.id)
    const textObject = designOptions.textObjects.find((item) => item.id === manipulation.id)
    if (!stage || !element || !objectElement || !textObject) return

    if (manipulation.mode === 'move') {
      const position = clampTextPosition(
        textObject,
        manipulation.startX + (clientX - manipulation.pointerStartX) / stage.clientWidth,
        manipulation.startY + (clientY - manipulation.pointerStartY) / stage.clientHeight,
        element,
      )
      manipulation.moved ||= Math.abs(position.x - manipulation.x) > 0.0001 || Math.abs(position.y - manipulation.y) > 0.0001
      manipulation.x = position.x
      manipulation.y = position.y
    } else {
      const pointerAngle = Math.atan2(clientY - manipulation.centerY, clientX - manipulation.centerX)
      let angleDelta = pointerAngle - manipulation.previousAngle
      if (angleDelta > Math.PI) angleDelta -= Math.PI * 2
      if (angleDelta < -Math.PI) angleDelta += Math.PI * 2
      if (Math.abs(angleDelta) > 0.0001) manipulation.moved = true
      manipulation.rotation += (angleDelta * 180) / Math.PI
      manipulation.previousAngle = pointerAngle
      const position = clampTextPosition(
        { ...textObject, rotation: manipulation.rotation },
        manipulation.x,
        manipulation.y,
        element,
      )
      manipulation.x = position.x
      manipulation.y = position.y
    }

    objectElement.style.left = `${manipulation.x * 100}%`
    objectElement.style.top = `${manipulation.y * 100}%`
    objectElement.style.setProperty('--text-rotation', `${manipulation.rotation}deg`)
    if (manipulation.mode === 'rotate') {
      const bounds = element.getBoundingClientRect()
      manipulation.centerX = bounds.left + bounds.width / 2
      manipulation.centerY = bounds.top + bounds.height / 2
      manipulation.previousAngle = Math.atan2(clientY - manipulation.centerY, clientX - manipulation.centerX)
    }
    drawLiveTextPreview(manipulation)
  }

  const beginTextManipulation = (event, textObject, mode) => {
    if (event.button !== 0 && event.pointerType !== 'touch') return
    event.preventDefault()
    event.stopPropagation()
    const element = textHitRefs.current.get(textObject.id)
    const bounds = element?.getBoundingClientRect()
    const centerX = bounds ? bounds.left + bounds.width / 2 : event.clientX
    const centerY = bounds ? bounds.top + bounds.height / 2 : event.clientY
    activeGestureRef.current = {
      type: 'text',
      id: textObject.id,
      mode,
      pointerId: event.pointerId,
      pointerType: event.pointerType || 'mouse',
      pointerStartX: event.clientX,
      pointerStartY: event.clientY,
      startX: textObject.x,
      startY: textObject.y,
      x: textObject.x,
      y: textObject.y,
      rotation: textObject.rotation,
      centerX,
      centerY,
      previousAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX),
      latestClientX: event.clientX,
      latestClientY: event.clientY,
      frameId: 0,
      moved: false,
    }
    if (event.currentTarget?.setPointerCapture) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Ignore pointer capture failures before the pointer is actually active.
      }
    }
    setSelectedPhotoIndex(null)
    setSelectedTextId(textObject.id)
    setActiveEditorTab('text')
    setIsManipulatingText(true)
  }

  const moveTextManipulation = (event) => {
    const manipulation = activeGestureRef.current
    if (!manipulation || manipulation.type !== 'text' || manipulation.pointerId !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    manipulation.latestClientX = event.clientX
    manipulation.latestClientY = event.clientY
    if (manipulation.frameId) return
    manipulation.frameId = window.requestAnimationFrame(() => {
      manipulation.frameId = 0
      updateTextManipulation(manipulation, manipulation.latestClientX, manipulation.latestClientY)
    })
  }

  const endTextManipulation = (event) => {
    const manipulation = activeGestureRef.current
    if (!manipulation || manipulation.type !== 'text' || manipulation.pointerId !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    if (manipulation.frameId) window.cancelAnimationFrame(manipulation.frameId)
    const clientX = (event.type === 'pointercancel' || event.clientX === undefined) ? manipulation.latestClientX : event.clientX
    const clientY = (event.type === 'pointercancel' || event.clientY === undefined) ? manipulation.latestClientY : event.clientY
    updateTextManipulation(manipulation, clientX, clientY)
    if (event.currentTarget?.releasePointerCapture) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // Ignore release failures when the pointer has already been released.
      }
    }
    activeGestureRef.current = null
    if (manipulation.moved) {
      updateTextObject(manipulation.id, {
        x: manipulation.x,
        y: manipulation.y,
        rotation: manipulation.rotation,
      })
    }
    setIsManipulatingText(false)
  }

  useLayoutEffect(() => {
    const clampedObjects = designOptions.textObjects.map((textObject) => {
      const element = textHitRefs.current.get(textObject.id)
      if (!element) return textObject
      const position = clampTextPosition(textObject, textObject.x, textObject.y, element)
      if (Math.abs(position.x - textObject.x) < 0.0001 && Math.abs(position.y - textObject.y) < 0.0001) return textObject
      return { ...textObject, ...position }
    })

    const hasValueChanges = clampedObjects.some((textObject, index) => {
      const current = designOptions.textObjects[index]
      return current !== textObject && (
        Math.abs((textObject.x ?? 0) - (current.x ?? 0)) > 0.0001
        || Math.abs((textObject.y ?? 0) - (current.y ?? 0)) > 0.0001
        || Math.abs((textObject.rotation ?? 0) - (current.rotation ?? 0)) > 0.0001
      )
    })

    if (hasValueChanges) {
      updateDesignOptions({ textObjects: clampedObjects })
    }
  }, [designOptions.textObjects, previewDimensions, updateDesignOptions])

  const toggleSticker = (stickerId) => {
    const selected = designOptions.stickers
    const next = selected.includes(stickerId)
      ? selected.filter((id) => id !== stickerId)
      : [...selected, stickerId].slice(-5)
    updateDesignOptions({ stickers: next })
  }

  const normalizedPhotoTransforms = useMemo(
    () => Array.from({ length: capturedPhotos.length }, (_, index) => photoTransforms[index] ?? getDefaultPhotoTransform()),
    [capturedPhotos.length, photoTransforms],
  )

  const beginPhotoManipulation = (event, photoIndex, mode) => {
    if (event.button !== 0 && event.pointerType !== 'touch') return
    event.preventDefault()
    event.stopPropagation()
    const frameElement = event.currentTarget.closest('.strip-photo-frame')
    const position = photoFrames[photoIndex]
    const transform = normalizedPhotoTransforms[photoIndex]
    if (!position) return
    const frameBounds = frameElement?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect()
    const centerX = frameBounds.left + frameBounds.width / 2
    const centerY = frameBounds.top + frameBounds.height / 2
    activeGestureRef.current = {
      type: 'photo',
      id: photoIndex,
      mode,
      pointerId: event.pointerId,
      pointerType: event.pointerType || 'mouse',
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX: transform.offsetX,
      startOffsetY: transform.offsetY,
      startRotation: transform.rotation,
      rotation: transform.rotation,
      centerX,
      centerY,
      previousAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX),
      latestClientX: event.clientX,
      latestClientY: event.clientY,
      frameId: 0,
      moved: false,
      frameElement,
    }
    if (event.currentTarget?.setPointerCapture) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Ignore pointer capture failures when the browser rejects a transient pointer.
      }
    }
    setSelectedTextId(null)
    setSelectedPhotoIndex(photoIndex)
  }

  const syncPhotoFrameStyle = (photoIndex, nextTransform) => {
    const frameElement = photoFrameRefs.current.get(photoIndex)
    const position = photoFrames[photoIndex]
    if (!frameElement || !position) return
    const adjustedPosition = getAdjustedPhotoPosition(position, nextTransform)
    frameElement.style.left = `${((adjustedPosition.x + adjustedPosition.width / 2) / previewDimensions.width) * 100}%`
    frameElement.style.top = `${((adjustedPosition.y + adjustedPosition.height / 2) / previewDimensions.height) * 100}%`
    frameElement.style.transform = `translate(-50%, -50%) rotate(${adjustedPosition.angle}rad)`
  }

  const updatePhotoManipulation = (manipulation, clientX, clientY) => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    const position = photoFrames[manipulation.id]
    const currentTransform = normalizedPhotoTransforms[manipulation.id]
    if (!stage || !canvas || !position) return

    if (manipulation.mode === 'move') {
      const deltaX = ((clientX - manipulation.startClientX) / stage.clientWidth) * canvas.width
      const deltaY = ((clientY - manipulation.startClientY) / stage.clientHeight) * canvas.height
      const nextTransform = clampPhotoTransform(position, {
        ...currentTransform,
        offsetX: manipulation.startOffsetX + deltaX,
        offsetY: manipulation.startOffsetY + deltaY,
      }, canvas.width, canvas.height)
      manipulation.moved ||= Math.abs(nextTransform.offsetX - currentTransform.offsetX) > 0.0001 || Math.abs(nextTransform.offsetY - currentTransform.offsetY) > 0.0001
      syncPhotoFrameStyle(manipulation.id, nextTransform)
      setPhotoTransforms((current) => {
        const nextTransforms = [...current]
        nextTransforms[manipulation.id] = nextTransform
        return nextTransforms
      })
      clearExpiredDownloadState()
      return
    }

    const pointerAngle = Math.atan2(clientY - manipulation.centerY, clientX - manipulation.centerX)
    let rotationDelta = pointerAngle - manipulation.previousAngle
    if (rotationDelta > Math.PI) rotationDelta -= Math.PI * 2
    if (rotationDelta < -Math.PI) rotationDelta += Math.PI * 2
    manipulation.rotation = (manipulation.rotation ?? manipulation.startRotation) + rotationDelta
    manipulation.previousAngle = pointerAngle
    manipulation.moved ||= Math.abs(manipulation.rotation - manipulation.startRotation) > 0.0001
    const nextTransform = clampPhotoTransform(position, {
      ...currentTransform,
      rotation: manipulation.rotation,
    }, canvas.width, canvas.height)
    syncPhotoFrameStyle(manipulation.id, nextTransform)
    setPhotoTransforms((current) => {
      const nextTransforms = [...current]
      nextTransforms[manipulation.id] = nextTransform
      return nextTransforms
    })
    clearExpiredDownloadState()
  }

  const movePhotoManipulation = (event) => {
    const manipulation = activeGestureRef.current
    if (!manipulation || manipulation.type !== 'photo' || manipulation.pointerId !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    manipulation.latestClientX = event.clientX
    manipulation.latestClientY = event.clientY
    if (manipulation.frameId) return
    manipulation.frameId = window.requestAnimationFrame(() => {
      manipulation.frameId = 0
      updatePhotoManipulation(manipulation, manipulation.latestClientX, manipulation.latestClientY)
    })
  }

  const endPhotoManipulation = (event) => {
    const manipulation = activeGestureRef.current
    if (!manipulation || manipulation.type !== 'photo' || manipulation.pointerId !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    if (manipulation.frameId) window.cancelAnimationFrame(manipulation.frameId)
    const clientX = (event.type === 'pointercancel' || event.type === 'lostpointercapture' || event.clientX === undefined) ? manipulation.latestClientX : event.clientX
    const clientY = (event.type === 'pointercancel' || event.type === 'lostpointercapture' || event.clientY === undefined) ? manipulation.latestClientY : event.clientY
    updatePhotoManipulation(manipulation, clientX, clientY)
    if (event.currentTarget?.releasePointerCapture) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // Ignore release failures when the pointer has already been released.
      }
    }
    activeGestureRef.current = null
  }

  const handlersRef = useRef({
    moveTextManipulation,
    endTextManipulation,
    movePhotoManipulation,
    endPhotoManipulation,
  })
  useEffect(() => {
    handlersRef.current = {
      moveTextManipulation,
      endTextManipulation,
      movePhotoManipulation,
      endPhotoManipulation,
    }
  })

  useEffect(() => {
    const handleGlobalPointerMove = (event) => {
      const gesture = activeGestureRef.current
      if (!gesture || gesture.pointerId !== event.pointerId) return
      if (gesture.type === 'text') {
        handlersRef.current.moveTextManipulation(event)
      } else if (gesture.type === 'photo') {
        handlersRef.current.movePhotoManipulation(event)
      }
    }

    const handleGlobalPointerUp = (event) => {
      const gesture = activeGestureRef.current
      if (!gesture || gesture.pointerId !== event.pointerId) return
      if (gesture.type === 'text') {
        handlersRef.current.endTextManipulation(event)
      } else if (gesture.type === 'photo') {
        handlersRef.current.endPhotoManipulation(event)
      }
    }

    window.addEventListener('pointermove', handleGlobalPointerMove)
    window.addEventListener('pointerup', handleGlobalPointerUp)
    window.addEventListener('pointercancel', handleGlobalPointerUp)
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove)
      window.removeEventListener('pointerup', handleGlobalPointerUp)
      window.removeEventListener('pointercancel', handleGlobalPointerUp)
    }
  }, [])

  useEffect(() => {
    if (capturedPhotos.length === 0) return undefined

    let cancelled = false
    const canvas = canvasRef.current
    const resources = exportResourcesRef.current
    const baseCanvas = baseCanvasRef.current ?? document.createElement('canvas')
    baseCanvasRef.current = baseCanvas
    expiredRef.current = false

    const generatePreview = async () => {
      try {
        setRenderStatus('rendering')
        setRenderError('')
        setDownloadError('')

        const images = await Promise.all(capturedPhotos.map(loadCapturedPhoto))
        if (cancelled || !canvas) return

        const dimensions = getPhotoStripDimensions(activeTheme, images)
        const natureSceneImage = await loadNatureSceneImage(activeTheme, dimensions.width, dimensions.height)
        if (cancelled) return

        const positions = getPhotoPositions(activeTheme, dimensions.width, dimensions.height, images, activeTheme.photoHeaderSpace ? 250 : 210, dimensions.height - 180)
        setPhotoFrames(positions)
        renderPhotoStrip(baseCanvas, images, activeTheme, { ...designOptions, textObjects: [] }, natureSceneImage, normalizedPhotoTransforms)
        renderPhotoStrip(canvas, images, activeTheme, designOptions, natureSceneImage, normalizedPhotoTransforms)
        setPreviewDimensions((current) => current.width === canvas.width && current.height === canvas.height
          ? current
          : { width: canvas.width, height: canvas.height })

        setRenderStatus('ready')
      } catch (error) {
        if (cancelled) return
        console.error(error)
        setRenderError('The photo strip could not be created. Retake your photos and try again.')
        setRenderStatus('error')
      } finally {
        if (!cancelled) {
          setDownloadError('')
        }
      }
    }

    void generatePreview()

    return () => {
      cancelled = true
      if (resources.url) URL.revokeObjectURL(resources.url)
      resources.blob = null
      resources.url = null
      resources.expiresAt = null
    }
  }, [activeTheme, capturedPhotos, designOptions, normalizedPhotoTransforms, selectedTheme])

  const finalizeCurrentDesign = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      setRenderError('')
      setDownloadError('')
      setExpired(false)
      expiredRef.current = false

      const finalBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((nextBlob) => {
          if (!nextBlob) return reject(new Error('The JPG could not be created.'))
          if (nextBlob.size === 0) return reject(new Error('The generated JPG was empty.'))
          resolve(nextBlob)
        }, 'image/jpeg', 0.95)
      })

      const resources = exportResourcesRef.current
      if (resources.url) {
        URL.revokeObjectURL(resources.url)
      }

      const finalUrl = URL.createObjectURL(finalBlob)
      resources.blob = finalBlob
      resources.url = finalUrl
      resources.expiresAt = Date.now() + 60_000
      setGeneratedBlob(finalBlob)
      setDownloadUrl(finalUrl)
      setSecondsRemaining(60)
      setRenderStatus('ready')
      setIsFinished(true)
    } catch (error) {
      console.error(error)
      setRenderError('The photo strip could not be created. Retake your photos and try again.')
      setRenderStatus('error')
    }
  }, [])

  const expireDownload = useCallback(() => {
    if (expiredRef.current) return
    expiredRef.current = true
    releaseExportResources()
    setSecondsRemaining(0)
    setExpired(true)
    setRenderStatus('expired')
    if (canvasRef.current) {
      canvasRef.current.width = 1
      canvasRef.current.height = 1
    }
    onExpire()
  }, [onExpire, releaseExportResources])

  useEffect(() => {
    if (!downloadUrl || !generatedBlob) return undefined

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((exportResourcesRef.current.expiresAt - Date.now()) / 1000))
      setSecondsRemaining((current) => current === remaining ? current : remaining)
      if (remaining === 0) expireDownload()
    }
    const timer = window.setInterval(updateCountdown, 250)
    return () => window.clearInterval(timer)
  }, [downloadUrl, expireDownload, generatedBlob])

  const downloadJpg = async () => {
    const resources = exportResourcesRef.current
    setDownloadError('')
    setIsDownloading(true)

    try {
      if (!resources.blob || !resources.url || renderStatus !== 'ready') {
        throw new Error('Your JPG is still being prepared. Please wait a moment and try again.')
      }
      if (Date.now() >= resources.expiresAt) {
        expireDownload()
        return
      }

      const link = document.createElement('a')
      link.href = resources.url
      link.download = `snap-studio-${selectedTheme.toLowerCase()}-strip.jpg`
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.setTimeout(() => {
        if (resources.url) {
          URL.revokeObjectURL(resources.url)
          resources.url = null
          setDownloadUrl(null)
        }
      }, 1500)
    } catch (error) {
      console.error(error)
      setDownloadError(error?.message || 'The JPG could not be downloaded. Please try again.')
      setRenderError(error?.message || 'The JPG could not be downloaded. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const countdownText = `Download available for ${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(secondsRemaining % 60).padStart(2, '0')}`
  const renderedPhotoFrames = photoFrames.map((position, index) => getAdjustedPhotoPosition(position, normalizedPhotoTransforms[index]))
  const activeDownloadStatus = downloadError || renderError
  const isEditingMode = !isFinished
  const shouldShowExpiredMessage = expired && !isEditingMode
  const editorTabs = [
    { id: 'background', label: 'Background' },
    { id: 'filter', label: 'Filter' },
    { id: 'frame', label: 'Frame' },
    { id: 'text', label: 'Text' },
    { id: 'stickers', label: 'Stickers' },
  ]
  const selectedText = designOptions.textObjects.find((textObject) => textObject.id === selectedTextId)
  const textMaxDimension = Math.min(previewDimensions.width, previewDimensions.height) * 0.72

  return (
    <main className={`booth-main finished-main${mobileEditorExpanded ? ' editor-open' : ''}`}>
      <div className="finished-control-column">
        <section className="finished-copy" aria-labelledby="finished-title">
          <p className="eyebrow"><span className="eyebrow-dot" /> THAT’S A WRAP</p>
          <h1 id="finished-title">A little strip of <em>your people.</em></h1>
          <p>Your {selectedTheme.toLowerCase()} design is ready to make your own.</p>
          <div className={`strip-actions${isEditingMode ? ' is-finish-mode' : ''}`}>
            {isEditingMode ? (
              <button
                className="booth-button booth-button-primary"
                type="button"
                onClick={() => void finalizeCurrentDesign()}
                disabled={renderStatus !== 'ready' || isManipulatingText}
              >
                Finish <span aria-hidden="true">✓</span>
              </button>
            ) : (
              <>
                <button
                  className="booth-button booth-button-primary"
                  type="button"
                  onClick={downloadJpg}
                  disabled={renderStatus !== 'ready' || !generatedBlob || !downloadUrl || secondsRemaining === 0 || isManipulatingText || isDownloading}
                >
                  {isDownloading ? 'Preparing JPG…' : 'Download JPG'} <span aria-hidden="true">↓</span>
                </button>
                <button className="booth-button booth-button-secondary" type="button" onClick={onRetake}>
                  <span aria-hidden="true">↻</span> Retake
                </button>
                <button className="booth-button booth-button-secondary" type="button" onClick={onCreateNewStrip}>
                  <span aria-hidden="true">✦</span> Create New Strip
                </button>
              </>
            )}
          </div>
          {!isFinished && (
            <div className="photo-edit-list" aria-label="Edit photos">
              {capturedPhotos.map((photo, index) => (
                <div className="photo-edit-row" key={`photo-edit-${index}`}>
                  <span>Photo {index + 1}</span>
                  <button type="button" className={`photo-edit-button${selectedPhotoIndex === index ? ' is-selected' : ''}`} onClick={() => setSelectedPhotoIndex(index)}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="strip-status" role={activeDownloadStatus ? 'alert' : 'status'}>
            {shouldShowExpiredMessage
              ? 'Download expired — create a new strip.'
              : activeDownloadStatus || (isDownloading ? 'Preparing your JPG…' : generatedBlob ? countdownText : renderStatus === 'ready' ? 'Preparing your JPG…' : 'Updating your design preview…')}
          </p>
          <p className="download-privacy-note">Downloaded files stay on your device; this app cannot remove a copy you saved.</p>
        </section>
        {!isFinished && (
          <section className={`design-editor${mobileEditorExpanded ? ' is-expanded' : ' is-collapsed'}`} aria-label="Design customization">
            <div className="design-editor-heading">
              <strong>Make it yours</strong>
              <span>{activeTheme.name}</span>
              <button className="add-text-button" type="button" onClick={addTextObject}>Add Text</button>
              <button
                className="editor-sheet-toggle"
                type="button"
                aria-expanded={mobileEditorExpanded}
                aria-label={mobileEditorExpanded ? 'Collapse design options' : 'Expand design options'}
                onClick={() => setMobileEditorExpanded((expanded) => !expanded)}
              >
                {mobileEditorExpanded ? 'Hide' : 'Options'} <span aria-hidden="true">{mobileEditorExpanded ? '⌄' : '⌃'}</span>
              </button>
            </div>
            <div className="design-tabs" role="tablist" aria-label="Design options">
              {editorTabs.map((tab) => (
                <button
                  className={`design-tab${activeEditorTab === tab.id ? ' is-active' : ''}`}
                  id={`design-tab-${tab.id}`}
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeEditorTab === tab.id}
                  aria-controls="design-panel"
                  onClick={() => {
                    setActiveEditorTab(tab.id)
                    setMobileEditorExpanded(true)
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="design-panel" id="design-panel" role="tabpanel" aria-labelledby={`design-tab-${activeEditorTab}`}>
              {activeEditorTab === 'background' && (
                <label className="design-control">
                  <span>Background</span>
                  <select value={designOptions.background} onChange={(event) => updateDesignOptions({ background: event.target.value })}>
                    {DESIGN_BACKGROUND_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              )}
              {activeEditorTab === 'filter' && (
                <label className="design-control">
                  <span>Photo filter</span>
                  <select value={designOptions.filter} onChange={(event) => updateDesignOptions({ filter: event.target.value })}>
                    {PHOTO_FILTER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              )}
              {activeEditorTab === 'frame' && (
                <label className="design-control">
                  <span>Frame / overlay</span>
                  <select value={designOptions.frame} onChange={(event) => updateDesignOptions({ frame: event.target.value })}>
                    {FRAME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              )}
              {activeEditorTab === 'text' && (
                <div className="design-text-controls">
                  <div className="text-object-list" aria-label="Text objects">
                    {designOptions.textObjects.map((textObject, index) => (
                      <button
                        className={`text-object-choice${selectedTextId === textObject.id ? ' is-selected' : ''}`}
                        key={textObject.id}
                        type="button"
                        aria-pressed={selectedTextId === textObject.id}
                        onClick={() => {
                          setSelectedTextId(textObject.id)
                          setSelectedPhotoIndex(null)
                        }}
                      >
                        {textObject.text.trim().slice(0, 30) || `Text ${index + 1}`}
                      </button>
                    ))}
                  </div>
                  {selectedText ? (
                    <div className="design-control design-control-wide text-object-settings">
                      <label className="design-control">
                        <span>Text</span>
                        <textarea value={selectedText.text} maxLength={500} rows={2} onChange={(event) => updateTextObject(selectedText.id, { text: event.target.value })} />
                      </label>
                      <div className="design-text-fields">
                        <label className="design-control">
                          <span>Font</span>
                          <select value={selectedText.fontFamily} onChange={(event) => updateTextObject(selectedText.id, { fontFamily: event.target.value })}>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="'Playfair Display', Georgia, serif">Playfair Display</option>
                            <option value="'DM Sans', sans-serif">DM Sans</option>
                            <option value="'Courier New', monospace">Courier New</option>
                          </select>
                        </label>
                        <label className="design-control">
                          <span>Size · {selectedText.fontSize}px</span>
                          <input type="range" min="12" max="120" step="1" value={selectedText.fontSize} onChange={(event) => updateTextObject(selectedText.id, { fontSize: Number(event.target.value) })} />
                        </label>
                        <label className="design-control">
                          <span>Color</span>
                          <input type="color" value={selectedText.color} onChange={(event) => updateTextObject(selectedText.id, { color: event.target.value })} />
                        </label>
                        <label className="design-control">
                          <span>Weight</span>
                          <select value={selectedText.weight} onChange={(event) => updateTextObject(selectedText.id, { weight: event.target.value })}>
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                          </select>
                        </label>
                        <label className="design-control">
                          <span>Alignment</span>
                          <select value={selectedText.alignment} onChange={(event) => updateTextObject(selectedText.id, { alignment: event.target.value })}>
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </label>
                        <label className="design-control">
                          <span>Letter spacing · {selectedText.letterSpacing}px</span>
                          <input type="range" min="-4" max="20" step="0.5" value={selectedText.letterSpacing} onChange={(event) => updateTextObject(selectedText.id, { letterSpacing: Number(event.target.value) })} />
                        </label>
                        <label className="design-control">
                          <span>Opacity · {Math.round(selectedText.opacity * 100)}%</span>
                          <input type="range" min="0.1" max="1" step="0.05" value={selectedText.opacity} onChange={(event) => updateTextObject(selectedText.id, { opacity: Number(event.target.value) })} />
                        </label>
                      </div>
                      <button
                        className="delete-text-button"
                        type="button"
                        onClick={() => {
                          const remaining = designOptions.textObjects.filter((item) => item.id !== selectedText.id)
                          updateDesignOptions({ textObjects: remaining })
                          setSelectedTextId(remaining.at(-1)?.id ?? null)
                        }}
                      >
                        Delete Text
                      </button>
                    </div>
                  ) : (
                    <button className="add-text-panel-button" type="button" onClick={addTextObject}>Add Text</button>
                  )}
                </div>
              )}
              {activeEditorTab === 'stickers' && (
                <div className="sticker-groups">
                  {['Love', 'Cute', 'Party', 'Retro', 'College', 'Seasonal'].map((category) => (
                    <fieldset className="sticker-category" key={category}>
                      <legend>{category}</legend>
                      <div className="sticker-options">
                        {CUSTOM_STICKERS.filter((sticker) => sticker.category === category).map((sticker) => (
                          <button
                            className={`sticker-option${designOptions.stickers.includes(sticker.id) ? ' is-selected' : ''}`}
                            key={sticker.id}
                            type="button"
                            aria-pressed={designOptions.stickers.includes(sticker.id)}
                            onClick={() => toggleSticker(sticker.id)}
                          >
                            {sticker.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                  <label className="design-control">
                    <span>Sticker size</span>
                    <input type="range" min="0.65" max="1.5" step="0.05" value={designOptions.stickerScale} onChange={(event) => updateDesignOptions({ stickerScale: Number(event.target.value) })} />
                  </label>
                  <label className="design-control">
                    <span>Sticker rotation</span>
                    <input type="range" min="-18" max="18" step="1" value={designOptions.stickerRotation} onChange={(event) => updateDesignOptions({ stickerRotation: Number(event.target.value) })} />
                  </label>
                  <label className="design-control">
                    <span>Sticker horizontal position</span>
                    <input type="range" min="-0.08" max="0.08" step="0.01" value={designOptions.stickerOffsetX} onChange={(event) => updateDesignOptions({ stickerOffsetX: Number(event.target.value) })} />
                  </label>
                  <label className="design-control">
                    <span>Sticker vertical position</span>
                    <input type="range" min="-0.08" max="0.08" step="0.01" value={designOptions.stickerOffsetY} onChange={(event) => updateDesignOptions({ stickerOffsetY: Number(event.target.value) })} />
                  </label>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      <div className="strip-preview-wrap">
        <div
          className="strip-canvas-stage"
          ref={stageRef}
          style={{ aspectRatio: `${previewDimensions.width} / ${previewDimensions.height}` }}
        >
          <canvas
            ref={canvasRef}
            className="strip-print-canvas"
            width={activeTheme.orientation === 'vertical' ? 900 : 1400}
            height={activeTheme.orientation === 'vertical' ? 1500 : 1000}
            role="img"
            aria-label={`${activeTheme.orientation} ${selectedTheme} photobooth design with ${activeTheme.requiredPhotoCount} captured photos`}
          >
            Your {activeTheme.requiredPhotoCount}-photo {selectedTheme} photobooth print.
          </canvas>
          <div className="strip-photo-overlay" aria-label="Photo editing layer">
            {renderedPhotoFrames.map((position, index) => (
              <div
                className={`strip-photo-frame${selectedPhotoIndex === index ? ' is-selected' : ''}`}
                key={`photo-frame-${index}`}
                ref={(element) => {
                  if (element) photoFrameRefs.current.set(index, element)
                  else photoFrameRefs.current.delete(index)
                }}
                style={{
                  left: `${((position.x + position.width / 2) / previewDimensions.width) * 100}%`,
                  top: `${((position.y + position.height / 2) / previewDimensions.height) * 100}%`,
                  width: `${(position.width / previewDimensions.width) * 100}%`,
                  height: `${(position.height / previewDimensions.height) * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${position.angle}rad)`,
                }}
              >
                <button
                  className="strip-photo-hit"
                  type="button"
                  aria-label={`Move photo ${index + 1}`}
                  onPointerDown={(event) => beginPhotoManipulation(event, index, 'move')}
                  onPointerMove={movePhotoManipulation}
                  onPointerUp={endPhotoManipulation}
                  onPointerCancel={endPhotoManipulation}
                />
                {selectedPhotoIndex === index && (
                  <button
                    aria-label={`Rotate photo ${index + 1}`}
                    className="strip-photo-rotate-handle"
                    type="button"
                    onPointerDown={(event) => beginPhotoManipulation(event, index, 'rotate')}
                    onPointerMove={movePhotoManipulation}
                    onPointerUp={endPhotoManipulation}
                    onPointerCancel={endPhotoManipulation}
                  >
                    ↻
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="strip-text-overlay" aria-label="Text objects">
            {designOptions.textObjects.map((textObject) => {
              const isSelected = selectedTextId === textObject.id
              return (
                <div
                  className={`strip-text-object${isSelected ? ' is-selected' : ''}`}
                  key={textObject.id}
                  ref={(element) => {
                    if (element) textObjectRefs.current.set(textObject.id, element)
                    else textObjectRefs.current.delete(textObject.id)
                  }}
                  style={{
                    left: `${textObject.x * 100}%`,
                    top: `${textObject.y * 100}%`,
                    '--text-size': `${textObject.fontSize / previewDimensions.width * 100}cqw`,
                    '--text-spacing': `${textObject.letterSpacing / previewDimensions.width * 100}cqw`,
                    '--text-max-width': `${textMaxDimension / previewDimensions.width * 100}%`,
                    '--text-max-height': `${textMaxDimension / previewDimensions.height * 100}%`,
                    '--text-rotation': `${textObject.rotation}deg`,
                    fontFamily: textObject.fontFamily,
                    fontWeight: textObject.weight === 'bold' ? 700 : 400,
                    textAlign: textObject.alignment,
                  }}
                >
                  <button
                    aria-label={`Select and drag to move text: ${textObject.text || 'empty text'}`}
                    aria-pressed={isSelected}
                    className="strip-text-hit"
                    ref={(element) => {
                      if (element) textHitRefs.current.set(textObject.id, element)
                      else textHitRefs.current.delete(textObject.id)
                    }}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedPhotoIndex(null)
                      setSelectedTextId(textObject.id)
                      setActiveEditorTab('text')
                    }}
                    onPointerDown={(event) => beginTextManipulation(event, textObject, 'move')}
                    onPointerMove={moveTextManipulation}
                    onPointerUp={endTextManipulation}
                    onPointerCancel={endTextManipulation}
                  >
                    {textObject.text}
                  </button>
                  {isSelected && (
                    <button
                      aria-label={`Rotate text: ${textObject.text || 'empty text'}`}
                      className="strip-text-rotate-handle"
                      type="button"
                      onPointerDown={(event) => beginTextManipulation(event, textObject, 'rotate')}
                      onPointerMove={moveTextManipulation}
                      onPointerUp={endTextManipulation}
                      onPointerCancel={endTextManipulation}
                    >
                      ↻
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

function App() {
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [customPhotoCount, setCustomPhotoCount] = useState(4)
  const [screen, setScreen] = useState('landing')
  const [cameraStatus, setCameraStatus] = useState('idle')
  const [cameraError, setCameraError] = useState('')
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraDiagnostics, setCameraDiagnostics] = useState({
    mediaDevices: false,
    getUserMedia: false,
    state: 'idle',
    deviceLabel: '',
    errorName: '',
    errorMessage: '',
  })
  const [capturedPhotos, setCapturedPhotos] = useState([])
  const [photoNumber, setPhotoNumber] = useState(1)
  const [countdown, setCountdown] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const requestIdRef = useRef(0)
  const screenRef = useRef(screen)
  const handleSetCustomPhotoCount = (count) => {
    const validCount = Math.max(1, Math.min(6, Number(count) || 4))
    activeCustomStripPhotoCount = validCount
    setCustomPhotoCount(validCount)
  }
  const requiredPhotoCount = selectedTheme ? getThemeByName(selectedTheme, customPhotoCount).requiredPhotoCount : 3

  useEffect(() => {
    screenRef.current = screen
  }, [screen])

  const requestCamera = async () => {
    stopMediaStream(streamRef.current)
    streamRef.current = null
    setCameraStream(null)
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setScreen('camera')
    setCameraStatus('requesting')
    setCameraError('')
    setCountdown(null)
    setCameraDiagnostics({
      mediaDevices: Boolean(navigator.mediaDevices),
      getUserMedia: Boolean(navigator.mediaDevices?.getUserMedia),
      state: 'requesting',
      deviceLabel: '',
      errorName: '',
      errorMessage: '',
    })

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(getCameraErrorMessage({ name: 'TypeError' }))
      setCameraStatus('error')
      setCameraDiagnostics((current) => ({ ...current, state: 'error', errorName: 'TypeError', errorMessage: 'mediaDevices.getUserMedia is unavailable' }))
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (requestId !== requestIdRef.current) {
        stopMediaStream(stream)
        return
      }
      streamRef.current = stream
      setCameraStream(stream)
      setCameraDiagnostics((current) => ({
        ...current,
        state: 'stream-received',
        deviceLabel: stream.getVideoTracks()[0]?.label ?? '',
      }))
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      setCameraError(getCameraErrorMessage(error))
      setCameraStatus('error')
      setCameraDiagnostics((current) => ({
        ...current,
        state: 'error',
        errorName: error?.name ?? 'UnknownError',
        errorMessage: error?.message ?? String(error),
      }))
    }
  }

  const clearSessionPhotoState = ({ preserveTheme = false, returnToSource = false, returnToLanding = false } = {}) => {
    requestIdRef.current += 1
    stopMediaStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) clearVideoSource(videoRef.current)
    setCameraStream(null)
    setCameraStatus('idle')
    setCameraError('')
    setCountdown(null)
    setCapturedPhotos([])
    setPhotoNumber(1)

    if (!preserveTheme) {
      setSelectedTheme(null)
    }

    if (returnToSource) {
      setScreen('source')
      return
    }

    if (returnToLanding) {
      setScreen('landing')
    }
  }

  const leavePhotobooth = () => {
    clearSessionPhotoState({ returnToLanding: true })
  }

  const retakePhotos = () => {
    clearSessionPhotoState({ preserveTheme: true, returnToSource: true })
  }

  const createNewStrip = () => {
    clearSessionPhotoState({ returnToLanding: true })
  }

  const uploadPhotos = async (files) => {
    const currentTheme = getThemeByName(selectedTheme, customPhotoCount)
    const validationError = validateImageFiles(files, currentTheme.requiredPhotoCount, currentTheme.name)
    if (validationError) throw new Error(validationError)
    const photos = await Promise.all(files.map(normalizeImageFile))
    setCapturedPhotos(photos)
    setPhotoNumber(photos.length)
    setScreen('review')
  }

  const expireSession = () => {
    stopMediaStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) clearVideoSource(videoRef.current)
    setCameraStream(null)
    setCameraStatus('idle')
    setCountdown(null)
    setCapturedPhotos([])
    setPhotoNumber(1)
  }

  useEffect(() => {
    const discardInactiveCameraSession = (pageIsHiding = false) => {
      if (!pageIsHiding && document.visibilityState !== 'hidden') return
      if (screenRef.current !== 'camera') return
      requestIdRef.current += 1
      stopMediaStream(streamRef.current)
      streamRef.current = null
      setCameraStream(null)
      setCameraStatus('idle')
      setCameraError('')
      setCountdown(null)
      setCapturedPhotos([])
      setPhotoNumber(1)
      setScreen('source')
    }

    const handleVisibilityChange = () => discardInactiveCameraSession()
    const handlePageHide = () => discardInactiveCameraSession(true)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [])

  useEffect(() => {
    if (!cameraStream || !videoRef.current) return

    const video = videoRef.current
    video.srcObject = cameraStream
    const markReady = () => {
      if (streamRef.current !== cameraStream) return
      setCameraStatus('ready')
      setCountdown((current) => current ?? 3)
      setCameraDiagnostics((current) => ({ ...current, state: 'ready' }))
    }
    const handleVideoError = () => {
      if (streamRef.current !== cameraStream) return
      setCameraError('The camera preview could not load. Check your browser permissions, then try again.')
      setCameraStatus('error')
      setCameraDiagnostics((current) => ({ ...current, state: 'error', errorName: 'VideoError', errorMessage: 'The video element could not play the stream' }))
      stopMediaStream(cameraStream)
      streamRef.current = null
      setCameraStream(null)
    }

    video.addEventListener('loadedmetadata', markReady)
    video.addEventListener('canplay', markReady)
    video.addEventListener('error', handleVideoError)
    video.play().catch(handleVideoError)

    return () => {
      video.removeEventListener('loadedmetadata', markReady)
      video.removeEventListener('canplay', markReady)
      video.removeEventListener('error', handleVideoError)
      if (video.srcObject === cameraStream) video.srcObject = null
    }
  }, [cameraStream])

  useEffect(() => {
    if (screen !== 'camera' || cameraStatus !== 'ready' || countdown === null) return

    const timer = window.setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1)
        return
      }

      const video = videoRef.current
      if (!video?.videoWidth || !video.videoHeight) {
        setCameraError('The camera preview is not ready yet. Try starting the camera again.')
        setCameraStatus('error')
        setCountdown(null)
        stopMediaStream(cameraStream)
        streamRef.current = null
        setCameraStream(null)
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (!context) {
        setCameraError('This browser could not prepare the photo. Try another browser or device.')
        setCameraStatus('error')
        setCountdown(null)
        stopMediaStream(cameraStream)
        streamRef.current = null
        setCameraStream(null)
        return
      }

      context.translate(canvas.width, 0)
      context.scale(-1, 1)
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      let photo
      try {
        photo = canvas.toDataURL('image/jpeg', 0.92)
      } catch {
        setCameraError('This browser could not save the photo. Please try again.')
        setCameraStatus('error')
        setCountdown(null)
        stopMediaStream(cameraStream)
        streamRef.current = null
        setCameraStream(null)
        return
      }

      const nextPhotos = [...capturedPhotos, photo]
      setCapturedPhotos(nextPhotos)
      if (nextPhotos.length === requiredPhotoCount) {
        stopMediaStream(cameraStream)
        streamRef.current = null
        setCameraStream(null)
        setCameraStatus('idle')
        setCountdown(null)
        setScreen('review')
      } else {
        setPhotoNumber(nextPhotos.length + 1)
        setCountdown(3)
      }
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [cameraStatus, cameraStream, capturedPhotos, countdown, requiredPhotoCount, screen])

  useEffect(() => () => {
    requestIdRef.current += 1
    stopMediaStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) clearVideoSource(videoRef.current)
  }, [])

  return (
    <div className={`site-shell${screen === 'landing' ? '' : ' booth-shell'}`} id="top">
      {screen === 'landing' ? (
        <LandingPage
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          customPhotoCount={customPhotoCount}
          setCustomPhotoCount={handleSetCustomPhotoCount}
          onContinue={() => {
            setCapturedPhotos([])
            setPhotoNumber(1)
            setScreen('source')
          }}
        />
      ) : (
        <div className="booth-app">
          <BoothHeader selectedTheme={selectedTheme} onBack={leavePhotobooth} />
          {screen === 'source' && (
            <SourceChooser
              key={`${selectedTheme}-${customPhotoCount}`}
              selectedTheme={selectedTheme}
              customPhotoCount={customPhotoCount}
              onSetCustomPhotoCount={handleSetCustomPhotoCount}
              onTakePhotos={() => {
                setCapturedPhotos([])
                setPhotoNumber(1)
                void requestCamera()
              }}
              onUploadPhotos={uploadPhotos}
            />
          )}
          {screen === 'camera' && (
            <CameraWorkspace
              cameraDiagnostics={cameraDiagnostics}
              cameraError={cameraError}
              cameraStatus={cameraStatus}
              cameraStream={cameraStream}
              capturedPhotos={capturedPhotos}
              countdown={countdown}
              onBack={leavePhotobooth}
              onRetry={() => void requestCamera()}
              photoNumber={photoNumber}
              requiredPhotoCount={requiredPhotoCount}
              selectedTheme={selectedTheme}
              videoRef={videoRef}
            />
          )}
          {screen === 'review' && (
            <PhotoReview
              capturedPhotos={capturedPhotos}
              onContinue={() => setScreen('finished')}
              onRetake={retakePhotos}
              selectedTheme={selectedTheme}
              customPhotoCount={customPhotoCount}
            />
          )}
          {screen === 'finished' && (
            <FinishedStrip
              capturedPhotos={capturedPhotos}
              onExpire={expireSession}
              onRetake={retakePhotos}
              onCreateNewStrip={createNewStrip}
              selectedTheme={selectedTheme}
              customPhotoCount={customPhotoCount}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default App