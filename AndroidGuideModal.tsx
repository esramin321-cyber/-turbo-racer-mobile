/**
 * Turbo Racer Mobile - Android Testing & Google Play Publication Guide Modal
 */

import React, { useState } from 'react';
import { X, Smartphone, Play, CheckCircle2, Copy, Check } from 'lucide-react';

interface AndroidGuideModalProps {
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'testing' | 'google-play'>('testing');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Android Developer Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-4 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('testing')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'testing'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Test on Android Phone
          </button>
          <button
            onClick={() => setActiveTab('google-play')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'google-play'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Google Play Publication
          </button>
        </div>

        {/* Tab 1: How to test on Android Phone */}
        {activeTab === 'testing' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="font-bold text-sky-400 flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Step 1: Open in Chrome on Android
              </div>
              <p className="text-slate-400 leading-relaxed">
                Open this app URL in Google Chrome (or Firefox) on your Android phone. No PC or Android Studio required for instant gameplay testing!
              </p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Step 2: Add to Home Screen (Instant App)
              </div>
              <p className="text-slate-400 leading-relaxed">
                Tap the Chrome top-right <strong>three dots (⋮)</strong> menu and tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
              </p>
              <p className="text-slate-400 leading-relaxed">
                This launches the game in full-screen standalone mode without any browser URL bar, giving 100% of the display to the game.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Step 3: Rotate into Landscape Mode
              </div>
              <p className="text-slate-400 leading-relaxed">
                Turn your phone horizontally. The game automatically re-orients into comfortable twin-thumb arcade controls:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                <li><strong className="text-slate-200">Left Thumb:</strong> Big Left & Right steering buttons.</li>
                <li><strong className="text-slate-200">Right Thumb:</strong> Accelerator (GAS), Brake, and Nitro Boost.</li>
                <li><strong className="text-slate-200">Haptics:</strong> Vibration feedback triggers automatically on collisions and nitro.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Prepare for Google Play Store */}
        {activeTab === 'google-play' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center justify-between text-sm">
                <span>Method A: Google Bubblewrap (Recommended)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Official TWA</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Google provides <strong>Bubblewrap</strong> specifically to turn web and canvas games into signed <strong>.aab</strong> (Android App Bundles) ready for the Play Store with zero native code changes.
              </p>
              <div className="relative bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-slate-300">
                <code>npx @bubblewrap/cli init --manifest=https://your-domain.com/manifest.json</code>
                <button
                  onClick={() => copyToClipboard('npx @bubblewrap/cli init --manifest=https://your-domain.com/manifest.json', 'bubble')}
                  className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                >
                  {copiedCode === 'bubble' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="relative bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-slate-300">
                <code>npx @bubblewrap/cli build</code>
                <button
                  onClick={() => copyToClipboard('npx @bubblewrap/cli build', 'bubble-build')}
                  className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                >
                  {copiedCode === 'bubble-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                This outputs <code className="text-amber-300 font-mono">app-release-bundle.aab</code> directly!
              </p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="font-bold text-sky-400 text-sm">
                Method B: Capacitor.js / Android Studio
              </div>
              <p className="text-slate-400 leading-relaxed">
                If you prefer a full native wrapper with Gradle and Android Studio:
              </p>
              <div className="relative bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-slate-300">
                <code>npm i @capacitor/core @capacitor/cli @capacitor/android && npx cap init "Turbo Racer" "com.turboracer.app"</code>
                <button
                  onClick={() => copyToClipboard('npm i @capacitor/core @capacitor/cli @capacitor/android && npx cap init "Turbo Racer" "com.turboracer.app"', 'cap')}
                  className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                >
                  {copiedCode === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="font-bold text-amber-400 text-sm">
                Google Play Store Assets Checklist
              </div>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>Google Play Console developer account ($25 one-time registration).</li>
                <li>App icon: 512 x 512 px (PNG 32-bit).</li>
                <li>Feature Graphic: 1024 x 500 px (PNG/JPG).</li>
                <li>Landscape and Portrait screenshots (minimum 2).</li>
                <li>Target API 34+ (handled automatically by Bubblewrap/Capacitor).</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
