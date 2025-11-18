"use client";
import React from 'react';
import Link from 'next/link';
import { Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full max-w-7xl bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 flex justify-between items-center mb-10 transition-colors duration-300">
      <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400">
        <Zap className="w-6 h-6" />
        <Link href="/">
          <h1 className="text-2xl font-extrabold tracking-tight cursor-pointer">ToolTeeno</h1>
        </Link>
      </div>
      
      {/* Actual Nav Links with Next.js Link */}
      <nav className="hidden sm:flex space-x-6 text-gray-600 dark:text-gray-300 font-medium items-center">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">All Tools</Link>
        <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</Link>
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
        </button>
      </nav>
      
      <div className="flex items-center gap-2 sm:hidden">
        {/* Theme Toggle for Mobile */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
        </button>
        
        <button className="p-2 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
    </header>
  );
}
