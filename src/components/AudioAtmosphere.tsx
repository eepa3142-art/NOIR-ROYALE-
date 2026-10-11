import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface AudioAtmosphereProps {
  language: Language;
}

export const AudioAtmosphere: React.FC<AudioAtmosphereProps> = ({ language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const t = translations[language].audio;

  const chords = [
    [130.81, 196.00, 246.94, 293.66], // Cmaj9 low
    [110.00, 164.81, 220.00, 261.63], // Amin9
    [146.83, 220.00, 261.63, 329.63], // Dmin9
    [98.00, 146.83, 196.00, 246.94],  // G13
  ];

  const playWarmChords = (ctx: AudioContext, gainNode: GainNode) => {
    let chordIndex = 0;

    const playNextChord = () => {
      const now = ctx.currentTime;
      const notes = chords[chordIndex % chords.length];
      chordIndex++;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450 + Math.random() * 100, now);

        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.04, now + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(now);
        osc.stop(now + 6.0);
      });
    };

    playNextChord();
    intervalRef.current = window.setInterval(playNextChord, 4800);
  };

  const toggleAudio = async () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setIsPlaying(false);
    } else {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioContextClass();
          const masterGain = ctx.createGain();
          masterGain.gain.value = 0.5;
          masterGain.connect(ctx.destination);

          audioCtxRef.current = ctx;
          gainNodeRef.current = masterGain;
          playWarmChords(ctx, masterGain);
        } else {
          await audioCtxRef.current.resume();
          if (gainNodeRef.current) {
            playWarmChords(audioCtxRef.current, gainNodeRef.current);
          }
        }
        setIsPlaying(true);
      } catch {
        // Fallback silently if audio blocked by browser policy
      }
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden sm:block">
      <button
        onClick={toggleAudio}
        className="group flex items-center gap-2.5 px-3 py-2 bg-[#121212]/90 hover:bg-[#191919] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-sm text-xs text-[#F5F1E8] shadow-2xl backdrop-blur-md transition-all cursor-pointer"
        title={isPlaying ? t.pause : t.play}
        aria-label={isPlaying ? t.pause : t.play}
      >
        <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
          {isPlaying ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-[#F5F1E8]/80 font-medium">
          {isPlaying ? t.pause : t.play}
        </span>
        {isPlaying && (
          <span className="flex items-center gap-0.5 ml-1">
            <span className="w-0.5 h-2 bg-[#D4AF37] animate-pulse" />
            <span className="w-0.5 h-3 bg-[#D4AF37] animate-pulse delay-75" />
            <span className="w-0.5 h-1.5 bg-[#D4AF37] animate-pulse delay-150" />
          </span>
        )}
      </button>
    </div>
  );
};
