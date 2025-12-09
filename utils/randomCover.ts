/**
 * Generates a random cover image URL or placeholder
 * Useful for interview session thumbnails or UI placeholders
 */

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800',
];

const GRADIENT_COVERS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
];

/**
 * Get a random cover image URL
 */
export function getRandomCoverImage(): string {
  const randomIndex = Math.floor(Math.random() * COVER_IMAGES.length);
  return COVER_IMAGES[randomIndex];
}

/**
 * Get a random gradient cover (CSS gradient string)
 */
export function getRandomGradientCover(): string {
  const randomIndex = Math.floor(Math.random() * GRADIENT_COVERS.length);
  return GRADIENT_COVERS[randomIndex];
}

/**
 * Get a deterministic cover based on a seed (e.g., interview ID)
 * Useful for consistent covers per interview
 */
export function getCoverBySeed(seed: string, type: 'image' | 'gradient' = 'image'): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % (type === 'image' ? COVER_IMAGES.length : GRADIENT_COVERS.length);
  
  return type === 'image' 
    ? COVER_IMAGES[index]
    : GRADIENT_COVERS[index];
}

/**
 * Generate a placeholder cover with text
 */
export function getPlaceholderCover(text: string, width: number = 800, height: number = 400): string {
  // Using a placeholder service (you can replace with your own)
  const encodedText = encodeURIComponent(text.substring(0, 20));
  return `https://via.placeholder.com/${width}x${height}/667eea/ffffff?text=${encodedText}`;
}

