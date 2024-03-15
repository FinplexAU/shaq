export const selectFirst = <T extends any[]>(values: T): T[number] => {
	if (values.length !== 1)
		throw new Error("Found non unique or inexistent value");
	return values[0]!;
};

export const throwIfNone = <T>(values: T[]): [T, ...T[]] => {
	if (values.length === 0) {
		throw new Error("No value found");
	}
	return values as unknown as [T, ...T[]];
};
