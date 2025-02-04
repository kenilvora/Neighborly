import nlp from "compromise";

export default function extractMainName(text: string): string {
  let doc = nlp(text);

  // Extract nouns (product category) and adjectives (descriptors)
  let nouns = doc.nouns().out("array"); // Gets product type
  let adjectives = doc.adjectives().out("array"); // Gets descriptive words
  let brand = doc.match("#ProperNoun").out("array"); // Extracts brand names (Proper Nouns)

  // Determine the main product category
  let productCategory = nouns.length > 0 ? nouns[nouns.length - 1] : "";

  // Format the result
  let result = [...brand, ...adjectives, productCategory].join(" ").trim();

  return result || text; // Fallback if no extraction happens
}
