"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

function useAdDismissed() {
    const pathname = usePathname();
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setDismissed(false);
    }, [pathname]);

    const dismiss = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDismissed(true);
    };

    return { dismissed, dismiss };
}

type AdsterraBannerSlotConfig = {
    key: string;
    width: number;
    height: number;
    src: string;
};

export const ADSTERRA_BANNER_SLOTS = {
    "banner-160x300": {
        key: "",
        width: 160,
        height: 300,
        src: "/ads/banner-160x300.html",
    },
    "banner-160x600": {
        key: "",
        width: 160,
        height: 600,
        src: "/ads/banner-160x600.html",
    },
    "banner-300x250": {
        key: "",
        width: 300,
        height: 250,
        src: "/ads/banner-300x250.html",
    },
    "banner-320x50": {
        key: "",
        width: 320,
        height: 50,
        src: "/ads/banner-320x50.html",
    },
    "banner-468x60": {
        key: "",
        width: 468,
        height: 60,
        src: "/ads/banner-468x60.html",
    },
    "banner-728x90": {
        key: "",
        width: 728,
        height: 90,
        src: "/ads/banner-728x90.html",
    },
} satisfies Record<string, AdsterraBannerSlotConfig>;

const adBannerTypes = {
    "banner-320x50": ADSTERRA_BANNER_SLOTS["banner-320x50"],
    "banner-160x300": ADSTERRA_BANNER_SLOTS["banner-160x300"],
    "banner-160x600": ADSTERRA_BANNER_SLOTS["banner-160x600"],
} as const;

export type AdBannerType = keyof typeof adBannerTypes;
export type AdsterraBannerSlot = keyof typeof ADSTERRA_BANNER_SLOTS;

type AdBannerProps = {
    type: AdBannerType;
    adKey?: string;
    dismissible?: boolean;
    eager?: boolean;
    className?: string;
    title?: string;
};

export const adsterraBannerPlacements = {
    "160x300": ADSTERRA_BANNER_SLOTS["banner-160x300"],
    "160x600": ADSTERRA_BANNER_SLOTS["banner-160x600"],
    "300x250": ADSTERRA_BANNER_SLOTS["banner-300x250"],
    "320x50": ADSTERRA_BANNER_SLOTS["banner-320x50"],
    "468x60": ADSTERRA_BANNER_SLOTS["banner-468x60"],
    "728x90": ADSTERRA_BANNER_SLOTS["banner-728x90"],
} as const;

export type AdsterraBannerPlacement = keyof typeof adsterraBannerPlacements;

type AdsterraBannerProps = {
    placement: AdsterraBannerPlacement;
    dismissible?: boolean;
    className?: string;
    title?: string;
};

function getAdsterraBannerSrc(src: string, adKey: string) {
    return `${src}?key=${encodeURIComponent(adKey)}`;
}

export function AdBanner({
                             type,
                             adKey,
                             dismissible = false,
                             eager = false,
                             className,
                             title = "Advertisement",
                         }: AdBannerProps) {
    const key = adKey?.trim();
    const ad = adBannerTypes[type];
    const { dismissed, dismiss } = useAdDismissed();

    if (!key || dismissed || !ad) {
        return null;
    }

    const src = getAdsterraBannerSrc(ad.src, key);

    return (
        <div className={cn("flex w-full items-center justify-center", className)}>
            <div className="relative w-fit">
                <iframe
                    height={ad.height}
                    loading={eager ? "eager" : "lazy"}
                    referrerPolicy="strict-origin-when-cross-origin"
                    scrolling="no"
                    src={src}
                    style={{
                        background: "transparent",
                        border: "none",
                        display: "block",
                        height: ad.height,
                        overflow: "hidden",
                        width: ad.width,
                    }}
                    title={title}
                    width={ad.width}
                />
                {dismissible && (
                    <button
                        type="button"
                        aria-label="Close advertisement"
                        className="absolute right-1 top-1 z-50 grid size-5 cursor-pointer place-items-center rounded-sm bg-transparent text-foreground drop-shadow transition-colors hover:bg-background/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onClick={dismiss}
                        onPointerDown={dismiss}
                    >
                        <X className="size-3" aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    );
}

export function AdsterraBanner({
                                   placement,
                                   dismissible = false,
                                   className,
                                   title = "Advertisement",
                               }: AdsterraBannerProps) {
    const ad = adsterraBannerPlacements[placement];
    const { dismissed, dismiss } = useAdDismissed();

    if (!ad.key.trim() || dismissed) {
        return null;
    }

    return (
        <div className={cn("flex w-full items-center justify-center", className)}>
            <div className="relative w-fit">
                <iframe
                    height={ad.height}
                    referrerPolicy="strict-origin-when-cross-origin"
                    scrolling="no"
                    src={ad.src}
                    style={{
                        background: "transparent",
                        border: "none",
                        display: "block",
                        height: ad.height,
                        overflow: "hidden",
                        width: ad.width,
                    }}
                    title={title}
                    width={ad.width}
                />
                {dismissible && (
                    <button
                        type="button"
                        aria-label="Close advertisement"
                        className="absolute right-1 top-1 z-50 grid size-5 cursor-pointer place-items-center rounded-sm bg-transparent text-foreground drop-shadow transition-colors hover:bg-background/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onClick={dismiss}
                        onPointerDown={dismiss}
                    >
                        <X className="size-3" aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    );
}
