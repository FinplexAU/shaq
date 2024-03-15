export const safe = async <T>(
	prom: (() => Promise<T>) | Promise<T>
): Promise<({ success: true } & T) | { success: false; error: any }> => {
	const p = typeof prom === "function" ? prom() : prom;
	return p
		.then((data) => ({ success: true, ...data }) as const)
		.catch((error) => ({ success: false, error }) as const);
};
