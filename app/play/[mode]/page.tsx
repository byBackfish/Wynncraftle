'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import {
  BaseItem,
  Weapon,
  Gear,
  Ingredient,
  getDailyItem,
  fetchItems,
  filterWeapons,
  filterGear,
  filterIngredients,
} from '@/app/lib/types';

enum RarityValues {
  COMMON = 1,
  UNIQUE = 2,
  RARE = 3,
  LEGENDARY = 4,
  SET = 5,
  FABLED = 6,
  MYTHIC = 7,
}

type GameItem = Weapon | Gear | Ingredient;

interface GameState {
  guesses: Array<{
    name: string;
    stats: GameItem;
    matches: Record<string, boolean>;
  }>;
  isCorrect: boolean;
  targetItem: {
    name: string;
    stats: GameItem;
  } | null;
}

export default function GameMode() {
  const { mode } = useParams();
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<GameItem[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    isCorrect: false,
    targetItem: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch target item on mount
  useEffect(() => {
    const initializeGame = async () => {
      try {
        const target = await getDailyItem(mode as string);
        console.log('Target Item:', target);
        setGameState((prev) => ({
          ...prev,
          targetItem: {
            name: target.name,
            stats: target as GameItem,
          },
        }));
      } catch (error) {
        console.error('Error fetching daily item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, [mode]);

  // Handle search suggestions
  useEffect(() => {
    let isMounted = true;

    const fetchSuggestions = async () => {
      if (searchInput.length === 0) {
        setSuggestions([]);
        return;
      }

      try {
        const items = await fetchItems();
        if (!isMounted) return;

        let filteredItems: GameItem[];
        switch (mode) {
          case 'weapons':
            filteredItems = filterWeapons(items) as GameItem[];
            break;
          case 'gear':
            filteredItems = filterGear(items) as GameItem[];
            break;
          case 'ingredients':
            filteredItems = filterIngredients(items) as GameItem[];
            break;
          default:
            filteredItems = [];
        }

        const matchingItems = filteredItems
          .filter((item) =>
            item.name.toLowerCase().includes(searchInput.toLowerCase())
          )
          .slice(0, 5);

        setSuggestions(matchingItems);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [searchInput, mode]);

  const handleGuess = async (guessName: string = searchInput) => {
    if (!gameState.targetItem || !guessName) return;

    if (guessName.toLowerCase() === gameState.targetItem.name.toLowerCase()) {
      const matches = Object.keys(gameState.targetItem.stats).reduce(
        (acc, key) => {
          if (key !== 'name') {
            acc[key] = true;
          }
          return acc;
        },
        {} as Record<string, boolean>
      );

      setGameState((prev) => ({
        ...prev,
        guesses: [
          ...prev.guesses,
          {
            name: guessName,
            stats: gameState.targetItem!.stats,
            matches,
          },
        ],
        isCorrect: true,
      }));
    } else {
      try {
        const items = await fetchItems();
        let filteredItems: GameItem[];

        switch (mode) {
          case 'weapons':
            filteredItems = filterWeapons(items) as GameItem[];
            break;
          case 'gear':
            filteredItems = filterGear(items) as GameItem[];
            break;
          case 'ingredients':
            filteredItems = filterIngredients(items) as GameItem[];
            break;
          default:
            filteredItems = [];
        }

        const mockStats =
          filteredItems.find((item) => item.name === guessName) ||
          filteredItems[Math.floor(Math.random() * filteredItems.length)];

        const matches = Object.keys(mockStats).reduce((acc, key) => {
          if (key !== 'name') {
            acc[key] = mockStats[key] === gameState.targetItem!.stats[key];
          }
          return acc;
        }, {} as Record<string, boolean>);

        setGameState((prev) => ({
          ...prev,
          guesses: [
            ...prev.guesses,
            {
              name: guessName,
              stats: mockStats,
              matches,
            },
          ],
          isCorrect: false,
        }));
      } catch (error) {
        console.error('Error processing guess:', error);
      }
    }

    setSearchInput('');
    setSuggestions([]);
  };

  const renderStats = (stats: GameItem) => {
    const filteredStats = Object.entries(stats).filter(
      ([key]) => key !== 'name'
    );
    return filteredStats.map(([key]) => (
      <div key={key} className="font-minecraft text-sm">
        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
      </div>
    ));
  };

  const renderStatValue = (stats: GameItem) => {
    const filteredStats = Object.entries(stats).filter(
      ([key]) => key !== 'name'
    );
    return filteredStats.map(([key, value]) => (
      <div key={key} className="font-minecraft text-sm text-gray-300">
        {value.toString()}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#1a1a1a] text-white p-4 flex items-center justify-center">
        <div className="font-minecraft text-[#ffd700]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-16">
        <div className="flex flex-col items-center gap-2 mb-8">
          <a href="/">
            <h1 className="text-4xl font-bold text-center font-minecraft text-[#ffd700] tracking-wider">
              Wynndle
            </h1>
          </a>
          <p className="text-xs font-minecraft text-gray-400">Daily Wynndle</p>
        </div>

        <div className="mb-8 relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search for ${
                mode === 'weapons'
                  ? 'a weapon'
                  : mode === 'gear'
                  ? 'gear'
                  : 'an ingredient'
              }`}
              className="flex-1 p-3 rounded-none bg-[#2a2a2a] border-2 border-[#3a3a3a] text-white font-minecraft placeholder-gray-500 focus:outline-none focus:border-[#4a4a4a]"
            />
            <button
              onClick={() => handleGuess()}
              className="px-6 py-3 bg-[#3a3a3a] hover:bg-[#4a4a4a] font-minecraft transition-colors duration-200 text-[#ffd700]"
            >
              Guess
            </button>
          </div>
          {suggestions.length > 0 && (
            <div className="absolute w-full mt-1 bg-[#2a2a2a] border-2 border-[#3a3a3a] overflow-hidden z-10 shadow-lg">
              {suggestions.map((item) => (
                <div
                  key={item.name}
                  className="p-4 hover:bg-[#3a3a3a] cursor-pointer border-b border-[#3a3a3a] last:border-b-0 transition-colors duration-200"
                  onClick={() => handleGuess(item.name)}
                >
                  <h4 className="font-minecraft text-lg mb-2 text-[#ffd700]">
                    {item.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStats(item)}
                    {renderStatValue(item)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {[...gameState.guesses].reverse().map((guess, index) => {
            const filteredStats = Object.entries(guess.stats).filter(
              ([key]) => key !== 'name'
            );
            return (
              <div
                key={index}
                className="bg-[#2a2a2a] border-2 border-[#3a3a3a] p-4"
              >
                <h3 className="text-lg font-minecraft mb-4 text-[#ffd700]">
                  {guess.name}
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {filteredStats.map(([key, value]) => {
                    let targetValue = gameState.targetItem?.stats[key];
                    let comparisonIndicator = '';

                    let useValue = value;
                    let useTargetValue = targetValue;

                    if (key === 'rarity') {
                      useValue = RarityValues[value.toUpperCase()];
                      useTargetValue = RarityValues[targetValue.toUpperCase()];
                    }

                    if (
                      typeof useValue === 'number' &&
                      typeof useTargetValue === 'number'
                    ) {
                      comparisonIndicator =
                        useValue < useTargetValue
                          ? '↑'
                          : useValue > useTargetValue
                          ? '↓'
                          : '';
                    }
                    return (
                      <div key={key} className="flex flex-col items-center">
                        <div className="font-minecraft text-xs text-gray-400 mb-2">
                          {key.charAt(0).toUpperCase() +
                            key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div
                          className={`w-16 h-16 font-minecraft text-sm flex items-center justify-center border-2 ${
                            guess.matches[key]
                              ? 'bg-[#285c28] border-[#3a7a3a] text-[#7fff7f]'
                              : 'bg-[#5c2828] border-[#7a3a3a] text-[#ff7f7f]'
                          }`}
                        >
                          <div className="text-center">
                            <div>{value.toString()}</div>
                            {!guess.matches[key] && comparisonIndicator && (
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
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
