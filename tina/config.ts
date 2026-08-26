import { createElement } from 'react';
import { defineConfig } from 'tinacms';
import type { ScreenPlugin } from 'tinacms';
import AnalyticsScreen from './screens/AnalyticsScreen';

// `createScreen` (Tina's own helper for building one of these) isn't
// exported from the package, so the plugin object is built by hand
// against the exported `ScreenPlugin` type instead -- confirmed valid by
// reading node_modules/tinacms/dist/toolkit/react-screens/screen-plugin.d.ts,
// and by the fact that Tina's own built-in "Media Usage" dashboard entry
// (Settings sidebar → DASHBOARD) is built the exact same way internally.
//
// The analytics backend's URL and shared secret are read here (Tina's CLI
// bundles tina/config.ts with its own tool, substituting process.env.*
// the same way it already does for NEXT_PUBLIC_TINA_CLIENT_ID above) and
// passed down as props, rather than having the screen read process.env
// itself -- keeps the screen component a plain, easily-testable function
// of its props.
const analyticsScreen: ScreenPlugin = {
  __type: 'screen',
  name: 'Analytics',
  Component: (props) =>
    createElement(AnalyticsScreen, {
      ...props,
      endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
      secret: process.env.NEXT_PUBLIC_ANALYTICS_SECRET,
    }),
  Icon: () => null,
  layout: 'fullscreen',
  navCategory: 'Dashboard',
};

/*
 * Tina schema for every content type the professor edits directly. Each
 * collection's fields mirror the corresponding type in src/data/*.ts field
 * for field — the mapper layer (src/lib/content/*.ts) is what translates
 * between Tina's generated shape and the exact types the existing
 * components already expect, so nothing here changes what's on the page
 * until that layer and the components are wired up to use it.
 *
 * branch/clientId/token are only used for TinaCloud (the professor's real
 * login on the deployed site) — local editing via `npm run dev` works with
 * none of them set.
 */

const SECTION_LABELS: Record<string, string> = {
  about: 'About',
  research: 'Research & Publications',
  teaching: 'Teaching',
  service: 'Service',
  media: 'Media & Stories',
  videos: 'Videos',
  writing: 'Blog',
  beyond: 'Beyond Work',
  contact: 'Contact',
};

const blogBlockTemplates = [
  {
    name: 'p',
    label: 'Paragraph',
    fields: [
      { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
    ],
  },
  {
    name: 'h',
    label: 'Sub-heading',
    fields: [{ type: 'string', name: 'text', label: 'Text' }],
  },
  {
    name: 'quote',
    label: 'Pull quote',
    fields: [
      { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
    ],
  },
  {
    name: 'list',
    label: 'Bulleted list',
    fields: [{ type: 'string', name: 'items', label: 'Items', list: true }],
  },
  {
    name: 'image',
    label: 'Image',
    fields: [
      {
        type: 'image',
        name: 'src',
        label: 'Image',
        uploadDir: () => 'blog',
      },
      { type: 'string', name: 'alt', label: 'Alt text' },
      { type: 'string', name: 'caption', label: 'Caption' },
    ],
  },
] as const;

export default defineConfig({
  cmsCallback: (cms) => {
    cms.plugins.add(analyticsScreen);
    return cms;
  },
  branch: process.env.TINA_BRANCH || process.env.HEAD || 'main',
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || undefined,
  token: process.env.TINA_TOKEN || undefined,
  build: {
    publicFolder: 'public',
    outputFolder: 'admin',
    basePath: process.env.BASE_PATH?.replace(/^\//, '') || undefined,
  },
  media: {
    tina: {
      publicFolder: 'public',
      mediaRoot: 'images',
    },
  },
  schema: {
    collections: [
      {
        name: 'publication',
        label: 'Publications',
        path: 'content/publications',
        format: 'json',
        ui: { router: () => undefined },
        indexes: [{ name: 'ByCategory', fields: [{ name: 'category' }] }],
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          {
            type: 'string',
            name: 'category',
            label: 'Category',
            required: true,
            options: [
              { value: 'published', label: 'Published' },
              { value: 'under-review', label: 'Under Review' },
              { value: 'books', label: 'Books & Chapters' },
              { value: 'working', label: 'Working Papers' },
            ],
          },
          { type: 'string', name: 'authors', label: 'Authors' },
          { type: 'string', name: 'venue', label: 'Venue' },
          { type: 'number', name: 'year', label: 'Year' },
          { type: 'string', name: 'status', label: 'Status' },
          { type: 'string', name: 'detail', label: 'Detail (e.g. page range)' },
          { type: 'string', name: 'doi', label: 'DOI' },
          { type: 'string', name: 'url', label: 'Journal URL' },
          { type: 'string', name: 'pdf', label: 'PDF / open-access URL' },
          {
            type: 'string',
            name: 'abstract',
            label: 'Abstract',
            ui: { component: 'textarea' },
          },
          { type: 'string', name: 'keywords', label: 'Keywords', list: true },
          {
            type: 'image',
            name: 'image',
            label: 'Figure',
            uploadDir: () => 'research',
          },
          { type: 'string', name: 'imageAlt', label: 'Figure alt text' },
          { type: 'boolean', name: 'featured', label: 'Featured (wide card)' },
        ],
      },
      {
        name: 'grant',
        label: 'Grants & Collaborations',
        path: 'content/grants',
        format: 'json',
        ui: { router: () => undefined },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          {
            type: 'string',
            name: 'status',
            label: 'Status',
            required: true,
            options: [
              { value: 'awarded', label: 'Awarded' },
              { value: 'in-preparation', label: 'In preparation' },
            ],
          },
          { type: 'string', name: 'agency', label: 'Agency' },
          { type: 'string', name: 'reference', label: 'Reference' },
          { type: 'string', name: 'amount', label: 'Amount' },
          { type: 'string', name: 'period', label: 'Period' },
          { type: 'string', name: 'role', label: 'Role' },
        ],
      },
      {
        name: 'award',
        label: 'Awards & Honors',
        path: 'content/awards',
        format: 'json',
        ui: { router: () => undefined },
        fields: [
          { type: 'string', name: 'name', label: 'Name', isTitle: true, required: true },
          { type: 'string', name: 'organisation', label: 'Organisation' },
          { type: 'string', name: 'year', label: 'Year' },
          { type: 'string', name: 'note', label: 'Note', ui: { component: 'textarea' } },
        ],
      },
      {
        name: 'talk',
        label: 'Talks',
        path: 'content/talks',
        format: 'json',
        ui: { router: () => undefined },
        fields: [
          { type: 'string', name: 'event', label: 'Event', isTitle: true, required: true },
          { type: 'number', name: 'year', label: 'Year', required: true },
          { type: 'string', name: 'kind', label: 'Kind (e.g. "Invited talk.")' },
          { type: 'string', name: 'paper', label: 'Paper / presentation title' },
          { type: 'string', name: 'date', label: 'Date' },
          { type: 'string', name: 'location', label: 'Location' },
        ],
      },
      {
        name: 'keynote',
        label: 'Keynotes',
        path: 'content/keynotes',
        format: 'json',
        ui: { router: () => undefined },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'string', name: 'context', label: 'Context' },
          { type: 'string', name: 'date', label: 'Date' },
          { type: 'string', name: 'location', label: 'Location' },
          {
            type: 'string',
            name: 'icon',
            label: 'Icon',
            options: ['podium', 'globe', 'leaf', 'quote'],
          },
        ],
      },
      {
        name: 'serviceGroup',
        label: 'Service',
        path: 'content/service',
        format: 'json',
        ui: { router: () => undefined },
        fields: [
          { type: 'string', name: 'label', label: 'Group label', isTitle: true, required: true },
          {
            type: 'string',
            name: 'icon',
            label: 'Icon',
            options: ['building', 'users', 'bank', 'globe'],
          },
          {
            type: 'object',
            name: 'items',
            label: 'Items',
            list: true,
            fields: [
              { type: 'string', name: 'role', label: 'Role', required: true },
              { type: 'string', name: 'detail', label: 'Detail' },
            ],
          },
          {
            type: 'object',
            name: 'subGroups',
            label: 'Sub-groups',
            list: true,
            fields: [
              { type: 'string', name: 'label', label: 'Sub-group label', required: true },
              {
                type: 'object',
                name: 'items',
                label: 'Items',
                list: true,
                fields: [
                  { type: 'string', name: 'role', label: 'Role', required: true },
                  { type: 'string', name: 'detail', label: 'Detail' },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'teachingStory',
        label: 'Teaching Life',
        path: 'content/teachingStories',
        format: 'json',
        ui: { router: () => undefined },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'string', name: 'context', label: 'Context (e.g. "MSc Marketing")' },
          {
            type: 'string',
            name: 'summary',
            label: 'Card summary (1-2 sentences)',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'story',
            label: 'Full story (leave a blank line between paragraphs)',
            ui: { component: 'textarea' },
          },
          {
            type: 'image',
            name: 'photo',
            label: 'Photo',
            uploadDir: () => 'teaching-life',
          },
          { type: 'string', name: 'photoAlt', label: 'Photo alt text' },
          { type: 'boolean', name: 'draft', label: 'Draft (hidden from the live site)' },
        ],
      },
      {
        name: 'mediaStory',
        label: 'Media & Stories',
        path: 'content/media',
        format: 'json',
        ui: { router: () => undefined },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          {
            type: 'string',
            name: 'category',
            label: 'Category',
            options: ['Profile', 'Career story', 'Research feature', 'Interview', 'Alumni profile'],
          },
          { type: 'string', name: 'source', label: 'Source publication' },
          { type: 'string', name: 'date', label: 'Date' },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            ui: { component: 'textarea' },
          },
          { type: 'string', name: 'url', label: 'Article URL' },
          { type: 'string', name: 'language', label: 'Language (only if not English)' },
        ],
      },
      {
        name: 'video',
        label: 'Videos',
        path: 'content/videos',
        format: 'json',
        ui: { router: () => undefined },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'url',
            label: 'YouTube or Vimeo URL',
            required: true,
          },
          {
            type: 'image',
            name: 'thumbnail',
            label: "Custom thumbnail (optional — otherwise uses YouTube/Vimeo's own)",
            uploadDir: () => 'videos',
          },
          { type: 'string', name: 'date', label: 'Date (optional, e.g. "2026")' },
          { type: 'boolean', name: 'draft', label: 'Draft (hidden from the live site)' },
        ],
      },
      {
        name: 'post',
        label: 'Blog',
        path: 'content/blog',
        format: 'json',
        ui: { router: () => undefined },
        fields: [
          {
            type: 'string',
            name: 'slug',
            label: 'Slug (becomes the URL — never change after publishing)',
            required: true,
          },
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'string', name: 'date', label: 'Date (YYYY-MM-DD)', required: true },
          {
            type: 'string',
            name: 'category',
            label: 'Category',
            required: true,
            options: ['Teaching', 'Research', 'Analytics', 'Technology', 'Travel', 'Reflections'],
          },
          {
            type: 'string',
            name: 'excerpt',
            label: 'Excerpt (1-2 sentences)',
            ui: { component: 'textarea' },
          },
          {
            type: 'image',
            name: 'image',
            label: 'Lead image',
            uploadDir: () => 'blog',
          },
          { type: 'string', name: 'imageAlt', label: 'Lead image alt text' },
          { type: 'boolean', name: 'draft', label: 'Draft (hidden from the live site)' },
          {
            type: 'object',
            name: 'body',
            label: 'Body',
            list: true,
            templates: blogBlockTemplates as any,
          },
        ],
      },
      {
        name: 'siteSettings',
        label: 'Site Layout',
        path: 'content/settings',
        format: 'json',
        // A single document edited from the admin sidebar directly,
        // rather than a file list — there's only ever one.
        ui: { global: true },
        fields: [
          {
            // A plain string list with `options` renders as a fixed set of
            // checkboxes in Tina's admin, with no way to reorder them.
            // Only an *object* list gets drag handles (the same "Add,
            // drag, delete" row UI already used for Service items and
            // Blog body blocks) — so each entry is a one-field object
            // rather than a bare string, purely to get that UI.
            type: 'object',
            name: 'sectionOrder',
            label: 'Homepage sections (drag rows to reorder)',
            list: true,
            ui: {
              itemProps: (item: { section?: string }) => ({
                label: (item?.section && SECTION_LABELS[item.section]) || 'Section',
              }),
            },
            fields: [
              {
                type: 'string',
                name: 'section',
                label: 'Section',
                required: true,
                options: [
                  { value: 'about', label: 'About' },
                  { value: 'research', label: 'Research & Publications' },
                  { value: 'teaching', label: 'Teaching' },
                  { value: 'service', label: 'Service' },
                  { value: 'media', label: 'Media & Stories' },
                  { value: 'videos', label: 'Videos' },
                  { value: 'writing', label: 'Blog' },
                  { value: 'beyond', label: 'Beyond Work' },
                  { value: 'contact', label: 'Contact' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
