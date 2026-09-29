const naturePhotoPaths = {
  'banyan-canopy': '/nature/banyan-forest.jpg',
  'secret-garden-arch': '/nature/secret-garden-roses.jpg',
  'cherry-blossom-walk': '/nature/cherry-blossom-path.jpg',
  'forest-clearing': '/nature/forest-clearing.jpg',
  'wildflower-path': '/nature/wildflower-meadow.jpg',
  'monsoon-green': '/nature/monsoon-forest.jpg',
  'autumn-grove': '/nature/autumn-grove.jpg',
  'dry-leaves-bottom': '/nature/dry-leaf-grove.jpg',
  'tropical-canopy': '/nature/tropical-grove.jpg',
  'rose-tree-garden': '/nature/rose-garden.jpg',
  'golden-forest': '/nature/golden-forest.jpg',
  'lavender-woods': '/nature/lavender-garden.jpg',
  'daisy-meadow': '/nature/daisy-meadow.jpg',
  'lakeside-trees': '/nature/lakeside-grove.jpg',
  'enchanted-woodland': '/nature/enchanted-woodland.jpg',
  'print-ivory-botanical-editorial': '/themes/ivory-botanical-editorial.jpg',
  'print-burgundy-gold': '/themes/burgundy-gold.jpg',
  'print-analog-black-film': '/themes/analog-black-film.jpg',
  'print-silver-chrome-y2k': '/themes/silver-chrome-y2k.jpg',
  'print-warm-newspaper': '/themes/warm-newspaper.jpg',
  'print-black-white-studio': '/themes/black-white-studio.jpg',
  'print-vintage-garden-paper': '/themes/vintage-garden-paper.jpg',
  'print-seventies-film': '/themes/seventies-film-print.jpg',
  'print-deep-red-cinema': '/themes/deep-red-cinema.jpg',
  'print-soft-blue-botanical': '/themes/soft-blue-botanical.jpg',
  'print-old-photo-album': '/themes/old-photo-album.jpg',
  'print-minimal-cream-gallery': '/themes/minimal-cream-gallery.jpg',
}

export function getNaturePhotoPath(theme) {
  return naturePhotoPaths[theme.backgroundStyle] ?? ''
}

export function isNaturePhotoTheme(theme) {
  return Boolean(naturePhotoPaths[theme.backgroundStyle])
}