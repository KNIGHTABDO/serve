/**
 * SERVE Resonance Engine — Procedural, Reactive Soundscapes
 * Uses Web Audio API to synthesize drones and resonances live.
 */

class ResonanceEngine {
    private ctx: AudioContext | null = null;
    private drone: OscillatorNode | null = null;
    private shimmer: OscillatorNode | null = null;
    private noise: AudioWorkletNode | null = null;
    private masterGain: GainNode | null = null;
    private filter: BiquadFilterNode | null = null;
    private isRunning: boolean = false;

    async init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Master Gain (Volume)
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.05; // Very subtle
        this.masterGain.connect(this.ctx.destination);

        // Low-pass Filter (The "Darkness")
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 150;
        this.filter.connect(this.masterGain);

        // Deep Drone (Base)
        this.drone = this.ctx.createOscillator();
        this.drone.type = 'sine';
        this.drone.frequency.value = 55; // A1 note
        this.drone.connect(this.filter);
        this.drone.start();

        // High Resonance (The "Silver")
        this.shimmer = this.ctx.createOscillator();
        this.shimmer.type = 'sine';
        this.shimmer.frequency.value = 880; // A5 note
        const shimmerGain = this.ctx.createGain();
        shimmerGain.gain.value = 0; // Starts silent
        this.shimmer.connect(shimmerGain);
        shimmerGain.connect(this.masterGain);
        this.shimmer.start();

        this.isRunning = true;
        this.setupListeners(shimmerGain);
    }

    private setupListeners(shimmerGain: GainNode) {
        window.addEventListener('serve-thinking-start', () => {
            if (!this.ctx || !this.isRunning) return;
            // Fade in the shimmer
            shimmerGain.gain.setTargetAtTime(0.02, this.ctx.currentTime, 1.5);
            this.filter!.frequency.setTargetAtTime(300, this.ctx.currentTime, 2);
        });

        window.addEventListener('serve-thinking-stop', () => {
            if (!this.ctx || !this.isRunning) return;
            // Fade out the shimmer
            shimmerGain.gain.setTargetAtTime(0, this.ctx.currentTime, 2);
            this.filter!.frequency.setTargetAtTime(150, this.ctx.currentTime, 3);
        });
    }

    stop() {
        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
            this.isRunning = false;
        }
    }

    setVolume(val: number) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(val, this.ctx!.currentTime, 0.1);
        }
    }
}

export const resonance = new ResonanceEngine();
