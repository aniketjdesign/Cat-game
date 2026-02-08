import * as Tone from 'tone';

export class AudioSystem {
  private synth = new Tone.Synth({
    oscillator: { type: 'square8' },
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.1 },
  }).toDestination();

  private started = false;

  async ensureStarted(): Promise<void> {
    if (!this.started) {
      await Tone.start();
      this.started = true;
    }
  }

  async play(action: 'feed' | 'water' | 'play' | 'cleanLitter' | 'pet' | 'ui'): Promise<void> {
    await this.ensureStarted();

    const note =
      action === 'feed'
        ? 'C5'
        : action === 'water'
          ? 'E5'
          : action === 'play'
            ? 'G5'
            : action === 'cleanLitter'
              ? 'A4'
              : action === 'pet'
                ? 'D5'
                : 'B4';

    this.synth.triggerAttackRelease(note, '16n');
  }
}
