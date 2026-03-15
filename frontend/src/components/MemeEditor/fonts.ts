import type { TextFont } from "./types";

export const TEXT_FONTS: TextFont[] = [
	{
		label: "Impact",
		fontFamily: 'Impact, "Anton", sans-serif',
	},
	{
		label: "Arial",
		fontFamily: 'Arial, "Arimo", sans-serif',
	},
	{
		label: "Arial Black",
		fontFamily: '"Arial Black", "Archivo Black", sans-serif',
	},
	{
		label: "Comic Sans MS",
		fontFamily: '"Comic Sans MS", "Comic Neue", cursive',
	},
	{
		label: "Montserrat",
		fontFamily: '"Montserrat", sans-serif',
	},
	{
		label: "Bebas Neue",
		fontFamily: '"Bebas Neue", sans-serif',
	},
	{
		label: "Oswald",
		fontFamily: '"Oswald", sans-serif',
	},
	{
		label: "Luckiest Guy",
		fontFamily: '"Luckiest Guy", cursive',
	},
	{
		label: "Bangers",
		fontFamily: '"Bangers", cursive',
	},
];

export const DEFAULT_TEXT_FONT = TEXT_FONTS[0];

type TextFontVariant = {
	style: "normal" | "italic";
	weight: "400" | "700";
};

const TEXT_FONT_VARIANTS: TextFontVariant[] = [
	{ style: "normal", weight: "400" },
	{ style: "normal", weight: "700" },
	{ style: "italic", weight: "400" },
	{ style: "italic", weight: "700" },
];

const GENERIC_FONT_FAMILIES = new Set([
	"cursive",
	"fantasy",
	"monospace",
	"sans-serif",
	"serif",
	"system-ui",
]);

const stripQuotes = (fontFamily: string) => {
	return fontFamily.replace(/^['"]|['"]$/g, "");
};

export const getFontFamilies = (fontStack: string) => {
	return fontStack
		.split(",")
		.map((family) => stripQuotes(family.trim()))
		.filter(
			(family) => family.length > 0 && !GENERIC_FONT_FAMILIES.has(family),
		);
};

const loadFontFamily = (fontFamily: string, variant: TextFontVariant) => {
	return document.fonts.load(
		`${variant.style} ${variant.weight} 16px "${fontFamily}"`,
	);
};

export const preloadFontStack = async (fontStack: string) => {
	const families = getFontFamilies(fontStack);
	await Promise.all(
		families.flatMap((family) =>
			TEXT_FONT_VARIANTS.map((variant) => loadFontFamily(family, variant)),
		),
	);
};

export const preloadMemeFonts = async () => {
	await Promise.all(
		TEXT_FONTS.map(({ fontFamily }) => preloadFontStack(fontFamily)),
	);
};
