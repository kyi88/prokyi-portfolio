import { useState, useRef, useEffect, memo } from 'react';

function ProgressiveImage({ src, alt, className = '', ...props }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = src;
    // If already cached
    if (img.complete) setLoaded(true);
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      style={{
        filter: loaded ? 'none' : 'blur(15px)',
        transition: 'filter 0.5s ease-out',
      }}
      {...props}
    />
  );
}

export default memo(ProgressiveImage);
