# Interview Drive Manager (React + Vite)

A beautiful, minimalistic HR interview tracking UI built with React, TailwindCSS, Framer Motion, Lucide Icons, and ShadCN-inspired components.

## Tech Stack
- React + Vite (TypeScript)
- TailwindCSS
- Shadcn-style UI primitives (no CLI dependency)
- Framer Motion (animations)
- Lucide React (icons)
- TanStack Table (data tables)
- dnd-kit (drag-and-drop)

## Get Started

Requirements: Node.js 18+

```powershell
# From project root
npm install
npm run dev
```

Then open http://localhost:5173.

## Project Structure
```
src/
  components/
    ui/          # UI primitives (button, card, input, etc.)
    layout/      # AppLayout, Sidebar, Topbar
    cards/       # Stat and analytics cards
    forms/       # Dropzone, FiltersBar
    table/       # DataTable wrapper (TanStack Table)
  pages/         # login, dashboard, upload, candidates, candidate, rounds, schedule, notifications
  hooks/
  utils/
  context/
  firebase/
```

## Notes
- This scaffold includes accessible attributes (aria-labels) where applicable.
- Calendar uses the native date input for simplicity; you can swap for a richer calendar later.
- Toasts and theme toggle are implemented via lightweight React contexts.

## Build
```powershell
npm run build; npm run preview
```
