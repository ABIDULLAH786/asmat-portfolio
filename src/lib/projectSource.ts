/**
 * Detect which platform a project's source URL points to so we can label
 * the public "view original" link with something more meaningful than a
 * generic "external link". Falls back to "View original" when the host
 * isn't recognized.
 */

import type { IconName } from "@/lib/icons";

export type ProjectSourcePlatform = {
  label: string; // e.g. "View on Behance"
  short: string; // e.g. "Behance"
  icon: IconName; // react-icons name resolvable by DynamicIcon
};

const RULES: Array<{ test: RegExp; platform: ProjectSourcePlatform }> = [
  { test: /(^|\.)dribbble\.com$/i,    platform: { label: "View on Dribbble",    short: "Dribbble",    icon: "FaDribbble" } },
  { test: /(^|\.)behance\.net$/i,     platform: { label: "View on Behance",     short: "Behance",     icon: "FaBehance" } },
  { test: /(^|\.)instagram\.com$/i,   platform: { label: "View on Instagram",   short: "Instagram",   icon: "FaInstagram" } },
  { test: /(^|\.)facebook\.com$/i,    platform: { label: "View on Facebook",    short: "Facebook",    icon: "FaFacebookF" } },
  { test: /(^|\.)linkedin\.com$/i,    platform: { label: "View on LinkedIn",    short: "LinkedIn",    icon: "FaLinkedinIn" } },
  { test: /(^|\.)tiktok\.com$/i,      platform: { label: "View on TikTok",      short: "TikTok",      icon: "FaTiktok" } },
  { test: /(^|\.)youtube\.com$/i,     platform: { label: "Watch on YouTube",    short: "YouTube",     icon: "FaYoutube" } },
  { test: /(^|\.)youtu\.be$/i,        platform: { label: "Watch on YouTube",    short: "YouTube",     icon: "FaYoutube" } },
  { test: /(^|\.)pinterest\.com$/i,   platform: { label: "View on Pinterest",   short: "Pinterest",   icon: "FaPinterestP" } },
  { test: /(^|\.)medium\.com$/i,      platform: { label: "Read on Medium",      short: "Medium",      icon: "FaMedium" } },
  { test: /(^|\.)x\.com$/i,           platform: { label: "View on X",           short: "X",           icon: "FaXTwitter" } },
  { test: /(^|\.)twitter\.com$/i,     platform: { label: "View on X",           short: "X",           icon: "FaXTwitter" } },
  { test: /(^|\.)threads\.net$/i,     platform: { label: "View on Threads",     short: "Threads",     icon: "FaThreads" } },
  { test: /(^|\.)github\.com$/i,      platform: { label: "View on GitHub",      short: "GitHub",      icon: "FaGithub" } },
];

const FALLBACK: ProjectSourcePlatform = {
  label: "View original",
  short: "Original",
  icon: "FaLink",
};

export function detectProjectSource(url: string | null | undefined): ProjectSourcePlatform | null {
  if (!url) return null;
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  for (const r of RULES) {
    if (r.test.test(host)) return r.platform;
  }
  return FALLBACK;
}
