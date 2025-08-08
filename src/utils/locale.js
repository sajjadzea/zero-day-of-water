// اعداد فارسی
export const faNum = (n) => new Intl.NumberFormat('fa-IR').format(n);

// تاریخ جلالی
export const faDateJalali = (isoLikeOrNow = new Date()) =>
  new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long' }).format(
    new Date(isoLikeOrNow)
  );

// توابع قبلی برای سازگاری
export const formatNum = faNum;
export const formatPercent = (n) => `${faNum(n)}٪`;
export const formatDateJalali = faDateJalali;
