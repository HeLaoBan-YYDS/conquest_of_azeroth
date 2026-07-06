import { StickyAd } from "@/components/ads/sticky-ad";

type StickyTopAdProps = {
  adKey?: string;
  eager?: boolean;
};

export function StickyTopAd({ adKey, eager = true }: StickyTopAdProps) {
  return <StickyAd placement="top" type="banner-320x50" adKey={adKey} eager={eager} />;
}
