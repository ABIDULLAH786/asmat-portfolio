// Hand-rolled types matching supabase/schema.sql

export type LogoSize = 60 | 80 | 100;

export type SiteSettings = {
  id: number;
  logo_url: string | null;
  logo_size: LogoSize;
  resume_url: string | null;
  resume_label: string | null;
  profile_image: string | null;
  hero_name: string;
  brand_name: string | null;
  hero_tagline: string;
  hero_intro: string;
  updated_at: string;
};

export type AboutContent = {
  id: number;
  intro: string;
  journey: string;
  bio: string | null;
  show_skill_bars: boolean;
  updated_at: string;
};

export type CoreValue = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
};

export type Skill = {
  id: string;
  name: string;
  percentage: number;
  show_bar: boolean;
  sort_order: number;
  category: string | null;
  icon_url: string | null;
  created_at: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  description: string | null;
  start_date: string; // ISO date
  end_date: string | null;
  sort_order: number;
  logo_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  cover_image: string | null;
  sort_order: number;
  tags: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectSlide = {
  id: string;
  project_id: string;
  title: string | null;
  description: string | null;
  images: string[];
  sort_order: number;
  created_at: string;
};

export type ProcessStep = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
};

export type ContactInfo = {
  id: number;
  email: string;
  phone: string | null;
  location: string;
  blurb: string;
  updated_at: string;
};

export type SocialZone = "contact" | "follow_work" | "footer";

export type SocialLink = {
  id: string;
  zone: SocialZone;
  label: string;
  url: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type Note = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  external_link: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};
