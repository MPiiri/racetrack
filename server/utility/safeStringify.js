// Utility function to safely stringify arguments
const safeStringify = (obj) => {
  try {
    return JSON.stringify(
      obj,
      (key, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    );
  } catch (err) {
    return "[Unstringifiable Object]";
  }
};

module.exports = safeStringify;
