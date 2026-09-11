// Voice Manager: Handles microphone capture, audio recording, volume analysis, audio streaming, and speech recognition

export interface VoiceRecordingResult {
  audioData: string; // Base64 Data URL (e.g. data:audio/webm;base64,...)
  duration: number; // in seconds
  transcript?: string;
}

export type VoiceStateCallback = (state: {
  isRecording: boolean;
  audioLevel: number; // 0 to 100
  permissionGranted: boolean;
  permissionError: string | null;
  liveTranscript: string;
}) => void;

class VoiceManager {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private startTime: number = 0;
  private recognition: any = null;
  private liveTranscript: string = '';
  private isContinuousStreaming: boolean = false;

  public isRecording: boolean = false;
  public audioLevel: number = 0;
  public permissionGranted: boolean = false;
  public permissionError: string | null = null;
  private listeners: Set<VoiceStateCallback> = new Set();

  constructor() {
    this.initSpeechRecognition();
  }

  public subscribe(cb: VoiceStateCallback) {
    this.listeners.add(cb);
    this.notify();
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const state = {
      isRecording: this.isRecording,
      audioLevel: this.audioLevel,
      permissionGranted: this.permissionGranted,
      permissionError: this.permissionError,
      liveTranscript: this.liveTranscript
    };
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch {
        // ignore
      }
    });
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ar-SA';

        this.recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              this.liveTranscript = event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (interim) {
            this.liveTranscript = interim;
          }
          this.notify();
        };

        this.recognition.onerror = () => {
          // ignore recognition errors gracefully
        };
      } catch {
        this.recognition = null;
      }
    }
  }

  /**
   * Request Microphone Permission & Initialize Audio Context Analyser
   */
  public async requestMicPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.permissionError = 'المتصفح لا يدعم الوصول للمايكروفون';
      this.permissionGranted = false;
      this.notify();
      return false;
    }

    try {
      this.permissionError = null;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaStream = stream;
      this.permissionGranted = true;
      this.permissionError = null;

      // Set up audio analyzer for VU meter
      this.initAnalyser(stream);
      this.notify();
      return true;
    } catch (err: any) {
      this.permissionGranted = false;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.permissionError = 'تم رفض الإذن بالوصول للمايكروفون. يرجى السماح به من إعدادات المتصفح.';
      } else if (err.name === 'NotFoundError') {
        this.permissionError = 'لم يتم العثور على مايكروفون متصل بجهازك.';
      } else {
        this.permissionError = `تعذر تفعيل المايكروفون: ${err.message || 'خطأ غير معروف'}`;
      }
      this.notify();
      return false;
    }
  }

  private initAnalyser(stream: MediaStream) {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.5;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // scale to 0-100
        const level = Math.min(100, Math.round((avg / 128) * 100));

        if (this.audioLevel !== level) {
          this.audioLevel = level;
          this.notify();
        }

        this.animFrameId = requestAnimationFrame(updateLevel);
      };

      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.animFrameId = requestAnimationFrame(updateLevel);
    } catch {
      // ignore analyzer errors
    }
  }

  /**
   * Start Recording Voice (Push-to-Talk or Continuous Note)
   */
  public async startRecording(): Promise<boolean> {
    if (!this.mediaStream || !this.permissionGranted) {
      const ok = await this.requestMicPermission();
      if (!ok) return false;
    }

    if (!this.mediaStream) return false;

    try {
      this.audioChunks = [];
      this.liveTranscript = '';
      this.startTime = Date.now();

      // Determine supported mime type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac'
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const options: MediaRecorderOptions = {
        mimeType: selectedMime || undefined,
        audioBitsPerSecond: 32000 // Ultra-lightweight Opus speech compression for zero-delay transmission
      };
      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // 100ms timeslices
      this.isRecording = true;

      // Start speech recognition if available
      if (this.recognition) {
        try {
          this.recognition.start();
        } catch {
          // already started or unavailable
        }
      }

      this.notify();
      return true;
    } catch (err: any) {
      this.permissionError = `فشل بدء التسجيل: ${err.message}`;
      this.isRecording = false;
      this.notify();
      return false;
    }
  }

  /**
   * Stop Recording and return Base64 Audio Data URL + duration + transcription
   */
  public async stopRecording(): Promise<VoiceRecordingResult | null> {
    if (!this.isRecording || !this.mediaRecorder) {
      this.isRecording = false;
      this.notify();
      return null;
    }

    return new Promise((resolve) => {
      const recorder = this.mediaRecorder!;
      const durationSeconds = Math.max(0.5, (Date.now() - this.startTime) / 1000);

      recorder.onstop = () => {
        this.isRecording = false;

        // Stop recognition
        if (this.recognition) {
          try {
            this.recognition.stop();
          } catch {
            // ignore
          }
        }

        const mime = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mime });

        if (audioBlob.size === 0) {
          this.notify();
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          this.notify();
          resolve({
            audioData: base64Audio,
            duration: parseFloat(durationSeconds.toFixed(1)),
            transcript: this.liveTranscript.trim() || undefined
          });
        };
        reader.onerror = () => {
          this.notify();
          resolve(null);
        };
        reader.readAsDataURL(audioBlob);
      };

      try {
        recorder.stop();
      } catch {
        this.isRecording = false;
        this.notify();
        resolve(null);
      }
    });
  }

  public cancelRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.ondataavailable = null;
      this.mediaRecorder.onstop = null;
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    this.isRecording = false;
    this.audioChunks = [];
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.notify();
  }

  /**
   * Play any base64 Audio Voice Note
   */
  public playAudio(audioData: string, volume: number = 1.0): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    try {
      const audio = new Audio(audioData);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch(() => {
        // user interaction might be required
      });
      return audio;
    } catch {
      return null;
    }
  }

  /**
   * Clean up mic tracks when done
   */
  public cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.permissionGranted = false;
    this.isRecording = false;
    this.notify();
  }
}

export const voiceManager = new VoiceManager();
