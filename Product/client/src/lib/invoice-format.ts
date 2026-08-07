/**
 * Shared currency/number formatting for invoices — used by both the live
 * on-screen preview and the PDF generator so the two always agree.
 */

// Currencies whose customary digit grouping is the Indian lakh/crore system
// (1,00,000 instead of 100,000) rather than the international thousands system.
const LAKH_GROUPED_CURRENCY_CODES = new Set(["INR"]);

/**
 * Groups the integer part of a number using the Indian numbering system:
 * the last 3 digits form one group, then every group after that is 2 digits
 * (10,00,000 = ten lakh; 1,00,00,000 = one crore). Assumes a non-negative,
 * already-rounded integer string (no sign, no decimal point).
 */
function groupIndian(integerDigits: string): string {
  if (integerDigits.length <= 3) return integerDigits;
  const last3 = integerDigits.slice(-3);
  let rest = integerDigits.slice(0, -3);
  const groups: string[] = [];
  while (rest.length > 2) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest.length > 0) groups.unshift(rest);
  return `${groups.join(",")},${last3}`;
}

function groupInternational(integerDigits: string): string {
  return integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Formats a currency amount, choosing Indian lakh/crore grouping for INR and
 * international thousands grouping for everything else — matches how each
 * currency is conventionally written, rather than a single fixed style.
 */
export function formatCurrencyAmount(
  amount: number,
  symbol: string,
  currencyCode?: string
): string {
  const safe = Number.isFinite(amount) ? Math.abs(amount) : 0;
  const sign = amount < 0 ? "-" : "";
  const [intPart, decPart] = safe.toFixed(2).split(".");
  const grouped =
    currencyCode && LAKH_GROUPED_CURRENCY_CODES.has(currencyCode)
      ? groupIndian(intPart)
      : groupInternational(intPart);
  return `${sign}${symbol}${grouped}.${decPart}`;
}

// ---------------------------------------------------------------------------
// Number to words (Indian numbering scale: lakh/crore) — used for the
// "Invoice Total (in words)" line shown on the reference invoice.
// ---------------------------------------------------------------------------

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];

function twoDigitsToWords(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens];
}

function threeDigitsToWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds) parts.push(`${ONES[hundreds]} hundred`);
  if (rest) parts.push(twoDigitsToWords(rest));
  return parts.join(" ");
}

/**
 * Converts a non-negative integer to English words using the Indian
 * numbering scale (thousand, lakh, crore) — matches the grouping used for
 * INR amounts elsewhere in the invoice.
 */
function integerToWordsIndian(n: number): string {
  if (n === 0) return "zero";

  const crore = Math.floor(n / 1_00_00_000);
  const lakh = Math.floor((n % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((n % 1_00_000) / 1_000);
  const rest = n % 1_000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigitsToWords(crore)} crore`);
  if (lakh) parts.push(`${threeDigitsToWords(lakh)} lakh`);
  if (thousand) parts.push(`${threeDigitsToWords(thousand)} thousand`);
  if (rest) parts.push(threeDigitsToWords(rest));

  return parts.join(", ");
}

/**
 * Converts a non-negative integer to English words using the international
 * numbering scale (thousand, million, billion).
 */
function integerToWordsInternational(n: number): string {
  if (n === 0) return "zero";

  const billion = Math.floor(n / 1_000_000_000);
  const million = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousand = Math.floor((n % 1_000_000) / 1_000);
  const rest = n % 1_000;

  const parts: string[] = [];
  if (billion) parts.push(`${threeDigitsToWords(billion)} billion`);
  if (million) parts.push(`${threeDigitsToWords(million)} million`);
  if (thousand) parts.push(`${threeDigitsToWords(thousand)} thousand`);
  if (rest) parts.push(threeDigitsToWords(rest));

  return parts.join(", ");
}

/**
 * Spells out a currency amount in words for the "Invoice Total (in words)"
 * line, e.g. 109974 -> "one hundred nine thousand, nine hundred seventy-four"
 * (INR uses the Indian lakh/crore scale; other currencies use the
 * international scale). Cents are omitted, matching the reference invoice.
 */
export function amountToWords(amount: number, currencyCode?: string): string {
  const whole = Math.floor(Math.abs(amount));
  const words =
    currencyCode && LAKH_GROUPED_CURRENCY_CODES.has(currencyCode)
      ? integerToWordsIndian(whole)
      : integerToWordsInternational(whole);
  return amount < 0 ? `negative ${words}` : words;
}
