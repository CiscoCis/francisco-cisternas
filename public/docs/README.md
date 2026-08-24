# Documents

Drop downloadable files here.

## CV — change requirements §11

Two versions are expected, a full CV and a short one. Put the files here
and set their paths in `src/data/profile.ts`:

```ts
export const cvVersions: CvVersion[] = [
  { label: 'Curriculum vitae', description: '…', href: '/docs/cv-full.pdf' },
  { label: 'Short CV',         description: '…', href: '/docs/cv-short.pdf' },
];
```

Rules the site follows:

* The CV is **never** opened or downloaded automatically on arrival. It is
  an ordinary button and nothing more.
* An entry with an empty `href` is skipped entirely rather than rendered as
  a dead link, so the site never ships a broken download.
* Replacing a CV means replacing the file. Keep the same filename and
  nothing else has to change.

The buttons appear in the About section, and one also appears in the hero
once at least one file exists.

## Student resources

Syllabi, course materials, guidelines and other downloads are listed in
`src/data/teaching.ts` under `studentResources`. Each entry renders in a
disabled "Available on request" state until you give it an `href`:

```ts
{ label: 'Syllabi', icon: 'doc', href: '/docs/syllabi.pdf' },
```
