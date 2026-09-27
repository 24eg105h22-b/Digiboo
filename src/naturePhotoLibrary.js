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
}

export function getNaturePhotoPath(theme) {
  return naturePhotoPaths[theme.backgroundStyle] ?? ''
}

export function isNaturePhotoTheme(theme) {
  return Boolean(naturePhotoPaths[theme.backgroundStyle])
}