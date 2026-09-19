# SYNQ frontend

The frontend is a separate React/Vite application. It can be reviewed without the backend through a clearly labeled demo workspace.

## Run in VS Code

Open `C:\Users\aravi\Desktop\SYNQ\frontend` as the VS Code folder, then run:

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. Click **Take a look around** to use sample data. Demo changes stay in this browser's local storage and do not create a real account or grant administrative access.

## Pages

- Public landing, login and registration
- Overview dashboard
- Planner with manual blocks and AI proposal UI
- Task manager
- Journal and mood check-in
- Calendar history
- Explainable analytics
- Settings and palette reference
- Superadmin preview and live admin console

## Connect the backend later

During local development, Vite proxies `/api` to `http://127.0.0.1:4000`. Start the backend separately from `../backend` and use the login or registration page instead of demo mode.

For a separately hosted API, copy `.env.example` to `.env` and set:

```text
VITE_API_URL=https://your-api.example.com/api
```

Restart the frontend after changing `.env`. `VITE_API_URL` is public browser configuration; never put secrets in it.

## Verify

```powershell
npm test
npm run build
```

The production output is written to `dist/`. The frontend does not contain database, JWT, Groq or superadmin credentials.

## Interactive phone simulator

The public landing page uses `src/components/ProductTour.jsx`. It renders React screen components inside one phone frame and keeps the selected screen, preview theme, tasks, mood, planner proposal and insight range in the parent component. External feature tabs and the phone's bottom navigation both call the same `selectFeature` handler.

To connect another React screen:

1. Create a preview component such as `ProfileScreen`.
2. Add it to the `screens` object: `profile: ProfileScreen`.
3. Add a matching item to `tourItems` and `PhoneNav` using the same `profile` id.
4. Pass shared values or action handlers through `screenProps`.

For real URLs, replace the dynamic `<Screen {...screenProps}/>` inside `Phone` with an iframe:

```jsx
const previewUrls = {
  overview: '/app/dashboard?preview=1',
  planner: '/app/planner?preview=1',
};

<iframe
  className="phone-iframe"
  src={previewUrls[screen]}
  title={`${screen} live preview`}
/>
```

For a separate domain, add its full HTTPS URL and ensure that server permits iframe embedding. To send actions into a cross-origin iframe, use `window.postMessage` in the simulator and validate `event.origin` in the embedded app before applying an action. Same-origin React components are preferred because they share state directly and avoid iframe security restrictions.

## Typography system

The frontend loads Bodoni Moda for luxury display text, DM Sans for readable body copy, and Manrope for compact interface labels and the wordmark. The Google Fonts import is defined at the top of `src/styles/global.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Sans:opsz,wght@9..40,400..700&family=Manrope:wght@500;600;700;800&display=swap');
```

Use the shared variables and utility classes when adding new sections:

```css
:root {
  --font-display: 'Bodoni Moda', Didot, 'Times New Roman', serif;
  --font-body: 'DM Sans', Arial, sans-serif;
  --font-ui: 'Manrope', 'DM Sans', sans-serif;
}

.editorial-title {
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: -.045em;
  line-height: .98;
}

.editorial-kicker {
  font-family: var(--font-ui);
  letter-spacing: .18em;
  text-transform: uppercase;
}

.luxury-body {
  font-family: var(--font-body);
  letter-spacing: .005em;
  line-height: 1.75;
}
```

Example:

```jsx
<span className="editorial-kicker">A quieter way to plan</span>
<h1 className="editorial-title">Make room for <em>what matters.</em></h1>
<p className="luxury-body">Thoughtful structure, with enough space to breathe.</p>
```
