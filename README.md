# MBAN Case — RFQ Data Journey

An educational web app based on Rohaan, Topan and Groothuis-Oudshoorn (2022), DOI 10.1016/j.eswa.2021.115925. Original article licensed CC BY 4.0. All displayed records are invented. Reported results are separated into the final lesson.

Eight lessons cover raw records, joins, cleaning, features, a working miniature tree ensemble, thresholds and evaluation, dictionary extraction, and original findings. The raw-record exercise, ABC shares, and training sample are explicitly separate datasets. The teaching learner is not the paper's Random Forest.

## Run

Install Node.js 22.13 or newer, then run:

```sh
git clone https://github.com/kevintabora/mban-case.git
cd mban-case
npm ci
npm run dev
```

Open the local URL printed in the terminal (normally http://localhost:3000). Keep the terminal running while using the app; press Ctrl+C to stop it. This React app needs a server, so there is no standalone `index.html` to double-click.

## Public website

Open https://kevintabora.github.io/mban-case/ to use the app without installing anything or signing in.

The GitHub Pages build reuses the same React app and runs entirely in the browser. To publish changes, run `npm run build:pages`, commit the updated source and `docs` folder, and push to `main`. GitHub Pages publishes from `main` → `/docs`. The build sets the `/mban-case/` asset prefix and includes `.nojekyll` so GitHub serves the app instead of rendering this README.

The original Sites build remains available through `npm run build`.

`npm run build` creates the production site. Implementation is React with semantic HTML, CSS, and client-side JavaScript compiled from TypeScript. No model API or external data service is required by the lessons. No uploads, personal data, or persistent user records are used.

## Checks

- `node --experimental-strip-types engine.test.ts`: joins and matching windows, pending outcomes, cleaning, historical cutoffs, sampling, all fold/tree configurations, held-out label isolation, metrics, and extraction.
- `npx tsc --noEmit`: type checking.
- `npx oxlint app engine.test.ts`: authored code lint.
- Production build and local HTTP render.

The untouched starter component catalog has existing lint findings; the authored application checks pass. Browser UI interaction testing was not requested. An optional feature-detected WebMCP navigation tool is included; no supported WebMCP validation context was used, so that contract is not claimed as verified.
