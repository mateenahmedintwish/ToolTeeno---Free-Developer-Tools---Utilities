"use client";
import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full max-w-7xl mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
      <p>&copy; {new Date().getFullYear()} ToolTeeno. Built with Next.js and Tailwind CSS.</p>
    </footer>
  );
}
