"use client";

import { useEffect, useRef } from "react";

export default function HangoverEffect() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Apply the visual hangover effect to the whole page immediately
    document.documentElement.classList.add("hangover-active");

    if (!audioRef.current) {
      audioRef.current = new Audio("https://upload.wikimedia.org/wikipedia/commons/4/4b/Shepard_tone.ogg");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }

    const startAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch((e) => console.log("Audio autoplay prevented", e));
      }
    };

    // Listen for any user interaction to start the audio
    document.addEventListener("click", startAudio, { once: true });
    document.addEventListener("keydown", startAudio, { once: true });

    return () => {
      document.documentElement.classList.remove("hangover-active");
      if (audioRef.current) {
        audioRef.current.pause();
      }
      document.removeEventListener("click", startAudio);
      document.removeEventListener("keydown", startAudio);
    };
  }, []);

  return null;
}
