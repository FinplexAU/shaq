export const safeProm = async <T>(
	dangerousPromiseOrFunction: (() => Promise<T>) | Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: any }> => {
	const dangerousPromise =
		typeof dangerousPromiseOrFunction === "function"
			? dangerousPromiseOrFunction()
			: dangerousPromiseOrFunction;
	return dangerousPromise
		.then((data) => ({ success: true, data }) as const)
		.catch((error) => ({ success: false, error }) as const);
};
