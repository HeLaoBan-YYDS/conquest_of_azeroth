"use client";

import { Play } from "lucide-react";
import { useState } from "react";

export function TrailerCard() {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border shadow-lg transition-all duration-200">
      <div className="relative aspect-video w-full">
        <img src="/images/hero-trailer-thumbnail.jpg" alt="Conquest of Azeroth official trailer thumbnail" className="size-full object-cover transition-all duration-200 group-hover:brightness-80" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 backdrop-blur-md transition-transform duration-200 group-hover:scale-105 sm:size-24">
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-primary/30 to-primary shadow-md transition-transform duration-200 group-hover:scale-110 sm:size-16">
            <Play className="size-6 fill-white text-white sm:size-7" style={{ filter: "drop-shadow(rgba(0,0,0,0.07) 0 4px 3px) drop-shadow(rgba(0,0,0,0.06) 0 2px 2px)" }} />
          </div>
        </div>
      </div>
      <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] text-white">YouTube</span>
    </div>
  );
}

export function TrailerDialog({ videoId, onClose, closeLabel = "Close" }: { videoId: string; onClose: () => void; closeLabel?: string }) {
  return (
    <div id="trailer-dialog" role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-black/80 p-0 backdrop-blur-sm" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative mx-4 w-full max-w-4xl">
        <iframe id="trailer-iframe" title="Conquest of Azeroth video player" className="aspect-video w-full rounded-xl" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        <button type="button" className="absolute right-3 top-3 z-10 rounded-md bg-black/70 px-2.5 py-1 text-sm font-medium text-white/90 backdrop-blur-sm hover:text-white" onClick={onClose}>{closeLabel}</button>
      </div>
    </div>
  );
}

export function TrailerButton({ videoId, closeLabel }: { videoId: string; closeLabel?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="w-full" aria-haspopup="dialog" aria-controls="trailer-dialog" aria-expanded={isOpen} onClick={() => setIsOpen(true)}>
        <TrailerCard />
      </button>
      {isOpen && <TrailerDialog videoId={videoId} closeLabel={closeLabel} onClose={() => setIsOpen(false)} />}
    </>
  );
}
