# Tooling Service (Fastify + TypeScript)

Una API pequeña estilo plataforma que demuestra buenas prácticas para servicios internos y herramientas de desarrollo.

- Fastify + TypeScript (ESM)
- OpenAPI + Swagger UI
- Autenticación por API Key + limitador de peticiones
- Errores estandarizados (Problem Details: `application/problem+json`)
- Herramientas prácticas para desarrolladores:
  - Inspector HTTP (`POST /tools/http/inspect`)
  - Decodificador JWT (`POST /tools/jwt/decode`)
- Tests automáticos con Vitest usando Fastify `inject`

---

**Endpoints principales**

- Públicos:
  - `GET /health`
  - `GET /docs` (Swagger UI)
  - `GET /openapi.json`
- Protegidos (requieren API Key en cabecera `X-API-Key`):
  - `POST /tools/http/inspect`
  - `POST /tools/jwt/decode`

---

**Quickstart (local)**

1. Instalar dependencias

```bash
pnpm install
```

2. Ejecutar en modo desarrollo

```bash
API_KEY=local-dev-key pnpm dev
```

- Swagger UI: http://localhost:3000/docs
- OpenAPI JSON: http://localhost:3000/openapi.json

---

**Autenticación**

Todas las rutas protegidas requieren la cabecera:

```
X-API-Key: <API_KEY>
```

Por defecto el proyecto define `local-dev-key` como API key si no se provee otra.

---

**Ejemplos**

- Ping (protegido)

```bash
curl -i http://localhost:3000/ping -H "X-API-Key: local-dev-key"
```

- HTTP Inspector

```bash
curl -i -X POST "http://localhost:3000/tools/http/inspect" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: local-dev-key" \
  -d '{"url":"https://example.com","method":"GET","timeoutMs":3000,"followRedirects":false}'
```

- JWT Decode (no verifica firma)

```bash
curl -i -X POST "http://localhost:3000/tools/jwt/decode" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: local-dev-key" \
  -d '{"token":"<JWT>"}'
```

---

**Errores (Problem Details)**

El servicio devuelve errores en formato `application/problem+json` para facilitar integración y depuración.

- `400` — validación / request malformado
- `401` — API key ausente o inválida
- `429` — limite de peticiones alcanzado
- `404` — ruta no encontrada

Ejemplo de respuesta de error:

```json
{
  "type": "https://problems.vargontoc.es/validation",
  "title": "Bad Request",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "instance": "/tools/http/inspect",
  "errors": { "url": ["Required"] }
}
```

---

**Tests**

Ejecutar la suite de pruebas:

```bash
pnpm test
```

Las pruebas usan `vitest` y arrancan una instancia de Fastify en memoria con `inject`.

---

**Docker**

Construir imagen localmente:

```bash
docker build -t tooling-service:local .
```

Ejecutar contenedor:

```bash
docker run --rm -p 3000:3000 -e API_KEY=local-dev-key tooling-service:local
```

---

**Archivos clave**

- Código de arranque: [src/server.ts](src/server.ts)
- Construcción de la app: [src/app.ts](src/app.ts)
- Rutas: [src/routes](src/routes)
- Validaciones y utilidades: [src/domain](src/domain)
- Tests: [src/tests](src/tests)



