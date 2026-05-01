/**
 * react-icons library router.
 * Each icon name in react-icons is prefixed by its library code (Fa, Fi, Md, …).
 * We use that prefix to dynamically import only the right pack.
 */

export type IconName = string;

type IconLib = {
  prefix: string;
  label: string;
  loader: () => Promise<unknown>;
};

const LIBS: IconLib[] = [
  { prefix: "Fa6", label: "Font Awesome 6",  loader: () => import("react-icons/fa6") },
  { prefix: "Fa",  label: "Font Awesome",    loader: () => import("react-icons/fa") },
  { prefix: "Ai",  label: "Ant Design",      loader: () => import("react-icons/ai") },
  { prefix: "Bi",  label: "BoxIcons",        loader: () => import("react-icons/bi") },
  { prefix: "Bs",  label: "Bootstrap",       loader: () => import("react-icons/bs") },
  { prefix: "Ci",  label: "CoreUI",          loader: () => import("react-icons/ci") },
  { prefix: "Di",  label: "Devicons",        loader: () => import("react-icons/di") },
  { prefix: "Fi",  label: "Feather",         loader: () => import("react-icons/fi") },
  { prefix: "Fc",  label: "Flat Color",      loader: () => import("react-icons/fc") },
  { prefix: "Gi",  label: "Game Icons",      loader: () => import("react-icons/gi") },
  { prefix: "Go",  label: "GitHub Octicons", loader: () => import("react-icons/go") },
  { prefix: "Gr",  label: "Grommet",         loader: () => import("react-icons/gr") },
  { prefix: "Hi2", label: "Heroicons 2",     loader: () => import("react-icons/hi2") },
  { prefix: "Hi",  label: "Heroicons",       loader: () => import("react-icons/hi") },
  { prefix: "Im",  label: "IcoMoon",         loader: () => import("react-icons/im") },
  { prefix: "Io5", label: "Ionicons 5",      loader: () => import("react-icons/io5") },
  { prefix: "Io",  label: "Ionicons",        loader: () => import("react-icons/io") },
  { prefix: "Lia", label: "Line Awesome",    loader: () => import("react-icons/lia") },
  { prefix: "Lu",  label: "Lucide",          loader: () => import("react-icons/lu") },
  { prefix: "Md",  label: "Material",        loader: () => import("react-icons/md") },
  { prefix: "Pi",  label: "Phosphor",        loader: () => import("react-icons/pi") },
  { prefix: "Ri",  label: "Remix",           loader: () => import("react-icons/ri") },
  { prefix: "Si",  label: "Simple Icons",    loader: () => import("react-icons/si") },
  { prefix: "Sl",  label: "Simple Line",     loader: () => import("react-icons/sl") },
  { prefix: "Tb",  label: "Tabler",          loader: () => import("react-icons/tb") },
  { prefix: "Ti",  label: "Typicons",        loader: () => import("react-icons/ti") },
  { prefix: "Vsc", label: "VS Code",         loader: () => import("react-icons/vsc") },
  { prefix: "Wi",  label: "Weather",         loader: () => import("react-icons/wi") },
];

// Ordered longest-prefix-first so "Hi2" matches before "Hi"
const SORTED = [...LIBS].sort((a, b) => b.prefix.length - a.prefix.length);

export function iconLibFor(name: IconName): IconLib | undefined {
  return SORTED.find((l) => name.startsWith(l.prefix));
}

export function allLibs() {
  return LIBS;
}

/** A small curated default list shown when the picker opens with no query. */
export const POPULAR_ICONS = [
  "FaLinkedinIn",
  "FaInstagram",
  "FaFacebookF",
  "FaXTwitter",
  "FaYoutube",
  "FaTiktok",
  "FaBehance",
  "FaDribbble",
  "FaPinterestP",
  "FaGithub",
  "FaThreads",
  "FaWhatsapp",
  "FaSnapchatGhost",
  "FaTelegram",
  "FaDiscord",
  "FaMedium",
  "FaReddit",
  "FaSlack",
  "FaGlobe",
  "FaEnvelope",
  "FaPhone",
  "FaMapMarkerAlt",
  "FaLink",
];
