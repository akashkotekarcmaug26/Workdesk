# WorkDesk Frontend (React 18 + TypeScript + Hooks + useForm + Tailwind CSS + Vite)

1. Start the backend first (see `backend/README.md`), running on `http://localhost:5000`
2. `npm install`
3. Copy `.env.example` to `.env` (only needed if the API is not on `localhost:5000`)
4. `npm run dev` and open `http://localhost:5173`

Sign in as `admin@workdesk.com` / `Password@123` (after `npm run seed` in the backend),
or register a new account, which is always created as an employee.

## Syllabus Features Integrated
- **TypeScript (`Sessions 12 & 13`)**: Interfaces, union types, generics (`useApi<T>`, `useForm<T>`), typed DOM refs and event handlers.
- **React Hooks (`Sessions 23-28`)**: `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`, `useRef`, plus custom hooks `useForm`, `useApi`, and `useDebounce`.
- **Forms with `useForm` (`Session 26-28` & Requirement 3)**: Custom generic `useForm` hook managing form state, validation, field registration, and server error mapping across all forms.
- **Error Boundaries & React Router (`Sessions 29 & 30`)**: Class-based `ErrorBoundary` wrapping route outlets, plus nested layout routes (`Routes`, `Route`, `NavLink`, `Link`, `useNavigate`, `useParams`, `Outlet`).
- **Tailwind CSS (`Session 4`)**: Configured with WorkDesk custom theme colors and fonts alongside original WorkDesk styles.
