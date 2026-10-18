# React browser regressions

`npm ci && npm run build && npx playwright install --with-deps chromium && npm run test:browser`

CI installs the real npm-packed payload into a temporary project outside the checkout, with React/React DOM 18.3.1 and 19.3.1 in separate jobs. The browser imports only the public package entry points. Each page hydrates two StrictMode roots using matching, distinct server/client `identifierPrefix` values. Console warnings/errors and hydration recovery fail the tests.

The assertions cover frame and thumbnail updates, empty/invalid selections, repeated mount/unmount, root-local marker references, accessible names, class/style forwarding and fixed-height thumbnail containment. Screenshots cover every symbol and arrow, zones/labels, square/landscape/off-pitch documents and a 360px viewport. Synthetic documents are host-owned inputs copied into the independent consumer.

## Reviewing image changes

Baselines are Chromium/Linux images produced by the pinned Playwright version in the Ubuntu CI job. When rendering intentionally changes, run `npm run test:browser -- --update-snapshots` in the same environment, inspect every changed image and the before/after diff, and commit the PNGs with the behaviour decision. Never update baselines solely to make an unexpected failure green. Both React versions share baselines because the visible diagram must remain identical. CI retains reports, actual/expected/diff images and failure diagnostics for 14 days. A Playwright/browser upgrade needs its own baseline review.
