export type PaymentColor = 'green' | 'orange' | 'yellow' | 'blue' | 'purple' | 'brown' | 'gray';

export const PAYMENT_COLORS: Record<PaymentColor, string> = {
  green: 'bg-green-100 border-green-500 text-green-800',
  orange: 'bg-orange-100 border-orange-500 text-orange-800',
  yellow: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  blue: 'bg-blue-100 border-blue-500 text-blue-800',
  purple: 'bg-purple-100 border-purple-500 text-purple-800',
  brown: 'bg-amber-100 border-amber-700 text-amber-900',
  gray: 'bg-gray-100 border-gray-500 text-gray-800',
};

export const PAYMENT_ICONS: Record<number, string> = {
  1: '💵', // Gotówka
  2: '💳', // Karta
  3: '📝', // Czek
  4: '🏦', // Kredyt
  5: '❓', // Inna
  6: '💸', // Przelew
};

export const PAYMENT_NAMES: Record<number, string> = {
  1: 'Gotówka',
  2: 'Karta płatnicza',
  3: 'Czek',
  4: 'Kredyt',
  5: 'Inna',
  6: 'Przelew',
};
