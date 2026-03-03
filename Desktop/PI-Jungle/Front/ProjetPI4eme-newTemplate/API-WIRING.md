# Courses API wiring (Front → Backend)

## What the app does

- **Page:** `http://localhost:4200/front/trainings` (TrainingsPage).
- **Trigger:** `ngOnInit()` calls `loadCourses()`, which calls `CourseService.getAllCourses()`.

## URLs called (in the browser)

All requests are **same-origin** (host `localhost:4200`). The dev server proxy forwards them to the backend.

| What        | URL in browser (Network tab)              | Proxied to (backend)                          |
|------------|--------------------------------------------|-----------------------------------------------|
| Online     | `http://localhost:4200/api/v1/onlinecourses/all`  | `http://localhost:8098/api/v1/onlinecourses/all`  |
| Onsite     | `http://localhost:4200/api/v1/onsitecourses/all`  | `http://localhost:8098/api/v1/onsitecourses/all`  |

So you will **not** see `localhost:8098` in the Network tab; you will see `localhost:4200` with path `/api/v1/...`. The proxy does the rest.

If your backend (e.g. GestionCours) serves at **8098 without** `/api/v1` (e.g. `GET /onlinecourses/all`), add in `proxy.conf.json` under `"/api"`:

```json
"pathRewrite": { "^/api/v1": "" }
```

Then the same browser URLs are sent to `http://localhost:8098/onlinecourses/all` and `http://localhost:8098/onsitecourses/all`.

## Response shape

The service accepts any of:

1. **Array:** `[{ id, title, level, type, description, ... }, ...]`
2. **Spring Page:** `{ "content": [ ... ] }`
3. **Generic:** `{ "data": [ ... ] }`

Each item is normalized to the `Course` interface (id, title, level, type, description, classroom?, etc.). Online/onsite lists are merged and typed as `Online` / `On-site`.

## Console logs (for debugging)

- **TrainingsPage:** `"Calling API... loadCourses()"` → then either `"API next: count= ... body= ..."` or `"API error: status= ... message= ... body= ..."`.
- **CourseService:** `"Calling API... GET <full URL>"` for each of the two URLs; then per endpoint `"online/onsite next: count= ..."` or `"online/onsite error: status= ... url= ... body= ..."`.

## CORS

Using the proxy (`npm start`), the browser only talks to `localhost:4200`, so CORS is not involved. Do **not** point the frontend at `http://localhost:8098` directly unless the backend allows origin `http://localhost:4200`.
