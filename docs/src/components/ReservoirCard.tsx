import React from 'react';
import SourceStamp from './SourceStamp';
import { formatFaNumber, formatMm3 } from '../utils/format';
import reservoirs from '../../data/reservoirs.json';

interface Reservoir {
  id: string;
  nameFa: string;
  capacityMm3: number;
  deadStorageMm3: number;
  volumeNowMm3: number;
  lastUpdate: string;
  source: { name: string; url?: string };
}

const data = reservoirs as Reservoir[];

interface Props {
  id: string;
}

export default function ReservoirCard({ id }: Props) {
  const reservoir = data.find((r) => r.id === id);
  if (!reservoir) return null;

  const percent = (reservoir.volumeNowMm3 / reservoir.capacityMm3) * 100;

  return (
    <div className="border rounded p-4">
      <h3 className="text-base font-medium">{reservoir.nameFa}</h3>
      <SourceStamp source={reservoir.source} lastUpdate={reservoir.lastUpdate} className="mt-1" />
      <div className="mt-2 space-y-1 text-sm">
        <p>حجم فعلی: {formatMm3(reservoir.volumeNowMm3)}</p>
        <p>درصد پرشدگی: {formatFaNumber(+percent.toFixed(1))}٪</p>
      </div>
    </div>
  );
}
