# GIS Based Web Application

## Admin inquiry desk

The inquiry dashboard is available at `/admin/inquiries` and displays all saved inquiries from the database:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
FRONTEND_URL=http://localhost:5173
```

Start the backend from `FIS_Backend` with `npm start`, then open the frontend at `http://localhost:5173/admin/inquiries`. The dashboard supports searching, status and priority filters, status/priority updates, internal notes, email replies, refresh, and deletion.

## Fish forecast maps

The admin fish-forecast page supports uploading one or more `.shp` fishing-area
files for each supported species, staging them in the database, and publishing
the selected map. Published maps are served to both the admin preview and the
public fish-forecast page, where users can select a harbour and a forecast area
to calculate the shortest sea-route distance. A published map remains active
until a newer map is published for that species; staged files that are never
published are cleaned up after eight days.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
