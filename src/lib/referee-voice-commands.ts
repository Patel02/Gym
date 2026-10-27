/**
 * Official IPF Platform Verbal Commands & Jury Audio Synthesizer
 * Offline, Web Speech API + Web Audio API synthesizer.
 */

class RefereeVoiceEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Voice speech command using browser speech synthesis
  public speakCommand(commandText: string): void {
    if (this.isMuted) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel(); // Cancel any overlapping speech
        const utterance = new SpeechSynthesisUtterance(commandText);
        utterance.rate = 1.05; // Firm, authoritative pace
        utterance.pitch = 0.95;
        utterance.volume = 1.0;

        // Prefer natural English voices
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("David"))
        );
        if (preferred) utterance.voice = preferred;

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis fallback tone triggered", err);
      }
    }
  }

  // Verbal commands
  public commandSquat(): void {
    this.speakCommand("Squat!");
  }

  public commandRack(): void {
    this.speakCommand("Rack!");
  }

  public commandBenchStart(): void {
    this.speakCommand("Start!");
  }

  public commandBenchPress(): void {
    this.speakCommand("Press!");
  }

  public commandDeadliftDown(): void {
    this.speakCommand("Down!");
  }

  // White Light 3-Tone Chime (Pass)
  public playWhiteLightChime(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.1); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.2); // D6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Red Light Dual-Tone Buzzer (No Lift)
  public playRedLightBuzzer(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "sawtooth";
    osc1.frequency.setValueAtTime(140, now);
    osc2.frequency.setValueAtTime(110, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  }

  // Technical Jury Alert Horn
  public playJuryHorn(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(330, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  }
}

export const refereeVoice = new RefereeVoiceEngine();
