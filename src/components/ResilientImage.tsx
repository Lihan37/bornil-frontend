import { useEffect, useMemo, useState, type ImgHTMLAttributes } from 'react';
import { fallbackImage } from '../utils/imageFallback';

type ResilientImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> & {
  sources: Array<string | undefined>;
};

export default function ResilientImage({ sources, ...props }: ResilientImageProps) {
  const candidates = useMemo(() => [...new Set(sources.filter((source): source is string => Boolean(source))), fallbackImage], [sources]);
  const signature = candidates.join('|');
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => setSourceIndex(0), [signature]);

  return (
    <img
      {...props}
      src={candidates[sourceIndex] ?? fallbackImage}
      onError={() => setSourceIndex((current) => Math.min(current + 1, candidates.length - 1))}
    />
  );
}
