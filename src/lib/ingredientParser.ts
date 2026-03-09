const UNITS = [
  'cup', 'cups', 'c',
  'tablespoon', 'tablespoons', 'tbsp', 'tbs', 'tb',
  'teaspoon', 'teaspoons', 'tsp', 'ts',
  'oz', 'ounce', 'ounces',
  'lb', 'lbs', 'pound', 'pounds',
  'g', 'gram', 'grams',
  'kg', 'kilogram', 'kilograms',
  'ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres',
  'l', 'liter', 'liters', 'litre', 'litres',
  'pint', 'pints', 'pt',
  'quart', 'quarts', 'qt',
  'gallon', 'gallons', 'gal',
  'stick', 'sticks',
  'slice', 'slices',
  'piece', 'pieces', 'pc', 'pcs',
  'bunch', 'bunches',
  'clove', 'cloves',
  'can', 'cans',
  'bag', 'bags',
  'package', 'packages', 'pkg',
  'head', 'heads',
  'sprig', 'sprigs',
  'pinch', 'pinches',
  'dash', 'dashes',
  'handful', 'handfuls',
  'small', 'medium', 'large',
];

const UNIT_PATTERN = UNITS.join('|');

const QUANTITY_REGEX = new RegExp(
  `^([\\d\\s\\/\\.\\-–½⅓⅔¼¾⅛⅜⅝⅞]+(?:\\s*(?:${UNIT_PATTERN})(?:\\.|\\b))?)\\s+(.+)$`,
  'i'
);

export function parseIngredientString(text: string): { amount: string; name: string } {
  const trimmed = text.trim();
  const match = trimmed.match(QUANTITY_REGEX);
  if (match) {
    return { amount: match[1].trim(), name: match[2].trim() };
  }
  return { amount: '', name: trimmed };
}

export function normalizeExtractedIngredient(ingredient: { amount: string; name: string }): { amount: string; name: string } {
  if (ingredient.amount.trim()) return ingredient;
  return parseIngredientString(ingredient.name);
}

/**
 * Given an array of words, suggest the index where the split between
 * amount and name should occur (i.e., words[0..index-1] = amount, words[index..] = name).
 */
export function suggestSplitIndex(words: string[]): number {
  const rejoined = words.join(' ');
  const parsed = parseIngredientString(rejoined);
  if (!parsed.amount) return 0;
  // Count how many words the amount covers
  const amountWords = parsed.amount.split(/\s+/).length;
  return Math.min(amountWords, words.length);
}
