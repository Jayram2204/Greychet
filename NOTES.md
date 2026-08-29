# Notes

## Design QA (Impeccable)

`apps/web/PRODUCT.md` documents product context for [Impeccable](https://github.com/impeccable-cli/impeccable),
used for one design-polish pass on the consumer/registrar UI. Impeccable itself
is **not** a project dependency — running its slop detector (`impeccable detect`)
needs a `puppeteer` install, which is a large, unrelated-to-the-product
dependency we don't want to force on every `pnpm install`. So it's run from an
isolated scratch install instead of `npx impeccable` directly (npx's isolated
install can't see a project-local `puppeteer`, so the two need to live in the
same install for URL-based scanning to work):

```bash
mkdir -p /tmp/impeccable-runner && cd /tmp/impeccable-runner
npm init -y && npm install impeccable puppeteer
node node_modules/.bin/impeccable detect http://localhost:3000
```

Run the app's dev server first (`pnpm --filter web dev`), then point the
command above at whichever route you want checked.
