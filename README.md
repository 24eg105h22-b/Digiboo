# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Privacy and photo handling

Camera captures and selected images are processed in the browser. The app does not intentionally upload photos or write them to an API, database, browser storage, or analytics service. Photo pixels remain in runtime memory for the active session; uploaded images are decoded and re-encoded in memory to remove embedded metadata. Temporary upload object URLs are revoked after decoding.

The generated JPG is held in browser memory for 60 seconds. Its temporary object URL is revoked and the in-memory export and captured photos are cleared when the timer expires or the session is left. A copy already downloaded to the device is outside the app's control and cannot be remotely removed.

The landing page loads fixed decorative images and fonts from Unsplash and Google Fonts. Those requests do not contain user photos.

## Production security checklist

- Deploy over HTTPS and verify the response headers from `vercel.json`.
- Keep `build.sourcemap` disabled and do not commit `.env` files, credentials, or tokens.
- Run `npm audit` and `npm run lint` before deployment.
- Confirm camera permission is requested only after choosing **Take Photos**; microphone remains denied.
- Confirm user photos are not added to storage, analytics, external requests, or server endpoints.
- Confirm the download countdown expires and its object URL is revoked.

See [SECURITY.md](SECURITY.md) for the security and privacy summary.
