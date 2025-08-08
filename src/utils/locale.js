export const formatNum = (n) => new Intl.NumberFormat('fa-IR').format(n);
export const formatPercent = (n) => `${formatNum(n)}٪`;
export const formatDateJalali = (d=new Date()) =>
  new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long' }).format(d);
