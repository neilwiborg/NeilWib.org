export type TextAlignment = "center" | "left" | "right";

export type BackgroundSource =
	| { kind: "file"; file: File }
	| { kind: "url"; url: string };
