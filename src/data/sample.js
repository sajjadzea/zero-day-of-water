export const kpis = {
  city: { value: 48, trend: 0.1, subtitle: 'پیشرفت تأمین منابع جایگزین' },
  dams: { value: 36.1, trend: -0.1, subtitle: 'حجم ذخیره سدهای تأمین‌کننده' },
  residents: { value: 36, trend: -8, subtitle: 'درصد مصرف‌کنندگان ≤ ۸۷ لیتر/روز' },
};

export const projects = [
  { name: 'هاوت بِی (آب‌شیرین‌کن)', pct: 43, state:'warn' },
  { name: 'کیپ‌تاون هاربور (بَرچ)', pct: 56, state:'ok' },
  { name: 'یونیورسال سایتس (آب‌شیرین‌کن)', pct: 15, state:'bad' },
  { name: 'Cape Peninsula (TMG Aquifer)', pct: 20, state:'warn' },
  { name: 'Granger Bay (Desalination)', pct: 45, state:'warn' },
  { name: 'Red Hill/Iddo Valley (Desalination)', pct: 43, state:'bad' },
  { name: 'Harmony Park (Desalination)', pct: 56, state:'ok' },
];
