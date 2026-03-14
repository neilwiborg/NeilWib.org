import type { ReactNode } from "react";
import styles from "./Tooltip.module.css";

export type TooltipProps = {
	message: string;
	active: boolean;
	children: ReactNode;
};

export const Tooltip = ({ message, active, children }: TooltipProps) => {
	const hasTooltip = active && message !== "";
	return (
		<div
			className={styles.root}
			data-tooltip={hasTooltip ? message : undefined}
			data-placement={"top"}
		>
			{children}
		</div>
	);
};
