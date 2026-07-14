// Cloudflare Workers 兼容版本的内容加载器
//
// 历史实现用 fs.readFileSync 读 MDX 源文件提取 headings/动态列举目录,
// Workers 运行时没有 fs,所以这些操作都被搬到 prebuild 脚本
// (scripts/extract-content.mjs) 在构建期一次性完成,结果落到
// src/generated/content-index.json 随 bundle 静态打入。
//
// MDX 主体仍走 webpack `require.context` 静态收集所有 .mdx 模块,
// 运行时通过模块 key (e.g. "en/guide/foo") 直接引用,无任何运行时 IO。

import type { ComponentType } from "react";
import { CONTENT_TYPES as CONFIG_CONTENT_TYPES } from "@/config/navigation";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import contentIndexData from "@/generated/content-index.json";

// === 类型 ===

export const CONTENT_TYPES = CONFIG_CONTENT_TYPES;

export interface ContentMetadata {
	title: string;
	description: string;
	category: string;
	date: string;
	lastModified?: string;
	image?: string;
	badge?: string;
	summary?: string;
}

export interface Heading {
	id: string;
	text: string;
	level: number;
}

export interface ContentItem {
	slug: string;
	segments: string[];
	contentType: string;
	locale: Locale;
	metadata: ContentMetadata;
}

export interface ContentData {
	slug: string;
	segments: string[];
	contentType: string;
	locale: Locale;
	metadata: ContentMetadata;
	MDXContent: ComponentType;
	headings: Heading[];
}

export interface NavGroup {
	title: string;
	count: number;
	slug: string;
	links: Array<{ label: string; href: string; badge?: string }>;
}

// === 预构建索引形状 ===

interface IndexEntry {
	slug: string;
	segments: string[];
	contentType: string;
	locale: string;
	metadata: ContentMetadata;
	headings: Heading[];
	realPath: string;
}

interface ContentIndex {
	entries: IndexEntry[];
	paths: Array<{ contentType: string; slug: string[] }>;
	navigation: Record<string, NavGroup[]>;
}

const contentIndex = contentIndexData as ContentIndex;

// === MDX 静态加载 (webpack require.context) ===

interface MdxModule {
	default: ComponentType;
	metadata: ContentMetadata;
}

const mdxContext = require.context(
	"../../content",
	true,
	/\.mdx$/,
);

const mdxModulesByKey: Record<string, MdxModule> = {};
for (const key of mdxContext.keys()) {
	// key 形如 "./en/guide/foo.mdx" -> 归一化为 "en/guide/foo"
	const normalized = key.replace(/^\.\//, "").replace(/\.mdx$/, "");
	mdxModulesByKey[normalized] = mdxContext(key) as MdxModule;
}

function getMdx(locale: string, contentType: string, realPath: string): MdxModule | undefined {
	return mdxModulesByKey[`${locale}/${contentType}/${realPath}`];
}

// === 索引查询 ===

function findEntry(
	locale: Locale,
	contentType: string,
	slugSegments: string[],
): IndexEntry | undefined {
	const slug = slugSegments.join("/");
	return contentIndex.entries.find(
		(e) => e.locale === locale && e.contentType === contentType && e.slug === slug,
	);
}

// === 公共 API ===

export async function getAllContent(
	contentType: string,
	language: Locale,
): Promise<ContentItem[]> {
	return contentIndex.entries
		.filter((e) => e.locale === language && e.contentType === contentType)
		.map((e) => ({
			slug: e.slug,
			segments: e.segments,
			contentType: e.contentType,
			locale: e.locale as Locale,
			metadata: e.metadata,
		}))
		.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
}

export async function getContent(
	contentType: string,
	slugSegments: string[],
	language: Locale,
): Promise<ContentData | null> {
	const currentSlug = slugSegments.join("/");

	const entry = findEntry(language, contentType, slugSegments);
	if (entry) {
		const mdx = getMdx(entry.locale, entry.contentType, entry.realPath);
		if (mdx) {
			return {
				slug: entry.slug,
				segments: entry.segments,
				contentType: entry.contentType,
				locale: entry.locale as Locale,
				metadata: entry.metadata,
				MDXContent: mdx.default,
				headings: entry.headings,
			};
		}
	}

	// Fallback 到 default locale
	if (language !== routing.defaultLocale) {
		const fallback = findEntry(routing.defaultLocale, contentType, slugSegments);
		if (fallback) {
			const mdx = getMdx(fallback.locale, fallback.contentType, fallback.realPath);
			if (mdx) {
				return {
					slug: fallback.slug,
					segments: fallback.segments,
					contentType: fallback.contentType,
					locale: fallback.locale as Locale,
					metadata: fallback.metadata,
					MDXContent: mdx.default,
					headings: fallback.headings,
				};
			}
		}
	}

	return null;
}

export function getDynamicNavigation(language: Locale = "en"): NavGroup[] {
	return (
		contentIndex.navigation[language] ||
		contentIndex.navigation[routing.defaultLocale] ||
		[]
	);
}

export async function getAllContentPaths(language: Locale) {
	// generateStaticParams 只用 en 即可;其它 locale 由 middleware 重写,SSG 复用同一组页面
	if (language === routing.defaultLocale) {
		return contentIndex.paths;
	}
	return [];
}
