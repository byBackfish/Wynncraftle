'use client';

import React from 'react';
import { GuessResult } from '@/app/lib/mode';
import type { Item } from '@/app/lib/struct';

interface ItemStatsProps {
  item: Item;
  stats: Record<
    string,
    {
      name: string;
      getValue: (item: Item) => any;
    }
  >;
  results?: Record<string, GuessResult>;
  matches?: Record<string, boolean>;
}

export function ItemStats({ item, stats, results, matches }: ItemStatsProps) {
  return (
    <div className="grid grid-cols-6 gap-4">
      {Object.entries(stats).map(([key, stat]) => {
        const value = stat.getValue(item);
        let comparisonIndicator = '';
        let colorClasses = 'bg-[#2a2a2a] border-[#3a3a3a] text-white';

        if (results && matches) {
          const result = results[key];
          if (result === GuessResult.CORRECT) {
            colorClasses = 'bg-[#285c28] border-[#3a7a3a] text-[#7fff7f]';
          } else if (result === GuessResult.CLOSE) {
            colorClasses = 'bg-[#5c5c28] border-[#7a7a3a] text-[#ffff7f]';
          } else {
            colorClasses = 'bg-[#5c2828] border-[#7a3a3a] text-[#ff7f7f]';
          }

          if (!matches[key]) {
            if (result === GuessResult.HIGHER) {
              comparisonIndicator = '↓';
            } else if (result === GuessResult.LOWER) {
              comparisonIndicator = '↑';
            }
          }
        }

        return (
          <div key={key} className="flex flex-col items-center">
            <div className="font-minecraft text-xs text-gray-400 mb-2">
              {key.charAt(0).toUpperCase() +
                key.slice(1).replace(/([A-Z])/g, ' $1')}
            </div>
            <div
              className={`w-16 h-16 font-minecraft text-sm flex items-center justify-center border-2 ${colorClasses}`}
            >
              <div className="text-center">
                {format(value).map((line) => (
                  <div key={line}>{line}</div>
                ))}
                {comparisonIndicator && (
                  <div className="mt-1 font-bold text-sm">
                    {comparisonIndicator}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function format(input: any): string[] {
  if (Array.isArray(input)) {
    return input;
  }

  return [input];
}
