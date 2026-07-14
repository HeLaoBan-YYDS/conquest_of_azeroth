// 兼容 webpack require.context (用于 content.ts 静态加载所有 MDX)
declare module "*.mdx" {
	import type { ComponentType } from "react";
	const MDXContent: ComponentType;
	export const metadata: {
		title: string;
		description: string;
		category: string;
		date: string;
		lastModified?: string;
		image?: string;
		badge?: string;
		summary?: string;
	};
	export default MDXContent;
}

declare module "*.json" {
	const value: unknown;
	export default value;
}

// webpack 提供的 require.context 静态收集模块
declare const require: {
	context: (
		directory: string,
		useSubdirectories: boolean,
		regex: RegExp,
	) => {
		keys(): string[];
		(id: string): unknown;
	};
} & NodeJS.Require;
