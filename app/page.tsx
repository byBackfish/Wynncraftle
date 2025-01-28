'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GameModes } from '@/app/lib/mode';

const descriptions: Record<string, string> = {
  weapons: "Guess today's Wynncraft weapon",
  gear: "Discover today's piece of Wynncraft gear",
  ingredients: 'Guess the Wynncraft crafting ingredient of today',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-16">
        <h1 className="text-4xl font-bold text-center mb-2 font-minecraft">
          WYNNDLE
        </h1>
        <p className="text-yellow-500 text-center mb-8 font-minecraft">
          A DAILY WYNNCRAFT WORDLE
        </p>

        <div className="space-y-4">
          <h2 className="text-xl text-center mb-6 font-minecraft">
            Choose a gamemode
          </h2>

          {GameModes.map((mode) => (
            <Link
              href={`/play/${mode.id}`}
              key={mode.id}
              className="block bg-gray-800 border-2 border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">{mode.icon}</div>
                <div>
                  <h3 className="text-xl font-minecraft text-orange-500">
                    {mode.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {descriptions[mode.id]}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
