"use client";

import { AdBanner, type AdBannerType } from "@/components/ads/adsterra-banner";

type StickyTopAdProps = {
    type: AdBannerType;
    adKey?: string;
    eager?: boolean;
    dismissible?: boolean;
};

export function StickyTopAd({ type, adKey, eager = true, dismissible = false }: StickyTopAdProps) {
    const key = adKey?.trim();

    if (!key) {
        return null;
    }

    return (
        <div className="sticky top-20 z-20 py-2">
            <div className="mx-auto max-w-4xl">
                <div className="relative mx-auto w-fit max-w-full overflow-hidden">
                    <AdBanner type={type} adKey={key} eager={eager} dismissible={dismissible} className="w-auto" />
                </div>
            </div>
        </div>
    );
}
