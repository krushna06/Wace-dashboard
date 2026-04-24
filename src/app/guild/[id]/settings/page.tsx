'use client';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Check, Settings as SettingsIcon } from 'lucide-react';
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
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-zinc-400">Manage your account settings and preferences</p>
            </div>
          </div>
          {/* Language Card */}
          <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg text-white">Language</h3>
                <p className="text-[#BCC3D7] text-sm">Default language for public dashboard.</p>
              </div>
              <div className="relative guild-selector w-56" ref={dropdownRef}>
                {loading ? (
                  <div className="flex items-center gap-2 text-zinc-400 rounded-lg p-2" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:opacity-80 transition-opacity text-left text-sm font-medium text-white"
                      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
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
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
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
                              {lang === language && <Check className="w-4 h-4 ml-auto" style={{ color: 'var(--color-primary)' }} />}
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
    </div>
  );
} 