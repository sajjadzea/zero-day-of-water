import React from 'react';

interface SourceInfo {
  name: string;
  url?: string;
}

interface SourceStampProps {
  source: SourceInfo;
  lastUpdate: string;
  className?: string;
}

export default function SourceStamp({ source, lastUpdate, className = '' }: SourceStampProps) {
  const date = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    dateStyle: 'long',
  }).format(new Date(lastUpdate));

  return (
    <div className={`text-xs text-gray-500 flex flex-col space-y-0.5 ${className}`}>
      <span>
        منبع:
        {source.url ? (
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline ml-1">
            {source.name}
          </a>
        ) : (
          <span className="ml-1">{source.name}</span>
        )}
      </span>
      <span>آخرین به‌روزرسانی: {date}</span>
    </div>
  );
}
