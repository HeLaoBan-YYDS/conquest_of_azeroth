import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withMDX = createMDX({
	options: {
		remarkPlugins: [remarkGfm],
		rehypePlugins: [],
	},
});

const nextConfig: NextConfig = {
	pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
	allowedDevOrigins: ["*.preview.same-app.com"],
	// Cloudflare Workers 环境下没有 sharp，必须禁用图片优化
	images: {
		unoptimized: true,
		remotePatterns: [
			{ protocol: "https", hostname: "source.unsplash.com", pathname: "/**" },
			{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
			{ protocol: "https", hostname: "ext.same-assets.com", pathname: "/**" },
			{ protocol: "https", hostname: "ugc.same-assets.com", pathname: "/**" },
			{ protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
			{ protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
		],
	},
};

export default withNextIntl(withMDX(nextConfig));
