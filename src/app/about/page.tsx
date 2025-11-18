// app/about/page.tsx
"use client";
import React from 'react';

export default function AboutPage() {
  const walletAddress = "0xaa91ff7fb9fac6b489166655394f169a43055c34";
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    alert('Wallet address copied to clipboard! 🎉');
  };
  
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 rounded-2xl p-8 md:p-12 text-white shadow-2xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About ToolTeeno</h1>
          <p className="text-xl text-indigo-50 leading-relaxed">
            <span className="font-bold">TL;DR:</span> These are all the tools I (Mateen) want available on the internet 
            that I don't need to Google to get. So I made this site. 🎯
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-xl mb-12 transition-colors duration-300">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">The Story</h2>
          <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              You know that moment when you need to <strong>encode a URL</strong>, <strong>format some JSON</strong>, 
              or <strong>generate a QR code</strong>, and you end up clicking through three sketchy websites with 
              more ads than actual functionality? Yeah, I got tired of that too.
            </p>
            <p>
              So I built ToolTeeno - a collection of developer tools that are actually useful, don't track you, 
              don't bombard you with popups, and won't suddenly ask you to "upgrade to premium" for basic features. 
              Revolutionary, I know. 😎
            </p>
            <p>
              Everything runs <strong>locally in your browser</strong> (because your data is yours, not mine), 
              there's a <strong>proper dark mode</strong> (because we're developers, not vampires... or are we? 🧛), 
              and it's all <strong>completely free</strong> - now and forever.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-xl mb-12 transition-colors duration-300">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">What Makes It Special</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Blazing Fast</h3>
                <p className="text-gray-600 dark:text-gray-400">No server roundtrips, everything runs instantly in your browser</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔒</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Privacy First</h3>
                <p className="text-gray-600 dark:text-gray-400">Your data never leaves your device. No tracking, no analytics, no BS</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎨</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Beautiful Dark Mode</h3>
                <p className="text-gray-600 dark:text-gray-400">Because squinting at white screens at 2 AM is not a vibe</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="text-3xl">🚀</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Always Expanding</h3>
                <p className="text-gray-600 dark:text-gray-400">New tools added regularly based on what developers actually need</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="text-3xl">💰</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Forever Free</h3>
                <p className="text-gray-600 dark:text-gray-400">No premium plans, no paywalls, no "free trial". Just free.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔓</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Open Source</h3>
                <p className="text-gray-600 dark:text-gray-400">All code is public. Want a feature? Contribute or fork it!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contribute Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 rounded-2xl p-8 md:p-10 text-white shadow-2xl mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Want to Contribute?</h2>
          <p className="text-lg text-indigo-50 mb-8 text-center leading-relaxed">
            ToolTeeno is open source and built for the community. There are two ways you can help keep it awesome:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* GitHub Contribution */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-5xl mb-4">👨‍💻</div>
              <h3 className="text-2xl font-bold mb-3">Code Contribution</h3>
              <p className="text-indigo-100 mb-6">
                Found a bug? Have an idea for a new tool? The entire source code is on GitHub!
              </p>
              <a
                href="https://github.com/mateenahmedintwish/ToolTeeno---Free-Developer-Tools---Utilities"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            </div>

            {/* Crypto Contribution */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-5xl mb-4">☕</div>
              <h3 className="text-2xl font-bold mb-3">Buy Me a Coffee</h3>
              <p className="text-indigo-100 mb-4">
                If you find ToolTeeno useful, you can support its development with crypto!
              </p>
              <div className="bg-white/20 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm font-bold mb-2 text-indigo-100">Ethereum (ETH) or Base Network:</p>
                <div className="bg-gray-900/50 rounded p-3 break-all font-mono text-xs text-white">
                  {walletAddress}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="mt-3 w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all duration-300"
                >
                  📋 Copy Address
                </button>
              </div>
              <p className="text-xs text-indigo-200">
                (MetaMask or any Web3 wallet works!)
              </p>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl transition-colors duration-300">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Built with 💜 by{' '}
            <a href="/mateen" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Mateen Ahmed
            </a>
            {' '}for developers who just want their tools to work.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            No VC funding, no premium tiers, no ulterior motives. Just good tools. 🛠️
          </p>
        </div>
      </div>
    </div>
  );
}