'use client';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { musicApi } from '@/services/api';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  hi: 'Hindi',
  ko: '한국어',
  ru: 'Русский',
  tu: 'Türkçe',
};

export default function GuildSettingsPage({ params }: { params: { id: string } }) {
  const guildId = params.id;
  const [language, setLanguage] = useState('');
  const [available, setAvailable] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    musicApi.getLanguage(guildId)
      .then((data: { language: string; available: string[] }) => {
        setLanguage(data.language);
        setAvailable(data.available);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load languages');
        setLoading(false);
      });
  }, [guildId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full mt-10">
        <h2 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">Settings</h2>
        <p className="mb-8 text-zinc-500 dark:text-zinc-400">Manage your account settings and preferences</p>
        {/* Language Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Language</h3>
              <p className="text-zinc-500 text-sm">Default language for public dashboard.</p>
            </div>
            <div className="relative guild-selector w-56" ref={dropdownRef}>
              {loading ? (
                <div className="text-zinc-400">Loading...</div>
              ) : (
                <>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-left text-sm font-medium text-white"
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={dropdownOpen}
                  >
                    <span className="truncate">
                      {LANGUAGE_NAMES[language]?.toString() || language.toUpperCase()} ({language.toUpperCase()})
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      <div className="py-1">
                        {available.map((lang) => (
                          <button
                            key={lang}
                            className={`w-full flex items-center gap-2 p-2 hover:bg-zinc-700 transition-colors text-left ${lang === language ? 'bg-zinc-700' : ''}`}
                            role="option"
                            aria-selected={lang === language}
                            onClick={async () => {
                              setDropdownOpen(false);
                              setLanguage(lang);
                              setError('');
                              setSuccess(false);
                              try {
                                const data = await musicApi.setLanguage(guildId, lang);
                                if (data.success) {
                                  setSuccess(true);
                                } else {
                                  setError('Failed to update language');
                                }
                              } catch {
                                setError('Failed to update language');
                              }
                            }}
                          >
                            <span className="truncate text-sm">{LANGUAGE_NAMES[lang] || lang.toUpperCase()} ({lang.toUpperCase()})</span>
                            {lang === language && <Check className="w-4 h-4 text-blue-500 ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          {success && <div className="text-green-500 mt-2">Language updated!</div>}
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
} 