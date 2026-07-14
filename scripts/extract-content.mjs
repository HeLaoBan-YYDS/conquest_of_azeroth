// Cloudflare Workers 构建期预构建脚本
// 扫描 content/<locale>/<contentType>/**/*.mdx,提取 metadata + headings + 导航信息
// 输出到 src/generated/content-index.json,运行时由 src/lib/content.ts 通过 import 加载
//
// 之所以走预构建:Workers 运行时没有 fs/path,无法读项目文件;
// 通过把索引数据序列化进 JSON 配合 require.context 静态加载 MDX,避开任何运行时 IO。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const CONTENT_ROOT = path.join(ROOT, "content");
const OUTPUT_PATH = path.join(ROOT, "src", "generated", "content-index.json");

const LOCALES = ["en", "es", "fr", "pt-br"];
const CONTENT_TYPES = [
	"guide",
	"release",
	"access",
	"classes",
	"builds",
	"rankings",
	"addons",
	"community",
];

// === Helpers (与 src/lib/content.ts 保持完全一致) ===

function fileNameToSlug(fileName) {
	return fileName
		.replace(/\.mdx$/, "")
		.replace(/[^a-zA-Z0-9\-_]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function toHeadingId(value) {
	const id = value
		.normalize("NFKC")
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s_-]/gu, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
	return id || `section-${hashText(value) || "heading"}`;
}

function hashText(value) {
	let hash = 0;
	for (const char of value) {
		hash = Math.imul(hash, 31) + (char.codePointAt(0) ?? 0);
		hash >>>= 0;
	}
	return hash.toString(36);
}

function extractHeadings(mdxSource) {
	const headings = [];
	const lines = mdxSource.split("\n");
	for (const line of lines) {
		const match = line.match(/^(#{2,3})\s+(.+)/);
		if (match) {
			const level = match[1].length;
			const text = match[2].replace(/\{[^}]*\}/g, "").trim();
			headings.push({ id: toHeadingId(text), text, level });
		}
	}
	return headings;
}

/**
 * 用最朴素的"匹配 key: 'value' / key: "value""方式从 export const metadata = { ... } 块里抽字段。
 * 现有所有 MDX 的 metadata 字段都是字符串字面量,这种提取方式足够。
 */
function extractMetadata(mdxSource) {
	const blockMatch = mdxSource.match(
		/export\s+const\s+metadata\s*=\s*\{([\s\S]*?)\n\}/,
	);
	const result = {
		title: "",
		description: "",
		category: "",
		date: "",
	};
	if (!blockMatch) return result;
	const objStr = blockMatch[1];
	const re = /(\w+)\s*:\s*(["'])([^"']*)\2/g;
	let m;
	while ((m = re.exec(objStr)) !== null) {
		result[m[1]] = m[3];
	}
	return result;
}

function getSlugsFromDirectory(dir, basePath = []) {
	if (!fs.existsSync(dir)) return [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const paths = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			paths.push(...getSlugsFromDirectory(fullPath, [...basePath, entry.name]));
		} else if (entry.name.endsWith(".mdx")) {
			const fileName = entry.name.replace(".mdx", "");
			paths.push([...basePath, fileName]);
		}
	}
	return paths;
}

function findRealFile(dir, slugSegments) {
	if (!fs.existsSync(dir)) return null;
	const target = slugSegments.join("/");
	function walk(d, basePath) {
		for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
			const fullPath = path.join(d, entry.name);
			if (entry.isDirectory()) {
				const result = walk(fullPath, [...basePath, entry.name]);
				if (result) return result;
			} else if (entry.name.endsWith(".mdx")) {
				const fileName = entry.name.replace(".mdx", "");
				const entrySlug = [...basePath, fileNameToSlug(fileName)].join("/");
				if (entrySlug === target) {
					return [...basePath, fileName].join("/");
				}
			}
		}
		return null;
	}
	return walk(dir, []);
}

// === Navigation titles (与 src/lib/content.ts 一致) ===

const GROUP_TITLES = {
	guide: "Guide",
	release: "Release",
	access: "Access",
	classes: "Classes",
	builds: "Builds",
	rankings: "Rankings",
	addons: "Addons",
	community: "Community",
};
const GROUP_TITLES_BY_LOCALE = {
	es: {
		guide: "Guia",
		release: "Lanzamiento",
		access: "Acceso",
		classes: "Clases",
		builds: "Builds",
		rankings: "Rankings",
		addons: "Addons",
		community: "Comunidad",
	},
	fr: {
		guide: "Guide",
		release: "Sortie",
		access: "Acces",
		classes: "Classes",
		builds: "Builds",
		rankings: "Classements",
		addons: "Addons",
		community: "Communaute",
	},
	"pt-br": {
		guide: "Guia",
		release: "Lancamento",
		access: "Acesso",
		classes: "Classes",
		builds: "Builds",
		rankings: "Rankings",
		addons: "Addons",
		community: "Comunidade",
	},
};
const OVERVIEW_LABEL_BY_LOCALE = {
	es: "Resumen",
	fr: "Apercu",
	"pt-br": "Visao geral",
};
const GROUP_ORDER = [
	"guide",
	"release",
	"access",
	"classes",
	"builds",
	"rankings",
	"addons",
	"community",
];

// === Main ===

function main() {
	const entries = [];
	const paths = [];
	const navigation = {};

	for (const locale of LOCALES) {
		const localeDir = path.join(CONTENT_ROOT, locale);
		if (!fs.existsSync(localeDir)) continue;

		const navGroups = [];

		for (const contentType of CONTENT_TYPES) {
			const ctDir = path.join(localeDir, contentType);
			if (!fs.existsSync(ctDir)) continue;

			const segmentPaths = getSlugsFromDirectory(ctDir);

			for (const segments of segmentPaths) {
				const slug = segments.join("/");
				const realPath = findRealFile(ctDir, segments);
				if (!realPath) continue;

				const filePath = path.join(ctDir, `${realPath}.mdx`);
				const source = fs.readFileSync(filePath, "utf-8");
				const metadata = extractMetadata(source);
				const headings = extractHeadings(source);

				entries.push({
					slug,
					segments,
					contentType,
					locale,
					metadata,
					headings,
					// 注意:realPath 不带 locale 前缀,运行时拼成 "<locale>/<contentType>/<realPath>"
					realPath,
				});
			}

			for (const segments of segmentPaths) {
				paths.push({ contentType, slug: segments });
			}
		}

		// navigation:按 contentType 分组,每组包含 Overview + 全部文章
		for (const contentType of CONTENT_TYPES) {
			const ctDir = path.join(localeDir, contentType);
			if (!fs.existsSync(ctDir)) continue;
			const segmentPaths = getSlugsFromDirectory(ctDir);
			if (segmentPaths.length === 0) continue;

			const links = [];
			const overviewLabel = OVERVIEW_LABEL_BY_LOCALE[locale] || "Overview";
			links.push({ label: overviewLabel, href: `/${contentType}` });

			for (const segments of segmentPaths) {
				const slug = segments.join("/");
				const realPath = findRealFile(ctDir, segments);
				if (!realPath) continue;
				const filePath = path.join(ctDir, `${realPath}.mdx`);
				const source = fs.readFileSync(filePath, "utf-8");
				const metadata = extractMetadata(source);
				links.push({
					label: metadata.title || slug,
					href: `/${contentType}/${slug}`,
					badge: metadata.badge || undefined,
				});
			}

			const localTitles = GROUP_TITLES_BY_LOCALE[locale] || {};
			const title =
				localTitles[contentType] ||
				GROUP_TITLES[contentType] ||
				contentType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

			navGroups.push({
				title,
				count: links.length - 1,
				slug: contentType,
				links,
			});
		}

		navGroups.sort((a, b) => {
			const ai = GROUP_ORDER.indexOf(a.slug);
			const bi = GROUP_ORDER.indexOf(b.slug);
			return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
		});

		navigation[locale] = navGroups;
	}

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
	fs.writeFileSync(
		OUTPUT_PATH,
		JSON.stringify({ entries, paths, navigation }, null, 2),
		"utf-8",
	);
	console.log(
		`[extract-content] wrote ${entries.length} entries to ${path.relative(ROOT, OUTPUT_PATH)}`,
	);
}

main();
