function toKebabCase(str) {
  return str
    .normalize("NFD") // Normalize accents
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .trim() // Trim whitespace
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .toLowerCase(); // Convert to lowercase
}

module.exports = { toKebabCase };
