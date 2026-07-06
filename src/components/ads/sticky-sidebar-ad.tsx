import { StickyAd } from "@/components/ads/sticky-ad";

type StickySidebarAdProps = {
  adKey?: string;
  placement?: "left-sidebar" | "right-sidebar";
  eager?: boolean;
};

export function StickySidebarAd({ adKey, placement = "left-sidebar", eager = true }: StickySidebarAdProps) {
  return (
    <StickyAd
      placement={placement}
      type={placement === "right-sidebar" ? "banner-160x300" : "banner-160x600"}
      adKey={adKey}
      eager={eager}
    />
  );
}
