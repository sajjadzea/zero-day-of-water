import React from 'react';
import SourceStamp from './SourceStamp';
import { formatFaNumber } from '../utils/format';

interface SourceInfo {
  name: string;
  url?: string;
}

interface Meta {
  source: SourceInfo;
  lastUpdate: string;
}

interface Props {
  title: string;
  value: number;
  meta?: Meta;
}

export default function KPICard({ title, value, meta }: Props) {
  return (
    <div className="relative border rounded p-4">
      {meta && (
        <div className="absolute top-2 right-2">
          <SourceStamp source={meta.source} lastUpdate={meta.lastUpdate} />
        </div>
      )}
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-2xl mt-2">{formatFaNumber(value)}٪</p>
    </div>
  );
}
