import type { ReactNode } from "react";
import styles from "./Tooltip.module.css";

export type TooltipProps = {
	message: string;
	active: boolean;
	children: ReactNode;
};

export const Tooltip = ({ message, active, children }: TooltipProps) => {
	const hasTooltip = active && message !== "";

	if (!hasTooltip) {
		return <>{children}</>;
	}

	return (
		<div className={styles.root} data-tooltip={message} data-placement="top">
			{children}
		</div>
	);
};
