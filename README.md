# Lakar

Videollamadas peer-to-peer con chat en tiempo real.

![Build](https://github.com/davidsdevel/lakar-videocall/actions/workflows/deploy.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

## Stack

| Componente | Tecnología |
|------------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS |
| Backend | Express, Socket.io |
| WebRTC | PeerJS (signaling externo) |
| Auth | NextAuth v5 (Google + Credenciales) |
| DB | MongoDB con Mongoose |
| Code style | Biome (lint + format) |
| Deploy | Docker Compose / Kubernetes + Keel |

## Getting Started

### Requisitos

- Node.js 20+
- MongoDB 7+ (o usar Docker)
- npm

### Instalación

```bash
git clone https://github.com/davidsdevel/lakar-videocall.git
cd lakar-videocall
npm install
cp .env.example .env
```

Configura las variables de entorno en `.env` y ejecuta:

```bash
npm run dev
```

La app estará disponible en `http://localhost:8082`.

### Variables de entorno

| Variable | Descripción | Requerida |
|----------|------------|-----------|
| `MONGO_URL` | URI de conexión a MongoDB | Sí |
| `AUTH_URL` | URL del servidor (ej: `https://tudominio.com`) | Sí |
| `AUTH_SECRET` | Secret para NextAuth | Sí |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | No |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth | No |
| `SERVICE_URL` | URL interna del servidor | Sí |
| `NEXT_PUBLIC_API_URL` | URL pública de la API | Sí |
| `PORT` | Puerto del servidor (default: 8082) | No |

## Commands

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Servidor de desarrollo en puerto 8082 |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar en producción |
| `npm run lint` | Verificar código con Biome |
| `npm run format` | Formatear código con Biome |

## Deploy

### Docker Compose (self-hosting)

```bash
docker compose up -d
```

- App: `http://localhost:8082`
- MongoDB: `localhost:27017`
- Healthcheck: `GET /healthz`

### Kubernetes

```bash
kubectl apply -f lakar-stack.yaml
```

- Deploy automático via Keel (poll Docker Hub)
- Ingress con TLS automático (Traefik)
- Rolling update zero downtime (`maxUnavailable: 0`, `maxSurge: 1`)
- Health checks en `/healthz` (startup, readiness, liveness)

## Project Structure

```
lakar-videocall/
├── src/
│   ├── app/              # App Router (layouts, páginas, API routes)
│   │   ├── api/          # API routes (App Router)
│   │   ├── auth/         # NextAuth configuration
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── signin/       # Sign in page
│   │   └── signup/       # Sign up page
│   ├── features/         # Componentes de features (call, dashboard)
│   ├── lib/mongo/        # Conexión y modelos Mongoose
│   └── pages/api/        # API routes (Pages Router)
├── server/
│   ├── handlers/         # Eventos de Socket.io
│   ├── models/           # Modelos Mongoose (server-side)
│   └── index.js          # Express + Socket.io + Next.js server
├── compose.yaml          # Docker Compose
├── Dockerfile            # Multi-stage build
└── index.js              # Entry point
```

## Health Check

```
GET /healthz

200 → { "status": "ok" }
503 → { "status": "error", "db": "disconnected" }
```

## Contributing

### Convenciones

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, etc.
- **Lint**: Biome (no usar ESLint ni Prettier)
- **Indentación**: Tabs
- **Strings**: Doble comilla
- **Archivos**: `.jsx` para componentes React, `.js` para server/API/models

### Pasos

1. Fork el repositorio
2. Crea una rama (`git checkout -b feat/nueva-feature`)
3. Haz tus cambios
4. Ejecuta `npm run lint` para verificar
5. Commit con convención (`git commit -m "feat: agregar nueva feature"`)
6. Push a tu fork (`git push origin feat/nueva-feature`)
7. Abre un Pull Request

## License

[MIT](https://opensource.org/licenses/MIT) © [davidsdevel](https://github.com/davidsdevel)
