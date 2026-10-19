# GIS Based Web Application

## Admin inquiry desk

The inquiry dashboard is available at `/admin/inquiries` and displays all saved inquiries from the database:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
FRONTEND_URL=http://localhost:5173
```

Start the backend from `FIS_Backend` with `npm start`, then open the frontend at `http://localhost:5173/admin/inquiries`. The dashboard supports searching, status and priority filters, status/priority updates, internal notes, email replies, refresh, and deletion.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
