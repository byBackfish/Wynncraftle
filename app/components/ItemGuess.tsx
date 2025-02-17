'use client';

import React from 'react';
import type { Item } from '@/app/lib/struct';
import { ItemStats } from './ItemStats';
import { getItemUrl } from '@/app/lib/game';
import { Helmet, Chestplate, Leggings, Boots } from './Leather';
import { GuessResult, RarityDecorators } from '../lib/mode';

interface ItemGuessProps {
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
  onClick?: () => void;
  isSuggestion?: boolean;
}

export function ItemGuess({
  item,
  stats,
  results,
  matches,
  onClick,
  isSuggestion = false,
}: ItemGuessProps) {
  const color =
    item.tier !== undefined
      ? RarityDecorators.tier[
          item.tier.toString() as keyof typeof RarityDecorators.tier
        ]
      : RarityDecorators.rarity[
          (item.rarity?.toLowerCase() ||
            'common') as keyof typeof RarityDecorators.rarity
        ];

  const containerClasses = isSuggestion
    ? 'p-4 hover:bg-[#3a3a3a] cursor-pointer border-b border-[#3a3a3a] last:border-b-0 transition-colors duration-200'
    : 'bg-[#2a2a2a] border-2 border-[#3a3a3a] p-4';

  return (
    <div className={`${containerClasses} animate-fade-in`} onClick={onClick}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8">
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgb(${color}) 30%, rgb(41, 41, 41) 90%)`,
              padding: '2px',
            }}
          >
            {item.armourMaterial === 'leather' && item.armourColor ? (
              <div className="w-full h-full transition-transform duration-300 hover:scale-110">
                {item.armourType === 'helmet' && (
                  <Helmet color={item.armourColor} />
                )}
                {item.armourType === 'chestplate' && (
                  <Chestplate color={item.armourColor} />
                )}
                {item.armourType === 'leggings' && (
                  <Leggings color={item.armourColor} />
                )}
                {item.armourType === 'boots' && (
                  <Boots color={item.armourColor} />
                )}
              </div>
            ) : (
              <img
                src={getItemUrl(item)}
                alt={item.internalName}
                className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
              />
            )}
          </div>
        </div>
        <h3
          className="text-lg font-minecraft"
          style={{ color: `rgb(${color})` }}
        >
          {item.internalName}
        </h3>
      </div>
      <ItemStats
        item={item}
        stats={stats}
        results={results}
        matches={matches}
      />
    </div>
  );
}
