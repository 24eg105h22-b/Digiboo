const slot = (x, y, width, height, rotation = 0, offsetX = 0, offsetY = 0, fitStrategy = 'full-image') => ({
  x,
  y,
  width,
  height,
  rotation,
  offsetX,
  offsetY,
  minWidth: Math.max(0.12, Math.min(width, 0.22)),
  minHeight: Math.max(0.12, Math.min(height, 0.24)),
  minAspectRatio: 0.75,
  maxAspectRatio: 2.2,
  preferredWidth: width,
  preferredHeight: height,
  preferredAspectRatio: width / height,
  fitStrategy,
})

function naturePhotoSlot(left, top, width, height) {
  return {
    ...slot(left, top, width, height),
    minAspectRatio: 0.4,
    maxAspectRatio: 2.4,
  }
}

const QUALITY_MINIMUMS = {
  3: { width: 0.18, height: 0.17, area: 0.026 },
  4: { width: 0.16, height: 0.16, area: 0.02 },
  5: { width: 0.15, height: 0.14, area: 0.018 },
  6: { width: 0.14, height: 0.13, area: 0.016 },
}

const marks = (kind, points, size = 10) => points.map(([x, y], index) => ({ kind, x, y, size, rotation: index % 2 ? 9 : -9 }))

function buildDecorationPoints(layout, photoCount) {
  const core = [
    [0.08, 0.12], [0.92, 0.12], [0.08, 0.88], [0.92, 0.88],
    [0.5, 0.1], [0.5, 0.9], [0.1, 0.5], [0.9, 0.5],
    [0.22, 0.25], [0.78, 0.25], [0.22, 0.75], [0.78, 0.75],
  ]

  if (['zigzag', 'staggered', 'diagonal', 'collage', 'contact-sheet', 'gallery', 'stacked', 'two-large-three-small'].includes(layout)) {
    return [[0.035, 0.34], [0.965, 0.34], [0.035, 0.68], [0.965, 0.68]].slice(0, photoCount >= 5 ? 4 : 2)
  }

  if (['staircase', 'overlap', 'editorial', 'magazine', 'one-large-two-small', 'one-large-four-small', 'mini-arc', 'full-bleed', 'frame', 'book', 'corner', 'scattered', 'split', 'postcard', 'asymmetric-collage', 'center', 'vertical-strip'].includes(layout)) return []

  if (layout === 'stacked' || layout === 'vertical-strip' || layout === 'filmstrip') {
    return core.filter((_, index) => index % 2 === 0 || index > 5).slice(0, photoCount >= 6 ? 8 : 6)
  }

  if (layout === 'horizontal-strip' || layout === 'zigzag' || layout === 'staggered' || layout === 'diagonal') {
    return core.slice(0, photoCount >= 6 ? 10 : 8)
  }

  return core.slice(0, photoCount >= 6 ? 8 : 6)
}

const layerOrder = {
  background: 0,
  photos: 10,
  frames: 20,
  text: 30,
  foreground: 40,
}

function gridSlots(photoCount, columns = 2) {
  const rows = Math.ceil(photoCount / columns)
  const gapX = 0.035
  const gapY = 0.035
  const width = (0.84 - gapX * (columns - 1)) / columns
  const height = (0.84 - gapY * (rows - 1)) / rows

  return Array.from({ length: photoCount }, (_, index) => {
    const row = Math.floor(index / columns)
    const rowStart = row * columns
    const itemsInRow = Math.min(columns, photoCount - rowStart)
    const col = index - rowStart
    const rowWidth = itemsInRow * width + (itemsInRow - 1) * gapX
    const leftOffset = (1 - rowWidth) / 2
    return slot(leftOffset + col * (width + gapX), 0.08 + row * (height + gapY), width, height)
  })
}

function stripSlots(photoCount, orientation, film = false) {
  const minimum = QUALITY_MINIMUMS[photoCount] ?? QUALITY_MINIMUMS[6]
  const gap = photoCount >= 6 ? 0 : 0.018
  if (orientation === 'horizontal') {
    const available = 0.84 - gap * (photoCount - 1)
    const width = Math.max(available / photoCount, minimum.width)
    const total = width * photoCount + gap * (photoCount - 1)
    const offsetX = (1 - total) / 2
    return Array.from({ length: photoCount }, (_, index) => slot(
      offsetX + index * (width + gap),
      film ? 0.18 : 0.2,
      width,
      film ? 0.64 : 0.6,
      0,
      0,
      0,
      'full-image'
    ))
  }

  const available = 0.84 - gap * (photoCount - 1)
  const height = Math.max(available / photoCount, minimum.height)
  const total = height * photoCount + gap * (photoCount - 1)
  const offsetY = (1 - total) / 2
  return Array.from({ length: photoCount }, (_, index) => slot(
    film ? 0.16 : 0.13,
    offsetY + index * (height + gap),
    film ? 0.68 : 0.74,
    height,
    0,
    0,
    0,
    'full-image'
  ))
}

function verticalStripSlots(photoCount, canvasOrientation) {
  if (canvasOrientation === 'horizontal') {
    if (photoCount === 3) {
      return [slot(0.08, 0.22, 0.27, 0.56), slot(0.365, 0.22, 0.27, 0.56), slot(0.65, 0.22, 0.27, 0.56)]
    }

    if (photoCount === 4) {
      return [slot(0.08, 0.14, 0.4, 0.32), slot(0.52, 0.14, 0.4, 0.32), slot(0.08, 0.54, 0.4, 0.32), slot(0.52, 0.54, 0.4, 0.32)]
    }

    if (photoCount === 5) {
      return [
        slot(0.08, 0.12, 0.26, 0.4),
        slot(0.37, 0.12, 0.26, 0.4),
        slot(0.66, 0.12, 0.26, 0.4),
        slot(0.19, 0.56, 0.3, 0.32),
        slot(0.51, 0.56, 0.3, 0.32),
      ]
    }

    return [
      slot(0.08, 0.13, 0.27, 0.34),
      slot(0.365, 0.13, 0.27, 0.34),
      slot(0.65, 0.13, 0.27, 0.34),
      slot(0.08, 0.53, 0.27, 0.34),
      slot(0.365, 0.53, 0.27, 0.34),
      slot(0.65, 0.53, 0.27, 0.34),
    ]
  }

  if (photoCount === 3) {
    return [slot(0.36, 0.14, 0.28, 0.23), slot(0.36, 0.385, 0.28, 0.23), slot(0.36, 0.63, 0.28, 0.23)]
  }

  if (photoCount === 4) {
    return [slot(0.08, 0.12, 0.4, 0.34), slot(0.52, 0.12, 0.4, 0.34), slot(0.08, 0.54, 0.4, 0.34), slot(0.52, 0.54, 0.4, 0.34)]
  }

  if (photoCount === 5) {
    return [
      slot(0.08, 0.12, 0.4, 0.22),
      slot(0.52, 0.12, 0.4, 0.22),
      slot(0.3, 0.38, 0.4, 0.22),
      slot(0.08, 0.64, 0.4, 0.22),
      slot(0.52, 0.64, 0.4, 0.22),
    ]
  }

  return [
    slot(0.08, 0.12, 0.4, 0.22),
    slot(0.52, 0.12, 0.4, 0.22),
    slot(0.08, 0.38, 0.4, 0.22),
    slot(0.52, 0.38, 0.4, 0.22),
    slot(0.08, 0.64, 0.4, 0.22),
    slot(0.52, 0.64, 0.4, 0.22),
  ]
}

function zigzagSlots(photoCount, diagonal = false) {
  const minimum = QUALITY_MINIMUMS[photoCount] ?? QUALITY_MINIMUMS[6]
  const rawHeight = 0.84 / photoCount
  const itemHeight = Math.max(rawHeight, minimum.height)
  const top = (1 - itemHeight * photoCount) / 2
  return Array.from({ length: photoCount }, (_, index) => {
    const offset = diagonal ? index / Math.max(1, photoCount - 1) : index % 2
    const width = Math.max(diagonal ? 0.48 : 0.54, minimum.width)
    return slot(
      diagonal ? 0.1 + offset * 0.38 : (index % 2 ? 0.39 : 0.08),
      top + index * itemHeight,
      width,
      itemHeight,
      diagonal ? (index % 2 ? 3 : -3) : (index % 2 ? 2 : -2),
      0,
      0,
      'full-image'
    )
  })
}

function diagonalSlots(photoCount) {
  if (photoCount === 3) {
    return [
      slot(0.05, 0.12, 0.44, 0.34, -1.5),
      slot(0.51, 0.12, 0.44, 0.34, 1.5),
      slot(0.28, 0.54, 0.44, 0.34, -1.5),
    ]
  }

  if (photoCount === 4) {
    return [
      slot(0.06, 0.12, 0.42, 0.35, -1.5),
      slot(0.52, 0.12, 0.42, 0.35, 1.5),
      slot(0.06, 0.53, 0.42, 0.35, 1.5),
      slot(0.52, 0.53, 0.42, 0.35, -1.5),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.06, 0.12, 0.42, 0.24, -1.5),
      slot(0.52, 0.12, 0.42, 0.24, 1.5),
      slot(0.29, 0.38, 0.42, 0.24),
      slot(0.06, 0.64, 0.42, 0.24, 1.5),
      slot(0.52, 0.64, 0.42, 0.24, -1.5),
    ]
  }

  return [
    slot(0.06, 0.12, 0.4, 0.24, -1.5),
    slot(0.54, 0.12, 0.4, 0.24, 1.5),
    slot(0.06, 0.38, 0.4, 0.24, 1.5),
    slot(0.54, 0.38, 0.4, 0.24, -1.5),
    slot(0.06, 0.64, 0.4, 0.24, -1.5),
    slot(0.54, 0.64, 0.4, 0.24, 1.5),
  ]
}

function collageSlots(photoCount) {
  const first = slot(0.07, 0.09, 0.48, 0.82, -1)
  const remaining = photoCount - 1
  const gap = 0.025
  const height = (0.82 - gap * (remaining - 1)) / remaining
  const otherSlots = Array.from({ length: remaining }, (_, index) => slot(
    0.59,
    0.09 + index * (height + gap),
    0.34,
    height,
    index % 2 ? 1 : -1,
    0,
    0,
    'full-image'
  ))
  return [first, ...otherSlots]
}

function polaroidSlots(photoCount, orientation) {
  const slots = stripSlots(photoCount, orientation)
  return slots.map((slotItem, index) => ({
    ...slotItem,
    x: orientation === 'horizontal' ? slotItem.x : 0.17 + (index % 2) * 0.025,
    width: orientation === 'horizontal' ? slotItem.width : 0.66,
    y: orientation === 'horizontal' ? 0.2 : slotItem.y,
    height: orientation === 'horizontal' ? 0.6 : slotItem.height * 0.78,
    rotation: index % 2 ? 3 : -3,
    fitStrategy: 'full-image',
  }))
}

function staircaseSlots(photoCount) {
  if (photoCount === 3) {
    return [
      slot(0.06, 0.14, 0.54, 0.68),
      slot(0.64, 0.14, 0.3, 0.32),
      slot(0.64, 0.52, 0.3, 0.32),
    ]
  }

  if (photoCount === 4) {
    return [
      slot(0.08, 0.12, 0.4, 0.34),
      slot(0.52, 0.12, 0.4, 0.34),
      slot(0.08, 0.54, 0.4, 0.34),
      slot(0.52, 0.54, 0.4, 0.34),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.08, 0.12, 0.26, 0.4),
      slot(0.37, 0.12, 0.26, 0.4),
      slot(0.66, 0.12, 0.26, 0.4),
      slot(0.19, 0.56, 0.3, 0.32),
      slot(0.51, 0.56, 0.3, 0.32),
    ]
  }

  return [
    slot(0.08, 0.12, 0.25, 0.34),
    slot(0.375, 0.12, 0.25, 0.34),
    slot(0.67, 0.12, 0.25, 0.34),
    slot(0.08, 0.54, 0.25, 0.34),
    slot(0.375, 0.54, 0.25, 0.34),
    slot(0.67, 0.54, 0.25, 0.34),
  ]
}

function overlapSlots(photoCount, orientation) {
  if (photoCount === 3 && orientation === 'horizontal') {
    return [slot(0.08, 0.16, 0.42, 0.62), slot(0.58, 0.16, 0.28, 0.28), slot(0.58, 0.5, 0.28, 0.28)]
  }

  if (photoCount === 3) {
    return [slot(0.18, 0.12, 0.64, 0.36), slot(0.08, 0.56, 0.36, 0.26), slot(0.56, 0.56, 0.36, 0.26)]
  }

  if (photoCount === 4) {
    return [
      slot(0.06, 0.12, 0.42, 0.35),
      slot(0.52, 0.12, 0.42, 0.35),
      slot(0.06, 0.53, 0.42, 0.35),
      slot(0.52, 0.53, 0.42, 0.35),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.08, 0.12, 0.4, 0.24),
      slot(0.52, 0.12, 0.4, 0.24),
      slot(0.3, 0.38, 0.4, 0.24),
      slot(0.08, 0.64, 0.4, 0.24),
      slot(0.52, 0.64, 0.4, 0.24),
    ]
  }

  if (orientation === 'horizontal') {
    return [
      slot(0.08, 0.12, 0.25, 0.34),
      slot(0.375, 0.12, 0.25, 0.34),
      slot(0.67, 0.12, 0.25, 0.34),
      slot(0.08, 0.54, 0.25, 0.34),
      slot(0.375, 0.54, 0.25, 0.34),
      slot(0.67, 0.54, 0.25, 0.34),
    ]
  }

  return [
    slot(0.06, 0.1, 0.4, 0.24),
    slot(0.54, 0.1, 0.4, 0.24),
    slot(0.06, 0.38, 0.4, 0.24),
    slot(0.54, 0.38, 0.4, 0.24),
    slot(0.06, 0.66, 0.4, 0.24),
    slot(0.54, 0.66, 0.4, 0.24),
  ]
}

function contactSheetSlots(photoCount, orientation) {
  const columns = orientation === 'horizontal' ? (photoCount >= 5 ? 3 : 2) : (photoCount <= 4 ? 2 : 3)
  const rows = Math.ceil(photoCount / columns)
  const gapX = 0.024
  const gapY = 0.022
  const width = (0.86 - gapX * (columns - 1)) / columns
  const height = (0.82 - gapY * (rows - 1)) / rows

  return Array.from({ length: photoCount }, (_, index) => {
    const row = Math.floor(index / columns)
    const col = index % columns
    return slot(0.07 + col * (width + gapX), 0.08 + row * (height + gapY), width, height)
  })
}

function editorialSlots(photoCount, orientation) {
  if (photoCount === 3 && orientation === 'vertical') {
    return [slot(0.18, 0.12, 0.64, 0.38), slot(0.08, 0.58, 0.34, 0.26), slot(0.58, 0.58, 0.34, 0.26)]
  }

  if (photoCount === 3) {
    return [slot(0.06, 0.14, 0.54, 0.68), slot(0.64, 0.14, 0.3, 0.32), slot(0.64, 0.52, 0.3, 0.32)]
  }

  if (photoCount === 4) {
    return [
      slot(0.08, 0.12, 0.42, 0.72),
      slot(0.58, 0.12, 0.28, 0.2),
      slot(0.58, 0.39, 0.28, 0.2),
      slot(0.58, 0.66, 0.28, 0.2),
    ]
  }

  if (photoCount === 5 && orientation === 'vertical') {
    return [
      slot(0.18, 0.12, 0.64, 0.34),
      slot(0.1, 0.54, 0.32, 0.2),
      slot(0.58, 0.54, 0.32, 0.2),
      slot(0.1, 0.78, 0.32, 0.2),
      slot(0.58, 0.78, 0.32, 0.2),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.08, 0.15, 0.38, 0.66),
      slot(0.52, 0.16, 0.18, 0.24),
      slot(0.74, 0.16, 0.18, 0.24),
      slot(0.52, 0.56, 0.18, 0.24),
      slot(0.74, 0.56, 0.18, 0.24),
    ]
  }

  if (orientation === 'vertical') {
    return [
      slot(0.08, 0.14, 0.36, 0.62),
      slot(0.5, 0.12, 0.2, 0.21),
      slot(0.74, 0.12, 0.2, 0.21),
      slot(0.5, 0.38, 0.2, 0.21),
      slot(0.74, 0.38, 0.2, 0.21),
      slot(0.62, 0.64, 0.2, 0.21),
    ]
  }

  return [
    slot(0.07, 0.14, 0.26, 0.32),
    slot(0.37, 0.14, 0.26, 0.32),
    slot(0.67, 0.14, 0.26, 0.32),
    slot(0.07, 0.56, 0.26, 0.32),
    slot(0.37, 0.56, 0.26, 0.32),
    slot(0.67, 0.56, 0.26, 0.32),
  ]
}

function cornerSlots(photoCount, orientation) {
  if (photoCount === 3 && orientation === 'horizontal') {
    return [slot(0.06, 0.14, 0.54, 0.68), slot(0.64, 0.14, 0.3, 0.32), slot(0.64, 0.52, 0.3, 0.32)]
  }

  if (photoCount === 3) {
    return [slot(0.2, 0.12, 0.6, 0.3), slot(0.08, 0.56, 0.32, 0.22), slot(0.58, 0.56, 0.32, 0.22)]
  }

  if (photoCount === 4) {
    return [
      slot(0.08, 0.12, 0.38, 0.34),
      slot(0.54, 0.12, 0.38, 0.34),
      slot(0.08, 0.54, 0.38, 0.34),
      slot(0.54, 0.54, 0.38, 0.34),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.06, 0.12, 0.42, 0.24),
      slot(0.52, 0.12, 0.42, 0.24),
      slot(0.29, 0.38, 0.42, 0.24),
      slot(0.06, 0.64, 0.42, 0.24),
      slot(0.52, 0.64, 0.42, 0.24),
    ]
  }

  return [
    slot(0.08, 0.12, 0.37, 0.2),
    slot(0.55, 0.12, 0.37, 0.2),
    slot(0.08, 0.38, 0.37, 0.2),
    slot(0.55, 0.38, 0.37, 0.2),
    slot(0.08, 0.64, 0.37, 0.2),
    slot(0.55, 0.64, 0.37, 0.2),
  ]
}

function centerCompositionSlots(photoCount, orientation) {
  if (photoCount === 3 && orientation === 'horizontal') {
    return [slot(0.08, 0.14, 0.27, 0.68), slot(0.38, 0.14, 0.27, 0.68), slot(0.68, 0.14, 0.27, 0.68)]
  }

  if (photoCount === 3) {
    return [slot(0.17, 0.12, 0.66, 0.4), slot(0.08, 0.58, 0.38, 0.27), slot(0.54, 0.58, 0.38, 0.27)]
  }

  if (photoCount === 4) {
    return [
      slot(0.08, 0.12, 0.38, 0.34),
      slot(0.54, 0.12, 0.38, 0.34),
      slot(0.08, 0.54, 0.38, 0.34),
      slot(0.54, 0.54, 0.38, 0.34),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.08, 0.12, 0.4, 0.24),
      slot(0.52, 0.12, 0.4, 0.24),
      slot(0.25, 0.38, 0.5, 0.24),
      slot(0.08, 0.64, 0.4, 0.24),
      slot(0.52, 0.64, 0.4, 0.24),
    ]
  }

  return [
    slot(0.08, 0.12, 0.37, 0.2),
    slot(0.55, 0.12, 0.37, 0.2),
    slot(0.08, 0.38, 0.37, 0.2),
    slot(0.55, 0.38, 0.37, 0.2),
    slot(0.08, 0.64, 0.37, 0.2),
    slot(0.55, 0.64, 0.37, 0.2),
  ]
}

function splitLayoutSlots(photoCount) {
  if (photoCount === 3) {
    return [slot(0.06, 0.14, 0.54, 0.68), slot(0.64, 0.14, 0.3, 0.32), slot(0.64, 0.52, 0.3, 0.32)]
  }

  if (photoCount === 4) {
    return [
      slot(0.08, 0.12, 0.4, 0.34),
      slot(0.52, 0.12, 0.4, 0.34),
      slot(0.08, 0.54, 0.4, 0.34),
      slot(0.52, 0.54, 0.4, 0.34),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.06, 0.12, 0.42, 0.24),
      slot(0.52, 0.12, 0.42, 0.24),
      slot(0.29, 0.38, 0.42, 0.24),
      slot(0.06, 0.64, 0.42, 0.24),
      slot(0.52, 0.64, 0.42, 0.24),
    ]
  }

  return [
    slot(0.07, 0.14, 0.26, 0.32),
    slot(0.37, 0.14, 0.26, 0.32),
    slot(0.67, 0.14, 0.26, 0.32),
    slot(0.07, 0.56, 0.26, 0.32),
    slot(0.37, 0.56, 0.26, 0.32),
    slot(0.67, 0.56, 0.26, 0.32),
  ]
}

function fullBleedSlots(photoCount, orientation) {
  if (photoCount === 3 && orientation === 'horizontal') {
    return [slot(0.08, 0.14, 0.27, 0.68), slot(0.38, 0.14, 0.27, 0.68), slot(0.68, 0.14, 0.27, 0.68)]
  }

  if (photoCount === 3) {
    return [slot(0.2, 0.12, 0.6, 0.3), slot(0.08, 0.56, 0.32, 0.22), slot(0.58, 0.56, 0.32, 0.22)]
  }

  if (photoCount === 4) {
    return [
      slot(0.08, 0.12, 0.4, 0.34),
      slot(0.52, 0.12, 0.4, 0.34),
      slot(0.08, 0.54, 0.4, 0.34),
      slot(0.52, 0.54, 0.4, 0.34),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.08, 0.12, 0.26, 0.4),
      slot(0.37, 0.12, 0.26, 0.4),
      slot(0.66, 0.12, 0.26, 0.4),
      slot(0.19, 0.56, 0.3, 0.32),
      slot(0.51, 0.56, 0.3, 0.32),
    ]
  }

  if (orientation === 'vertical') {
    return [
      slot(0.08, 0.12, 0.37, 0.2),
      slot(0.55, 0.12, 0.37, 0.2),
      slot(0.08, 0.38, 0.37, 0.2),
      slot(0.55, 0.38, 0.37, 0.2),
      slot(0.08, 0.64, 0.37, 0.2),
      slot(0.55, 0.64, 0.37, 0.2),
    ]
  }

  return [
    slot(0.07, 0.14, 0.26, 0.32),
    slot(0.37, 0.14, 0.26, 0.32),
    slot(0.67, 0.14, 0.26, 0.32),
    slot(0.07, 0.56, 0.26, 0.32),
    slot(0.37, 0.56, 0.26, 0.32),
    slot(0.67, 0.56, 0.26, 0.32),
  ]
}

function asymmetricCollageSlots(_photoCount) {
  return [
    slot(0.08, 0.16, 0.42, 0.66),
    slot(0.56, 0.16, 0.18, 0.24),
    slot(0.78, 0.16, 0.18, 0.24),
    slot(0.56, 0.56, 0.18, 0.24),
    slot(0.78, 0.56, 0.18, 0.24),
  ]
}

function stackedSlots(photoCount) {
  const minimum = QUALITY_MINIMUMS[photoCount] ?? QUALITY_MINIMUMS[6]
  const gap = photoCount >= 6 ? 0.014 : 0.02
  const height = Math.max((0.8 - gap * (photoCount - 1)) / photoCount, minimum.height)
  const total = height * photoCount + gap * (photoCount - 1)
  const offsetY = (1 - total) / 2
  return Array.from({ length: photoCount }, (_, index) => slot(
    0.12 + (index % 2) * 0.07,
    offsetY + index * (height + gap),
    0.76,
    height,
    0,
    0,
    0,
    'full-image'
  ))
}

function bookSlots(photoCount, orientation) {
  if (photoCount === 3) {
    if (orientation === 'horizontal') {
      return [slot(0.08, 0.16, 0.27, 0.66), slot(0.365, 0.16, 0.27, 0.66), slot(0.65, 0.16, 0.27, 0.66)]
    }
    return [slot(0.08, 0.14, 0.38, 0.34), slot(0.54, 0.14, 0.38, 0.34), slot(0.31, 0.56, 0.38, 0.28)]
  }

  if (photoCount === 4) {
    return [
      slot(0.08, 0.12, 0.4, 0.34),
      slot(0.52, 0.12, 0.4, 0.34),
      slot(0.08, 0.54, 0.4, 0.34),
      slot(0.52, 0.54, 0.4, 0.34),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.06, 0.12, 0.42, 0.24),
      slot(0.52, 0.12, 0.42, 0.24),
      slot(0.29, 0.38, 0.42, 0.24),
      slot(0.06, 0.64, 0.42, 0.24),
      slot(0.52, 0.64, 0.42, 0.24),
    ]
  }

  return [
    slot(0.07, 0.14, 0.26, 0.32),
    slot(0.37, 0.14, 0.26, 0.32),
    slot(0.67, 0.14, 0.26, 0.32),
    slot(0.07, 0.56, 0.26, 0.32),
    slot(0.37, 0.56, 0.26, 0.32),
    slot(0.67, 0.56, 0.26, 0.32),
  ]
}

function frameSlots(photoCount) {
  if (photoCount === 3) {
    return [slot(0.18, 0.12, 0.64, 0.36), slot(0.08, 0.56, 0.36, 0.26), slot(0.56, 0.56, 0.36, 0.26)]
  }

  if (photoCount === 4) {
    return [
      slot(0.06, 0.12, 0.42, 0.35),
      slot(0.52, 0.12, 0.42, 0.35),
      slot(0.06, 0.53, 0.42, 0.35),
      slot(0.52, 0.53, 0.42, 0.35),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.08, 0.12, 0.4, 0.24),
      slot(0.52, 0.12, 0.4, 0.24),
      slot(0.3, 0.38, 0.4, 0.24),
      slot(0.08, 0.64, 0.4, 0.24),
      slot(0.52, 0.64, 0.4, 0.24),
    ]
  }

  return [
    slot(0.06, 0.1, 0.4, 0.24),
    slot(0.54, 0.1, 0.4, 0.24),
    slot(0.06, 0.38, 0.4, 0.24),
    slot(0.54, 0.38, 0.4, 0.24),
    slot(0.06, 0.66, 0.4, 0.24),
    slot(0.54, 0.66, 0.4, 0.24),
  ]
}

function scatteredSlots(photoCount, orientation) {
  if (photoCount === 3 && orientation === 'horizontal') {
    return [slot(0.08, 0.14, 0.32, 0.28), slot(0.58, 0.14, 0.32, 0.28), slot(0.33, 0.56, 0.32, 0.28)]
  }

  if (photoCount === 3) {
    return [slot(0.18, 0.12, 0.64, 0.38), slot(0.08, 0.58, 0.34, 0.26), slot(0.58, 0.58, 0.34, 0.26)]
  }

  if (photoCount === 4) {
    return [
      slot(0.08, 0.12, 0.38, 0.34),
      slot(0.54, 0.12, 0.38, 0.34),
      slot(0.08, 0.54, 0.38, 0.34),
      slot(0.54, 0.54, 0.38, 0.34),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.06, 0.12, 0.42, 0.24),
      slot(0.52, 0.12, 0.42, 0.24),
      slot(0.29, 0.38, 0.42, 0.24),
      slot(0.06, 0.64, 0.42, 0.24),
      slot(0.52, 0.64, 0.42, 0.24),
    ]
  }

  if (orientation === 'horizontal') {
    return [
      slot(0.07, 0.14, 0.26, 0.32),
      slot(0.37, 0.14, 0.26, 0.32),
      slot(0.67, 0.14, 0.26, 0.32),
      slot(0.07, 0.56, 0.26, 0.32),
      slot(0.37, 0.56, 0.26, 0.32),
      slot(0.67, 0.56, 0.26, 0.32),
    ]
  }

  return [
    slot(0.08, 0.12, 0.37, 0.2),
    slot(0.55, 0.12, 0.37, 0.2),
    slot(0.08, 0.38, 0.37, 0.2),
    slot(0.55, 0.38, 0.37, 0.2),
    slot(0.08, 0.64, 0.37, 0.2),
    slot(0.55, 0.64, 0.37, 0.2),
  ]
}

function miniArcSlots(photoCount, orientation) {
  if (photoCount === 3 && orientation === 'horizontal') {
    return [slot(0.08, 0.14, 0.27, 0.68), slot(0.37, 0.18, 0.27, 0.68), slot(0.66, 0.14, 0.27, 0.68)]
  }

  if (photoCount === 3) {
    return [slot(0.18, 0.12, 0.58, 0.3), slot(0.1, 0.56, 0.3, 0.2), slot(0.6, 0.56, 0.3, 0.2)]
  }

  if (photoCount === 4) {
    return [
      slot(0.08, 0.12, 0.38, 0.34),
      slot(0.54, 0.12, 0.38, 0.34),
      slot(0.08, 0.54, 0.38, 0.34),
      slot(0.54, 0.54, 0.38, 0.34),
    ]
  }

  if (photoCount === 5) {
    return [
      slot(0.06, 0.12, 0.42, 0.24),
      slot(0.52, 0.12, 0.42, 0.24),
      slot(0.29, 0.38, 0.42, 0.24),
      slot(0.06, 0.64, 0.42, 0.24),
      slot(0.52, 0.64, 0.42, 0.24),
    ]
  }

  if (orientation === 'horizontal') {
    return [
      slot(0.07, 0.14, 0.26, 0.32),
      slot(0.37, 0.14, 0.26, 0.32),
      slot(0.67, 0.14, 0.26, 0.32),
      slot(0.07, 0.56, 0.26, 0.32),
      slot(0.37, 0.56, 0.26, 0.32),
      slot(0.67, 0.56, 0.26, 0.32),
    ]
  }

  return [
    slot(0.08, 0.12, 0.37, 0.2),
    slot(0.55, 0.12, 0.37, 0.2),
    slot(0.08, 0.38, 0.37, 0.2),
    slot(0.55, 0.38, 0.37, 0.2),
    slot(0.08, 0.64, 0.37, 0.2),
    slot(0.55, 0.64, 0.37, 0.2),
  ]
}

function makePhotoSlots(layout, photoCount, orientation) {
  if (layout === 'horizontal-strip') return stripSlots(photoCount, 'horizontal')
  if (layout === 'vertical-strip') return verticalStripSlots(photoCount, orientation)
  if (layout === 'filmstrip') return stripSlots(photoCount, orientation, true)
  if (layout === 'zigzag' || layout === 'staggered') return zigzagSlots(photoCount)
  if (layout === 'diagonal') return diagonalSlots(photoCount)
  if (layout === 'polaroid') return polaroidSlots(photoCount, orientation)
  if (layout === 'collage') return collageSlots(photoCount)
  if (layout === 'grid') return gridSlots(photoCount, photoCount >= 6 ? 3 : 2)
  if (layout === 'staircase') return staircaseSlots(photoCount)
  if (layout === 'contact-sheet') return contactSheetSlots(photoCount, orientation)
  if (layout === 'overlap') return overlapSlots(photoCount, orientation)
  if (layout === 'center') return centerCompositionSlots(photoCount, orientation)
  if (layout === 'split') return splitLayoutSlots(photoCount)
  if (layout === 'full-bleed') return fullBleedSlots(photoCount, orientation)
  if (layout === 'asymmetric-collage') return asymmetricCollageSlots(photoCount)
  if (layout === 'stacked') return stackedSlots(photoCount)
  if (layout === 'book') return bookSlots(photoCount, orientation)
  if (layout === 'frame') return frameSlots(photoCount)
  if (layout === 'corner') return cornerSlots(photoCount, orientation)
  if (layout === 'scattered') return scatteredSlots(photoCount, orientation)
  if (layout === 'editorial') return editorialSlots(photoCount, orientation)
  if (layout === 'magazine') return editorialSlots(photoCount, orientation)
  if (layout === 'gallery') return contactSheetSlots(photoCount, orientation)
  if (layout === 'one-large-two-small') return editorialSlots(photoCount, orientation)
  if (layout === 'two-large-two-small') return collageSlots(photoCount)
  if (layout === 'one-large-four-small') return editorialSlots(photoCount, orientation)
  if (layout === 'two-large-three-small') return collageSlots(photoCount)
  if (layout === 'postcard') return splitLayoutSlots(photoCount)
  if (layout === 'mini-arc') return miniArcSlots(photoCount, orientation)
  return gridSlots(photoCount, photoCount >= 6 ? 3 : 2)
}

const categoryPalette = {
  Classic: { background: '#f5edf1', accent: '#b72545', pattern: 'film', frame: 'clean', mood: 'classic', text: '#2a1d20' },
  Retro: { background: '#f5e4d9', accent: '#9a3d3d', pattern: 'scrapbook', frame: 'retro', mood: 'vintage', text: '#2d1f1a' },
  Party: { background: '#f8e5cf', accent: '#e5486a', pattern: 'stars', frame: 'decorative', mood: 'festive', text: '#2a1f22' },
  Cute: { background: '#f6eaf4', accent: '#d98ca7', pattern: 'floral', frame: 'soft-pink', mood: 'sweet', text: '#392127' },
  Love: { background: '#fde6eb', accent: '#cf3557', pattern: 'hearts', frame: 'soft-pink', mood: 'romantic', text: '#3a1f2d' },
}

const CATEGORY_VISUAL_FAMILIES = {
  Classic: 'Classic & Minimal',
  Retro: 'Retro & Photo',
  Party: 'Celebration',
  Cute: 'Nature & Floral',
  Love: 'Romantic',
}

const themeVisualTreatments = {
  'Doodle Trio 3': {
    visualFamily: 'Nature & Floral', background: '#e1eef0', frame: '#fbf8ed', accent: '#6c99a0', text: '#2d4142', backgroundStyle: 'clouds',
  },
  'Weekend Letter 3': {
    visualFamily: 'Celebration', background: '#f6e9d1', frame: '#fff8e8', accent: '#c76b51', text: '#3b3030', backgroundStyle: 'celebration',
    borderStyle: { kind: 'dashed', weight: 2 },
  },
  'Faded Bloom 3': {
    visualFamily: 'Botanical', background: '#e7ede2', frame: '#faf7eb', accent: '#61795d', text: '#2f3b30', backgroundStyle: 'botanical',
  },
  'Street Glow 3': {
    visualFamily: 'Darkroom', background: '#27262c', frame: '#f2e7d4', accent: '#d0805f', text: '#f8f0df', backgroundStyle: 'noir',
    borderStyle: { kind: 'dashed', weight: 2 },
  },
  'Candy Keepsake 4': {
    visualFamily: 'Monochrome Editorial', background: '#eeeeeb', frame: '#fffefa', accent: '#414348', text: '#292a2d', backgroundStyle: 'white-grid',
    borderStyle: { kind: 'newspaper', weight: 2, innerInset: 8 },
  },
  'Blackout Frame 4': {
    visualFamily: 'Darkroom', background: '#24242a', frame: '#f3ead9', accent: '#d0ad6d', text: '#f7f0e2', backgroundStyle: 'noir',
    borderStyle: { kind: 'double', weight: 2, innerInset: 7 },
  },
  'Daydream Strip 4': {
    visualFamily: 'Sky & Coast', background: '#dfedf0', frame: '#fbf8ed', accent: '#57848c', text: '#293e42', backgroundStyle: 'coast',
  },
  'Modern Shimmer 4': {
    visualFamily: 'Artistic & Y2K', background: '#dfe3e8', frame: '#f8f7f3', accent: '#718096', text: '#2b2d32', backgroundStyle: 'chrome',
  },
  'Night Reel 4': {
    visualFamily: 'Botanical', background: '#e4ebe1', frame: '#f8f3e4', accent: '#60755d', text: '#303a30', backgroundStyle: 'botanical',
  },
  'Paper Arcade 4': {
    visualFamily: 'Artistic & Y2K', background: '#222b36', frame: '#eee7d6', accent: '#e38aaa', text: '#f5eef0', backgroundStyle: 'neon',
    borderStyle: { kind: 'dashed', weight: 2 },
  },
  'Daisy Relay 5': {
    visualFamily: 'Botanical', background: '#e9e3f0', frame: '#faf7ef', accent: '#7a6d8c', text: '#383440', backgroundStyle: 'lavender',
  },
  'Neon Story 5': {
    visualFamily: 'Artistic & Y2K', background: '#20232f', frame: '#f1e8d4', accent: '#e780a0', text: '#f7eff0', backgroundStyle: 'neon',
    borderStyle: { kind: 'dashed', weight: 3 },
  },
  'Rose Sequence 5': {
    visualFamily: 'Romantic', background: '#f3e2e3', frame: '#fff9f0', accent: '#a64753', text: '#4b3036', backgroundStyle: 'rose-petal',
    borderStyle: { kind: 'double', weight: 2, innerInset: 7 },
  },
  'Quiet Crowd 5': {
    visualFamily: 'Sky & Coast', background: '#deebec', frame: '#f9f6e9', accent: '#56828a', text: '#293d40', backgroundStyle: 'coast',
  },
  'Petal Spread 5': {
    visualFamily: 'Nature & Floral', background: '#f0ecdc', frame: '#fff9ed', accent: '#94685a', text: '#3b3931', backgroundStyle: 'wildflower', decorationKind: 'flowers',
  },
  'Scene Book 5': {
    visualFamily: 'Retro & Photo', background: '#e9dfcf', frame: '#faf3e5', accent: '#9b6042', text: '#3d3129', backgroundStyle: 'autumn',
    borderStyle: { kind: 'film', weight: 2, innerInset: 6 },
  },
  'Night Party 6': {
    visualFamily: 'Darkroom', background: '#242a32', frame: '#f1e9d8', accent: '#8fb1bb', text: '#f4f0e8', backgroundStyle: 'noir',
  },
  'Love Circuit 6': {
    visualFamily: 'Celebration', background: '#f4dfd4', frame: '#fff4e2', accent: '#c5544d', text: '#3b302d', backgroundStyle: 'celebration',
    borderStyle: { kind: 'dashed', weight: 2 },
  },
  'Linen Story 6': {
    visualFamily: 'Botanical', background: '#e5e9dc', frame: '#f8f3e7', accent: '#718263', text: '#343d30', backgroundStyle: 'autumn',
  },
  'Vivid Notes 6': {
    visualFamily: 'Botanical', background: '#e0ebe1', frame: '#f8f1dc', accent: '#477967', text: '#293b34', backgroundStyle: 'tropical', decorationKind: 'flowers',
  },
}

const photoCountNames = {
  3: [
    'Three-Cut Classic', 'Rose Reel', 'Polaroid Fan', 'Bloom Notes', 'Velvet Frame', 'Sunset Stack', 'Paper Story', 'Moonlit Trio', 'Daisy Line', 'Love Ledger',
    'Golden Moment', 'Street Glow', 'Petit Postcard', 'Velvet Trio', 'Warm Echo', 'Night Ribbon', 'Weekend Muse', 'Candy Frame', 'Faded Bloom', 'Doodle Trio',
    'Soft Snap', 'Wildflower Fold', 'Pink Orbit', 'Chalkboard Keepsake', 'Weekend Letter',
  ],
  4: [
    'Four Square Glow', 'Cherry Comet', 'Corner Story', 'Soft Bloom', 'Rose Parade', 'Studio Ledger', 'Memories Fold', 'Pink Anchor', 'Love Ledger', 'Blackout Frame',
    'Modern Shimmer', 'Velvet Grid', 'Field Notes', 'Rose Drift', 'Night Reel', 'Duo Glow', 'Sunset Notes', 'Candy Keepsake', 'Daydream Strip', 'Paper Arcade',
    'Mini Muse', 'Little Parade', 'Breeze Square', 'Cherry Fold', 'Paper Hearts',
  ],
  5: [
    'Five Frame Mood', 'Studio Trace', 'Sunlit Mosaic', 'Sweet Contact', 'Warm Scatter', 'Afterglow Set', 'Paper Circuit', 'Nightline Reel', 'Cafe Memory', 'Pink Ledger',
    'Mini Gallery', 'Joy Sequence', 'Petal Spread', 'Retro Lift', 'Scene Book', 'Color Drift', 'Daisy Relay', 'Neon Story', 'Garden Notes', 'Wildlight Set',
    'Cafe Mood', 'Rose Sequence', 'Window Frame', 'Starlight Mix', 'Quiet Crowd',
  ],
  6: [
    'Six Frame Story', 'Midnight Mix', 'Ribbon Ledger', 'Festival Fold', 'Cherry Parade', 'Weekend Block', 'Candid Grid', 'Night Party', 'Paper Crowd', 'Rose Archive',
    'Good Time Set', 'Golden Ledger', 'Vivid Notes', 'Velvet Archive', 'Scene Stack', 'Gathering Glow', 'Linen Story', 'Dream Board', 'Happy Scatter', 'Candy Ledger',
    'Polaroid Block', 'Love Circuit', 'Sunroom Mix', 'Weekend Pulse', 'Big Day Set',
  ],
}

const layoutCatalog = {
  3: ['vertical-strip', 'horizontal-strip', 'zigzag', 'staggered', 'diagonal', 'polaroid', 'collage', 'postcard', 'center', 'split', 'overlap', 'staircase', 'contact-sheet', 'stacked', 'scattered', 'editorial', 'frame', 'book', 'corner', 'magazine', 'gallery', 'full-bleed', 'one-large-two-small', 'mini-arc'],
  4: ['vertical-strip', 'horizontal-strip', 'zigzag', 'staggered', 'diagonal', 'polaroid', 'collage', 'postcard', 'center', 'split', 'overlap', 'staircase', 'contact-sheet', 'stacked', 'scattered', 'editorial', 'frame', 'book', 'corner', 'magazine', 'gallery', 'full-bleed', 'one-large-two-small', 'two-large-two-small', 'mini-arc'],
  5: ['vertical-strip', 'horizontal-strip', 'zigzag', 'staggered', 'diagonal', 'polaroid', 'collage', 'postcard', 'center', 'split', 'overlap', 'staircase', 'contact-sheet', 'stacked', 'scattered', 'editorial', 'frame', 'book', 'corner', 'magazine', 'gallery', 'full-bleed', 'one-large-two-small', 'asymmetric-collage', 'mini-arc'],
  6: ['vertical-strip', 'horizontal-strip', 'zigzag', 'staggered', 'diagonal', 'polaroid', 'collage', 'postcard', 'center', 'split', 'overlap', 'staircase', 'contact-sheet', 'stacked', 'scattered', 'editorial', 'frame', 'book', 'corner', 'magazine', 'gallery', 'full-bleed', 'one-large-four-small', 'two-large-three-small', 'mini-arc'],
}

const templatePhotoSlotOverrides = {
  'Golden Moment 3': [
    slot(0.16, 0.12, 0.68, 0.5),
    slot(0.06, 0.66, 0.4, 0.22, -2),
    slot(0.54, 0.66, 0.4, 0.22, 2),
  ],
  'Weekend Muse 3': [
    slot(0.285, 0.12, 0.43, 0.4, -1.5),
    slot(0.06, 0.58, 0.43, 0.34, 1.5),
    slot(0.51, 0.58, 0.43, 0.34, -1.5),
  ],
  'Warm Echo 3': [
    slot(0.06, 0.12, 0.42, 0.42, -2),
    slot(0.52, 0.31, 0.42, 0.42, 2),
    slot(0.06, 0.58, 0.42, 0.3, -2),
  ],
  'Pink Orbit 3': [
    slot(0.06, 0.12, 0.54, 0.74),
    slot(0.64, 0.12, 0.3, 0.32),
    slot(0.64, 0.52, 0.3, 0.32),
  ],
  'Color Drift 5': [
    slot(0.29, 0.2, 0.42, 0.6),
    slot(0.06, 0.12, 0.2, 0.32),
    slot(0.74, 0.12, 0.2, 0.32),
    slot(0.06, 0.56, 0.2, 0.32),
    slot(0.74, 0.56, 0.2, 0.32),
  ],
  'Wildlight Set 5': [
    slot(0.06, 0.12, 0.28, 0.38),
    slot(0.36, 0.12, 0.28, 0.38),
    slot(0.66, 0.12, 0.28, 0.38),
    slot(0.21, 0.54, 0.28, 0.38),
    slot(0.51, 0.54, 0.28, 0.38),
  ],
  'Sunroom Mix 6': [
    slot(0.06, 0.12, 0.42, 0.66),
    slot(0.54, 0.12, 0.2, 0.22),
    slot(0.74, 0.12, 0.2, 0.22),
    slot(0.54, 0.38, 0.2, 0.22),
    slot(0.74, 0.38, 0.2, 0.22),
    slot(0.64, 0.64, 0.2, 0.22),
  ],
  'Five Frame Mood 5': [
    slot(0.05, 0.12, 0.3, 0.34),
    slot(0.35, 0.12, 0.3, 0.34),
    slot(0.65, 0.12, 0.3, 0.34),
    slot(0.2, 0.56, 0.3, 0.32),
    slot(0.5, 0.56, 0.3, 0.32),
  ],
  'Paper Crowd 6': [
    slot(0.05, 0.12, 0.3, 0.28),
    slot(0.36, 0.12, 0.3, 0.28),
    slot(0.67, 0.12, 0.3, 0.28),
    slot(0.05, 0.58, 0.3, 0.28),
    slot(0.36, 0.58, 0.3, 0.28),
    slot(0.67, 0.58, 0.3, 0.28),
  ],
  'Scene Stack 6': [
    slot(0.06, 0.12, 0.29, 0.28, -1.5),
    slot(0.365, 0.12, 0.29, 0.28, 1.5),
    slot(0.67, 0.12, 0.29, 0.28, -1.5),
    slot(0.09, 0.58, 0.29, 0.28, 1.5),
    slot(0.395, 0.58, 0.29, 0.28, -1.5),
    slot(0.7, 0.58, 0.29, 0.28, 1.5),
  ],
}

const natureThemeSpecs = [
  {
    name: 'Under the Banyan', photoCount: 6, orientation: 'vertical', layout: 'grid', visualFamily: 'Banyan Canopy', backgroundStyle: 'banyan-canopy',
    background: '#e1e8d5', frame: '#f4efdb', accent: '#56734e', text: '#2e4032', slotFrameStyle: 'clean',
    borderStyle: { kind: 'keyline', weight: 2, inset: 19, innerInset: 7 }, decorationKind: 'leaves',
    photoSlots: [
      naturePhotoSlot(0.04, 0.1, 0.29, 0.18),
      naturePhotoSlot(0.05, 0.4, 0.28, 0.17),
      naturePhotoSlot(0.02, 0.69, 0.3, 0.18),
      naturePhotoSlot(0.67, 0.18, 0.29, 0.18),
      naturePhotoSlot(0.68, 0.47, 0.28, 0.17),
      naturePhotoSlot(0.66, 0.73, 0.31, 0.18),
    ],
    description: 'A mature banyan canopy, broad limbs and hanging aerial roots frame a six-photo grid.',
  },
  {
    name: 'Secret Garden', photoCount: 5, orientation: 'horizontal', layout: 'editorial', visualFamily: 'Floral Arch', backgroundStyle: 'secret-garden-arch',
    background: '#e3eadc', frame: '#f7efe0', accent: '#7d805d', text: '#374136', slotFrameStyle: 'clean',
    borderStyle: { kind: 'double', weight: 2, inset: 20, innerInset: 8 }, decorationKind: 'rose',
    photoSlots: [
      naturePhotoSlot(0.06, 0.19, 0.3, 0.52),
      naturePhotoSlot(0.52, 0.12, 0.18, 0.31),
      naturePhotoSlot(0.75, 0.12, 0.18, 0.31),
      naturePhotoSlot(0.52, 0.48, 0.18, 0.31),
      naturePhotoSlot(0.75, 0.48, 0.18, 0.31),
    ],
    description: 'A quiet woodland backdrop with a flower-covered arch framing five open portraits.',
  },
  {
    name: 'Cherry Blossom Grove', photoCount: 3, orientation: 'horizontal', layout: 'horizontal-strip', visualFamily: 'Blossom Grove', backgroundStyle: 'cherry-blossom-walk',
    background: '#f0e5e8', frame: '#fff9f3', accent: '#ad7784', text: '#483a40', slotFrameStyle: 'clean',
    borderStyle: { kind: 'keyline', weight: 2, inset: 20, innerInset: 8 }, decorationKind: 'blossom',
    photoSlots: [
      naturePhotoSlot(0.06, 0.22, 0.29, 0.5),
      naturePhotoSlot(0.66, 0.1, 0.24, 0.4),
      naturePhotoSlot(0.66, 0.52, 0.24, 0.4),
    ],
    description: 'Large flowering branches reach in from both sides beneath a soft spring sky.',
  },
  {
    name: 'Forest Clearing', photoCount: 6, orientation: 'vertical', layout: 'contact-sheet', visualFamily: 'Forest Clearing', backgroundStyle: 'forest-clearing',
    background: '#dbe4d8', frame: '#f2eddd', accent: '#506f5c', text: '#2c3d34', slotFrameStyle: 'clean',
    borderStyle: { kind: 'double', weight: 2, inset: 19, innerInset: 8 }, decorationKind: 'leaves',
    photoSlots: [
      naturePhotoSlot(0.02, 0.12, 0.28, 0.165),
      naturePhotoSlot(0.7, 0.24, 0.28, 0.165),
      naturePhotoSlot(0.02, 0.42, 0.28, 0.165),
      naturePhotoSlot(0.7, 0.54, 0.28, 0.165),
      naturePhotoSlot(0.02, 0.7, 0.28, 0.165),
      naturePhotoSlot(0.7, 0.73, 0.28, 0.165),
    ],
    description: 'Deep layered woods and tall edge trunks leave a calm clearing for six photos.',
  },
  {
    name: 'Wildflower Meadow', photoCount: 5, orientation: 'horizontal', layout: 'grid', visualFamily: 'Wildflower Meadow', backgroundStyle: 'wildflower-path',
    background: '#e8ecd9', frame: '#f7efdc', accent: '#71825b', text: '#353d30', slotFrameStyle: 'clean',
    borderStyle: { kind: 'keyline', weight: 2, inset: 19, innerInset: 6 }, decorationKind: 'flowers',
    photoSlots: [
      naturePhotoSlot(0.33, 0.08, 0.34, 0.57),
      naturePhotoSlot(0.04, 0.68, 0.18, 0.28),
      naturePhotoSlot(0.27, 0.68, 0.18, 0.28),
      naturePhotoSlot(0.51, 0.68, 0.18, 0.28),
      naturePhotoSlot(0.74, 0.68, 0.18, 0.28),
    ],
    description: 'A leafy overhead path opens through an irregular bank of small meadow flowers.',
  },
  {
    name: 'Monsoon Forest', photoCount: 4, orientation: 'vertical', layout: 'grid', visualFamily: 'Monsoon Forest', backgroundStyle: 'monsoon-green',
    background: '#cbd9cf', frame: '#e9e7d5', accent: '#426b5a', text: '#293d36', slotFrameStyle: 'clean',
    borderStyle: { kind: 'keyline', weight: 3, inset: 18, innerInset: 0 }, decorationKind: 'leaves',
    photoSlots: [
      naturePhotoSlot(0.03, 0.37, 0.32, 0.19),
      naturePhotoSlot(0.65, 0.24, 0.32, 0.19),
      naturePhotoSlot(0.65, 0.54, 0.32, 0.19),
      naturePhotoSlot(0.08, 0.66, 0.32, 0.19),
    ],
    description: 'Dark rain-wet trunks, glossy leaves and a soft mist sit behind four portraits.',
  },
  {
    name: 'Autumn Grove', photoCount: 4, orientation: 'horizontal', layout: 'horizontal-strip', visualFamily: 'Autumn Canopy', backgroundStyle: 'autumn-grove',
    background: '#e6d8bd', frame: '#f5ead3', accent: '#9c6942', text: '#40342b', slotFrameStyle: 'clean',
    borderStyle: { kind: 'keyline', weight: 2, inset: 20, innerInset: 7 }, decorationKind: 'dry-leaf',
    photoSlots: [
      naturePhotoSlot(0.04, 0.08, 0.27, 0.46),
      naturePhotoSlot(0.69, 0.12, 0.27, 0.46),
      naturePhotoSlot(0.17, 0.58, 0.25, 0.38),
      naturePhotoSlot(0.55, 0.61, 0.24, 0.36),
    ],
    description: 'Amber trees arch overhead as scattered dry leaves collect along the park path.',
  },
  {
    name: 'Dry Leaf Grove', photoCount: 4, orientation: 'horizontal', layout: 'split', visualFamily: 'Fallen Leaf Scrapbook', backgroundStyle: 'dry-leaves-bottom',
    background: '#e4d2b5', frame: '#f5e5cb', accent: '#98633f', text: '#40332a', slotFrameStyle: 'postcard',
    borderStyle: { kind: 'film', weight: 3, inset: 18, innerInset: 7 }, decorationKind: 'dry-leaf',
    photoSlots: [
      naturePhotoSlot(0.08, 0.08, 0.18, 0.31),
      naturePhotoSlot(0.08, 0.4, 0.18, 0.31),
      naturePhotoSlot(0.08, 0.72, 0.18, 0.25),
      naturePhotoSlot(0.6, 0.16, 0.32, 0.54),
    ],
    description: 'A warm paper scrapbook with a substantial foreground of fallen amber leaves.',
  },
  {
    name: 'Tropical Tree Grove', photoCount: 6, orientation: 'vertical', layout: 'collage', visualFamily: 'Tropical Canopy', backgroundStyle: 'tropical-canopy',
    background: '#d4e2d2', frame: '#f4e9ce', accent: '#3e705e', text: '#293d34', slotFrameStyle: 'floating',
    borderStyle: { kind: 'keyline', weight: 3, inset: 18, innerInset: 0 }, decorationKind: 'leaves',
    photoSlots: [
      naturePhotoSlot(0.03, 0.12, 0.27, 0.16),
      naturePhotoSlot(0.7, 0.21, 0.27, 0.16),
      naturePhotoSlot(0.13, 0.4, 0.27, 0.16),
      naturePhotoSlot(0.6, 0.49, 0.27, 0.16),
      naturePhotoSlot(0.03, 0.69, 0.27, 0.16),
      naturePhotoSlot(0.7, 0.75, 0.27, 0.16),
    ],
    description: 'Layered banana leaves and palms create a lush tropical edge around six photos.',
  },
  {
    name: 'Rose Garden Trees', photoCount: 5, orientation: 'horizontal', layout: 'horizontal-strip', visualFamily: 'Rose Tree Garden', backgroundStyle: 'rose-tree-garden',
    background: '#eaddd5', frame: '#f8efe3', accent: '#98636a', text: '#45353b', slotFrameStyle: 'clean',
    borderStyle: { kind: 'double', weight: 2, inset: 20, innerInset: 8 }, decorationKind: 'rose',
    photoSlots: [
      naturePhotoSlot(0.62, 0.22, 0.31, 0.53),
      naturePhotoSlot(0.06, 0.12, 0.18, 0.31),
      naturePhotoSlot(0.29, 0.12, 0.18, 0.31),
      naturePhotoSlot(0.06, 0.5, 0.18, 0.31),
      naturePhotoSlot(0.29, 0.5, 0.18, 0.31),
    ],
    description: 'Old rose branches and climbing vines frame a tidy five-photo garden strip.',
  },
  {
    name: 'Golden Sunlight Forest', photoCount: 5, orientation: 'horizontal', layout: 'contact-sheet', visualFamily: 'Golden Forest Light', backgroundStyle: 'golden-forest',
    background: '#e6d8b9', frame: '#f6edda', accent: '#92764d', text: '#3c382f', slotFrameStyle: 'clean',
    borderStyle: { kind: 'keyline', weight: 2, inset: 19, innerInset: 6 }, decorationKind: 'leaves',
    photoSlots: [
      naturePhotoSlot(0.05, 0.12, 0.2, 0.34),
      naturePhotoSlot(0.75, 0.12, 0.2, 0.34),
      naturePhotoSlot(0.05, 0.58, 0.2, 0.34),
      naturePhotoSlot(0.4, 0.58, 0.2, 0.34),
      naturePhotoSlot(0.75, 0.58, 0.2, 0.34),
    ],
    description: 'Tall trunks and soft shafts of late sunlight form a warm five-photo forest scene.',
  },
  {
    name: 'Lavender Garden', photoCount: 4, orientation: 'vertical', layout: 'vertical-strip', visualFamily: 'Lavender Woods', backgroundStyle: 'lavender-woods',
    background: '#e2deea', frame: '#f6f1e7', accent: '#796c8e', text: '#393644', slotFrameStyle: 'clean',
    borderStyle: { kind: 'keyline', weight: 2, inset: 21, innerInset: 0 }, decorationKind: 'lavender',
    photoSlots: [
      naturePhotoSlot(0.04, 0.11, 0.31, 0.18),
      naturePhotoSlot(0.63, 0.32, 0.31, 0.18),
      naturePhotoSlot(0.08, 0.53, 0.31, 0.18),
      naturePhotoSlot(0.61, 0.74, 0.31, 0.18),
    ],
    description: 'A woodland edge of lavender sprigs, cool shadows and muted violet light.',
  },
  {
    name: 'Daisy Meadow', photoCount: 6, orientation: 'horizontal', layout: 'vertical-strip', visualFamily: 'Daisy Meadow', backgroundStyle: 'daisy-meadow',
    background: '#e8ecd9', frame: '#faf5e3', accent: '#748358', text: '#363e30', slotFrameStyle: 'contact',
    borderStyle: { kind: 'dotted', weight: 2, inset: 19, innerInset: 0 }, decorationKind: 'daisy',
    photoSlots: [
      naturePhotoSlot(0.08, 0.09, 0.25, 0.42),
      naturePhotoSlot(0.67, 0.09, 0.25, 0.42),
      naturePhotoSlot(0.04, 0.67, 0.16, 0.27),
      naturePhotoSlot(0.28, 0.67, 0.16, 0.27),
      naturePhotoSlot(0.52, 0.67, 0.16, 0.27),
      naturePhotoSlot(0.76, 0.67, 0.16, 0.27),
    ],
    description: 'Edge trees open onto a grassy meadow with white daisies around six frames.',
  },
  {
    name: 'Lakeside Grove', photoCount: 3, orientation: 'horizontal', layout: 'grid', visualFamily: 'Lakeside Trees', backgroundStyle: 'lakeside-trees',
    background: '#dce7e4', frame: '#f3efdf', accent: '#527c77', text: '#2e4240', slotFrameStyle: 'postcard',
    borderStyle: { kind: 'keyline', weight: 2, inset: 20, innerInset: 0 }, decorationKind: 'leaves',
    photoSlots: [
      naturePhotoSlot(0.62, 0.23, 0.3, 0.52),
      naturePhotoSlot(0.06, 0.08, 0.24, 0.415),
      naturePhotoSlot(0.06, 0.53, 0.24, 0.415),
    ],
    description: 'Tall lakeside trees frame a calm blue horizon behind three landscape photos.',
  },
  {
    name: 'Enchanted Woodland', photoCount: 3, orientation: 'vertical', layout: 'vertical-strip', visualFamily: 'Enchanted Woodland', backgroundStyle: 'enchanted-woodland',
    background: '#dce5d9', frame: '#f4eadb', accent: '#617c67', text: '#303e37', slotFrameStyle: 'clean',
    borderStyle: { kind: 'double', weight: 2, inset: 20, innerInset: 7 }, decorationKind: 'petal',
    photoSlots: [
      naturePhotoSlot(0.04, 0.11, 0.32, 0.19),
      naturePhotoSlot(0.6, 0.39, 0.32, 0.19),
      naturePhotoSlot(0.14, 0.68, 0.32, 0.19),
    ],
    description: 'Layered forest silhouettes, flower vines and soft firefly-like light surround three photos.',
  },
]

function buildThemeLibrary() {
  const categories = ['Classic', 'Retro', 'Party', 'Cute', 'Love']
  const templates = []

  for (const photoCount of [3, 4, 5, 6]) {
    const names = photoCountNames[photoCount]
    const layouts = layoutCatalog[photoCount]
    const seenNames = new Map()

    for (let index = 0; index < 25; index += 1) {
      const category = categories[(index + photoCount) % categories.length]
      const palette = categoryPalette[category]
      const layout = layouts[index % layouts.length]
      const orientation = photoCount === 3 && index % 3 === 0 ? 'horizontal' : index % 2 === 0 ? 'vertical' : 'horizontal'
      const photoHeaderSpace = orientation === 'vertical' && index % 5 !== 0
      const baseName = names[index]
      const seenCount = seenNames.get(baseName) ?? 0
      seenNames.set(baseName, seenCount + 1)
      const uniqueName = seenCount === 0 ? `${baseName} ${photoCount}` : `${baseName} ${photoCount}-${seenCount + 1}`
      const baseSlots = templatePhotoSlotOverrides[uniqueName] ?? makePhotoSlots(layout, photoCount, orientation)
      const slots = baseSlots.map((slotItem) => ({
        ...slotItem,
        x: slotItem.x,
        y: slotItem.y,
        width: slotItem.width,
        height: slotItem.height,
        rotation: slotItem.rotation,
        offsetX: 0,
        offsetY: 0,
        fitStrategy: 'filled-frame',
        zIndex: layerOrder.photos,
        layer: 'photo',
      }))
      const treatment = themeVisualTreatments[uniqueName] ?? {}
      const decorationKind = treatment.decorationKind ?? (palette.pattern === 'film' ? 'sparkles' : palette.pattern === 'hearts' ? 'hearts' : 'dots')
      const decorations = marks(
        decorationKind,
        buildDecorationPoints(layout, photoCount),
        9,
      ).map((item, index) => ({
        ...item,
        zIndex: index % 2 === 0 ? layerOrder.background : layerOrder.foreground,
        layer: 'decorative',
      }))
      const borderStyle = { kind: 'keyline', weight: 2, inset: 18, innerInset: 6, ...treatment.borderStyle }
      const background = treatment.background ?? palette.background
      const frame = treatment.frame ?? palette.accent
      const accent = treatment.accent ?? palette.accent
      const text = treatment.text ?? palette.text
      const backgroundStyle = treatment.backgroundStyle ?? palette.pattern
      const slotFrameStyle = palette.frame
      const visualFamily = treatment.visualFamily ?? CATEGORY_VISUAL_FAMILIES[category]

      templates.push({
        id: `${photoCount}-${category.toLowerCase()}-${index + 1}`,
        name: uniqueName,
        category,
        description: `${uniqueName} gives ${photoCount} real moments a ${palette.mood} mood with a ${layout.replace('-', ' ')} arrangement.`,
        photoCount,
        orientation,
        photoHeaderSpace,
        visualFamily,
        layout,
        visualStyle: layout.replace(/[^a-z0-9]+/g, '-'),
        photoSlots: slots,
        alternatePhotoSlots: slots,
        background,
        frame,
        accent,
        text,
        backgroundStyle,
        slotFrameStyle,
        borderStyle,
        decorationStyle: { kind: decorationKind, size: 8, count: 4 },
        decorations,
        requiredPhotoCount: photoCount,
        composition: {
          layout,
          orientation,
          photoCount,
          canvasFormat: orientation === 'vertical' ? 'portrait' : 'landscape',
          photoSlots: slots,
          background: backgroundStyle,
          defaultFilter: 'original',
          frame: slotFrameStyle,
          visualFamily,
          decorations: { kind: decorationKind, size: 8, count: 4 },
          stickerCategory: category,
        },
      })
    }
  }

  natureThemeSpecs.forEach((spec) => {
    const slug = spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const photoSlots = (spec.photoSlots ?? makePhotoSlots(spec.layout, spec.photoCount, spec.orientation)).map((photoSlot) => ({
      ...photoSlot,
      offsetX: 0,
      offsetY: 0,
      fitStrategy: 'filled-frame',
      zIndex: layerOrder.photos,
      layer: 'photo',
    }))
    const decorations = []

    templates.push({
      id: `nature-${slug}`,
      name: spec.name,
      category: 'Cute',
      description: spec.description,
      photoCount: spec.photoCount,
      requiredPhotoCount: spec.photoCount,
      orientation: spec.orientation,
      photoHeaderSpace: spec.photoHeaderSpace ?? false,
      visualFamily: spec.visualFamily,
      layout: spec.layout,
      visualStyle: `nature-${slug}`,
      photoSlots,
      alternatePhotoSlots: photoSlots,
      background: spec.background,
      frame: spec.frame,
      accent: spec.accent,
      text: spec.text,
      backgroundStyle: spec.backgroundStyle,
      slotFrameStyle: spec.slotFrameStyle,
      borderStyle: { inset: 18, weight: 2, innerInset: 6, ...spec.borderStyle },
      decorationStyle: { kind: spec.decorationKind, size: 8, count: 0 },
      decorations,
      composition: {
        layout: spec.layout,
        orientation: spec.orientation,
        photoCount: spec.photoCount,
        canvasFormat: spec.orientation === 'vertical' ? 'portrait' : 'landscape',
        photoSlots,
        background: spec.backgroundStyle,
        defaultFilter: 'original',
        frame: spec.slotFrameStyle,
        visualFamily: spec.visualFamily,
        decorations: { kind: spec.decorationKind, size: 8, count: 0 },
        stickerCategory: 'Cute',
      },
    })
  })

  return templates
}

export const themeDefinitions = buildThemeLibrary()
export const themeCount = themeDefinitions.length
export const themeCategories = ['Classic', 'Retro', 'Party', 'Cute', 'Love']
export const themeByName = Object.fromEntries(themeDefinitions.map((theme) => [theme.name, theme]))

export function buildTemplateQualityReport(templates) {
  const counts = { 3: 0, 4: 0, 5: 0, 6: 0 }
  const layouts = new Set()
  const styles = new Set()
  const failing = []
  const decorationOverlap = []
  const duplicates = []

  templates.forEach((template) => {
    counts[template.photoCount] += 1
    layouts.add(template.layout)
    styles.add(template.visualStyle)

    const smallest = template.photoSlots.reduce((current, slot) => {
      const area = slot.width * slot.height
      if (!current || area < current.area) {
        return { area, width: slot.width, height: slot.height, slot }
      }
      return current
    }, null)

    const qualityViolations = template.photoSlots.filter((slot) => {
      const minimum = QUALITY_MINIMUMS[template.photoCount] ?? QUALITY_MINIMUMS[6]
      return slot.width < minimum.width || slot.height < minimum.height || slot.width * slot.height < minimum.area
    })

    if (qualityViolations.length) {
      failing.push({ name: template.name, photoCount: template.photoCount, layout: template.layout, issue: 'slot too small', slots: qualityViolations.length })
    }

    const decorationBounds = template.decorations.map((decoration) => ({
      x: decoration.x - 0.035,
      y: decoration.y - 0.035,
      width: 0.07,
      height: 0.07,
    }))

    template.photoSlots.forEach((slotItem, slotIndex) => {
      const slotBounds = { x: slotItem.x, y: slotItem.y, width: slotItem.width, height: slotItem.height }
      decorationBounds.forEach((bound, decorationIndex) => {
        const overlaps = !(bound.x + bound.width < slotBounds.x || bound.y + bound.height < slotBounds.y || bound.x > slotBounds.x + slotBounds.width || bound.y > slotBounds.y + slotBounds.height)
        if (overlaps && slotIndex === 0) {
          decorationOverlap.push({ name: template.name, decorationIndex, layout: template.layout, photoCount: template.photoCount })
        }
      })
    })

    const names = templates.map((item) => item.name)
    if (names.filter((name) => name === template.name).length > 1) {
      duplicates.push(template.name)
    }

    template.qualitySummary = {
      smallestPhotoSlot: smallest ? {
        width: smallest.width,
        height: smallest.height,
        area: smallest.area,
      } : null,
      failedMinimums: qualityViolations.length,
      hasDecorationOverlap: Boolean(decorationOverlap.find((item) => item.name === template.name)),
    }
  })

  return {
    totalTemplates: templates.length,
    photoDistribution: counts,
    verticalCount: templates.filter((template) => template.orientation === 'vertical').length,
    horizontalCount: templates.filter((template) => template.orientation === 'horizontal').length,
    uniqueLayoutCount: layouts.size,
    uniqueVisualStyleCount: styles.size,
    smallestPhotoSlotByTemplate: templates.map((template) => ({
      name: template.name,
      photoCount: template.photoCount,
      layout: template.layout,
      smallest: template.photoSlots.reduce((current, slot) => {
        const area = slot.width * slot.height
        if (!current || area < current.area) {
          return { area, width: slot.width, height: slot.height }
        }
        return current
      }, null),
    })),
    failingMinimumPhotoArea: failing,
    overlappingDecorationBounds: decorationOverlap,
    duplicateOrSuspiciousNames: [...new Set(duplicates)],
  }
}

export const templateQualityReport = buildTemplateQualityReport(themeDefinitions)
