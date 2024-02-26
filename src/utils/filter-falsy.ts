export const filterFalsy = <T>(x: (T | undefined | null)[]) => {
  return x.filter((y) => y) as T[];
};
