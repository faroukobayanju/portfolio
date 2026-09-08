# farouk obayanju — portfolio

A React/Vite portfolio for farouk obayanju: vibecoder, data analyst, and social media manager. The drafting-board structure takes inspiration from mittalparth.dev while using an original ink-blue, apricot, and warm-paper identity.

## local development

```sh
npm install
npm run dev
```

Vite prints the local portfolio URL. Add `/admin.html` to open the content admin.

## production build

```sh
npm run build
```

The deployable multipage build is written to `dist/`.

## active source

- `src/App.jsx`: public React portfolio.
- `src/Admin.jsx`: React content admin.
- `src/content-store.js`: defaults, data validation, and browser storage.
- `scrapbook.css`: public layout and responsive styles.
- `admin.css`: admin layout and states.
- `tokens.css`: shared palette, spacing, and font tokens.
- `public/`: portrait and project imagery served by Vite.

## admin

The admin edits:

- about copy and portrait
- selected work, including vibecoding projects
- experience

Production content is stored in Vercel Blob through `/api/content`. Public reads require no credentials; every write from the admin requires the private `ADMIN_PASSWORD` environment variable. The password is kept in `sessionStorage` after entry, so closing the browser tab signs the editor out.

During ordinary Vite development, the content layer falls back to `localStorage` because Vite does not run the Vercel function. Use `vercel dev` to exercise the complete hosted-storage path locally. Export/import remains available for backups, and uploaded images are resized before being stored with the content.

The older root-level JavaScript files are retained only as an unreferenced migration snapshot. Both live entry points load React modules from `src/`.

## verification

- React/Vite production build passes.
- Vercel’s local production build passes with the serverless function included.
- Public and admin pages were verified in-browser.
- Hosted content GET, rejected unauthorized PUT, and authenticated PUT were verified locally and against a protected Vercel preview.
- The removed portrait caption is absent from the rendered page.
- The removed footer metadata is absent from the rendered page.
- No horizontal overflow was found at 320, 375, 414, or 768 CSS pixels.

Changes are local and have not been pushed or published.
