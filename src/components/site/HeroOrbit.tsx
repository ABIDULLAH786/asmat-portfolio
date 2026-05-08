"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroOrbit({ profileSrc }: { profileSrc: string | null }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* Rings */}
      <motion.span
        className="absolute inset-0 rounded-full border border-[#00ff88]/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ff88] shadow-[0_0_18px_#00ff88]" />
      </motion.span>
      <motion.span
        className="absolute inset-6 rounded-full border border-[#00ff88]/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#00ff88]" />
      </motion.span>
      <span className="absolute inset-12 rounded-full border border-dashed border-[#00ff88]/15" />

      {/* Profile / placeholder */}
      <div className="absolute inset-16 overflow-hidden rounded-full border-2 border-[#00ff88]/40 bg-gradient-to-br from-[#0a0a0a] to-black shadow-[0_0_60px_rgba(0,255,136,0.25)]">
        {profileSrc ? (
          <Image
            src={profileSrc}
            alt="Profile"
            fill
            sizes="(max-width: 768px) 320px, 420px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-7xl font-bold text-[#00ff88]/70">
            AM
          </div>
        )}
      </div>
    </div>
  );
}
