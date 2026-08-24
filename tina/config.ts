import { defineConfig } from 'tinacms';

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
    ],
  },
});
