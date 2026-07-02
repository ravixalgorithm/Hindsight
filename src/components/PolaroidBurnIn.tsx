"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function PolaroidBurnIn() {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // Only run once per app load
    const timer = setTimeout(() => setMounted(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ filter: "brightness(3)", opacity: 1, backgroundColor: "#FFFFFF" }}
      animate={{ filter: "brightness(1)", opacity: 0, backgroundColor: "transparent" }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      className="fixed inset-0 z-[100] pointer-events-none"
    />
  );
}
