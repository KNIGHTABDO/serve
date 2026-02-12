
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Copy, Check, ExternalLink, Github } from 'lucide-react';
import { startDeviceFlow, checkTokenStatus } from '@/lib/tauri/auth';
import { open } from '@tauri-apps/plugin-shell';

interface AuthModalProps {
  onAuthenticated: () => void;
}

export function AuthModal({ onAuthenticated }: AuthModalProps) {
  const [step, setStep] = useState<'start' | 'device' | 'success'>('start');
  const [deviceData, setDeviceData] = useState<{ user_code: string; verification_uri: string; device_code: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const startLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await startDeviceFlow();
      setDeviceData({
        user_code: data.userCode,
        verification_uri: data.verificationUri,
        device_code: data.deviceCode,
      });
      setStep('device');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic polling with recursive setTimeout
  useEffect(() => {
    let pollTimeout: ReturnType<typeof setTimeout>;
    let isActive = true;

    const poll = async (delay: number) => {
      if (!isActive || step !== 'device') return;

      try {
        const data = await checkTokenStatus();
        if (!isActive) return;

        let nextDelay = 5000;

        if (data.status === 'success' || data.access_token) {
          setStep('success');
          setTimeout(() => onAuthenticated(), 1000);
          return;
        }

        if (data.status === 'slow_down') {
          nextDelay = 10000;
        } else if (data.status === 'pending') {
          nextDelay = 5000;
        } else if (data.status === 'expired') {
          setError('Code expired. Please try again.');
          setStep('start');
          return;
        } else if (data.status === 'error') {
          setError(data.error || 'Unknown error');
          setStep('start');
          return;
        }

        pollTimeout = setTimeout(() => poll(nextDelay), nextDelay);
      } catch (e) {
        console.error("Poll error", e);
        pollTimeout = setTimeout(() => poll(5000), 5000);
      }
    };

    if (step === 'device') {
      pollTimeout = setTimeout(() => poll(5000), 5000);
    }

    return () => {
      isActive = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [step]);

  const copyCode = () => {
    if (deviceData?.user_code) {
      navigator.clipboard.writeText(deviceData.user_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openLink = async (url: string) => {
    try {
      await open(url);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-white/5 rounded-full">
            <Github className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-light tracking-wide text-white">
            {step === 'start' && "Connect Copilot"}
            {step === 'device' && "Authorize Device"}
            {step === 'success' && "Connected"}
          </h2>

          {step === 'start' && (
            <div className="space-y-4 w-full">
              <p className="text-white/50 text-sm">
                Access your GitHub Copilot subscription securely via Device Flow.
              </p>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                onClick={startLogin}
                disabled={loading}
                className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Login"}
              </button>
            </div>
          )}

          {step === 'device' && deviceData && (
            <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-2">
                <p className="text-xs text-white/40 uppercase tracking-widest">User Code</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xl font-mono text-blue-400 tracking-wider">
                    {deviceData.user_code}
                  </code>
                  <button
                    onClick={copyCode}
                    className="p-2 hover:bg-white/10 rounded-md transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-white/60">
                  Copy the code above, then authorize via GitHub:
                </p>
                <button
                  onClick={() => openLink(deviceData.verification_uri)}
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Open GitHub Activation <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-white/30">
                <Loader2 className="w-3 h-3 animate-spin" />
                Waiting for authorization...
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-green-400 flex flex-col items-center gap-2 animate-in zoom-in duration-300">
              <Check className="w-12 h-12" />
              <p>Successfully linked!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
