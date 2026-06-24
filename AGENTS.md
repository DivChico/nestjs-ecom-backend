# AGENTS.md — nestjs-ecom-backend

> **Learning project.** The user wants to understand what is being built and why.
> Before writing code, explain what the module/pattern does and why it is the NestJS way.
> Prefer annotated code over bare implementations when the tradeoff clarifies a concept.

## Architecture

- **NestJS v11** with **Mongoose (MongoDB)** — TypeORM is installed but NOT used; do not generate TypeORM entities or repositories
- Standard NestJS module structure: `module` → `controller` → `service` → `schema` (Mongoose) → `dto` (class-validator)
- Every feature gets its own module directory under `src/` (e.g. `src/users/`, `src/products/`)
- `ConfigModule.forRoot({ isGlobal: true })` reads `.env` — access via `ConfigService` everywhere without re-importing

## Database

- MongoDB URI is set in `.env` (not committed — in `.gitignore`)
- Connects to local Docker MongoDB with auth: `mongodb://admin:admin@localhost:27017/nestjs-ecom?authSource=admin`
- Use **Mongoose schemas** (`@Schema()`, `@Prop()`) — never TypeORM entities
- Register schemas in modules via `MongooseModule.forFeature([{ name: 'Name', schema: NameSchema }])`
- Use `@InjectModel('Name') private readonly model: Model<NameDocument>` for service injection
- Embedded subdocuments (e.g. CartItem inside Cart) preferred over separate collections for tightly coupled data
- `ref` for ObjectId references between collections (e.g. Product ref in OrderItem)

## Key Commands

| Command | Purpose |
|---|---|
| `npm run start:dev` | Dev server with hot-reload (port 3000) |
| `npm run build` | Compile to `dist/` |
| `npm test` | Unit tests (Jest, rootDir = `src/`, matches `*.spec.ts`) |
| `npm run test:e2e` | E2E tests (rootDir = `.`, matches `*.e2e-spec.ts`) |
| `npm run lint` | ESLint + Prettier auto-fix |
| `npm run format` | Prettier write (single quotes, trailing commas) |
| `nest generate module <name>` | Nest CLI — preferred for scaffolding |
| `nest generate service <name>` | Nest CLI |
| `nest generate controller <name>` | Nest CLI |

## Testing

- **Unit tests** live next to source files as `*.spec.ts` — Jest config is in `package.json` (rootDir: `src`)
- **E2E tests** live in `test/` as `*.e2e-spec.ts` — Jest config at `test/jest-e2e.json` (rootDir: `.`)
- E2E bootstrap uses `@nestjs/testing` `Test.createTestingModule({ imports: [AppModule] })`
- Supertest is the HTTP assertion library
- For Mongoose in tests, use `MongoMemoryServer` or mock models with `jest.fn()` — avoid hitting real DB

## Style & Conventions

- **ESLint**: `@typescript-eslint/no-explicit-any` is OFF — `any` is allowed; `no-floating-promises` is WARN
- **Prettier**: single quotes, trailing commas everywhere
- **Imports**: NestJS decorator-first, then local files with relative paths
- **DTOs**: `class-validator` decorators (`@IsNotEmpty`, `@IsEmail`, `@IsNumber`, etc.) in `dto/` subdirectory
- **Validation pipe**: register `ValidationPipe` in `main.ts` (not currently added — do it when first controller goes in)
- **Auth pattern**: Passport JWT strategy (`passport-jwt`) with `@nestjs/jwt`; `JwtAuthGuard` extends `AuthGuard('jwt')`
- **Role guard**: custom `RolesGuard` reads `@Roles()` decorator metadata; roles are plain strings (`'admin'`, `'customer'`)
- Secret keys (JWT, Stripe) go in `.env`, read via `ConfigService`

## Already Installed (no `npm install` needed)

`@nestjs/jwt`, `@nestjs/mongoose`, `@nestjs/config`, `@nestjs/typeorm`, `bcryptjs`, `class-validator`, `mongoose`, `typeorm`

Not yet installed for future phases: `stripe`, `@paypal/checkout-server-sdk`, `nodemailer`, `twilio`

## Important Quirks

- `dist/` is deleted and rebuilt on every `nest build` (via `deleteOutDir: true` in `nest-cli.json`)
- ESLint `sourceType: 'commonjs'` is set but the project uses ESM imports — this is the parser config, not module system
- `tsconfig.json` has `noImplicitAny: false` — explicit `: any` is not required but allowed
- The e2e test currently expects `GET /` to return `'Hello World!'` — this will need updating when routes are added

## Learning-First Development

When implementing any feature:
1. Explain the NestJS concept being used (module, guard, pipe, interceptor, etc.)
2. Show the wiring: how the module registers in `app.module.ts`, how schemas connect, how guards protect routes
3. Annotate or comment the key decisions — especially where the Mongoose approach differs from the TypeORM approach common in tutorials
