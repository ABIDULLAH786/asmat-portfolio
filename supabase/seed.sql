-- =====================================================================
-- Asmat Portfolio — initial data import
-- =====================================================================
-- Source: profile.json, core_values.json, skills.json, experiences.json,
--         process_steps.json, projects.json, messages.json
--
-- WHAT THIS SCRIPT DOES (idempotent — safe to re-run):
--   1. Adds new columns to preserve every field from your JSON:
--        skills.category, skills.icon_url
--        experiences.logo_url
--        about_content.bio
--        projects.tags (text[]), projects.featured (boolean)
--   2. UPDATEs site_settings, about_content, contact_info from profile.json
--   3. CLEARS and re-seeds: social_links, core_values, skills,
--      experiences, process_steps, categories, projects, project_slides
--
-- ⚠ WARNING: this REPLACES content in the multi-row tables above.
--   If you've already added rows in the admin, they will be deleted.
--
-- Run this AFTER schema.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Schema additions (all nullable / defaulted)
-- ---------------------------------------------------------------------
alter table public.skills          add column if not exists category   text;
alter table public.skills          add column if not exists icon_url   text;
alter table public.experiences     add column if not exists logo_url   text;
alter table public.about_content   add column if not exists bio        text;
alter table public.projects        add column if not exists tags       text[] default '{}'::text[];
alter table public.projects        add column if not exists featured   boolean default false;

-- ---------------------------------------------------------------------
-- 2. site_settings (singleton)  — from profile.json
-- ---------------------------------------------------------------------
update public.site_settings set
  logo_url      = 'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/Muntazir%20Designs%20%E2%80%94%20Personal%20Brand%20Logo/Logo%20JPG.jpg?raw=true',
  logo_size     = 100,
  resume_url    = null,
  profile_image = 'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Profile%20Pic%20-%20Avatar/Profile%20Pic.jpg?raw=true',
  hero_name     = 'Muntazir Designs',
  hero_tagline  = 'Precision in every pixel',
  hero_intro    = 'Creative graphic designer with 1.5 years of experience in branding, marketing, and visual storytelling.',
  updated_at    = now()
where id = 1;

-- ---------------------------------------------------------------------
-- 3. about_content  — from profile.json `about` (split into intro + journey)
-- ---------------------------------------------------------------------
update public.about_content set
  bio     = 'Creative graphic designer with 1.5 years of experience in branding, marketing, and visual storytelling.',
  intro   = 'I''m Asmat Muntazir, a graphic designer focused on creating visuals that are both meaningful and impactful. I believe design is not just about aesthetics, but about communicating ideas clearly and effectively.',
  journey = 'I developed my skills through learning from GFX Mentor, Satori Graphics, and Envato Tuts+, along with formal training from DigiSkills (Virtual University of Pakistan). I gained hands-on experience through an online internship at Developer Hub Corporation and an onsite internship at Plus Printers. I have also worked professionally with Burger Plus and Plus Printers, creating social media designs, promotional content, and Packaging Design.

My work covers a wide range of design areas, including: Art & Illustration, Visual Identity Design, Marketing & Advertising Design, Publication Design, Packaging Design, Environmental Design, Photo Manipulation, etc.

I''m highly skilled in tools like Adobe Photoshop and Illustrator, and also work with InDesign, Figma, and Canva when needed.

Beyond tools, I have a strong understanding of core design principles such as color theory, typography, composition, visual hierarchy, and branding consistency — ensuring every design is both creative and purposeful.

Outside of design, I''m passionate about photography, traveling, and capturing moments from different perspectives. I also enjoy singing and writing poetry, and I''m the author of a poetry book — something that deeply influences my creative thinking and storytelling approach in design.',
  show_skill_bars = false,
  updated_at = now()
where id = 1;

-- ---------------------------------------------------------------------
-- 4. contact_info  — from profile.json
-- ---------------------------------------------------------------------
update public.contact_info set
  email    = 'asmat.muntazir5@gmail.com',
  phone    = '+92 324 2724882',
  location = 'Lahore, Pakistan',
  blurb    = 'Available for freelance work and collaborations.',
  updated_at = now()
where id = 1;

-- ---------------------------------------------------------------------
-- 5. social_links — clear and re-seed across all 3 zones from profile.json
-- ---------------------------------------------------------------------
delete from public.social_links;

-- Footer (compact icons)
insert into public.social_links (zone, label, url, icon, sort_order) values
  ('footer', 'LinkedIn',  'https://www.linkedin.com/company/muntazir-designs/', 'FaLinkedinIn', 1),
  ('footer', 'Instagram', 'https://www.instagram.com/muntazir.design5/',         'FaInstagram',  2),
  ('footer', 'Facebook',  'https://web.facebook.com/profile.php?id=61586487555741', 'FaFacebookF', 3),
  ('footer', 'Behance',   'https://www.behance.net/asmatkhan786',                 'FaBehance',    4),
  ('footer', 'Dribbble',  'https://dribbble.com/myartandartist',                  'FaDribbble',   5),
  ('footer', 'TikTok',    'https://www.tiktok.com/@muntazir.design5',             'FaTiktok',     6),
  ('footer', 'GitHub',    'https://github.com/Muntazir-Designs',                  'FaGithub',     7);

-- "Follow My Work" block on Contact page (large icons)
insert into public.social_links (zone, label, url, icon, sort_order) values
  ('follow_work', 'LinkedIn',  'https://www.linkedin.com/company/muntazir-designs/', 'FaLinkedinIn', 1),
  ('follow_work', 'Behance',   'https://www.behance.net/asmatkhan786',                 'FaBehance',    2),
  ('follow_work', 'Dribbble',  'https://dribbble.com/myartandartist',                  'FaDribbble',   3),
  ('follow_work', 'Instagram', 'https://www.instagram.com/muntazir.design5/',          'FaInstagram',  4),
  ('follow_work', 'Facebook',  'https://web.facebook.com/profile.php?id=61586487555741','FaFacebookF', 5),
  ('follow_work', 'TikTok',    'https://www.tiktok.com/@muntazir.design5',             'FaTiktok',     6),
  ('follow_work', 'GitHub',    'https://github.com/Muntazir-Designs',                  'FaGithub',     7);

-- ---------------------------------------------------------------------
-- 6. core_values  — from core_values.json (Lucide names → react-icons "Lu*")
-- ---------------------------------------------------------------------
delete from public.core_values;
insert into public.core_values (title, description, icon, sort_order) values
  ('Creativity',          'Bringing fresh, original ideas to every project to deliver designs that stand out and leave a lasting impression.', 'LuLightbulb', 1),
  ('Quality',             'Committed to delivering high-end, pixel-perfect designs that meet professional standards and exceed client expectations.', 'LuStar',     2),
  ('Client-Focused',      'Your vision comes first. I listen carefully, understand your needs, and craft designs that truly reflect your brand.', 'LuUsers',    3),
  ('Attention to Detail', 'Every line, color, and pixel matters. I focus on the small details that turn good designs into great ones.',          'LuEye',      4),
  ('Timely Delivery',     'Respecting deadlines is part of professionalism. I make sure every project is delivered on time, every time.',         'LuRocket',   5),
  ('Communication',       'Clear, honest, and consistent communication throughout the project ensures smooth collaboration and zero confusion.', 'LuSmile',    6);

-- ---------------------------------------------------------------------
-- 7. skills  — from skills.json (with new category + icon_url cols)
-- ---------------------------------------------------------------------
delete from public.skills;
insert into public.skills (name, percentage, show_bar, sort_order, category, icon_url) values
  ('Adobe Photoshop',   90, false, 0, 'Tools', 'https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg'),
  ('Adobe Illustrator', 90, false, 1, 'Tools', 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Adobe_Illustrator_CC_icon.svg'),
  ('Adobe InDesign',    60, false, 2, 'Tools', 'https://upload.wikimedia.org/wikipedia/commons/4/48/Adobe_InDesign_CC_icon.svg'),
  ('Canva',             60, false, 3, 'Tools', 'https://static.canva.com/domain-assets/canva/static/images/android-192x192-2.png');

-- ---------------------------------------------------------------------
-- 8. experiences  — from experiences.json (with new logo_url col)
-- ---------------------------------------------------------------------
delete from public.experiences;
insert into public.experiences (company, role, description, start_date, end_date, sort_order, logo_url) values
  ('Plus Printers, Lahore',                'Graphic Designer — Plus Printers',
   'Working as a Graphic Designer at Plus Printers, Lahore, handling design work for projects like Boxes For Product and Aqua Printers. Responsible for creating social media posts, web graphics, packaging designs, banners, and branding visuals to support both brands'' digital and marketing presence.',
   '2026-01-12', null, 0,
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Company%20Logos%20-%20Experience/Plus%20Printers%20Logo.png?raw=true'),

  ('Burger Plus, Lahore',                  'Social Media Graphic Designer — Burger Plus',
   'Working as a Graphic Designer and Social Media Assistant at Burger Plus, creating social media posts, food product visuals, and branding graphics to strengthen the restaurant''s digital presence and visual identity.',
   '2026-01-20', null, 1,
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Company%20Logos%20-%20Experience/Burger%20Plus%20logo.png?raw=true'),

  ('Developers Hub Corporation',           'Graphic Design Intern — Developers Hub Corporation',
   'Completed a 3-month online graphic design internship at Developers Hub Corporation, working on real projects under expert mentorship. Gained hands-on experience in branding, social media design, and creative workflows while strengthening both theoretical knowledge and practical design skills.',
   '2025-11-01', '2026-02-01', 2,
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Company%20Logos%20-%20Experience/developershub_corporation_logo.jpg?raw=true'),

  ('DigiSkills — Online Learning Platform','Graphic Design Trainee — DigiSkills',
   'Completed a 4-month Graphic Designing course on DigiSkills, an online learning platform. Gained hands-on experience with Adobe Photoshop and Illustrator, learned core design principles, and worked on multiple practice projects to build a strong portfolio and develop professional design skills.',
   '2025-07-05', '2025-10-10', 3,
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Company%20Logos%20-%20Experience/digi%20skills.png?raw=true'),

  ('GFX Mentor — YouTube Learning Platform','Graphic Design Trainee — GFX Mentor',
   'Learned graphic designing through GFX Mentor, a YouTube-based learning platform, completing full courses on Adobe Photoshop, Illustrator, and design theory. Worked on multiple practice projects in art and illustration, logo design, and social media posting to strengthen my skills and build a solid portfolio.',
   '2025-01-25', '2025-06-29', 4,
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Company%20Logos%20-%20Experience/gfx.png?raw=true'),

  ('SundarSTEM School, Lahore',            'Graphic Designer — Media Team Member',
   'Worked as a Graphic Designer and Media Team Member at Sundar STEM School, contributing to event photography, content creation, and website updates for www.sundarstem.edu.pk. Supported the school''s digital communication efforts to enhance its online presence and community engagement.',
   '2025-01-03', '2025-06-03', 5,
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Company%20Logos%20-%20Experience/logo-half.webp?raw=true');

-- ---------------------------------------------------------------------
-- 9. process_steps  — from process_steps.json
-- ---------------------------------------------------------------------
delete from public.process_steps;
insert into public.process_steps (title, description, icon, sort_order) values
  ('Research',              'Every great design starts with understanding. I dive deep into your brand, audience, goals, and competitors to build a strong foundation for the project.',                'LuGlobe',    1),
  ('Strategy',              'Turning insights into a clear roadmap. I define project goals, scope, and creative direction to ensure every step aligns with your vision.',                              'LuBookOpen', 2),
  ('Ideation',              'Exploring multiple creative directions and brainstorming fresh ideas to find the perfect concept that fits your brand and goals.',                                          'LuSparkles', 3),
  ('Prototyping',           'Creating interactive prototypes to test the design''s flow, usability, and feel before final development — making sure everything works smoothly.',                         'LuLayers',   4),
  ('Feedback & Revisions',  'Collaboration is key. I share progress, listen to your feedback, and refine the design until it perfectly matches your vision.',                                            'LuPenTool',  5),
  ('User-Centered Design',  'Designing with real people in mind. I focus on creating experiences that are intuitive, engaging, and tailored to your users'' needs.',                                    'LuUsers',    6),
  ('Final Delivery',        'Delivering the final, polished files in all the formats you need — ready to launch, print, or share with the world.',                                                       'LuRocket',   7);

-- ---------------------------------------------------------------------
-- 10. categories  — replace defaults with the user's actual category list
--     (extracted from projects.json `category` field)
-- ---------------------------------------------------------------------
-- Wipe project_slides and projects first (FK to categories).
delete from public.project_slides;
delete from public.projects;
delete from public.categories;

insert into public.categories (name, slug, sort_order) values
  ('Visual Identity Design & Branding',     'visual-identity-branding',  1),
  ('Logo Design',                           'logo-design',                2),
  ('Packaging Design',                      'packaging-design',           3),
  ('Social Media Design / Marketing Design','social-media-marketing',     4),
  ('Web Graphics / Website Visual Design',  'web-graphics',               5),
  ('UI UX Design',                          'ui-ux-design',               6),
  ('Icon Design',                           'icon-design',                7),
  ('Photo Manipulation',                    'photo-manipulation',         8),
  ('Art & Illustration',                    'art-illustration',           9),
  ('Publication Design',                    'publication-design',         10);

-- ---------------------------------------------------------------------
-- 11. projects + project_slides  — from projects.json
--     One Gallery slide per project that has additional images.
--     The cover_image is prepended into the gallery so it's reachable.
-- ---------------------------------------------------------------------

-- 41. Boxes For Product — Social Media Design
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Boxes For Product — Social Media Design', 'boxes-for-product-social-media-design',
   'Social media post designs created for Boxes For Product website while working at Plus Printers. These posts focus on promoting packaging products through visually engaging and marketing-oriented designs, combining branding, product highlights, and modern layouts for social media platforms.',
   (select id from public.categories where slug = 'social-media-marketing'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/1.png?raw=true',
   0, true,
   ARRAY['Social Media Design','Social Media Posts','Graphic Design','Adobe Photoshop','Marketing Design','Packaging Promotion','Branding','Creative Design','Plus Printers']::text[],
   '2026-04-22T04:04:14.341Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/1.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/2.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/3.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/4.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/5.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/6.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/7.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/8.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/9.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/10.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/11.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/12.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/13.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/14.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/15.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/17.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/18.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/19.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/20.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/21.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/22.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/23.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/1%20-%201.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/1%20-%202.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/1%20-%203.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Boxes%20For%20Product%20%20-%20Social%20Media%20Design/1%20-%204.png?raw=true'
  ]::text[], 0
from public.projects where slug = 'boxes-for-product-social-media-design';

-- 42. Packaging Web Banners — Practice Collection
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Packaging Web Banners — Practice Collection', 'packaging-web-banners-practice-collection',
   'A practice collection of website banner designs created to explore different layouts, styles, and visual approaches around the packaging industry. The set includes various banner formats — from bold typography-led hero banners and product showcase layouts to collage-style designs and call-to-action-driven promotional banners.

Each design experiments with unique color palettes, compositions, and typography pairings to deliver clean, modern, and conversion-focused visuals — perfect for hero sections, promotional sliders, and landing pages.',
   (select id from public.categories where slug = 'web-graphics'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Packaging%20Web%20Banners%20%E2%80%94%20Practice%20Collection/1.jpg?raw=true',
   1, true,
   ARRAY['Web Graphics','Banner Design','Adobe Photoshop','Website Design','Portfolio Work','Creative Design','Marketing Graphics','Modern Design','Layout Design','Practice Work','Promotional Design','Packaging Branding']::text[],
   '2026-04-23T01:37:52.887Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Packaging%20Web%20Banners%20%E2%80%94%20Practice%20Collection/1.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Packaging%20Web%20Banners%20%E2%80%94%20Practice%20Collection/2.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Packaging%20Web%20Banners%20%E2%80%94%20Practice%20Collection/3.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Packaging%20Web%20Banners%20%E2%80%94%20Practice%20Collection/4.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Packaging%20Web%20Banners%20%E2%80%94%20Practice%20Collection/5.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Packaging%20Web%20Banners%20%E2%80%94%20Practice%20Collection/6.jpg?raw=true'
  ]::text[], 0
from public.projects where slug = 'packaging-web-banners-practice-collection';

-- 44. One Cup Coffee — Complete Brand Identity & Café Branding
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('One Cup Coffee — Complete Brand Identity & Café Branding', 'one-cup-coffee-brand-identity',
   'Complete brand identity project for One Cup Coffee café, including logo design, logo and brand guidelines, and full branding applications. The project features mockups across real-world touchpoints such as coffee cups, sleeves, coffee bags, café wall branding, street signage, stand posters, and social media designs including Instagram mobile mockups. Designed with a cohesive and modern café aesthetic, ensuring strong visual consistency across all platforms.',
   (select id from public.categories where slug = 'visual-identity-branding'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/1.png?raw=true',
   2, true,
   ARRAY['Brand Identity','Visual Identity Design','Café Branding','Coffee Branding','Brand Guidelines','Mockup Design','Packaging Design','Coffee Bag Design','Cup & Sleeve Design','Instagram Design','Adobe Illustrator','Photoshop']::text[],
   '2026-04-23T01:55:01.434Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/1.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/2.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/3.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/4.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/5.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/6.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/7.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/8.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/9.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/10.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/11.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/12.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/13.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/14.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/15.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/16.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/One%20Cup%20Coffee%20%E2%80%93%20Complete%20Brand%20Identity%20&%20Caf%C3%A9%20Branding/17.png?raw=true'
  ]::text[], 0
from public.projects where slug = 'one-cup-coffee-brand-identity';

-- 45. To the Stars — Vector Space Illustration
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('To the Stars — Vector Space Illustration', 'to-the-stars-vector-space-illustration',
   'A bold and playful flat-style illustration designed entirely in Adobe Illustrator, capturing the thrilling moment of a rocket blasting off into deep space. The scene features a charming vector rocket soaring upward through a starlit sky, with billowing smoke clouds at its base, a glowing flame trail, and floating elements like a satellite, a ringed planet, and soft clouds adding depth to the composition.

Every detail — from the rocket''s body and fins to the stars, planet, and smoke plume — is hand-crafted using custom vector shapes, gradients, and careful color layering. The deep navy background paired with warm orange flames and creamy smoke creates a striking contrast that makes the artwork feel dynamic, adventurous, and full of motion.

This piece embodies imagination, ambition, and the spirit of exploration — perfect for tech branding, children''s book illustrations, motivational visuals, or creative posters.',
   (select id from public.categories where slug = 'art-illustration'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Art%20&%20Illustration/To%20the%20Stars%20%E2%80%94%20Vector%20Space%20Illustration/1.jpg?raw=true',
   3, true,
   ARRAY['Vector Art','Flat Design','Space Illustration','Rocket Art','Digital Illustration','Adobe Illustrator','Creative Art','Portfolio Work','Cosmic Art','Scenery Art']::text[],
   '2026-04-23T02:35:29.306Z');

-- 46. Inside The A — Photo Manipulation (P4)
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Inside The A — Photo Manipulation (P4)', 'inside-the-a-photo-manipulation',
   'This design explores the concept of identity through typography-based photo manipulation. The subject image is carefully masked within a bold letterform, creating a strong visual connection between shape and subject.

A textured background is applied to enhance depth and contrast, allowing the letter to stand out while maintaining a cohesive composition. The combination of clean masking and subtle texture work results in a modern and visually engaging design.

Created in Adobe Photoshop using techniques such as clipping masks, layer blending, and texture integration.',
   (select id from public.categories where slug = 'photo-manipulation'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Photo%20Manipulation/Inside%20The%20A%20-%20Photo%20Manipulation%20(P4)/71f44ddc02d2dfeca26bf9b68d3bc473.webp?raw=true',
   4, true,
   ARRAY['Photo Manipulation','Photoshop Art','Typography Design','Letter Masking','Text Effect','Texture Design','Visual Composition','Letter Art']::text[],
   '2026-04-23T02:36:42.685Z');

-- 47. Store Page — Game UI
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Store Page — Game UI', 'store-page-game-ui',
   'Game store UI design created in Adobe Illustrator, featuring a colorful and engaging interface for in-game purchases. All elements, including icons, buttons, and layout, were fully custom-designed with a focus on clean visuals, user interaction, and modern game aesthetics.',
   (select id from public.categories where slug = 'ui-ux-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/UI%20UX%20Design/Store%20Page%20%E2%80%93%20Game%20UI/Final-01.png?raw=true',
   5, true,
   ARRAY['Game UI Design','UI/UX Design','Adobe Illustrator','Game Store UI','Mobile Game UI','Vector Design','Icon Design']::text[],
   '2026-04-23T03:38:57.649Z');

-- 48. Artist — Neon Style Logo Design
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Artist — Neon Style Logo Design', 'artist-neon-style-logo',
   'A bold neon-style logo designed entirely in Adobe Photoshop, featuring a glowing teal "Artist" wordmark inside a sharp inverted triangle. Every element — from the textured grunge background to the neon glow effect and the triangle frame — was crafted from scratch to deliver a moody, retro, and creative vibe.

The combination of soft glow lighting, hand-style typography, and gritty texture makes this design perfect for creative branding, music covers, posters, or artist identities.',
   (select id from public.categories where slug = 'logo-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/Artist%20%E2%80%94%20Neon%20Style%20Logo%20Design/1.png?raw=true',
   6, true,
   ARRAY['Logo Design','Neon Logo','Adobe Photoshop','Custom Logo Typography','Portfolio Work','Creative Design','Glow Effect','Artist Branding','Retro Logo']::text[],
   '2026-04-23T06:53:21.787Z');

-- 49. Echoes of Silence — Minimal Sound Wave Icons for Meditation
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Echoes of Silence — Minimal Sound Wave Icons for Meditation', 'echoes-of-silence-meditation-icons',
   'A minimalist icon collection designed entirely in Adobe Illustrator, crafted to bring calmness and clarity into meditation and wellness apps. Echoes of Silence is a set of 8 hand-drawn sound wave icons that transform real sounds — your breath, your heartbeat, the ocean — into clean, expressive lines.

Each icon carries its own quiet personality: Mindful Wave, Harmony Beat, Quiet Mind, Zen Rhythm, Calm Breath, Inner Glow, Tranquil Pulse, and Silent Echo. Together, they form a gentle visual language built around stillness, rhythm, and mindfulness.

Designed as 100% vector graphics, the icons scale flawlessly from a phone screen to a billboard without losing detail. Their stripped-down, line-based style avoids visual clutter — making them perfect for meditation apps, wellness brands, audio interfaces, podcast covers, or any product that values simplicity and serenity.

Minimal? Yes. Boring? Never. These icons whisper: "Shhh… peace is here."',
   (select id from public.categories where slug = 'icon-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Echoes%20of%20Silence%20%E2%80%94%20Minimal%20Sound%20Wave%20Icons%20for%20Meditation/1.jpg?raw=true',
   7, true,
   ARRAY['Icon Design','Vector Art','Minimalist Icons','Adobe Illustrator','Meditation Design','Wellness Icons','Sound Wave Art','Portfolio Work','App Icons']::text[],
   '2026-04-23T07:22:53.580Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Echoes%20of%20Silence%20%E2%80%94%20Minimal%20Sound%20Wave%20Icons%20for%20Meditation/1.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Echoes%20of%20Silence%20%E2%80%94%20Minimal%20Sound%20Wave%20Icons%20for%20Meditation/2.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Echoes%20of%20Silence%20%E2%80%94%20Minimal%20Sound%20Wave%20Icons%20for%20Meditation/3.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Echoes%20of%20Silence%20%E2%80%94%20Minimal%20Sound%20Wave%20Icons%20for%20Meditation/4.jpg?raw=true'
  ]::text[], 0
from public.projects where slug = 'echoes-of-silence-meditation-icons';

-- 50. Boxes For Product — Packaging Design
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Boxes For Product — Packaging Design', 'boxes-for-product-packaging-design',
   'Packaging design project created for "Boxes For Product" website while working with Plus Printers. Designed premium and modern packaging for product-based websites using Adobe Photoshop, focusing on clean layout, branding, and print-ready quality.',
   (select id from public.categories where slug = 'packaging-design'),
   'https://raw.githubusercontent.com/Muntazir-Designs/Portfolio-Projects/refs/heads/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/1.jpg',
   8, true,
   ARRAY['Packaging Design','Adobe Photoshop','Product Packaging','Premium Design']::text[],
   '2026-04-24T10:00:04.218Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://raw.githubusercontent.com/Muntazir-Designs/Portfolio-Projects/refs/heads/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/1.jpg',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/2.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/3.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/4.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/5.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/6.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/7.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/8.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/9.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/10.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/11.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/12.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/13.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/14.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/15.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/16.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/17.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Packaging%20Design/Boxes%20For%20Product%20%E2%80%93%20Packaging%20Design/18.jpg?raw=true'
  ]::text[], 0
from public.projects where slug = 'boxes-for-product-packaging-design';

-- 51. ZenBloom — Plant Care Mobile App UI UX Design
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('ZenBloom — Plant Care Mobile App UI UX Design', 'zenbloom-plant-care-app-ui',
   'ZenBloom is a modern mobile app UI/UX design focused on plant care and management. Designed in Adobe Illustrator, the app helps users track watering schedules and learn plant care tips through a clean, minimal, and user-friendly interface. The design emphasizes simplicity, soft colors, and smooth user experience for everyday use.',
   (select id from public.categories where slug = 'ui-ux-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/UI%20UX%20Design/ZenBloom%20%E2%80%93%20Plant%20Care%20Mobile%20App%20UI%20UX%20Design/1.webp?raw=true',
   9, true,
   ARRAY['Mobile App Design','UI/UX Design','Adobe Illustrator','Plant Care App','Minimal Design','User Interface','App Prototype']::text[],
   '2026-04-25T05:30:42.458Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/UI%20UX%20Design/ZenBloom%20%E2%80%93%20Plant%20Care%20Mobile%20App%20UI%20UX%20Design/1.webp?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/UI%20UX%20Design/ZenBloom%20%E2%80%93%20Plant%20Care%20Mobile%20App%20UI%20UX%20Design/2.webp?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/UI%20UX%20Design/ZenBloom%20%E2%80%93%20Plant%20Care%20Mobile%20App%20UI%20UX%20Design/3.webp?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/UI%20UX%20Design/ZenBloom%20%E2%80%93%20Plant%20Care%20Mobile%20App%20UI%20UX%20Design/4.webp?raw=true'
  ]::text[], 0
from public.projects where slug = 'zenbloom-plant-care-app-ui';

-- 52. Burger Plus — Social Media Marketing
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Burger Plus — Social Media Marketing', 'burger-plus-social-media-marketing',
   'Social media marketing post designs created for Burger Plus, featuring promotional deals, food product highlights, and engaging visuals. Designed in Adobe Photoshop with original concepts, focusing on strong branding, eye-catching layouts, and effective marketing design principles.',
   (select id from public.categories where slug = 'social-media-marketing'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/1.jpg?raw=true',
   10, true,
   ARRAY['Social Media Design','Food Advertisement','Burger Design','Adobe Photoshop','Social Media Marketing','Creative Ads','Branding','Restaurant Marketing']::text[],
   '2026-04-25T07:13:11.518Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/1.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/2.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/3.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/4.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/5.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/6.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/7.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/8.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/9.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/10.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/11.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/12.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Burger%20Plus%20-%20Social%20Media%20Marketing/13.png?raw=true'
  ]::text[], 0
from public.projects where slug = 'burger-plus-social-media-marketing';

-- 53. Sunshine Fruit Juice — Posts
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Sunshine Fruit Juice — Posts', 'sunshine-fruit-juice-posts',
   'Sunshine fruit juice design project including label design, bottle mockup, and stand poster. Created in Adobe Photoshop, the project focuses on fresh and vibrant visuals, strong branding, and realistic product presentation for marketing purposes.',
   (select id from public.categories where slug = 'social-media-marketing'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Sunshine%20Fruit%20Juice%20-%20Posts/1.jpg?raw=true',
   11, true,
   ARRAY['Social Media Marketing','Juice Branding','Label Design','Poster Design','Adobe Photoshop','Product Mockup','Branding','Promotional Post']::text[],
   '2026-04-25T14:50:54.826Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Sunshine%20Fruit%20Juice%20-%20Posts/1.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Sunshine%20Fruit%20Juice%20-%20Posts/2.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Sunshine%20Fruit%20Juice%20-%20Posts/3.png?raw=true'
  ]::text[], 0
from public.projects where slug = 'sunshine-fruit-juice-posts';

-- 54. Land Promotion — Social Media Post
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Land Promotion — Social Media Post', 'land-promotion-social-media-post',
   'Social media poster designs created for land promotion, aimed at attracting people to invest and build homes. Designed in Adobe Photoshop, these posts focus on clean layouts, strong visuals, and marketing-driven content to highlight property value and location appeal.',
   (select id from public.categories where slug = 'social-media-marketing'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Land%20Promotion%20-%20Social%20Media%20Post/1.webp?raw=true',
   12, true,
   ARRAY['Social Media Design','Real Estate Design','Land Promotion','Property Advertisement','Adobe Photoshop','Marketing Design','Promotional Post']::text[],
   '2026-04-25T15:01:11.592Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Land%20Promotion%20-%20Social%20Media%20Post/1.webp?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Land%20Promotion%20-%20Social%20Media%20Post/2.jpg?raw=true'
  ]::text[], 0
from public.projects where slug = 'land-promotion-social-media-post';

-- 55. Cozy Brew Café — Weekend Offer Social Media Post
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Cozy Brew Café — Weekend Offer Social Media Post', 'cozy-brew-cafe-weekend-offer',
   'Social media promotional post designed for Cozy Brew Café featuring a "Buy 1 Get 1 Free" weekend offer. Created in Adobe Illustrator with a warm and inviting theme, focusing on engaging visuals, clear offer communication, and strong branding for social media marketing.',
   (select id from public.categories where slug = 'social-media-marketing'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Social%20Media%20Design%20-%20Marketing%20Design/Cozy%20Brew%20Caf%C3%A9%20%E2%80%93%20Weekend%20Offer%20Social%20Media%20Post/1.webp?raw=true',
   13, true,
   ARRAY['Social Media Design','Café Promotion','Offer Design','Buy 1 Get 1 Free','Adobe Illustrator','Promotional Post','Coffee Design']::text[],
   '2026-04-25T15:10:53.271Z');

-- 56. Cozy Brew Coffee — Branding
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Cozy Brew Coffee — Branding', 'cozy-brew-coffee-branding',
   'Complete visual identity and branding project for Cozy Brew Coffee, including logo usage, brand guidelines, and realistic mockups. The design focuses on a warm, modern café aesthetic with consistent colors, typography, and branding elements across all visuals.',
   (select id from public.categories where slug = 'visual-identity-branding'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/Cozy%20Brew%20Coffee%20%E2%80%93%20Branding/1.webp?raw=true',
   14, true,
   ARRAY['Brand Identity','Visual Identity Design','Branding','Logo Design','Brand Guidelines','Mockup Design','Coffee Branding','Adobe Illustrator','Photoshop','Brand Strategy']::text[],
   '2026-04-25T15:25:04.049Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/Cozy%20Brew%20Coffee%20%E2%80%93%20Branding/1.webp?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/Cozy%20Brew%20Coffee%20%E2%80%93%20Branding/2.webp?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/Cozy%20Brew%20Coffee%20%E2%80%93%20Branding/3.webp?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Visual%20Identity%20Design%20&%20Branding/Cozy%20Brew%20Coffee%20%E2%80%93%20Branding/4.webp?raw=true'
  ]::text[], 0
from public.projects where slug = 'cozy-brew-coffee-branding';

-- 57. Dual Reality — Photo Manipulation (P1)
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Dual Reality — Photo Manipulation (P1)', 'dual-reality-photo-manipulation',
   'This photo manipulation explores the concept of inner conflict and dual identity through bold color contrast and layered composition. Using deep blue tones to represent calm and isolation, contrasted with intense red overlays symbolizing chaos and emotion, the artwork visualizes the clash between two psychological states within a single individual.

The fragmented effect across the subject''s face emphasizes distortion of perception and the complexity of human thoughts. Created in Adobe Photoshop, this piece combines color grading, masking, and blending techniques to produce a surreal and expressive visual narrative.',
   (select id from public.categories where slug = 'photo-manipulation'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Photo%20Manipulation/Dual%20Reality%20-%20Photo%20Manipulation%20(P1)/1.png?raw=true',
   15, true,
   ARRAY['Photo Manipulation','Photoshop Art','Double Exposure','Neon Effect','Red And Blue Aesthetic','Portrait Editing','Color Grading','Visual Storytelling','Cinematic Lighting']::text[],
   '2026-04-26T02:05:08.186Z');

-- 58. Cool Perspective — Photo Manipulation (P2)
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Cool Perspective — Photo Manipulation (P2)', 'cool-perspective-photo-manipulation',
   'This photo manipulation highlights a clean and modern portrait style with a focus on simplicity and visual impact. The subject is isolated against a textured teal background, creating a strong contrast that enhances depth and presence.

Subtle glow effects and color grading are used to separate the subject from the background, giving the composition a polished and contemporary feel. The artwork reflects confidence, individuality, and a calm urban aesthetic. Created in Adobe Photoshop using techniques such as background replacement, color correction, and lighting enhancement.',
   (select id from public.categories where slug = 'photo-manipulation'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Photo%20Manipulation/Cool%20Perspective%20-%20Photo%20Manipulation%20(P2)/1.png?raw=true',
   16, true,
   ARRAY['Photo Manipulation','Photoshop Art','Modern Aesthetic','Color Grading','Background Manipulation','Digital Art','Lighting Effects']::text[],
   '2026-04-26T02:12:19.449Z');

-- 59. Smoke & Soul — Photo Manipulation (P3)
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Smoke & Soul — Photo Manipulation (P3)', 'smoke-and-soul-photo-manipulation',
   'This conceptual photo manipulation represents inner turmoil and emotional intensity through the visual metaphor of fire and smoke. The subject remains calm and composed, while flames emerge from within, symbolizing suppressed emotions, hidden pain, and silent strength.

The contrast between monochrome tones and vibrant fire elements creates a striking visual balance, emphasizing the duality between control and chaos. The flowing smoke adds a sense of movement and transformation, as if the subject is both burning and evolving at the same time.

All smoke and fire elements were carefully crafted and blended in Adobe Photoshop using compositing, and color grading techniques to achieve a realistic and cinematic effect.',
   (select id from public.categories where slug = 'photo-manipulation'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Photo%20Manipulation/Smoke%20&%20Soul%20-%20Photo%20Manipulation%20(P3)/1.png?raw=true',
   17, true,
   ARRAY['Photo Manipulation','Photoshop Art','Conceptual Art','Fire Effect','Smoke Effect','Dark Aesthetic','Cinematic Lighting','Creative Composition','Visual Storytelling','Dramatic Effect','Black And White Contrast']::text[],
   '2026-04-26T02:25:24.306Z');

-- 60. Rise Above — Abstract Data Visualization Art
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Rise Above — Abstract Data Visualization Art', 'rise-above-data-visualization-art',
   'A vibrant abstract illustration crafted entirely in Adobe Illustrator, blending bold gradients, fluid line work, and a striking neon color palette. The artwork reimagines a data graph as a visual metaphor — three flowing curves labeled You, Hard Work, and Problems weave across a glowing magenta and violet backdrop, telling a quiet story about persistence, growth, and the rhythm of life''s challenges.

Designed with smooth gradient meshes, transparent overlays, and carefully balanced composition, this piece explores how a simple chart can be transformed into expressive, mood-driven art. The interplay of pink, purple, and cyan creates a futuristic, retro-synthwave atmosphere — perfect for editorial covers, motivational posters, or creative branding visuals.',
   (select id from public.categories where slug = 'art-illustration'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Art%20&%20Illustration/Rise%20Above%20%E2%80%94%20Abstract%20Data%20Visualization%20Art/1.webp?raw=true',
   18, true,
   ARRAY['Vector Art','Gradient Art','Neon Design','Digital Art','Data Art','Motivational Art','Modern Illustration','Portfolio Work','Adobe Illustrator','Creative Art']::text[],
   '2026-04-26T02:59:06.790Z');

-- 61. Silent Night — Minimalist Moonlit Sketch
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Silent Night — Minimalist Moonlit Sketch', 'silent-night-moonlit-sketch',
   'A minimalist night-scene illustration crafted entirely in Adobe Illustrator, capturing the quiet beauty of a lone tree silhouetted against a glowing full moon. Soft layered clouds, a gentle hill, and a sky scattered with subtle stars come together to create a calm, dreamlike atmosphere.

The artwork uses a deep blue color palette with smooth tonal layering to bring depth and mood to the scene. Every element — from the hand-sketched tree to the glowing moon halo and softly stacked clouds — is fully designed and illustrated from scratch using vector shapes, layering techniques, and tonal blending.

This piece reflects a love for simplicity, storytelling through space, and the peaceful charm of night skies — ideal for wallpapers, editorial art, or minimalist design inspiration.',
   (select id from public.categories where slug = 'art-illustration'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Art%20&%20Illustration/Silent%20Night%20%E2%80%94%20Minimalist%20Moonlit%20Sketch/1.webp?raw=true',
   19, true,
   ARRAY['Vector Art','Minimalist Art','Night Illustration','Moonlight Art','Sketch Art','Digital Illustration','Adobe Illustrator','Blue Aesthetic','Portfolio Work','Creative Art','Scenery Art']::text[],
   '2026-04-26T03:07:20.323Z');

-- 62. Burger Plus — Custom Food Icon Set
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Burger Plus — Custom Food Icon Set', 'burger-plus-food-icon-set',
   'A custom-designed icon set created for Burger Plus, where I currently work. This icon pack was crafted to bring a clean, consistent, and appetizing visual identity to the brand''s website menu and digital presence.

The set includes 8 hand-illustrated food and beverage icons — Shawarma, Sandwich, Burger, Hot Wings, Wraps, Crispy Fries, Mocktails, and Drinks — each designed in a unified line-art style using the brand''s signature deep red color. Every icon is built from scratch in Adobe Illustrator with careful attention to stroke weight, balance, and proportion to ensure visual harmony across the entire menu.

The minimalist outline style keeps the icons modern, scalable, and versatile — perfect for web menus, mobile apps, printed materials, and social media branding. Designed with both aesthetics and functionality in mind, this set helps elevate the Burger Plus brand with a polished, professional look.',
   (select id from public.categories where slug = 'icon-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Burger%20Plus%20%E2%80%94%20Custom%20Food%20Icon%20Set/1.jpg?raw=true',
   20, true,
   ARRAY['Icon Design','Vector Art','Food Icons','Brand Identity','Adobe Illustrator','Restaurant Branding','Portfolio Work','Minimalist Icons','Custom Icons','Web Icons']::text[],
   '2026-04-26T03:22:45.085Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Burger%20Plus%20%E2%80%94%20Custom%20Food%20Icon%20Set/1.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Burger%20Plus%20%E2%80%94%20Custom%20Food%20Icon%20Set/2.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Burger%20Plus%20%E2%80%94%20Custom%20Food%20Icon%20Set/3.jpg?raw=true'
  ]::text[], 0
from public.projects where slug = 'burger-plus-food-icon-set';

-- 63. Boxes For Product — Custom Process Icon Set
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Boxes For Product — Custom Process Icon Set', 'boxes-for-product-process-icon-set',
   'A custom-designed icon set crafted for Boxes For Product, a packaging industry brand, to visually represent their core business workflow on the company website. Each icon was designed from scratch in Adobe Illustrator to perfectly match the brand''s professional identity and dual-tone blue color palette.

The set includes 5 process-oriented icons — Design, Distribution, Prototyping, Manufacturing, and Printing — each representing a key stage of the company''s packaging service pipeline. The icons use a clean two-tone blue style (deep navy and bright blue) that aligns seamlessly with the brand''s logo and overall visual language, creating a cohesive and professional look across the website.

Designed with bold silhouettes, balanced shapes, and clear visual storytelling, every icon communicates its meaning at a glance — making them ideal for service pages, infographics, presentations, and marketing materials. The result is a sharp, modern, and brand-consistent icon system that elevates the company''s digital presence.',
   (select id from public.categories where slug = 'icon-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Boxes%20For%20Product%20%E2%80%94%20Custom%20Process%20Icon%20Set/1.jpg?raw=true',
   21, true,
   ARRAY['Icon Design','Vector Art','Adobe Illustrator','Custom Icons','Web Icons','Portfolio Work','Corporate Design','Packaging Branding','Business Icons','Service Icons']::text[],
   '2026-04-26T03:31:27.500Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Boxes%20For%20Product%20%E2%80%94%20Custom%20Process%20Icon%20Set/1.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Icon%20Design/Boxes%20For%20Product%20%E2%80%94%20Custom%20Process%20Icon%20Set/2.jpg?raw=true'
  ]::text[], 0
from public.projects where slug = 'boxes-for-product-process-icon-set';

-- 64. One Cup Coffee — Coffee Brand Logo
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('One Cup Coffee — Coffee Brand Logo', 'one-cup-coffee-brand-logo',
   'A custom logo and brand identity design created entirely in Adobe Photoshop for One Cup Coffee — a concept coffee brand built around simplicity, warmth, and a love for the perfect cup. The logo features a clean top-down view of a freshly brewed coffee cup, designed with smooth curves, a balanced color palette, and clear typography that reflects the cozy, inviting feel of a modern café.

The design follows a thoughtful construction process — combining three core elements (the saucer, the cup handle, and the coffee top) to form one unified, memorable mark. The breakdown showcases how each shape comes together to create both the logo (with brand name) and a standalone icon version, giving the brand flexibility across packaging, social media, signage, and digital platforms.

The warm beige background, deep brown typography, and rich coffee tones bring an earthy, premium feel that suits the brand''s personality. Designed to be simple, scalable, and instantly recognizable, this logo captures the essence of slowing down and enjoying just one good cup.',
   (select id from public.categories where slug = 'logo-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/One%20Cup%20Coffee%20%E2%80%94%20Coffee%20Brand%20Logo/1.png?raw=true',
   22, true,
   ARRAY['Logo Design','Brand Identity','Coffee Branding','Adobe Photoshop','Custom Logo','Portfolio Work','Icon Design','Cafe Branding']::text[],
   '2026-04-26T04:25:43.309Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/One%20Cup%20Coffee%20%E2%80%94%20Coffee%20Brand%20Logo/1.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/One%20Cup%20Coffee%20%E2%80%94%20Coffee%20Brand%20Logo/2.png?raw=true'
  ]::text[], 0
from public.projects where slug = 'one-cup-coffee-brand-logo';

-- 65. Muntazir Writes — Personal Writer Logo
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Muntazir Writes — Personal Writer Logo', 'muntazir-writes-writer-logo',
   'A clean, classic logo designed for Muntazir Writes — a personal brand for writing and storytelling. The design features an elegant fountain pen poised above an open book, symbolizing creativity, knowledge, and the art of writing.

Crafted in a bold black-and-white style with timeless serif typography, the logo carries a vintage yet professional feel — perfect for blogs, book covers, author profiles, and personal branding.',
   (select id from public.categories where slug = 'logo-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/Muntazir%20Writes%20%E2%80%94%20Personal%20Writer%20Logo/Writing%20Profile%20Logo.jpg?raw=true',
   23, false,
   ARRAY['Logo Design','Writer Logo','Adobe Photoshop','Minimal Logo','Portfolio Work','Black And White Logo','Personal Brand Logo']::text[],
   '2026-04-26T04:33:02.810Z');

-- 66. Muntazir Designs — Personal Brand Logo
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Muntazir Designs — Personal Brand Logo', 'muntazir-designs-brand-logo',
   '',
   (select id from public.categories where slug = 'logo-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/Muntazir%20Designs%20%E2%80%94%20Personal%20Brand%20Logo/Logo%20JPG.jpg?raw=true',
   24, true,
   ARRAY['Logo Design','Brand Identity','Personal Logo','Adobe Illustrator','Monogram Logo','Designer Branding','Vector Logo']::text[],
   '2026-04-26T04:41:59.630Z');

-- 67. BRS Company — Logo Concepts & Variations
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('BRS Company — Logo Concepts & Variations', 'brs-company-logo-concepts',
   'A set of logo design concepts created in Adobe Illustrator for BRS Company, exploring different visual directions for the brand''s identity. Each variation experiments with unique shapes — from arrow marks and triangular forms to dynamic geometric cuts — while keeping a consistent green-and-black gradient theme.

The bold typography paired with sharp, modern accents gives the logos a strong, professional, and futuristic feel — suitable for a versatile corporate brand.',
   (select id from public.categories where slug = 'logo-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/BRS%20Company%20%E2%80%94%20Logo%20Concepts%20&%20Variations/logo-01.jpg?raw=true',
   25, true,
   ARRAY['Logo Design','Brand Identity','Adobe Illustrator','Custom Logo','Logo Variations','Portfolio Work','Vector Logo','Green And Black Logo','Gradient Logo']::text[],
   '2026-04-26T04:51:53.982Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/BRS%20Company%20%E2%80%94%20Logo%20Concepts%20&%20Variations/logo-01.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/BRS%20Company%20%E2%80%94%20Logo%20Concepts%20&%20Variations/logo-02.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/BRS%20Company%20%E2%80%94%20Logo%20Concepts%20&%20Variations/logo-03.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/BRS%20Company%20%E2%80%94%20Logo%20Concepts%20&%20Variations/logo-04.jpg?raw=true'
  ]::text[], 0
from public.projects where slug = 'brs-company-logo-concepts';

-- 68. ZenBloom — Plant Care App Logo
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('ZenBloom — Plant Care App Logo', 'zenbloom-plant-care-app-logo',
   'A clean, modern logo designed for ZenBloom — a mobile app focused on plant care and mindful gardening. The mark blends a stylized leaf and bloom motif using soft greens, teal, and deep navy, reflecting growth, calmness, and connection with nature.

Crafted in Adobe Illustrator, the logo is balanced, scalable, and perfectly suited for app icons, splash screens, and brand identity across digital platforms.',
   (select id from public.categories where slug = 'logo-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/ZenBloom%20%E2%80%94%20Plant%20Care%20App%20Logo/1.webp?raw=true',
   26, true,
   ARRAY['Logo Design App','Logo Brand Identity','Adobe Illustrator','Plant App Branding','Portfolio Work','Minimal Logo']::text[],
   '2026-04-26T05:00:11.590Z');

-- 69. Cozy Brew — Coffee Shop Logo Design
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Cozy Brew — Coffee Shop Logo Design', 'cozy-brew-coffee-shop-logo',
   'A warm and inviting logo designed for Cozy Brew — a coffee brand built around the feeling of comfort and simplicity. The mark features a steaming coffee cup paired with friendly typography and the tagline "Simple And Warm," capturing the cozy charm of a neighborhood café.

Designed in Adobe Illustrator, the logo uses soft browns and clean black outlines to deliver a friendly, approachable, and timeless coffee brand identity.',
   (select id from public.categories where slug = 'logo-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Logo%20Design/Cozy%20Brew%20%E2%80%94%20Coffee%20Shop%20Logo%20Design/1.webp?raw=true',
   27, true,
   ARRAY['Logo Design','Brand Identity','Coffee Branding','Adobe Illustrator','Cafe Logo','Minimal Logo','Portfolio Work','Vector Logo']::text[],
   '2026-04-26T05:11:20.331Z');

-- 70. Aqua Printers — Website Banners & Visual Design
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Aqua Printers — Website Banners & Visual Design', 'aqua-printers-website-banners',
   'A collection of custom web graphics designed for Aqua Printers, a custom packaging brand. The set includes website banners, blog feature images, and body visuals — all crafted to match the brand''s identity and elevate its online presence.

Each design uses Aqua Printers'' signature navy and coral color palette, paired with sharp typography and clean product compositions to deliver a professional, modern, and visually engaging experience across the website.',
   (select id from public.categories where slug = 'web-graphics'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Aqua%20Printers%20%E2%80%94%20Website%20Banners%20&%20Visual%20Design/1%20-%201.png?raw=true',
   28, true,
   ARRAY['Web Graphics','Banner Design','Adobe Photoshop','Website Design','Portfolio Work','Marketing Graphics','Blog Banner','Packaging Branding','Web Visuals','Feature Image']::text[],
   '2026-04-26T05:40:41.552Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Aqua%20Printers%20%E2%80%94%20Website%20Banners%20&%20Visual%20Design/1%20-%201.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Aqua%20Printers%20%E2%80%94%20Website%20Banners%20&%20Visual%20Design/1%20-%202.jpg?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Aqua%20Printers%20%E2%80%94%20Website%20Banners%20&%20Visual%20Design/3%20-%20Banner%201.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Aqua%20Printers%20%E2%80%94%20Website%20Banners%20&%20Visual%20Design/3%20-%20Banner%202.png?raw=true'
  ]::text[], 0
from public.projects where slug = 'aqua-printers-website-banners';

-- 71. Plus Printers — Website Body & Feature Images
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Plus Printers — Website Body & Feature Images', 'plus-printers-website-body-feature',
   'A set of custom-designed body and feature images created for the Plus Printers website, focused on showcasing their custom wax paper and printing services. Each visual blends product photography, layered compositions, and clean typography to create informative, eye-catching graphics for blog posts and feature sections.

The designs use a soft pink-and-coral color palette to match the brand''s aesthetic, with circular and hexagonal layouts that organize information in a visually engaging way — perfect for storytelling around industries, use cases, and product highlights.',
   (select id from public.categories where slug = 'web-graphics'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Plus%20Printers%20%E2%80%94%20Website%20Body%20&%20Feature%20Images/2%20-%20Body%20Image%201.png?raw=true',
   29, true,
   ARRAY['Web Graphics','Feature Image','Adobe Photoshop','Website Design','Portfolio Work','Blog Graphics','Packaging Branding']::text[],
   '2026-04-26T10:13:10.703Z');
insert into public.project_slides (project_id, title, images, sort_order)
select id, 'Gallery',
  ARRAY[
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Plus%20Printers%20%E2%80%94%20Website%20Body%20&%20Feature%20Images/2%20-%20Body%20Image%201.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Plus%20Printers%20%E2%80%94%20Website%20Body%20&%20Feature%20Images/2%20-%20Body%20Image%202.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Plus%20Printers%20%E2%80%94%20Website%20Body%20&%20Feature%20Images/2%20-%20Feature%20Image%203.png?raw=true',
    'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Web%20Graphics%20-%20Website%20Visual%20Design/Plus%20Printers%20%E2%80%94%20Website%20Body%20&%20Feature%20Images/2%20-%20Feature%20Image%20-%204.png?raw=true'
  ]::text[], 0
from public.projects where slug = 'plus-printers-website-body-feature';

-- 72. Echoes of a Restless Soul — Poetry Book Cover Design
insert into public.projects (title, slug, description, category_id, cover_image, sort_order, featured, tags, created_at) values
  ('Echoes of a Restless Soul — Poetry Book Cover Design', 'echoes-of-a-restless-soul-book-cover',
   'A custom book cover design created in Adobe Photoshop for my own poetry book, Echoes of a Restless Soul. The cover features a lone silhouette standing against a deep, dreamy blue backdrop — capturing the introspective and emotional essence of the poems within.

The painterly water-like texture, subtle gradients, and elegant serif typography come together to evoke a sense of solitude, reflection, and quiet longing — making it a fitting visual for a heartfelt poetry collection.',
   (select id from public.categories where slug = 'publication-design'),
   'https://github.com/Muntazir-Designs/Portfolio-Projects/blob/main/Publication%20Design/Echoes%20of%20a%20Restless%20Soul%20%E2%80%94%20Poetry%20Book%20Cover%20Design/Book%20Cover%20Design.png?raw=true',
   30, true,
   ARRAY['Book Cover Design','Publication Design','Adobe Photoshop','Custom Cover','Portfolio Work','Creative Design','Typography','Photo Manipulation','Author Branding','Minimal Cover','Editorial Design']::text[],
   '2026-04-26T10:54:44.012Z');

-- =====================================================================
-- Done! Sanity-check counts:
--   select 'core_values'    as t, count(*) from public.core_values
--   union all select 'skills',         count(*) from public.skills
--   union all select 'experiences',    count(*) from public.experiences
--   union all select 'process_steps',  count(*) from public.process_steps
--   union all select 'social_links',   count(*) from public.social_links
--   union all select 'categories',     count(*) from public.categories
--   union all select 'projects',       count(*) from public.projects
--   union all select 'project_slides', count(*) from public.project_slides;
-- Expected: 6, 4, 6, 7, 14, 10, 31, 16
-- =====================================================================
