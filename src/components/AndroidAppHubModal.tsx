import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  WifiOff,
  CloudLightning,
  Sparkles,
  Terminal,
  QrCode,
  Layers,
  ArrowRight
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidAppHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppHubModal: React.FC<AndroidAppHubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isStandalone, isAndroid, triggerInstall } = usePWAInstall();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'install' | 'features' | 'apk'>('install');

  useEffect(() => {
    if (isOpen) {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://airsense-ncr.web.app';
      QRCode.toDataURL(currentUrl, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to render QR Code:', err));
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header with Android Robot Style Gradient */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 sm:p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shadow-inner">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                      AirSense <span className="text-emerald-400">Android App</span>
                    </h2>
                    {isStandalone ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Native Mode
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        PWA / WebAPK
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-300">
                    Standalone Android application for Delhi-NCR air pollution & cloudburst tracking.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="mt-5 flex gap-2 border-b border-slate-700/60 pb-1">
              <button
                onClick={() => setActiveTab('install')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'install'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Download className="h-3.5 w-3.5" />
                Install & Mobile Scan
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'features'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Android Capabilities
              </button>
              <button
                onClick={() => setActiveTab('apk')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'apk'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                APK / Play Store CLI
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">

            {/* TAB 1: INSTALL & QR CODE */}
            {activeTab === 'install' && (
              <div className="space-y-6">
                {/* 1. Direct Install Trigger */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                          1
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {isStandalone
                            ? 'App Installed on this Device'
                            : isInstallable
                            ? '1-Tap Direct WebAPK Installation'
                            : 'Install to Android Home Screen'}
                        </h3>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 max-w-md">
                        {isStandalone
                          ? 'AirSense NCR is actively running in native standalone window mode with full offline caching and app drawer integration.'
                          : isInstallable
                          ? 'Google Chrome has verified this applet. Tap below to add AirSense NCR directly to your Android launcher and home screen.'
                          : 'Installs as a native Android WebAPK app with full-screen experience, zero browser chrome, and instant startup.'}
                      </p>
                    </div>

                    {isInstallable ? (
                      <button
                        id="android-direct-install-btn"
                        onClick={triggerInstall}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        Install App Now
                      </button>
                    ) : isStandalone ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-4 py-2.5 rounded-xl border border-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Active Standalone
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-md">
                          Use Chrome menu ⋮
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Manual Chrome instructions if prompt not yet fired */}
                  {!isStandalone && !isInstallable && (
                    <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                      <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900">Step A:</span>
                        <span>Open this page in <strong>Google Chrome</strong> on your Android phone.</span>
                      </div>
                      <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900">Step B:</span>
                        <span>Tap the <strong>three dots (⋮)</strong> in the top right browser corner.</span>
                      </div>
                      <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900">Step C:</span>
                        <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. QR Code Mobile Scan */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center gap-6">
                  <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Scan QR code to install on Android"
                        className="h-40 w-40 rounded-lg shadow-xs"
                      />
                    ) : (
                      <div className="h-40 w-40 flex items-center justify-center text-slate-400">
                        <QrCode className="h-12 w-12 animate-pulse" />
                      </div>
                    )}
                    <span className="mt-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Android Camera Scan
                    </span>
                  </div>

                  <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                      Instant Mobile Deployment
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      Scan to Open on your Android Device
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                      Open your Android camera or Google Lens to immediately load AirSense NCR on your mobile device. Chrome will present the native WebAPK install badge directly.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <button
                        onClick={() => copyToClipboard(window.location.href, 'url')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {copiedCmd === 'url' ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            URL Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Web Link
                          </>
                        )}
                      </button>
                      <a
                        href="/manifest.webmanifest"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Manifest
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ANDROID APP CAPABILITIES */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <Zap className="h-4 w-4" />
                      </div>
                      Standalone WebAPK Shell
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      Launches in an isolated process without address bars or navigation clutter. Registered directly into Android’s app management system with full home screen pinning.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                        <WifiOff className="h-4 w-4" />
                      </div>
                      Service Worker Offline Cache
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      Pre-caches application bundles, fonts, atmospheric physics models, and station geometries. Works seamlessly even during network outages.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                        <CloudLightning className="h-4 w-4" />
                      </div>
                      Convective Radar & Sounding
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      Features dynamic CAPE, Lifted Index, simulated Doppler Radar storm cells, and urban waterlogging hotspot warnings tailored for NCR.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                      <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                        <Layers className="h-4 w-4" />
                      </div>
                      Android Maskable & Quick Shortcuts
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      Complies with Android 13/14 squircle adaptive icon specifications with 15% safe padding and quick app-icon shortcuts for Live AQI and Cloudburst Radar.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div className="text-xs text-emerald-950">
                    <span className="font-bold">Lighthouse PWA & Chromium Compliant:</span> Verified manifest schema, Service Worker lifecycle, WebAPK compatibility, and viewport configuration.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: APK / TWA / PLAY STORE CLI */}
            {activeTab === 'apk' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      Google Bubblewrap CLI (TWA to APK/AAB)
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `npx @bubblewrap/cli init --manifest=${window.location.origin}/manifest.webmanifest\nnpx @bubblewrap/cli build`,
                          'twa'
                        )
                      }
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedCmd === 'twa' ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedCmd === 'twa' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="mt-3 text-xs font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded-md">
{`# 1. Initialize Google Trusted Web Activity (TWA)
npx @bubblewrap/cli init --manifest=${typeof window !== 'undefined' ? window.location.origin : 'https://airsense-ncr.web.app'}/manifest.webmanifest

# 2. Build signed Android APK and Play Store AAB
npx @bubblewrap/cli build`}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-blue-400 font-mono">
                      Alternative: Capacitor Android Bridge
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          'npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "AirSense NCR" com.airsense.ncr --web-dir=dist\nnpx cap add android\nnpx cap open android',
                          'cap'
                        )
                      }
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedCmd === 'cap' ? <CheckCircle2 className="h-3 w-3 text-blue-400" /> : <Copy className="h-3 w-3" />}
                      {copiedCmd === 'cap' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="mt-3 text-xs font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded-md">
{`# Wrap with native Capacitor Android project
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "AirSense NCR" com.airsense.ncr --web-dir=dist
npx cap add android
npx cap open android`}
                  </pre>
                </div>

                <p className="text-xs text-slate-500">
                  Because AirSense NCR follows modern PWA and Web App Manifest specifications, Bubblewrap directly parses the manifest and generates an official Android Studio project ready for Google Play Store upload.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Android WebAPK Ready (Android 7.0+)</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
