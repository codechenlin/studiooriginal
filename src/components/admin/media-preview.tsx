
"use client";

import Image from 'next/image';

interface MediaPreviewProps {
    src: string | null | undefined;
    alt?: string;
    className?: string;
}

export function MediaPreview({ src, alt = "Media background", className }: MediaPreviewProps) {
    if (!src) {
        // Do not render anything if src is empty, null, or undefined
        return null;
    }

    const isVideo = src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.avi');

    if (isVideo) {
        return (
            <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover ${className}`}
            >
                Tu navegador no soporta el tag de video.
            </video>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className={`object-cover ${className}`}
            priority
        />
    );
}
