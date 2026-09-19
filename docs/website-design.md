# SYNQ website design

## Direction

Create a calm, polished productivity workspace using the owner's six-color reference. Use an editorial heading hierarchy, restrained gradients, comfortable spacing and a small hamster companion. Avoid visual clutter, excessive glow, decorative charts with invented metrics, or inaccessible low-contrast text.

## Palette

| Color | Role |
| --- | --- |
| `#190019` | Main dark background and text on blush buttons |
| `#2B124C` | Navigation and elevated background sections |
| `#522B5B` | Card surfaces and selected navigation backgrounds |
| `#854F6C` | Decorative accents and substantial borders |
| `#DFB6B2` | Secondary text and soft accents |
| `#FBE4D8` | Main text, primary actions and highlights |

Keep body text blush on dark surfaces. Do not use mauve as small text on plum. Status must always include text or an icon; color alone is insufficient.

## Shared components

- App shell: desktop sidebar, compact mobile navigation, title/breadcrumb and account menu.
- Buttons: blush primary, outlined secondary, understated tertiary; explicit disabled and loading states.
- Cards: 20px corners, fine mauve borders, no excessive shadow.
- Inputs: persistent visible labels, help text, inline validation and focus outline.
- Feedback: loading skeleton, useful empty state, inline retryable errors, success confirmation.
- Typography: clean system sans for interface, restrained serif accents for large marketing headings.
- Motion: short opacity/position transitions; honor reduced-motion preferences.

## Pages and behavior

| Page | Content and actions |
| --- | --- |
| Landing | Product promise, visual daily-plan preview, planning/task/journal features, sign-up and login links. No invented testimonials or user counts. |
| Login / registration | Accessible forms, password visibility toggle, pending/error states, link between forms. Registration cannot select an admin role. |
| Dashboard | Date, greeting, completion summary from tasks, daily timeline, quick task creation, companion and journal shortcut. |
| Planner | Date and weekday/weekend selection, editable manual time blocks, AI instruction field, generate/review/save actions. Clearly report unconfigured AI. |
| Tasks | Date filter, add/edit/delete, pending/completed/skipped states, progress and empty state. |
| Journal | Selected date, labeled mood choices, reflection editor, save confirmation and paginated history. |
| Calendar | Month navigation and selected-day task/schedule/journal summary, preserving local calendar dates. |
| Analytics | Completion and planned focus time from actual stored records. Explain formulas and empty ranges. Do not imply schedule duration measures actual focused attention. |
| Settings | Account details, role, session/logout controls, palette overview if useful. Do not render preference toggles that cannot persist. |
| Superadmin | Platform counts, paginated accounts, disable/re-enable regular users, confirmation and feedback. Server checks role; private journals and password hashes remain hidden. |
| Not found | Clear return-to-dashboard/landing action. |

## Responsive and accessibility requirements

Support 360px phone through wide desktop without horizontal page overflow. On smaller screens cards stack, navigation collapses and schedule rows retain readable times. Visible keyboard focus, semantic headings, button labels, accessible dialogs, adequate target sizes and reduced-motion support are required.

## Integration boundaries

Use the existing Express API for auth, tasks, schedules, journals and superadmin actions. Access tokens stay in memory. Surface an actionable API connection error when MongoDB/backend is not configured. Any local demonstration mode must be explicitly labeled and must never imply real administrative authorization.

Payments and subscriptions remain outside the current backend. Do not add working-looking checkout actions without provider integration. Calendar and analytics must load all relevant pages or disclose a bounded sample rather than silently presenting the first page as complete history.

## Simple frontend structure

```text
frontend/
  src/
    components/  Reusable layout and interface pieces
    pages/       One file per main screen
    lib/         API, dates, calculations and session state
    styles/      Palette tokens and responsive styles
    App.jsx      Routes and guards
    main.jsx     React bootstrap
```

Status: visual specification prepared. Superdesign requires owner sign-in; frontend implementation has not started in this design pass.
