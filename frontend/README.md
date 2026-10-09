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
