'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { getDailyItem, getItemsForMode, evaluateGuess } from '@/app/lib/game';
import { GuessResult, type GameMode, GameModes } from '@/app/lib/mode';
import type { Item } from '@/app/lib/struct';

interface GameState {
  guesses: Array<{
    item: Item;
    results: Record<string, GuessResult>;
    matches: Record<string, boolean>;
    stats: Record<string, { name: string; value: number }>;
  }>;
  isCorrect: boolean;
  targetItem: Item | null;
}

export default function GameMode() {
  const params = useParams();
  const mode = params.mode as string;
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    isCorrect: false,
    targetItem: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [seed, setSeed] = useState<number>(
    new Date().getDay() * 100 + new Date().getDate()
  );
  const [showTarget, setShowTarget] = useState(false);

  // Fetch target item on mount
  useEffect(() => {
    const initializeGame = async () => {
      try {
        const gameMode = GameModes.find((m) => m.id === mode);
        if (!gameMode) throw new Error('Invalid game mode');

        const target = await getDailyItem(gameMode);
        console.log('Target Item:', target);
        setGameState((prev) => ({
          ...prev,
          targetItem: target,
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
        const gameMode = GameModes.find((m) => m.id === mode);
        if (!gameMode) throw new Error('Invalid game mode');

        const items = await getItemsForMode(gameMode);
        if (!isMounted) return;

        const matchingItems = items
          .filter((item) =>
            item.internalName.toLowerCase().includes(searchInput.toLowerCase())
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

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 10000));
  };

  const handleSeedSubmit = async () => {
    setIsLoading(true);
    try {
      const gameMode = GameModes.find((m) => m.id === mode);
      if (!gameMode) throw new Error('Invalid game mode');

      const target = await getDailyItem(gameMode, seed);
      setGameState({
        guesses: [],
        isCorrect: false,
        targetItem: target,
      });
    } catch (error) {
      console.error('Error fetching item with seed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuess = async (guessItem: Item | null = null) => {
    if (!gameState.targetItem || (!guessItem && !searchInput)) return;

    try {
      const gameMode = GameModes.find((m) => m.id === mode);
      if (!gameMode) throw new Error('Invalid game mode');

      let selectedItem = guessItem;
      if (!selectedItem) {
        const items = await getItemsForMode(gameMode);
        selectedItem =
          items.find(
            (item) =>
              item.internalName.toLowerCase() === searchInput.toLowerCase()
          ) || null;
      }

      if (!selectedItem) return;

      const results = evaluateGuess(
        gameMode,
        selectedItem,
        gameState.targetItem
      );
      const isCorrect = Object.values(results).every(
        (result) => result === GuessResult.CORRECT
      );

      const stats: Record<string, { name: string; value: number }> = {};
      const matches: Record<string, boolean> = {};

      Object.entries(gameMode.stats).forEach(([key, stat]) => {
        stats[key] = {
          name: stat.name,
          value: stat.getValue(selectedItem!),
        };
        matches[key] = results[key] === GuessResult.CORRECT;
      });

      setGameState((prev) => ({
        ...prev,
        guesses: [
          ...prev.guesses,
          {
            item: selectedItem!,
            results,
            matches,
            stats,
          },
        ],
        isCorrect,
      }));

      setSearchInput('');
      setSuggestions([]);
    } catch (error) {
      console.error('Error processing guess:', error);
    }
  };

  const renderStats = (item: Item) => {
    const gameMode = GameModes.find((m) => m.id === mode);
    if (!gameMode) return null;

    return Object.entries(gameMode.stats).map(([key, stat]) => (
      <div key={key} className="font-minecraft text-sm">
        {stat.name}
      </div>
    ));
  };

  const renderStatValue = (item: Item) => {
    const gameMode = GameModes.find((m) => m.id === mode);
    if (!gameMode) return null;

    return Object.entries(gameMode.stats).map(([key, stat]) => (
      <div key={key} className="font-minecraft text-sm text-gray-300">
        {stat.getValue(item).toString()}
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

  const currentGameMode = GameModes.find((m) => m.id === mode);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-16">
        <div className="flex flex-col items-center gap-2 mb-8">
          <a href="/">
            <h1 className="text-4xl font-bold text-center font-minecraft text-[#ffd700] tracking-wider">
              Wynndle
            </h1>
          </a>
          <p className="text-xs font-minecraft text-gray-400">Daily Wynndle</p>
          <div className="flex gap-2 mt-4">
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
              className="w-32 p-2 rounded-none bg-[#2a2a2a] border-2 border-[#3a3a3a] text-white font-minecraft"
              placeholder="Enter seed"
            />
            <button
              onClick={generateRandomSeed}
              className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] font-minecraft transition-colors duration-200 text-[#ffd700]"
            >
              Random
            </button>
            <button
              onClick={handleSeedSubmit}
              className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] font-minecraft transition-colors duration-200 text-[#ffd700]"
            >
              Submit
            </button>
          </div>
          <button
            onClick={() => setShowTarget(!showTarget)}
            className="px-4 py-2 mt-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] font-minecraft transition-colors duration-200 text-[#ffd700]"
          >
            {showTarget ? 'Hide Target' : 'Reveal Item'}
          </button>
          {showTarget && gameState.targetItem && (
            <div className="mt-4 p-4 bg-[#2a2a2a] border-2 border-[#3a3a3a] w-full max-w-md">
              <h3 className="text-lg font-minecraft mb-4 text-[#ffd700]">
                {gameState.targetItem.internalName}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {currentGameMode &&
                  Object.entries(currentGameMode.stats).map(([key, stat]) => (
                    <React.Fragment key={key}>
                      <div className="font-minecraft text-sm">{stat.name}</div>
                      <div className="font-minecraft text-sm text-gray-300">
                        {stat.getValue(gameState.targetItem!).toString()}
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </div>
          )}
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
                  key={item.internalName}
                  className="p-4 hover:bg-[#3a3a3a] cursor-pointer border-b border-[#3a3a3a] last:border-b-0 transition-colors duration-200"
                  onClick={() => handleGuess(item)}
                >
                  <h4 className="font-minecraft text-lg mb-4 text-[#ffd700]">
                    {item.internalName}
                  </h4>
                  <div className="grid grid-cols-5 gap-4">
                    {currentGameMode &&
                      Object.entries(currentGameMode.stats).map(
                        ([key, stat]) => (
                          <div key={key} className="flex flex-col items-center">
                            <div className="font-minecraft text-xs text-gray-400 mb-2">
                              {key.charAt(0).toUpperCase() +
                                key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </div>
                            <div className="w-16 h-16 font-minecraft text-sm flex items-center justify-center border-2 bg-[#2a2a2a] border-[#3a3a3a] text-white">
                              <div className="text-center">
                                <div>{stat.getValue(item).toString()}</div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {[...gameState.guesses].reverse().map((guess, index) => (
            <div
              key={index}
              className="bg-[#2a2a2a] border-2 border-[#3a3a3a] p-4"
            >
              <h3 className="text-lg font-minecraft mb-4 text-[#ffd700]">
                {guess.item.internalName}
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {currentGameMode &&
                  Object.entries(currentGameMode.stats).map(([key, stat]) => {
                    const result = guess.results[key];
                    const value = stat.getValue(guess.item);
                    let comparisonIndicator = '';

                    if (result === GuessResult.HIGHER) {
                      comparisonIndicator = '↓';
                    } else if (result === GuessResult.LOWER) {
                      comparisonIndicator = '↑';
                    }
                    return (
                      <div key={key} className="flex flex-col items-center">
                        <div className="font-minecraft text-xs text-gray-400 mb-2">
                          {key.charAt(0).toUpperCase() +
                            key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div
                          className={`w-16 h-16 font-minecraft text-sm flex items-center justify-center border-2 ${
                            result === GuessResult.CORRECT
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
          ))}
        </div>
      </div>
    </main>
  );
}
