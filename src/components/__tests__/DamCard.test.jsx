import { render, screen } from '@testing-library/react';
import DamCard from '../DamCard.jsx';

describe('DamCard', () => {
  it('renders last update with valid Jalali date', () => {
    render(<DamCard name="سد تست" percent={10} volumeMCM={5} updatedAt="2025-08-02" />);
    expect(screen.getByText('آخرین به‌روزرسانی: ۱۱ مرداد ۱۴۰۴')).toBeInTheDocument();
  });

  it('omits last update when updatedAt missing', () => {
    render(<DamCard name="سد تست" percent={10} volumeMCM={5} />);
    expect(screen.queryByText(/آخرین به‌روزرسانی/)).toBeNull();
  });

  it('omits last update when updatedAt invalid', () => {
    render(<DamCard name="سد تست" percent={10} volumeMCM={5} updatedAt="not-a-date" />);
    expect(screen.queryByText(/آخرین به‌روزرسانی/)).toBeNull();
  });

  it('renders badge when note present', () => {
    const note = 'یادداشت';
    render(<DamCard name="سد تست" percent={10} volumeMCM={5} note={note} />);
    expect(screen.getByText(note)).toBeInTheDocument();
  });

  it('does not render badge when note absent', () => {
    render(<DamCard name="سد تست" percent={10} volumeMCM={5} />);
    expect(screen.queryByText('یادداشت')).toBeNull();
  });

  it('prepends "کمتر از" when lessThan true', () => {
    render(<DamCard name="سد تست" percent={10} volumeMCM={3} lessThan />);
    expect(screen.getByText('حجم: کمتر از ۳ میلیون مترمکعب')).toBeInTheDocument();
  });
});
