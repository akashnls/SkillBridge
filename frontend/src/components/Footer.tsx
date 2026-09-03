import React from 'react';
import { Award, Heart, Shield, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">SkillBridge</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
            An AI-Powered Job and Skill Matching Platform designed to reduce youth unemployment, bridge structural skill mismatch, and empower non-traditional learners through explainable AI scoring and tamper-proof micro-credentials.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> WebAuthn/FIDO2 Biometrics
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Explainable Matching AI
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Core Modules</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:text-indigo-400 transition-colors cursor-pointer">Explainable Job-Fit Engine</li>
            <li className="hover:text-indigo-400 transition-colors cursor-pointer">Micro-Credentialing & Badges</li>
            <li className="hover:text-indigo-400 transition-colors cursor-pointer">Skill Gap Roadmap Generator</li>
            <li className="hover:text-indigo-400 transition-colors cursor-pointer">AI Mock Interview Simulator</li>
            <li className="hover:text-indigo-400 transition-colors cursor-pointer">Non-Traditional Portfolio Showcase</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Regional Languages</h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>🌐 English (Global)</li>
            <li>🇮🇳 Hindi (हिन्दी)</li>
            <li>🇮🇳 Tamil (தமிழ்)</li>
            <li>🇮🇳 Kannada (ಕನ್ನಡ)</li>
            <li>🇮🇳 Malayalam (മലയാളം)</li>
          </ul>
          <p className="mt-3 text-[11px] text-slate-500">
            Master of Science / M.Tech in Computer Science Dissertation Project
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© 2026 SkillBridge Platform. Built for inclusive, skill-first employment.</p>
        <p className="flex items-center gap-1">
          Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for equitable tech hiring
        </p>
      </div>
    </footer>
  );
};
