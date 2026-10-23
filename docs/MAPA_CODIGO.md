# Mapa del código — Fundación Luz de Benín

> **Léelo antes de buscar.** Sirve para saber *dónde* tocar sin leer todo el
> repo. **Actualízalo en el mismo commit** que cualquier cambio que mueva
> ficheros, añada rutas/modelos/páginas o tome una decisión que lo afecte
> (con el porqué, no solo el inventario). Última revisión: 2026-10-24.

---

## 1. Visión general

Tres piezas en un monorepo, desplegadas con Docker en un VPS Hetzner compartido:

```
navegador ──► Caddy COMPARTIDO (fuera de este repo)
               ├─ /api/*, /admin*, /uploads/*  ──► backend  (Express :3001)
               └─ resto                        ──► frontend (Next.js :3000)

frontend (servidor) ──fetch──► backend  vía API_INTERNAL_URL=http://backend:3001
backend ──POST /api/revalidate──► frontend  (ISR bajo demanda al guardar en el admin)
```

| Pieza | Carpeta | Tecnología | Puerto local |
|---|---|---|---|
| API REST + sirve el admin y las imágenes | `backend/` | Express + TS + Prisma + SQLite | 3001 |
| Panel admin (SPA) | `backend/admin/` | React 18 + Vite + Tailwind + TipTap | 5173 (proxy a 3001) |
| Web pública | `frontend/` | Next.js 14.1 App Router, `output: 'standalone'`, Tailwind | 3000 |
| Infra | raíz, `scripts/`, `.github/` | Docker Compose, GitHub Actions | — |

Servicios externos: **Stripe** (donaciones), **Resend** (emails transaccionales,
por `fetch`, sin SDK), **Mailchimp** (newsletter), **MyMemory** (traducción
ES→FR gratuita, ~500 caracteres por petición), **Google Analytics** `G-1SRJRDK6DD`.

---

## 2. «Quiero cambiar X → toca aquí»

| Cambio | Backend | Admin | Frontend |
|---|---|---|---|
| Campo nuevo en un modelo | `backend/prisma/schema.prisma` (**ASCII puro**) + ruta admin y pública del modelo | `pages/<Modelo>/Form.tsx` | `src/lib/types.ts` + página que lo pinte |
| Blog (posts) | `routes/admin/blog.ts`, `routes/public/blog.ts` (incluye `/rss`, `/related`, `/preview/:slug`) | `pages/Blog/Form.tsx`, `List.tsx` | `app/[lang]/blog/`, `components/blog/BlogCard.tsx`, `app/rss.xml/route.ts` |
| Categorías del blog | `routes/admin/categories.ts` (montada en `/api/admin/blog-categories`) | `pages/Blog/Categories.tsx` | — |
| Publicación programada | `lib/scheduler.ts` (cada 60 s) | checkbox en `pages/Blog/Form.tsx` | — |
| Proyectos | `routes/admin/projects.ts`, `routes/public/projects.ts`, `lib/projectVisibility.ts` | `pages/Projects/` | `app/[lang]/proyectos/`, `components/projects/` |
| Campañas (apadrina gallina/oveja…) | `routes/admin/campaigns.ts`, `routes/public/campaigns.ts` | `pages/Campaigns/` | `app/[lang]/campanas/`, `components/campaigns/`, `components/home/CampaignsStrip.tsx` |
| Textos editables de páginas (home, quiénes somos…) | `routes/admin/pages.ts`, `routes/public/pages.ts`, modelo `PageSection` | `pages/Pages/Editor.tsx` | la página llama `api.getPageSections('<page>')` |
| FAQ | `routes/admin/faqs.ts`, `routes/public/faqs.ts` | `pages/Faqs/List.tsx` | `app/[lang]/faq/`, `components/faq/FaqAccordion.tsx` |
| Ajustes globales (logo, contacto, IBAN, redes) | `routes/admin/settings.ts`, `routes/public/settings.ts`, modelo `Setting` (clave/valor) | `pages/Settings/General.tsx` | `api.getSettings()` en layout/footer |
| Donaciones / Stripe | `routes/public/stripe.ts` (checkout, productos, sesión), `routes/public/stripeWebhook.ts`, `routes/admin/stripe.ts` (productos), `routes/admin/donations.ts` (historial) | `pages/Donations/` | `app/[lang]/colabora/` (+ `success`, `cancel`), `components/colabora/DonationWidget.tsx`, `TaxDeduction.tsx`, `app/[lang]/gracias/` |
| Contacto | `routes/public/contact.ts`, `routes/admin/contacts.ts`, `lib/mailer.ts` | `pages/Contacts/Inbox.tsx` | `app/[lang]/contacto/`, `components/ui/ContactForm.tsx` |
| Newsletter / suscriptores | `routes/public/newsletter.ts` (Mailchimp + tabla `Subscriber`), `routes/admin/subscribers.ts` (+ CSV), `lib/subscriberSource.ts` | `pages/Subscribers/List.tsx` | `components/home/NewsletterStrip.tsx`, `components/ui/NewsletterInline.tsx`, `app/[lang]/suscribete/` + `components/newsletter/NewsletterLanding.tsx` |
| «Tu santo» (captación por santo del día) | `routes/public/santoLead.ts`, `routes/admin/santoLeads.ts` (+ CSV) | dentro de `pages/Subscribers/List.tsx` | `app/[lang]/tu-santo/`, `components/tu-santo/TuSantoClient.tsx`, `lib/saints.ts` |
| Colaboración empresas | — (formulario va a la API de contacto) | — | `app/[lang]/colabora-empresas/`, `components/colabora-empresas/ColaboraEmpresasClient.tsx` |
| Emails (plantillas) | `lib/mailer.ts`: `sendContactNotification`, `sendContactConfirmation`, `sendNewsletterConfirmation`, `sendSantoWelcome`, `sendDonationThankYou`, `sendPaymentFailedNotification` | — | — |
| Subida de imágenes | `routes/admin/upload.ts` (multer + sharp → WebP q82, salvo GIF) | `components/ImageUpload.tsx`, `MediaPicker.tsx` | — |
| Redimensionado de imágenes | `middleware/imageOptimizer.ts` (`/uploads/x?w=…` → WebP cacheado en disco) | — | `src/lib/imageLoader.ts` (loader de `next/image`) |
| Usuarios y roles del admin | `routes/admin/users.ts`, `routes/admin/auth.ts`, `lib/roles.ts`, `middleware/authMiddleware.ts` | `pages/Settings/Users.tsx`, `Login.tsx`, `App.tsx` | — |
| Dashboard admin | `routes/admin/dashboard.ts` | `pages/Dashboard.tsx` | — |
| Traducción ES→FR automática | `routes/admin/translate.ts` + `lib/textUtils.ts` (`makeChunks`) | botón en `BilingualField.tsx`, `Blog/Form`, `Faqs/List`, `Pages/Editor`, `Projects/Form` | — |
| SEO: metadatos, JSON-LD | `lib/seo.ts` (`resolveMetaDescription`, máx. 155) | campos meta en cada Form | `generateMetadata` y `<script type="application/ld+json">` en cada `page.tsx` |
| SEO: sitemap, robots, llms.txt, RSS | `lib/llmsTxt.ts` + `routes/public/llms.ts` | — | `app/sitemap.ts`, `app/robots.ts`, `public/robots.txt`, rewrite `/llms.txt` en `next.config.mjs`, `app/rss.xml/route.ts` |
| Redirecciones 301 | — | — | `frontend/next.config.mjs` → `redirects()` |
| Textos fijos de la web (no editables) | — | — | `src/locales/es.json`, `fr.json` vía `t(lang, key)` de `src/lib/i18n.ts` |
| Cabecera, pie, selector de idioma | — | — | `components/layout/` |
| Cookies / analítica | — | — | `components/legal/CookieBanner.tsx`, `Analytics.tsx`, `src/lib/analytics.ts` (`trackEvent`), `components/ui/Tracked*.tsx`, `PageViewTracker.tsx` |
| Menú lateral del admin | — | `components/Sidebar.tsx`, `TopBar.tsx` | — |
| Colores / tipografía | — | `admin/tailwind.config.ts` | `frontend/tailwind.config.ts`, `src/app/globals.css` |

---

## 3. Backend (`backend/`)

### Entrada: `src/index.ts`
Orden de montaje (importa):
1. `/api/stripe/webhook` **antes** de `express.json()` (necesita el body crudo para verificar la firma).
2. CORS (`CORS_ORIGIN`, separado por comas), JSON hasta 10 MB.
3. `/uploads` → `imageOptimizer` + `express.static(UPLOAD_DIR)`.
4. `/admin/*` → SPA de `backend/admin/dist` (hay que hacer `npm run build` del admin para que el backend lo sirva).
5. Rutas públicas `/api/*` y admin `/api/admin/*`.
6. `/api/health` (solo `status` + `timestamp`; **no expone commit**).
7. `errorHandler` al final. `startScheduler()` al arrancar.

### Autenticación y roles
- JWT `Bearer` en `Authorization`; el admin lo guarda en `localStorage.admin_token`.
- Roles en `lib/roles.ts`: `admin` (todo) y `donations_viewer` (solo `/api/admin/auth` y `/api/admin/donations`). Un rol desconocido se normaliza a `admin` (compatibilidad con tokens viejos).
- **Trampa:** `auth` y `donations` se montan *sin* `fullAdminOnly`; cada uno aplica su propio middleware dentro. Cualquier ruta admin nueva debe ir en el bloque `fullAdminOnly` de `index.ts`.

### Rutas
`src/routes/public/*.ts` y `src/routes/admin/*.ts`, un fichero por recurso, cada uno un `Router` de Express. El prefijo lo pone `index.ts` (ojo: `categories.ts` → `/api/admin/blog-categories`, `santoLead.ts` → `/api/santo-lead`, `llms.ts` → `/api/llms.txt`).

### Librerías (`src/lib/`)
| Fichero | Qué hace |
|---|---|
| `prisma.ts` | cliente Prisma singleton |
| `revalidate.ts` | `revalidate(paths, tags)` → POST al `/api/revalidate` del frontend; `PATHS.*` calcula qué rutas ES/FR invalidar. Silencioso si falla o no hay `REVALIDATE_SECRET` |
| `scheduler.ts` | publica posts con `scheduledAt <= now` y revalida |
| `mailer.ts` | plantillas HTML + envío por Resend. Silencioso sin `RESEND_API_KEY` |
| `roles.ts` | roles del panel |
| `projectVisibility.ts` | visibilidad pública: solo `published`; `status` es la fase, no la visibilidad |
| `seo.ts` | meta descriptions |
| `llmsTxt.ts` | genera `/llms.txt` |
| `subscriberSource.ts` | fuentes válidas de suscriptor: `newsletter`, `landing`, `tu-santo` |
| `textUtils.ts` | `toSlug`, `makeChunks`, `htmlToMarkdown` (escapa etiquetas y filtra esquemas de URL) |

### Modelos (`prisma/schema.prisma`)
`Project`, `BlogPost`, `BlogCategory`, `PageSection` (page+section+key, valor ES/FR), `ContactMessage`, `Setting` (clave/valor), `AdminUser`, `Campaign` (importe en céntimos, muchos campos bilingües), `SantoLead`, `Subscriber`, `Faq`, `StripeProduct`, `Donation` (estados `pending|completed|failed|canceled|expired`).

Convenciones: campos bilingües con sufijo `Es`/`Fr`; listas y objetos guardados como **JSON en `String`** (`images`, `stats`, `tags`, `coverItems`, `extraItems`); importes en **céntimos**.

### Tests (`src/__tests__/`, Vitest)
Solo lógica pura de `src/lib/` (`llmsTxt`, `projectVisibility`, `roles`, `seo`, `stripe`, `subscriberSource`, `textUtils`). Para que algo sea testeable, sacarlo de la ruta a `lib/`. `npm test` / `npm run typecheck`. No hay tests de frontend ni de admin.

### Scripts (`backend/scripts/`)
`convert-uploads-to-webp.ts`, `normalize-project-desc.ts` (manuales) y `migrate-md-to-html.cjs` (**se ejecuta en cada arranque del contenedor**, debe ser idempotente).

---

## 4. Panel admin (`backend/admin/`)

- `src/App.tsx`: rutas bajo `/admin/`. Si el rol es `donations_viewer` solo monta `donations`.
- `src/api.ts`: axios con `baseURL: '/api'`, añade el JWT y en 401 borra el token y manda a `/admin/`.
- `src/pages/<Recurso>/List.tsx` + `Form.tsx` (patrón general). `Pages/Editor.tsx` edita `PageSection`.
- `src/components/`: `BilingualField` (campo ES/FR con botón traducir), `RichTextEditor` (**TipTap**, produce HTML), `ImageUpload`, `MediaPicker`, `IconPicker`, `ConfirmDialog`, `Sidebar`, `TopBar`.

---

## 5. Frontend (`frontend/`)

### Estructura
- `src/app/[lang]/…`: todas las páginas, `lang` = `es` | `fr`. Slugs de ruta en español también en FR (`/fr/proyectos/`, `/fr/colabora/`).
- `src/app/page.tsx` → 308 a `/es/`. `src/app/suscribete/` y `src/app/tu-santo/` son enlaces cortos para compartir que redirigen a `/es/…`.
- `src/middleware.ts`: pone la cabecera `x-lang` según la URL (la usa el layout raíz para `<html lang>`).
- `src/app/api/revalidate/route.ts`: recibe la invalidación del backend (`secret` = `REVALIDATE_SECRET`).
- `src/lib/api.ts`: fetchers del servidor (`api.getProjects`, `getBlogPost`, `getPageSections`, `getSettings`, `createCheckout`…). Las campañas usan tags `campaigns` / `campaign-<slug>`.
- `src/lib/types.ts`: tipos compartidos y `SITE_URL`.

### Revalidación (ISR)
`export const revalidate` por página: home 300 s, blog listado 600 s, blog post / proyectos / campañas / faq / colabora 3600 s, quiénes somos / qué hacemos / contacto 86400 s; `gracias`, `tu-santo`, `rss.xml` dinámicas; `colabora/success|cancel` sin caché. Además el backend invalida al guardar (ver `lib/revalidate.ts`).

### Contenido: HTML vs Markdown (trampa)
- **Blog:** `contentEs/Fr` es **HTML** (TipTap) y se pinta con `dangerouslySetInnerHTML` en `app/[lang]/blog/[slug]/page.tsx`. Solo lo escriben admins.
- **Proyectos:** el admin envía HTML, el backend lo convierte a **Markdown** con `htmlToMarkdown` al guardar, y el frontend lo pinta con `react-markdown` + `remark-gfm`.

### Variables de entorno (sí las hay)
- `API_INTERNAL_URL` (runtime, servidor) → `http://backend:3001` en Docker.
- `NEXT_PUBLIC_API_URL` (se hornea en build, `ARG` del Dockerfile) → la usan componentes cliente (`TuSantoClient`, `SponsorButton`, `ColaboraEmpresasClient`).
- `REVALIDATE_SECRET`.

---

## 6. Infraestructura y despliegue

- **Producción:** VPS Hetzner compartido, `/root/fundacion`, contenedores `fundacion-backend-1` y `fundacion-frontend-1`. Detalle y normas en `C:\proyectos\INFRAESTRUCTURA.md` (leer antes de tocar servidor).
- **Proxy:** Caddy **compartido** entre proyectos, no definido aquí. El `Caddyfile` de la raíz es histórico/referencia; no lo usa el compose.
- **CI/CD** `.github/workflows/deploy.yml`: push a `master` → `npm ci` + `prisma generate` + `tsc --noEmit` + `npm test` (solo backend) → SSH → `git reset --hard origin/master` + `scripts/update.sh` (rebuild y recrea contenedores).
- **Arranque del backend** (`backend/Dockerfile` CMD): `prisma db push` → `seed.js` → `migrate-md-to-html.cjs` → `node dist/index.js`.
  - No hay migraciones: el schema se aplica con `db push` en cada arranque. Un cambio destructivo del schema se aplica en producción al desplegar.
  - El seed corre siempre: los usuarios admin, settings y `PageSection` se hacen con `upsert`; el contenido de ejemplo solo una vez (marcador `Setting._initialSeeded`).
- **Volúmenes:** `sqlite_data` (`/data/prod.db`) y `uploads_data` (`/app/uploads`).
- **Backups:** `.github/workflows/backup.yml`, diario 03:00 UTC, baja `prod.db` y la commitea.
- **Variables backend** (`docker-compose.yml`, valores en `.env` del servidor): `JWT_SECRET` (también se usa como `REVALIDATE_SECRET`), `DOMAIN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `CONTACT_EMAIL`, `MAILCHIMP_*`.
- `frontend/nginx.conf` es residuo de cuando el frontend era export estático; hoy corre `node server.js` (standalone).
- `scripts/`: `setup-server.sh`, `deploy.sh` (primer despliegue), `update.sh`, `switch-domain.sh`, `backup-db.sh`.

### Ficheros sueltos en la raíz
HTML/TXT de planes (`plan-seo-editorial.html`, `seo-estrategia.html`, `blog-plan-keywords.html`, `plan-colaboracion-empresarial.*`, `empresas-colaboradoras.html`) son documentos de trabajo, no parte de la web. `proyectos-doc/` (sin versionar) guarda borradores de proyectos.

---

## 7. Trampas conocidas

- `schema.prisma` debe ser **ASCII puro** (el parser rechaza acentos y emojis, también en comentarios). Comprobar con `grep -Pn '[^\x00-\x7F]' backend/prisma/schema.prisma`.
- No importar tipos de modelo (`BlogPost`, `Prisma`…) de `@prisma/client` en rutas: derivarlos con `typeof x[0]`.
- Campo booleano nuevo con filas existentes: darle un `@default` que no oculte datos (ver `Project.published` = `true`).
- Al crear una ruta admin que cambie contenido público, llamar a `revalidate(PATHS.…)`; si no, la web tarda hasta el `revalidate` de la página. Hoy **FAQ y ajustes no revalidan** al guardar.
- Webhook Stripe: solo una donación `pending` pasa a `expired`; nunca se pisa un estado terminal (carrera entre eventos).
- Ruta pública nueva de proyectos: filtrar con `buildPublicProjectWhere` / `isPubliclyVisible` para no filtrar borradores.
- `trailingSlash: true` en Next: las URLs internas y los `PATHS` de revalidación terminan en `/`.
