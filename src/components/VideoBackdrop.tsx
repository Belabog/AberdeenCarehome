import { useEffect, useRef, useState } from 'react';

interface VideoBackdropProps {
  videoUrl?: string;
  posterUrl?: string;
  fallbackImageUrl?: string;
  overlayOpacity?: number;
  className?: string;
}

export default function VideoBackdrop({
  videoUrl,
  posterUrl,
  fallbackImageUrl,
  overlayOpacity = 0.1,
  className = '',
}: VideoBackdropProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  const handleLoadedData = () => {
    setIsLoaded(true);
    if (isInView && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleError = () => {
    setHasError(true);
  };

  if (!videoUrl || hasError) {
    return (
      <div className={`absolute inset-0 bg-[#808080] ${className}`} />
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className={`absolute inset-0 bg-[#808080] ${className}`} />
      )}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        autoPlay
        muted
        loop
        playsInline
        poster={posterUrl}
        onLoadedData={handleLoadedData}
        onError={handleError}
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
      </video>
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
    </>
  );
}
