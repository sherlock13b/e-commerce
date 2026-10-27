# E-commerce backend

Small products API for the catalog frontend. Express 5, PostgreSQL, Node 20.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness. Never touches the database. Used by the ALB health check. |
| GET | `/api/ready` | Readiness. 200 if the database answers, 503 if not. |
| GET | `/api/categories` | List of category names |
| GET | `/api/products` | Products. Optional `?category=electronics` and `?sort=price-asc` or `price-desc` |
| GET | `/api/products/:id` | One product |
| GET | `/metrics` | Prometheus metrics |

Product shape: `id, title, price, description, category, image, rating { rate, count }`.
It matches the Fake Store API, so the frontend change is small.

## Settings (environment variables)

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | 3000 | Port the app listens on |
| `DB_HOST` | localhost | Database host (the RDS endpoint in AWS) |
| `DB_PORT` | 5432 | Database port |
| `DB_NAME` | ecommerce | Database name |
| `DB_USER` | postgres | Database user |
| `DB_PASSWORD` | empty | Password, for local use only |
| `DB_SECRET_ARN` | empty | If set, the password is read from Secrets Manager (plain string or `{"password":"..."}`) |
| `DB_SSL` | false | Set `true` for RDS |
| `AWS_REGION` | ap-south-1 | Region for Secrets Manager |
| `INIT_DB` | true | Create the table and load sample products on startup |
| `CORS_ORIGIN` | * | Allowed browser origin |

## Run it locally

1. Install dependencies, and create the lock file (commit `package-lock.json`):
   ```
   npm install
   ```
2. Run the tests (no database needed):
   ```
   npm test
   ```
3. Start a local Postgres:
   ```
   docker run -d --name ecom-db -e POSTGRES_PASSWORD=localpass -e POSTGRES_DB=ecommerce -p 5432:5432 postgres:16-alpine
   ```
4. Start the API:
   ```
   DB_PASSWORD=localpass npm start
   ```
5. Try it:
   ```
   curl localhost:3000/api/health
   curl localhost:3000/api/products
   curl "localhost:3000/api/products?category=electronics&sort=price-desc"
   ```

## Build the image

```
docker build -t ecommerce-backend .
```

## Notes for the AWS deployment

- The ALB sends `/api/*` to this service and everything else to the frontend.
- Use `/api/health` as the target group health check path.
- The task role needs `secretsmanager:GetSecretValue` on the database secret.
- A container that cannot reach the database exits after 5 failed attempts. The reason is in its CloudWatch log.
- On `SIGTERM` (deploy or scale in) the app finishes current requests and exits with code 0.
