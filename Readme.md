# GitKarma

GitKarma is an event-driven, distributed system that analyzes a developer's open-source footprint—commits, pull requests, followers, and repository stars—to generate a comprehensive developer score and global percentile ranking.

Rather than relying on synchronous API calls that block the event loop and degrade user experience, GitKarma utilizes a decoupled microservice architecture to process heavy data aggregation in the background while streaming real-time execution progress to the client.

Watch the real-time Server-Sent Events (SSE) pipeline in action.


# System Architecture

GitKarma is built for resilience and high throughput, splitting compute-heavy tasks away from the main API layer.

- **Client Layer (Vercel)**: A React/Vite Single Page Application. It initiates requests and listens to a unidirectional Server-Sent Events (SSE) stream for real-time progress updates.

- **API Gateway (Railway Envoy Proxy)**: Routes incoming HTTPS traffic, preserving the true client IP via `X-Forwarded-For` headers for accurate rate limiting.

- **Node.js API Server (Railway VPC): The main orchestration layer. It intercepts traffic, checks the Redis cache and MongoDB for fresh data (under 8 hours old), and either returns a fast-path response or queues a background job.

- **Message Broker (Redis & BullMQ)**: Acts as the central nervous system. It manages job queues, handles retries, and powers the Pub/Sub channels required for SSE cross-process communication.

- **Score Worker**: An isolated Node.js process that consumes BullMQ jobs. It queries the GitHub GraphQL API, runs algorithmic bot-detection, calculates the proprietary score, atomically updates MongoDB, and publishes progress back to Redis.

- **Analytics Worker (Cron)**: A scheduled background process that runs hourly to scan the MongoDB user base and recalculate the global score distribution, caching the percentile mapping back into Redis.

# Core Features

- **Real-Time SSE Streaming**: Bypasses layer-7 proxy buffering using strict `X-Accel-Buffering: no` headers to stream BullMQ job progress directly to the browser with zero latency.

- **Multi-Tiered Caching**: Utilizes a fast-path Redis cache for instant lookups, backed by a MongoDB freshness check to self-heal the cache and minimize redundant GitHub API calls.

- **Defensive Security Perimeter**: Protects upstream rate limits using a dual-layer defense: a rolling-window IP rate limiter (5 req/min) and a persistent daily IP blacklist that instantly drops traffic from scrapers exceeding 100 profiles a day.

- **Algorithmic Bot Detection**: Analyzes commit-to-PR and follower ratios to identify and permanently flag synthetic accounts, preventing polluted percentile distributions.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Redux Toolkit, Axios

- **Backend**: Node.js, Express, BullMQ

- **Database & Caching**: MongoDB Atlas, Redis (ioredis)

- **Infrastructure**: Vercel (Edge CDN), Railway (VPC, Containers)

# Local Development Setup
## 1. Prerequisites
Ensure you have Node.js (v18+) and a local or cloud instance of Redis and MongoDB running. You will also need a GitHub Personal Access Token (PAT).

## 2. Clone and Install

The project is structured as a monorepo.

```bash
git clone https://github.com/yourusername/gitkarma.git
cd gitkarma

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

## 3. Environment Variables
### Create a .env file in the root directory and configure the following:

```js
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# Databases
DB_PASSWORD="Your MongoDB Password"
REDIS_URL="redis://localhost:6379"

# GitHub Integration
GITHUB_PAT="your_github_personal_access_token"
```

### Create a .env file in the /client directory:

```js
VITE_BACKEND_URL="http://localhost:5000"
```

## 4. Run the Application
You will need multiple terminal windows to run the distributed services locally.

### Terminal 1 (API Server):
```bash
cd server
npm run dev
```

### Terminal 2 (Score Worker):

```bash
cd server
npm run worker:score
```

### Terminal 3 (Analytics Cron):

```Bash
cd server
npm run worker:analytics
```

### Terminal 4 (Frontend):

```Bash
cd client
npm run dev
```

## Contributing

Contributions, issues, and feature requests are welcome.
Feel free to check the issues page if you want to contribute.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
