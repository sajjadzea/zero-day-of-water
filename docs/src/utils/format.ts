export const formatFaNumber = (n: number): string =>
  new Intl.NumberFormat('fa-IR').format(n);

export const formatMm3 = (n: number): string =>
  `${formatFaNumber(n)} میلیون مترمکعب`;
