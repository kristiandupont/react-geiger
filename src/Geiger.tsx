import {
  type FC,
  Profiler,
  type ProfilerOnRenderCallback,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

function playGeigerSoundFile(
  audioContext: AudioContext,
  src: string,
  amplitude: number
) {
  const audioElement = new Audio(src);
  const audioSource = audioContext.createMediaElementSource(audioElement);
  audioSource.connect(audioContext.destination);
  audioElement.volume = amplitude;
  //  Limit audio to 1s
  audioElement.play();
  setTimeout(() => {
    audioElement.pause();
    audioElement.currentTime = 0;
  }, 1000);
}

function playGeigerClickSound(audioContext: AudioContext, amplitude: number) {
  const volume = Math.max(0.5, amplitude);
  const duration = 0.001;
  const startFrequency = 440 + amplitude * 200;

  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(startFrequency, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    220,
    audioContext.currentTime + duration
  );

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, duration / 2);

  // Connect the oscillator to the gain node and the gain node to the destination
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

type PhaseOption = "mount" | "update" | "both";

/**
 * Geiger is a React component that plays a Geiger click sound when a component
 * takes longer to render than a given threshold.
 *
 * @param {string} [profilerId="geiger"] - The id of the Profiler component.
 * @param {number} [renderTimeThreshold=50] - The threshold in milliseconds.
 * @param {PhaseOption} [phaseOption="both"] - The phase to listen for (mount, update, or both).
 * @param {string} [customSound] - The path to a custom sound file, if you want to replace the default
 * @param {boolean} [enabled=true] - Whether Geiger is enabled.
 *
 * @example
 * ```tsx
 * <Geiger renderTimeThreshold={10}>
 *  <App />
 * </Geiger>
 * ```
 */
const Geiger: FC<{
  profilerId?: string;
  renderTimeThreshold?: number;
  phaseOption?: PhaseOption;
  customSound?: string;
  enabled?: boolean;
  children: ReactNode;
}> = ({
  profilerId = "geiger",
  renderTimeThreshold = 50,
  phaseOption = "both",
  customSound,
  enabled = true,
  children,
}) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const handleRender = useCallback<ProfilerOnRenderCallback>(
    (_id, phase, actualDuration) => {
      if (
        (phase === phaseOption || phaseOption === "both") &&
        actualDuration > renderTimeThreshold &&
        audioContext
      ) {
        const amplitude = Math.min(
          1,
          (actualDuration - renderTimeThreshold) / (renderTimeThreshold * 2)
        );

        if (customSound && typeof customSound == "string") {
          if (customSound === "") {
            console.warn("The sound file path is empty");
          }
          playGeigerSoundFile(audioContext, customSound, amplitude);
        } else playGeigerClickSound(audioContext, amplitude);
      }
    },
    [audioContext, phaseOption, renderTimeThreshold]
  );

  useEffect(() => {
    if (enabled) {
      const audioContext = new (window.AudioContext ||
        // @ts-expect-error -- This is a fallback for Safari
        window.webkitAudioContext)();

      if (audioContext.state === "running") {
        console.info(`Geiger is ${enabled ? "enabled" : "disabled"}`);
        setAudioContext(audioContext);
      } else {
        console.warn(
          "Geiger: AudioContext did not start. To enable Geiger, you need to give permission to play audio on this page."
        );
      }
    }
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Profiler id={profilerId} onRender={handleRender}>
      {children}
    </Profiler>
  );
};

export default Geiger;
