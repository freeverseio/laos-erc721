export function Enum(...options: any[]) {
    return options.reduce((acc, key, i) => {
        acc[key] = BigInt(i);
        return acc;
    }, {});
}

module.exports = {
  Enum,
};
