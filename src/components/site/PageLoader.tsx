"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function PageLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black"
        >
          <div className="relative flex flex-col items-center gap-6">
            <div className="relative h-20 w-20">
              <span
                className="absolute inset-0 rounded-full border-2 border-[#00ff88]/30"
              />
              <motion.span
                className="absolute inset-0 rounded-full border-t-2 border-[#00ff88]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ borderRightColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "transparent" }}
              />
              <span
                className="absolute inset-3 rounded-full bg-[#00ff88]/20"
                style={{ animation: "loader-pulse 1.4s ease-in-out infinite" }}
              />
            </div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">
              Loading
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
