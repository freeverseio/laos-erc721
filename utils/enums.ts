export function Enum<T extends Record<string, number>>(
  ...options: (keyof T)[]
): T {
  return options.reduce((acc, key, i) => {
    acc[key] = BigInt(i) as unknown as T[keyof T];
    return acc;
  }, {} as T);
}

export const RevertType = Enum(
  "None",
  "RevertWithoutMessage",
  "RevertWithMessage",
  "RevertWithCustomError",
  "Panic",
);

module.exports = {
  Enum,
  RevertType,
};
