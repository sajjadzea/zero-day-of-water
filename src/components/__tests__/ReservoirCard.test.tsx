import { render, screen } from '@testing-library/react';
import ReservoirCard from '../ReservoirCard';

describe('ReservoirCard', () => {
  const baseProps = {
    name: 'سد تست',
    percent: 10,
    volumeNowMm3: 5,
    deadStorageMm3: 2,
  };

  it('renders last update with valid Jalali date', () => {
    render(<ReservoirCard {...baseProps} updatedAt="2025-08-02" />);
    expect(screen.getByText('آخرین به‌روزرسانی: ۱۱ مرداد ۱۴۰۴')).toBeInTheDocument();
  });

  it('omits last update when updatedAt missing', () => {
    render(<ReservoirCard {...baseProps} />);
    expect(screen.queryByText(/آخرین به‌روزرسانی/)).toBeNull();
  });

  it('omits last update when updatedAt invalid', () => {
    render(<ReservoirCard {...baseProps} updatedAt="not-a-date" />);
    expect(screen.queryByText(/آخرین به‌روزرسانی/)).toBeNull();
  });

  it('renders badge when note present', () => {
    const note = 'یادداشت';
    render(<ReservoirCard {...baseProps} note={note} />);
    expect(screen.getByText(note)).toBeInTheDocument();
  });

  it('does not render badge when note absent', () => {
    render(<ReservoirCard {...baseProps} />);
    expect(screen.queryByText('یادداشت')).toBeNull();
  });

  it('prepends "کمتر از" when lessThan true', () => {
    render(<ReservoirCard {...baseProps} volumeNowMm3={3} deadStorageMm3={0} lessThan />);
    expect(screen.getByText('حجم مفید: کمتر از ۳ میلیون مترمکعب')).toBeInTheDocument();
  });
});
