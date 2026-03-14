import type { ReactNode } from "react";
import styles from "./Tooltip.module.css";

export type TooltipProps = {
	message: string;
	active: boolean;
	children: ReactNode;
	inline?: boolean;
	placement?: "top" | "left";
};

export const Tooltip = ({
	message,
	active,
	children,
	inline = false,
	placement = "top",
}: TooltipProps) => {
	const hasTooltip = active && message !== "";
	const className = inline ? `${styles.root} ${styles.inline}` : styles.root;
	return (
		<div
			className={className}
			data-tooltip={hasTooltip ? message : undefined}
			data-placement={placement}
		>
			{children}
		</div>
	);
};
