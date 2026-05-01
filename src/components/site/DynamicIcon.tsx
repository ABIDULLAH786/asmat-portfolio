"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { iconLibFor, type IconName } from "@/lib/icons";

type Props = {
  name: string;
  className?: string;
  size?: number;
  style?: CSSProperties;
};

/**
 * Renders any react-icons icon by its string name (e.g. "FaLinkedinIn").
 * Lazy-loads only the matching icon library (Fa, Fi, Md, etc.) so we don't
 * ship the full ~50k-icon set up front.
 */
export default function DynamicIcon({ name, className, size = 20, style }: Props) {
  const [Comp, setComp] = useState<React.ComponentType<{ size?: number; className?: string; style?: CSSProperties }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const lib = iconLibFor(name as IconName);
    if (!lib) return;
    lib.loader().then((mod) => {
      if (cancelled) return;
      const C = (mod as Record<string, React.ComponentType<{ size?: number; className?: string; style?: CSSProperties }>>)[name];
      if (C) setComp(() => C);
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  if (!Comp) {
    return (
      <span
        className={className}
        style={{ display: "inline-block", width: size, height: size, ...style }}
        aria-hidden
      />
    );
  }
  return <Comp size={size} className={className} style={style} />;
}
