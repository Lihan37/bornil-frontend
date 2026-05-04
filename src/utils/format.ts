export const currency = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return currency.format(value);
}
