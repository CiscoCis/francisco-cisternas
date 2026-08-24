import { asset } from '@/lib/asset';

interface PhotoProps {
  /** Base name in /public/images, e.g. "headshot" -> headshot.webp/.jpg */
  name: string;
  /** Optional smaller variant base name for narrow viewports. */
  small?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Responsive picture element. Images are pre-optimised (webp + jpg, two
 * widths), so no runtime optimiser is required and the site stays fully
 * static. Non-critical photographs are lazy-loaded.
 */
export default function Photo({
  name,
  small,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '100vw',
}: PhotoProps) {
  const sm = small ?? name;
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`${asset(`/images/${sm}.webp`)} 800w, ${asset(`/images/${name}.webp`)} 1600w`}
        sizes={sizes}
      />
      <source
        type="image/jpeg"
        srcSet={`${asset(`/images/${sm}.jpg`)} 800w, ${asset(`/images/${name}.jpg`)} 1600w`}
        sizes={sizes}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(`/images/${name}.jpg`)}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  );
}
