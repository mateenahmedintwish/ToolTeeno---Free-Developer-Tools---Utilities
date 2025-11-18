"use client";
import React, { useState } from 'react';
import { Coffee, X, Copy, Check, ExternalLink, Lightbulb, Send } from 'lucide-react';

export default function Footer() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSuggestPopupOpen, setIsSuggestPopupOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const walletAddress = '0xaa91ff7fb9fac6b489166655394f169a43055c34';

  // Form state
  const [formData, setFormData] = useState({
    toolName: '',
    toolDescription: '',
    useCase: '',
    features: '',
    userName: '',
    userEmail: '',
    githubUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
  });

  const cryptoOptions = [
    {
      name: 'Ethereum (ETH)',
      network: 'Ethereum Mainnet',
      address: walletAddress,
      iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
      color: 'bg-purple-500',
    },
    {
      name: 'Base',
      network: 'Base Network',
      address: walletAddress,
      iconUrl: 'https://avatars.githubusercontent.com/u/108554348?s=280&v=4',
      color: 'bg-blue-500',
    },
  ];

  const paymentServices = [
    {
      name: 'MetaMask',
      url: `https://metamask.app.link/send/${walletAddress}`,
      icon: '🦊',
      description: 'Send via MetaMask app',
    },
    {
      name: 'Coinbase Wallet',
      url: `https://go.cb-w.com/send?address=${walletAddress}`,
      icon: '💙',
      description: 'Send via Coinbase Wallet',
    },
  ];

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleOpenService = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/suggest-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          toolName: '',
          toolDescription: '',
          useCase: '',
          features: '',
          userName: '',
          userEmail: '',
          githubUrl: '',
          twitterUrl: '',
          linkedinUrl: '',
          websiteUrl: '',
        });
        // Close popup after 2 seconds
        setTimeout(() => {
          setIsSuggestPopupOpen(false);
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <footer className="w-full max-w-7xl mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Coffee className="w-5 h-5" />
            Buy me a coffee
          </button>
          <button
            onClick={() => setIsSuggestPopupOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Lightbulb className="w-5 h-5" />
            Suggest a Tool
          </button>
        </div>
        <p>&copy; {new Date().getFullYear()} ToolTeeno. Built with Next.js and Tailwind CSS.</p>
      </footer>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Coffee className="w-8 h-8 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Buy me a coffee ☕
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Support the development of free tools! Send crypto donations via your preferred method.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Quick Send Services */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Quick Send (Recommended)
                </h3>
                <div className="grid gap-3">
                  {paymentServices.map((service) => (
                    <button
                      key={service.name}
                      onClick={() => handleOpenService(service.url)}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-all group"
                    >
                      <span className="text-3xl">{service.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-800 dark:text-white">
                          {service.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {service.description}
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or copy wallet address
                  </span>
                </div>
              </div>

              {/* Wallet Addresses */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Wallet Address
                </h3>
                <div className="space-y-3">
                  {cryptoOptions.map((crypto) => (
                    <div
                      key={crypto.name}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <img 
                          src={crypto.iconUrl} 
                          alt={crypto.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 dark:text-white">
                            {crypto.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {crypto.network}
                          </div>
                        </div>
                        <span className={`px-3 py-1 ${crypto.color} text-white text-xs font-semibold rounded-full`}>
                          Same Address
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <input
                          type="text"
                          value={crypto.address}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono text-gray-800 dark:text-white"
                        />
                        <button
                          onClick={() => handleCopyAddress(crypto.address)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            copiedAddress === crypto.address
                              ? 'bg-green-500 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {copiedAddress === crypto.address ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thank You Note */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  🙏 <strong>Thank you for your support!</strong> Your donation helps keep these tools free and ad-free for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggest Tool Popup Modal */}
      {isSuggestPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsSuggestPopupOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Suggest a Tool 💡
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Have an idea for a new tool? Share it with us! If we implement your suggestion, we'll credit you on the tool's page.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSuggestSubmit} className="p-6 space-y-6">
              {/* Tool Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Tool Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tool Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="toolName"
                      value={formData.toolName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., CSV to JSON Converter"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="toolDescription"
                      value={formData.toolDescription}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="Briefly describe what this tool does..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Use Case
                    </label>
                    <textarea
                      name="useCase"
                      value={formData.useCase}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="When and why would developers use this tool?"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Key Features
                    </label>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="List the main features you'd like to see (one per line)"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Your Information Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Your Information (for credit)
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        GitHub Profile
                      </label>
                      <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleInputChange}
                        placeholder="https://github.com/username"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter/X Profile
                      </label>
                      <input
                        type="url"
                        name="twitterUrl"
                        value={formData.twitterUrl}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/username"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 text-center font-medium">
                    ✅ Thank you! Your suggestion has been submitted successfully.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-center font-medium">
                    ❌ Something went wrong. Please try again later.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSuggestPopupOpen(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Suggestion
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
