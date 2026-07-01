"use client";
import React from "react";
import { Skeleton } from "@/ui/skeleton";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithSkeleton({ src, alt, className }: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <Skeleton className="absolute inset-0 w-full h-full bg-slate-200 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688';
          setLoaded(true);
        }}
      />
    </div>
  );
}
