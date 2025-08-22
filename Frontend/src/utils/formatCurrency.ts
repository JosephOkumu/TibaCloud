/**
 * Utility functions for formatting currency values
 */

/**
 * Formats a number as Kenyan Shillings (KES)
 * @param amount - The amount to format
 * @param includeSymbol - Whether to include the KES symbol (default: true)
 * @returns Formatted currency string
 */
export const formatKES = (amount: number | null | undefined, includeSymbol: boolean = true): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? "KES 0" : "0";
  }

  const formattedAmount = amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return includeSymbol ? `KES ${formattedAmount}` : formattedAmount;
};

/**
 * Formats a price range (from X to Y)
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string
 */
export const formatPriceRange = (minPrice: number, maxPrice: number): string => {
  if (minPrice === maxPrice) {
    return formatKES(minPrice);
  }
  return `${formatKES(minPrice)} - ${formatKES(maxPrice)}`;
};

/**
 * Formats a starting price with "From" prefix
 * @param amount - The starting amount
 * @returns Formatted starting price string
 */
export const formatStartingPrice = (amount: number | null | undefined): string => {
  return `From ${formatKES(amount)}`;
};

/**
 * Parses a string to a number for currency calculations
 * @param value - String value to parse
 * @returns Parsed number or 0 if invalid
 */
export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};
