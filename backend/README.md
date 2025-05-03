# Serverside

## CSRF Token Endpoint

To retrieve a CSRF token, make a `GET` request to `/auth/csrf-token`. The token will be returned in the response body as JSON:

```json
{
  "csrfToken": "your-csrf-token"
}
```

### Usage

Include the CSRF token in the `X-CSRF-Token` header for all protected POST, PUT, and DELETE requests.

### Example Request

```bash
curl -X GET http://localhost:3000/auth/csrf-token
```

### Example Usage in a Protected Request

```bash
curl -X POST http://localhost:3000/admin/users \
-H "Content-Type: application/json" \
-H "X-CSRF-Token: your-csrf-token" \
-H "Authorization: Bearer your-jwt-token" \
-d '{"username": "newuser", "password": "password123", "role": "user", "plan": "basic"}'
```

## CSRF Token Management

When a new CSRF token is generated, the previous CSRF token is stored in the `csrf_tokens` table in the database. This ensures that the server can track and manage CSRF tokens securely.

### Database Schema

The `csrf_tokens` table has the following structure:
- `session_id`: The session ID associated with the CSRF token.
- `csrf_token`: The previous CSRF token.
- `created_at`: The timestamp when the token was stored.

### Example Workflow

1. A user requests a CSRF token (`GET /auth/csrf-token`).
2. The server generates a new CSRF token and stores the previous token in the database.
3. The new CSRF token is sent to the client and stored in a cookie.

## Session Management

The application uses `express-session` with `connect-sqlite3` to manage user sessions. Each session is stored in the `sessions.sqlite` database file in the root directory.

### Configuration

- The session secret is defined in the `.env` file as `SESSION_SECRET`.
- Sessions are stored securely with the following cookie settings:
  - `httpOnly`: Prevents client-side JavaScript from accessing the cookie.
  - `secure`: Set to `true` in production with HTTPS.
  - `maxAge`: 1 day (24 hours).

### Example

When a user logs in or performs an action requiring authentication, a session is created and stored in the `sessions.sqlite` database. The session data is automatically managed by the server.

## Admin Panel

### Endpoints
- `GET /admin/users`: Retrieve all users.
- `GET /admin/api-keys`: Retrieve all API keys.

### Access
- Only users with the `admin` role can access these endpoints.

## User Panel

### Endpoints
- `GET /user/profile`: Retrieve the authenticated user's profile.
- `PUT /user/profile`: Update the authenticated user's profile.
- `POST /user/api-key`: Generate a new API key for the authenticated user.
- `POST /user/login`: Login a user and return a JWT.

### API Key Generation

To generate a new API key, make a `POST` request to `/user/api-key`. The request must include:
- A valid JWT token in the `Authorization` header.
- A valid CSRF token in the `X-CSRF-Token` header.

#### Example Request

```bash
curl -X POST http://localhost:3000/user/api-key \
-H "Content-Type: application/json" \
-H "X-CSRF-Token: your-csrf-token" \
-H "Authorization: Bearer your-jwt-token"
```

#### Example Response

```json
{
  "api_key": "generated-api-key"
}
```

### Notes
- The API key limit is based on the user's plan (`basic`, `pro`, or `pro_plus`).
- If the daily limit is reached, the user must wait until the limit is renewed.

### Login

To log in a user and retrieve a JWT, make a `POST` request to `/user/login` with the following JSON body:

```json
{
  "username": "exampleuser",
  "password": "examplepassword"
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/user/login \
-H "Content-Type: application/json" \
-H "X-CSRF-Token: your-csrf-token" \
-d '{"username": "exampleuser", "password": "examplepassword"}'
```

#### Example Response

```json
{
  "token": "your-jwt-token"
}
```

### Notes
- The JWT token is valid for 1 hour.
- Include the token in the `Authorization` header for protected routes:
  ```bash
  Authorization: Bearer your-jwt-token
  ```

## Registration

To register a new user, make a `POST` request to `/auth/register` with the following JSON body:

```json
{
  "username": "exampleuser",
  "password": "examplepassword",
  "role": "user", // Optional, defaults to "user". Can also be "admin".
  "plan": "basic" // Optional, defaults to "basic". Can also be "pro" or "pro_plus".
}
```

### API Key Limits

- `basic`: 50 API keys per day.
- `pro`: 500 API keys per day.
- `pro_plus`: 5000 API keys per day.

### Example Request

```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-H "X-CSRF-Token: your-csrf-token" \
-d '{"username": "exampleuser", "password": "examplepassword", "role": "user", "plan": "pro"}'
```

### Notes
- If the `role` is not provided, it defaults to `user`.
- Only valid roles are `user` and `admin`.
- If the `plan` is not provided, it defaults to `basic`.
- Only valid plans are `basic`, `pro`, and `pro_plus`.

## Authentication

## API Key Usage and Renewal

### API Key Limits
- `basic`: 50 API keys per day.
- `pro`: 500 API keys per day.
- `pro_plus`: 5000 API keys per day.

### Behavior
1. Each time a user generates an API key, their remaining API key count is reduced.
2. If the user reaches their daily limit, they cannot generate more API keys until the limit is renewed.
3. API key limits are automatically renewed daily at midnight (server time).

### Example Workflow
1. A user with the `basic` plan generates an API key.
2. Their remaining API key count is reduced from 50 to 49.
3. At midnight, their API key count is reset to 50.

### Notes
- The renewal process is handled automatically by the server using a scheduled task.

## API Usage Limits

### API Key Usage
- **Basic Plan**: 5 API calls per day.
- **Pro Plan**: 10 API calls per day.
- **Pro Plus Plan**: 15 API calls per day.

### Behavior
1. Each time a user fetches country data, their API usage count is incremented.
2. If the user exceeds their daily limit, they will receive a `429 Too Many Requests` error.
3. API usage limits reset daily at midnight (server time).

### Example Workflow
1. A user with the `basic` plan fetches country data.
2. Their remaining API usage count is reduced from 5 to 4.
3. If they exceed their limit, they cannot make further requests until the next day.

### Database Schema
The `api_usage` table tracks API usage:
- `id`: Unique identifier for each API usage record.
- `user_id`: The ID of the user making the request.
- `endpoint`: The API endpoint being accessed.
- `created_at`: The timestamp of the API request.

## Environment-Based Database Configuration

The application uses different SQLite database files based on the environment:

- **Development**: `country_api.db`
- **Production**: `country_api_prod.db`

### Configuration

Set the `NODE_ENV` variable in the `.env` file to specify the environment:
- `NODE_ENV=development` for development.
- `NODE_ENV=production` for production.

### Example

To run the application in production mode:
1. Set `NODE_ENV=production` in the `.env` file.
2. Restart the server.

The application will automatically use the `country_api_prod.db` database file.

## API Usage and Token Limits

### API Key Usage
- **Basic Plan**: 5 APIs per day, 1000 tokens total.
- **Pro Plan**: 10 APIs per day, 5000 tokens total.
- **Pro Plus Plan**: 15 APIs per day, 5000 tokens total.

### Behavior
1. Each API call consumes tokens (default: 1 token per request).
2. Users cannot exceed their daily API or token limits.
3. Limits reset daily at midnight (server time).

### Example Workflow
1. A user with the `basic` plan makes 5 API calls, consuming 200 tokens each.
2. Their remaining token count is reduced from 1000 to 0.
3. If they exceed their limit, they cannot make further requests until the next day.

### Database Schema
The `api_usage` table tracks API usage:
- `id`: Unique identifier for each API usage record.
- `user_id`: The ID of the user making the request.
- `endpoint`: The API endpoint being accessed.
- `tokens_used`: The number of tokens consumed by the request.
- `created_at`: The timestamp of the API request.

## API Key and Token Usage Checks

### API Key Generation
- Users can generate API keys up to their daily limit.
- If the limit is exceeded, the server returns:
  ```json
  {
    "error": "API key limit reached. Please wait until it renews."
  }
  ```

### Token Usage
- Each API call consumes tokens based on the user's plan:
  - **Basic Plan**: 1000 tokens per day.
  - **Pro Plan**: 5000 tokens per day.
  - **Pro Plus Plan**: 5000 tokens per day.
- If the token usage exceeds the daily limit, the server returns:
  ```json
  {
    "error": "Token usage limit reached for today."
  }
  ```

### Example Workflow
1. A user with the `basic` plan generates API keys and makes API calls.
2. If they exceed their API key or token limits, they cannot perform further actions until the limits are renewed.
3. Limits reset daily at midnight (server time).

## API Key and Token Usage Renewal

### Daily Renewal
- API key limits and token usage counts are reset every 24 hours.
- The renewal process runs automatically at midnight (server time).

### Behavior
1. **API Key Limits**:
   - **Basic Plan**: Reset to 5 API keys per day.
   - **Pro Plan**: Reset to 10 API keys per day.
   - **Pro Plus Plan**: Reset to 15 API keys per day.
2. **Token Usage**:
   - All token usage records older than 24 hours are cleared.

### Example Workflow
1. A user with the `basic` plan uses 3 API keys and consumes 500 tokens in a day.
2. At midnight, their API key count is reset to 5, and their token usage is cleared.
3. They can start fresh with their daily limits.

### Implementation
The renewal process is handled automatically by a scheduled task using `node-cron`. No manual intervention is required.


### Docker
-for start the docker use this command both frontend and backend 
    -docker-compose up