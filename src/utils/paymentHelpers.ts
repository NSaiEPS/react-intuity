/**
 * Centralized Payment Method Mapping for Convenience Fee API:
 * 0 = Card (Visa, Mastercard, Discover, generic card)
 * 1 = Bank (ACH / Bank account)
 * 2 = Amex Card (American Express)
 */
export const getPaymentMethodType = ({
  paymentType,
  cardType,
  brand,
  isBank,
}: {
  paymentType?: string;
  cardType?: string;
  brand?: string;
  isBank?: boolean;
}): number => {
  // If explicitly designated as bank / ACH
  if (isBank || paymentType === 'bank_account' || paymentType === 'bank' || paymentType === 'ach') {
    return 1;
  }

  // Check card type or brand strings for Amex
  const cardStr = (cardType || brand || '').toLowerCase();
  if (
    cardStr.includes('amex') ||
    cardStr.includes('american express') ||
    cardStr.includes('american_express')
  ) {
    return 2;
  }

  // Default: Standard Card (Visa, Mastercard, Discover, etc.)
  return 0;
};
