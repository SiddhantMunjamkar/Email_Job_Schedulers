# Email Job Schedulers - Backend

A production-ready, distributed email scheduling and campaign management system built with Node.js, TypeScript, BullMQ, and PostgreSQL. This system enables scheduled bulk email campaigns with sophisticated features including automatic reconciliation, multi-layer idempotency, distributed rate limiting, and self-healing capabilities.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Advanced Scheduler Features](#advanced-scheduler-features)
- [Email Processing Flow](#email-processing-flow)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Environment Configuration](#environment-configuration)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [Technical Decisions](#technical-decisions)
- [Security Features](#security-features)
- [Business Logic Details](#business-logic-details)

---

## Overview

The Email Job Schedulers is a distributed system designed to manage and execute bulk email campaigns with precise delivery scheduling. The platform allows users to:

- **Schedule bulk email campaigns** with configurable start times and staggered delivery
- **Manage multiple email senders** with independent rate limiting per sender
- **Track email delivery status** in real-time (scheduled, sending, sent, failed)
- **Authenticate via local credentials or Google OAuth**
- **Ensure reliable delivery** through automatic reconciliation and retry mechanisms
- **Prevent duplicate sends** using three-layer idempotency (database, queue, distributed locks)

### Core Purpose

This system solves the problem of reliable, scalable email campaign management where:
1. Emails must be delivered at specific times
2. Delivery must be staggered to avoid spam filters
3. Rate limits must be enforced per sender
4. No emails should be lost during infrastructure failures
5. No emails should be sent twice

---

## Key Features

### 1. Dual Authentication System
- **Local Authentication**: Email/password registration with bcrypt hashing and JWT
- **Google OAuth 2.0**: Seamless social authentication with Passport.js
- **Secure JWT Management**: HTTP-only cookies with 7-day expiration

### 2. Campaign Management
- Create campaigns with subject, body, sender, and scheduled start time
- Track campaign-level statistics (total, scheduled, sent, failed counts)
- Paginated campaign listing with detailed email job views

### 3. Advanced Email Scheduling
- **Staggered Delivery**: Configure 0-60 second delays between emails
- **Automatic Reconciliation**: Self-healing system recovers orphaned jobs on startup
- **Rate Limiting**: Per-sender hourly limits (default: 100 emails/hour)
- **Automatic Rescheduling**: Jobs exceeding rate limits defer to next hour window
- **Three-Layer Idempotency**: Prevents duplicate sends at database, queue, and worker levels

### 4. Sender Management
- Multiple senders per user with unique email addresses
- Rate limiting applied independently per sender
- Prevents duplicate sender emails via database constraints

### 5. Reliability & Monitoring
- **Self-Healing**: Reconciliation on worker startup recovers lost jobs
- **Status Tracking**: Four states (SCHEDULED, SENDING, SENT, FAILED)
- **Error Tracking**: Records last error message for failed jobs
- **Retry Logic**: 3 automatic retries with exponential backoff

---

## Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Runtime** | Node.js 20 | JavaScript runtime environment |
| **Language** | TypeScript | Type-safe development |
| **Framework** | Express.js 5 | HTTP API server |
| **Database** | PostgreSQL | Relational data storage |
| **ORM** | Prisma | Type-safe database client with migrations |
| **Queue** | BullMQ | Redis-based distributed job queue |
| **Cache/Locks** | Redis (IORedis) | Rate limiting counters and distributed locks |
| **Validation** | Zod | Runtime schema validation |
| **Authentication** | Passport.js, JWT, bcrypt | User authentication and authorization |
| **Email** | Nodemailer | SMTP email delivery (Ethereal for testing) |
| **Process Manager** | Custom | Dual-process architecture (server + worker) |

---

## Architecture

### Dual-Process Design

The system uses a **dual-process architecture** that separates HTTP request handling from background job processing:

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATIONS                     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER PROCESS (server.ts)                │
│  ┌────────────┬───────────┬──────────┬──────────────────┐  │
│  │    Auth    │  Emails   │ Senders  │    Campaigns     │  │
│  │ Controller │Controller │Controller│   Controller     │  │
│  └────────────┴───────────┴──────────┴──────────────────┘  │
│         │              │                                     │
│         ▼              ▼                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           Express.js + Middleware Layer               │ │
│  │  (Auth, CORS, Validation, Cookie Parser)              │ │
│  └───────────────────────────────────────────────────────┘ │
└────────┬───────────────────────┬────────────────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────────────┐
│   PostgreSQL    │     │     BullMQ Queue         │
│   (Prisma ORM)  │◄────┤   (Redis-backed)         │
└────────┬────────┘     └────────┬─────────────────┘
         │                       │                      
         │                       │                      
         ▼                       ▼                      
┌─────────────────────────────────────────────────────────────┐
│                   WORKER PROCESS (worker.ts)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Email Processor (email.processor.ts)         │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  1. Acquire Lock (Idempotency)                 │ │  │
│  │  │  2. Fetch Email Job from Database              │ │  │
│  │  │  3. Check Rate Limit (Redis Counter)           │ │  │
│  │  │  4. Send Email (Nodemailer)                    │ │  │
│  │  │  5. Update Status (SENT/FAILED)                │ │  │
│  │  │  6. Release Lock                               │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│  Concurrency: 5 workers │ Retries: 3 with backoff          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                 ┌──────────────────────┐
                 │    Redis Services    │
                 │  - Rate Limiting     │
                 │  - Idempotency Locks │
                 │  - Time Windows      │
                 └──────────────────────┘
```

### Why Dual-Process?

1. **Separation of Concerns**: HTTP API handling is isolated from CPU-intensive background processing
2. **Independent Scaling**: Scale API servers and workers independently based on different metrics
3. **Reliability**: Server crashes don't affect email processing; worker crashes don't affect API availability
4. **Resource Isolation**: Workers can use high concurrency without impacting API response times
5. **Deployment Flexibility**: Deploy to different machines/containers with different resource allocations

### Process Responsibilities

#### Server Process ([server.ts](src/server.ts))
- Listens on HTTP port (default: 4000)
- Handles all REST API requests
- User authentication and session management
- CRUD operations for campaigns, senders, emails
- Enqueues email jobs into BullMQ
- Returns immediately to client after queuing

#### Worker Process ([worker.ts](src/worker.ts))
- Runs background job processor
- Processes email jobs from Redis queue
- Executes reconciliation on startup
- Configurable concurrency (default: 5 concurrent jobs)
- No HTTP traffic handling
- Long-running process

---

## Advanced Scheduler Features

### 1. Reconciliation on Startup

**Location**: [src/scheduler/reconciliationOnstartup.ts](src/scheduler/reconciliationOnstartup.ts)

#### The Problem
Email jobs can be "orphaned" (present in database but missing from BullMQ queue) due to:
- Server crashes during job creation
- Redis restarts or data loss
- Deployment rollouts
- Network partitions between API server and Redis
- Manual database edits

Without reconciliation, these orphaned jobs would never be sent.

#### The Solution

When the worker process starts, it automatically scans for and recovers orphaned jobs:

```typescript
async function reconcileOrphanedJobs() {
  // 1. Find jobs that should have been processed
  const orphanedJobs = await prisma.emailJob.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: new Date() }  // Should have run by now
    },
    take: 500,  // Batch processing
    include: { campaign: true }
  });

  // 2. For each job, check if it exists in BullMQ
  // 3. If missing, re-add to queue
  // 4. Update bullmqJobId in database
  // 5. Log statistics
}
```

#### Implementation Details

1. **Query Strategy**: Finds `SCHEDULED` jobs where `scheduledAt <= now()`
2. **Batch Limit**: Processes maximum 500 jobs per reconciliation run
3. **Queue Verification**: Checks if each job exists in BullMQ before re-queuing
4. **Idempotent**: Safe to run multiple times (uses BullMQ's jobId deduplication)
5. **Logging**: Reports `[Requeued: X | Already OK: Y]`

#### Edge Cases Handled

- Jobs already in queue → Skipped (BullMQ rejects duplicate jobIds)
- Jobs marked as SENDING/SENT → Not reconciled (status filter prevents)
- Jobs with future scheduledAt → Not reconciled (time filter prevents)
- Worker restart during reconciliation → Safe (atomic job creation)

### 2. Distributed Rate Limiting

**Location**: [src/services/rateLimit/rate.Limit.service.ts](src/services/rateLimit/rate.Limit.service.ts)

#### The Problem
Sending too many emails from a single sender in a short time period:
- Triggers spam filters
- Damages sender reputation
- May violate SMTP provider limits
- Risk of account suspension

#### The Solution

**Per-sender, per-hour rate limiting** using Redis atomic counters:

```typescript
// Redis key structure
rateLimit:sender:{senderId}:{YYYY-MM-DD-HH}

// Example: rateLimit:sender:cm4abc123:2026-02-07-14
```

#### Implementation Details

1. **Atomic Counter**: Uses Redis `INCR` command for thread-safe increments
2. **Time Window**: Hourly buckets (e.g., 14:00-14:59)
3. **Key Format**: `rateLimit:sender:{senderId}:{YYYY-MM-DD-HH}`
4. **TTL Strategy**: Key expires at end of hour + 5 minutes buffer
5. **Distributed**: All workers share same Redis counters
6. **Configurable Limit**: Default 100 emails/hour via `MAX_EMAILS_PER_HOUR_PER_SENDER`

#### Rate Limit Check Flow

```typescript
// Before sending each email:
const count = await redis.incr(`rateLimit:sender:${senderId}:${hourWindow}`);

if (count === 1) {
  // First email this hour - set TTL
  await redis.expire(key, secondsUntilEndOfHour + 300);
}

if (count > MAX_LIMIT) {
  // Exceeded limit - reschedule to next hour
  await rescheduleToNextWindow(emailJob);
  return;
}

// Proceed with sending
```

#### Why Redis?

- **Atomic Operations**: `INCR` guarantees no race conditions between workers
- **Distributed State**: All workers see same counter values
- **Automatic Cleanup**: TTL removes old keys automatically
- **High Performance**: Sub-millisecond operations even at high concurrency

### 3. Automatic Rescheduling

**Location**: [src/scheduler/rescheduleToNextWindow.ts](src/scheduler/rescheduleToNextWindow.ts)

#### The Problem
When rate limit is exceeded, we don't want to:
- Fail the email (user expects delivery)
- Retry immediately (will hit limit again)
- Lose the email (data loss)

#### The Solution

**Automatically defer the email to the next hourly window**:

```typescript
async function rescheduleToNextWindow(emailJob) {
  // 1. Calculate next hour start
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  
  // 2. Re-add to BullMQ with new delay
  const delayMs = nextHour.getTime() - now.getTime();
  
  await emailQueue.add("send-email", 
    { emailJobId: emailJob.id },
    {
      jobId: emailJob.id,  // Same ID - idempotent
      delay: delayMs,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 }
    }
  );
  
  // 3. Update scheduled time in database
  await prisma.emailJob.update({
    where: { id: emailJob.id },
    data: { scheduledAt: nextHour }
  });
}
```

#### Implementation Details

1. **Time Calculation**: Next hour at `:00` minutes (e.g., 14:37 → 15:00)
2. **BullMQ Re-queuing**: Uses same `jobId` for idempotency (BullMQ removes old job)
3. **Database Update**: Updates `scheduledAt` to reflect new schedule
4. **Retry Configuration**: 3 attempts with exponential backoff
5. **Transparent to User**: UI shows job as "SCHEDULED" at new time

#### Example Scenario

```
Time: 14:45
Sender: john@example.com (sent 100 emails from 14:00-14:45)
New email: recipient@example.com

Flow:
1. Rate limit check: 101 emails > 100 limit ❌
2. Calculate next window: 15:00 (15 minutes from now)
3. Reschedule job to 15:00
4. User sees: "Scheduled for 15:00" (was originally 14:45)
```

### 4. Three-Layer Idempotency

Prevents duplicate email sends through multiple defensive layers:

#### Layer 1: Database-Level Idempotency

**Location**: [prisma/schema.prisma](prisma/schema.prisma)

```prisma
model EmailJob {
  id         String   @id @default(cuid())
  campaignId String
  recipient  String
  
  @@unique([campaignId, recipient])  // ← Prevents duplicates
}
```

**Protects Against**:
- User double-clicking submit button
- API client retry logic
- Concurrent API requests with same data

**Behavior**: Database rejects insert with unique constraint violation

#### Layer 2: BullMQ-Level Idempotency

**Location**: [src/modules/emails/email.service.ts](src/modules/emails/email.service.ts)

```typescript
await emailQueue.add("send-email",
  { emailJobId: job.id },
  {
    jobId: job.id,  // ← Custom job ID = emailJob.id (database PK)
    delay: delayMs,
    attempts: 3
  }
);
```

**Protects Against**:
- Race conditions between API servers
- Retry logic re-queuing same job
- Reconciliation re-queuing active jobs

**Behavior**: BullMQ rejects duplicate `jobId` (replaces old job with same ID)

#### Layer 3: Redis Lock Idempotency

**Location**: [src/services/idempotency/idempotency.service.ts](src/services/idempotency/idempotency.service.ts)

```typescript
async function acquireLock(emailJobId: string): Promise<boolean> {
  const key = `lock:email-sent:${emailJobId}`;
  const result = await redis.set(key, "locked", "EX", 300, "NX");
  return result === "OK";  // True if acquired, false if exists
}

async function releaseLock(emailJobId: string): Promise<void> {
  await redis.del(`lock:email-sent:${emailJobId}`);
}
```

**Protects Against**:
- Multiple workers processing same job concurrently
- Job retries while original is still processing
- Worker crashes during send (lock expires after 5 minutes)

**Behavior**: First worker acquires lock; others skip the job

#### Complete Protection Flow

```
User submits email campaign
    ↓
Layer 1: Database prevents duplicate (campaignId, recipient)
    ↓
API creates EmailJob → JobId = abc123
    ↓
Layer 2: BullMQ prevents duplicate jobId "abc123"
    ↓
Worker picks up job "abc123"
    ↓
Layer 3: Redis lock prevents concurrent processing
    ↓
Email sent successfully ✓
```

---

## Email Processing Flow

**Location**: [src/queue/email.processor.ts](src/queue/email.processor.ts)

### Complete Processing Steps

```typescript
async function processEmailJob(job: Job) {
  const emailJobId = job.data.emailJobId;

  // STEP 1: Acquire Distributed Lock
  const lockAcquired = await acquireLock(emailJobId);
  if (!lockAcquired) {
    console.log(`Job ${emailJobId} already being processed`);
    return;  // Another worker is handling it
  }

  try {
    // STEP 2: Fetch Job from Database
    const emailJob = await prisma.emailJob.findUnique({
      where: { id: emailJobId },
      include: { 
        campaign: { include: { sender: true } }
      }
    });

    // STEP 3: Early Exit if Already Sent
    if (emailJob.status === "SENT") {
      console.log(`Email ${emailJobId} already sent`);
      return;
    }

    // STEP 4: Rate Limit Check
    const senderId = emailJob.campaign.senderId;
    const hourWindow = getHourWindowKey();
    const count = await incrementRateLimit(senderId, hourWindow);

    if (count > MAX_EMAILS_PER_HOUR_PER_SENDER) {
      // Reschedule to next hour
      await rescheduleToNextWindow(emailJob);
      console.log(`Rate limit exceeded, rescheduled to next hour`);
      return;
    }

    // STEP 5: Mark as SENDING
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: { status: "SENDING" }
    });

    // STEP 6: Send Email via SMTP
    const transporter = getMailerTransporter();
    await transporter.sendMail({
      from: `${emailJob.campaign.sender.name} <${emailJob.campaign.sender.fromemail}>`,
      to: emailJob.recipient,
      subject: emailJob.campaign.subject,
      html: emailJob.campaign.body
    });

    // STEP 7: Mark as SENT
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: { 
        status: "SENT",
        sentAt: new Date()
      }
    });

    // STEP 8: Sleep (Prevent SMTP Flooding)
    await sleep(MIN_DELAY_BETWEEN_EMAILS_SECONDS * 1000);

  } catch (error) {
    // STEP 9: Error Handling
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: { 
        status: "SCHEDULED",  // Reset for retry
        lastError: error.message
      }
    });
    throw error;  // Let BullMQ retry
    
  } finally {
    // STEP 10: Always Release Lock
    await releaseLock(emailJobId);
  }
}
```

### Worker Configuration

```typescript
// worker.ts
const worker = new Worker("email-queue", processEmailJob, {
  connection: redisConnection,
  concurrency: WORKER_CONCURRENCY,  // Default: 5
  limiter: {
    max: 10,     // Max 10 jobs
    duration: 1000  // Per second
  }
});
```

### Retry Strategy

- **Attempts**: 3 retries per job
- **Backoff**: Exponential (2s, 4s, 8s)
- **On Failure**: After 3 attempts, status remains `SCHEDULED` with `lastError`
- **Manual Retry**: Can be triggered by re-queuing the job

### Status State Machine

```
SCHEDULED ──┬──► SENDING ──► SENT ✓
            │                 
            └──► FAILED ✗
                 (after 3 retries)
```

States:
- **SCHEDULED**: In queue, waiting to be processed
- **SENDING**: Currently being sent by a worker
- **SENT**: Successfully delivered
- **FAILED**: Permanent failure after all retries

---

## Database Schema

**Location**: [prisma/schema.prisma](prisma/schema.prisma)

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id              │──┐
│ email (unique)  │  │
│ passwordHash    │  │
│ name            │  │
│ avatarUrl       │  │
└─────────────────┘  │
                     │
         ┌───────────┴───────────┬─────────────┬─────────────┐
         │                       │             │             │
         ▼                       ▼             ▼             ▼
┌─────────────────┐    ┌─────────────────┐  ┌─────────────────┐
│    Account      │    │     Sender      │  │    Campaign     │
├─────────────────┤    ├─────────────────┤  ├─────────────────┤
│ id              │    │ id              │  │ id              │
│ userId (FK)     │    │ userId (FK)     │  │ userId (FK)     │
│ provider        │    │ name            │  │ senderId (FK)───┘
│ providerId      │    │ fromemail       │  │ subject         │
│ accessToken     │    └─────────────────┘  │ body            │
│ refreshToken    │           │             │ startAt         │
└─────────────────┘           │             └─────────────────┘
  @@unique([provider, providerId])          │
  Cascade: DELETE            │              │
                             │              │
                    @@unique([userId, fromemail])
                             │              │
                             └──────────────┼────────────┐
                                            │            │
                                            ▼            ▼
                                   ┌─────────────────┐
                                   │   EmailJob      │
                                   ├─────────────────┤
                                   │ id              │
                                   │ campaignId (FK) │
                                   │ recipient       │
                                   │ status (enum)   │
                                   │ scheduledAt     │
                                   │ sentAt          │
                                   │ lastError       │
                                   │ bullmqJobId     │
                                   └─────────────────┘
                                   @@unique([campaignId, recipient])
                                   @@index([status])
                                   @@index([scheduledAt])
                                   Cascade: DELETE
```

### Schema Details

#### User
- **Purpose**: Store user account information
- **Authentication**: Supports both local (passwordHash) and OAuth (via Account)
- **Relations**: One-to-many with Account, Sender, Campaign

#### Account
- **Purpose**: Store OAuth provider credentials
- **Providers**: Google (extensible to GitHub, Facebook, etc.)
- **Unique Constraint**: `(provider, providerId)` prevents duplicate OAuth links
- **Cascade Delete**: Deleted when user is deleted

#### Sender
- **Purpose**: Define "from" email addresses for campaigns
- **Unique Constraint**: `(userId, fromemail)` prevents duplicate senders per user
- **Rate Limiting**: Each sender has independent hourly rate limit
- **Cascade Delete**: Deleted when user is deleted

#### Campaign
- **Purpose**: Group emails into campaigns for tracking and analytics
- **Relations**: Belongs to User and Sender, has many EmailJobs
- **Cascade Delete**: All EmailJobs deleted when campaign is deleted

#### EmailJob
- **Purpose**: Individual email sending task
- **Status Enum**: `SCHEDULED | SENDING | SENT | FAILED`
- **Unique Constraint**: `(campaignId, recipient)` prevents duplicate emails in campaign
- **Indexes**: 
  - `status` - for filtering scheduled/sent emails
  - `scheduledAt` - for reconciliation queries
- **BullMQ Integration**: `bullmqJobId` stores queue job identifier
- **Cascade Delete**: Deleted when campaign is deleted

### Migrations

Located in [prisma/migrations/](prisma/migrations/):

1. **20260126112748_auth_init**: Initial User and Account tables
2. **20260126163303_scheduler_core**: Campaign and EmailJob tables
3. **20260130091415_adding_constraint_sender**: Added unique constraint on sender email

---

## API Reference

Base URL: `http://localhost:4000/api/v1`

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "cm4abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": null
  }
}
```

**Validation** (Zod schema):
- Email: Must be valid email format
- Password: Minimum 6 characters
- Name: Minimum 2 characters

#### POST `/auth/login`
Login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "cm4abc123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Sets Cookie**: `token` (HTTP-only, Secure, SameSite=None)

#### GET `/auth/google`
Initiate Google OAuth flow. Redirects to Google login.

#### GET `/auth/google/callback`
Google OAuth callback. Redirects to frontend with JWT cookie.

**Query Params**: `code`, `state` (handled by Passport)

**Redirects**: `${FRONTEND_URL}?auth=success`

#### GET `/auth/me`
Get current authenticated user.

**Headers**: `Cookie: token=<jwt>`

**Response** (200):
```json
{
  "user": {
    "id": "cm4abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://..."
  }
}
```

#### POST `/auth/logout`
Logout and clear authentication cookie.

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

### Email Endpoints

All email endpoints require authentication (`requireAuth` middleware).

#### POST `/emails/schedule-emails`
Create a campaign and schedule emails.

**Request Body**:
```json
{
  "senderId": "cm4sender123",
  "subject": "Welcome to our platform!",
  "body": "<h1>Hello!</h1><p>Welcome message...</p>",
  "recipients": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ],
  "startAt": "2026-02-07T15:00:00Z",
  "delayBetweenSeconds": 10
}
```

**Validation**:
- `senderId`: Must exist and belong to authenticated user
- `subject`: 1-200 characters
- `body`: 1-10000 characters (HTML allowed)
- `recipients`: Array of 1-1000 valid email addresses
- `startAt`: ISO 8601 datetime in future
- `delayBetweenSeconds`: Integer 0-60

**Response** (201):
```json
{
  "campaign": {
    "id": "cm4campaign123",
    "subject": "Welcome to our platform!",
    "createdAt": "2026-02-07T10:30:00Z"
  },
  "scheduledCount": 3
}
```

**Business Logic**:
1. Creates Campaign record
2. Creates EmailJob for each recipient with calculated `scheduledAt`:
   - Job 0: `startAt`
   - Job 1: `startAt + 10 seconds`
   - Job 2: `startAt + 20 seconds`
3. Enqueues each job in BullMQ with appropriate delay
4. Returns immediately (async processing)

#### GET `/emails/scheduled`
List scheduled and sending emails with pagination.

**Query Params**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response** (200):
```json
{
  "emails": [
    {
      "id": "cm4email123",
      "recipient": "user1@example.com",
      "status": "SCHEDULED",
      "scheduledAt": "2026-02-07T15:00:00Z",
      "campaign": {
        "id": "cm4campaign123",
        "subject": "Welcome to our platform!",
        "sender": {
          "name": "John Doe",
          "fromemail": "john@example.com"
        }
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

#### GET `/emails/sent`
List sent emails with pagination.

**Query Params**: Same as `/emails/scheduled`

**Response** (200):
```json
{
  "emails": [
    {
      "id": "cm4email456",
      "recipient": "user2@example.com",
      "status": "SENT",
      "scheduledAt": "2026-02-07T14:00:00Z",
      "sentAt": "2026-02-07T14:00:05Z",
      "campaign": {
        "id": "cm4campaign123",
        "subject": "Welcome to our platform!",
        "sender": {
          "name": "John Doe",
          "fromemail": "john@example.com"
        }
      }
    }
  ],
  "pagination": { ... }
}
```

#### GET `/emails/count/stats`
Get email statistics for authenticated user.

**Response** (200):
```json
{
  "scheduled": 150,
  "sent": 842
}
```

#### GET `/emails/:id`
Get details of a specific email job.

**Path Params**: `id` (EmailJob ID)

**Response** (200):
```json
{
  "id": "cm4email123",
  "recipient": "user1@example.com",
  "status": "SCHEDULED",
  "scheduledAt": "2026-02-07T15:00:00Z",
  "sentAt": null,
  "lastError": null,
  "campaign": {
    "id": "cm4campaign123",
    "subject": "Welcome to our platform!",
    "body": "<h1>Hello!</h1>...",
    "sender": {
      "id": "cm4sender123",
      "name": "John Doe",
      "fromemail": "john@example.com"
    }
  }
}
```

---

### Sender Endpoints

#### POST `/senders`
Create a new sender.

**Request Body**:
```json
{
  "name": "John Doe",
  "fromemail": "john@example.com"
}
```

**Validation**:
- `name`: 2-100 characters
- `fromemail`: Valid email format
- Unique: `(userId, fromemail)` must be unique

**Response** (201):
```json
{
  "id": "cm4sender123",
  "name": "John Doe",
  "fromemail": "john@example.com",
  "userId": "cm4user123"
}
```

**Error** (400):
```json
{
  "error": "Sender with this email already exists"
}
```

#### GET `/senders`
List all senders for authenticated user.

**Response** (200):
```json
{
  "senders": [
    {
      "id": "cm4sender123",
      "name": "John Doe",
      "fromemail": "john@example.com"
    },
    {
      "id": "cm4sender456",
      "name": "Support Team",
      "fromemail": "support@example.com"
    }
  ]
}
```

---

### Campaign Endpoints

#### GET `/campaigns`
List campaigns with pagination.

**Query Params**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response** (200):
```json
{
  "campaigns": [
    {
      "id": "cm4campaign123",
      "subject": "Welcome to our platform!",
      "startAt": "2026-02-07T15:00:00Z",
      "createdAt": "2026-02-07T10:30:00Z",
      "sender": {
        "name": "John Doe",
        "fromemail": "john@example.com"
      },
      "_count": {
        "emailJobs": 500
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

#### GET `/campaigns/:id`
Get campaign details with statistics and email jobs.

**Path Params**: `id` (Campaign ID)

**Query Params**:
- `emailsPage`: Page for email jobs (default: 1)
- `emailsLimit`: Limit for email jobs (default: 20, max: 100)

**Response** (200):
```json
{
  "id": "cm4campaign123",
  "subject": "Welcome to our platform!",
  "body": "<h1>Hello!</h1><p>Welcome...</p>",
  "startAt": "2026-02-07T15:00:00Z",
  "createdAt": "2026-02-07T10:30:00Z",
  "sender": {
    "id": "cm4sender123",
    "name": "John Doe",
    "fromemail": "john@example.com"
  },
  "stats": {
    "total": 500,
    "scheduled": 150,
    "sending": 5,
    "sent": 342,
    "failed": 3
  },
  "emails": {
    "data": [
      {
        "id": "cm4email123",
        "recipient": "user1@example.com",
        "status": "SENT",
        "scheduledAt": "2026-02-07T15:00:00Z",
        "sentAt": "2026-02-07T15:00:03Z"
      }
    ],
    "pagination": {
      "total": 500,
      "page": 1,
      "limit": 20,
      "totalPages": 25
    }
  }
}
```

---

### Health Check

#### GET `/health`
Check API server status.

**Response** (200):
```json
{
  "status": "OK"
}
```

---

## Environment Configuration

### Required Variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/email_scheduler"
DIRECT_URL="postgresql://user:password@localhost:5432/email_scheduler"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/api/v1/auth/google/callback"

# Application
PORT="4000"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Worker Configuration
WORKER_CONCURRENCY="5"
MAX_EMAILS_PER_HOUR_PER_SENDER="100"
MIN_DELAY_BETWEEN_EMAILS_SECONDS="2"
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| **Database** |
| `DATABASE_URL` | ✅ | - | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | ✅ | - | PostgreSQL direct connection (migrations) |
| **Redis** |
| `REDIS_URL` | ✅ | `redis://localhost:6379` | Redis connection string |
| **Authentication** |
| `JWT_SECRET` | ✅ | - | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | ❌ | `7d` | JWT token expiration (e.g., `7d`, `24h`) |
| `GOOGLE_CLIENT_ID` | ✅* | - | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | ✅* | - | Google OAuth 2.0 secret |
| `GOOGLE_CALLBACK_URL` | ✅* | - | OAuth redirect URI |
| **Application** |
| `PORT` | ❌ | `5000` | HTTP server port |
| `NODE_ENV` | ❌ | `development` | Environment (`development`\|`production`) |
| `FRONTEND_URL` | ✅ | - | Frontend URL for CORS and OAuth redirects |
| **Worker** |
| `WORKER_CONCURRENCY` | ❌ | `5` | Concurrent email jobs (1-50) |
| `MAX_EMAILS_PER_HOUR_PER_SENDER` | ❌ | `100` | Rate limit per sender per hour |
| `MIN_DELAY_BETWEEN_EMAILS_SECONDS` | ❌ | `2` | Minimum delay between sends (0-60) |

\* Required only if using Google OAuth

---

## Development Setup

### Prerequisites

- **Node.js**: 20.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 6.x or higher
- **npm** or **yarn**

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL and Redis**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d postgres redis

   # Or install locally and start services
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

7. **Build TypeScript**
   ```bash
   npm run build
   ```

### Running the Application

You need to run **both** processes simultaneously:

#### Option 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Server**:
```bash
npm run dev:server
# Or: npx tsx watch src/server.ts
```

**Terminal 2 - Worker**:
```bash
npm run dev:worker
# Or: npx tsx watch src/worker.ts
```

#### Option 2: Production Mode

```bash
# Build first
npm run build

# Terminal 1
npm run start:server

# Terminal 2
npm run start:worker
```

### Testing Email Delivery

The system uses **Ethereal Email** for testing (fake SMTP):

1. Emails are not actually delivered to recipients
2. View sent emails at: [https://ethereal.email](https://ethereal.email)
3. Credentials are hardcoded in [src/services/mailer/mailer.service.ts](src/services/mailer/mailer.service.ts)
4. Check console logs for email preview URLs

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_description

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Apply migrations in production
npx prisma migrate deploy
```

### Common Development Tasks

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check

# View logs
# Server logs: stdout
# Worker logs: stdout (shows job processing)
```

---

## Deployment

### Option 1: Fly.io (Recommended)

**Configuration**: [fly.toml](fly.toml), [fly.server.toml](fly.server.toml), [fly.worker.toml](fly.worker.toml)

#### Architecture

Fly.io deployment uses **separate machine pools** for server and worker:

- **Server Machines**: Handle HTTP traffic, auto-scale based on requests
- **Worker Machines**: Process background jobs, no HTTP traffic

#### Setup

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**
   ```bash
   fly auth login
   ```

3. **Create Postgres database**
   ```bash
   fly postgres create --name email-scheduler-db
   fly postgres attach email-scheduler-db
   ```

4. **Create Redis instance**
   ```bash
   fly redis create --name email-scheduler-redis
   ```

5. **Set secrets**
   ```bash
   fly secrets set JWT_SECRET="your-secret-key"
   fly secrets set GOOGLE_CLIENT_ID="your-google-id"
   fly secrets set GOOGLE_CLIENT_SECRET="your-google-secret"
   fly secrets set GOOGLE_CALLBACK_URL="https://your-app.fly.dev/api/v1/auth/google/callback"
   fly secrets set FRONTEND_URL="https://your-frontend.com"
   ```

6. **Deploy**
   ```bash
   # Deploy both server and worker
   fly deploy
   ```

#### Scaling

```bash
# Scale server machines
fly scale count 2 --process-group server

# Scale worker machines
fly scale count 3 --process-group worker

# Auto-scale configuration in fly.toml:
# - Servers: min=0, max=10 (auto-stop when idle)
# - Workers: min=1, max=5 (always running)
```

#### Monitoring

```bash
# View logs
fly logs

# View server logs only
fly logs --process-group server

# View worker logs only
fly logs --process-group worker

# SSH into machine
fly ssh console
```

### Option 2: Render

**Configuration**: [render.yaml](render.yaml)

#### Setup

1. **Connect GitHub** to Render dashboard

2. **Create Blueprint** from [render.yaml](render.yaml):
   - Automatically creates Web Service (server) and Worker Service (worker)
   - Creates PostgreSQL and Redis databases

3. **Set Environment Variables** in dashboard:
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL`
   - `FRONTEND_URL`

4. **Deploy**: Push to GitHub main branch

#### Features

- **Auto-deploy**: Pushes to main trigger deployment
- **Build Filters**: Only rebuilds when `src/` or `prisma/` changes
- **Region**: Singapore (configurable)
- **Plan**: Free tier available

### Option 3: Railway

**Configuration**: [railway.json](railway.json)

#### Setup

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize project**
   ```bash
   railway init
   ```

4. **Add PostgreSQL**
   ```bash
   railway add --database postgres
   ```

5. **Add Redis**
   ```bash
   railway add --database redis
   ```

6. **Set environment variables**
   ```bash
   railway variables set JWT_SECRET="your-secret"
   # ... other variables
   ```

7. **Deploy**
   ```bash
   railway up
   ```

#### Worker-Only Deployment

The [railway.json](railway.json) is configured for **worker-only**. To deploy server:

1. Create separate service for server
2. Set `CMD`: `node dist/server.js`
3. Enable HTTP port exposure

### Option 4: Docker

**Configuration**: [Dockerfile](Dockerfile)

#### Multi-Stage Build

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
CMD ["node", "dist/server.js"]
```

#### Running Locally

```bash
# Build image
docker build -t email-scheduler .

# Run server
docker run -p 4000:4000 \
  -e DATABASE_URL="..." \
  -e REDIS_URL="..." \
  email-scheduler node dist/server.js

# Run worker
docker run \
  -e DATABASE_URL="..." \
  -e REDIS_URL="..." \
  email-scheduler node dist/worker.js
```

#### Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: email_scheduler
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  server:
    build: .
    command: node dist/server.js
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/email_scheduler
      REDIS_URL: redis://redis:6379
      # ... other env vars
    depends_on:
      - postgres
      - redis

  worker:
    build: .
    command: node dist/worker.js
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/email_scheduler
      REDIS_URL: redis://redis:6379
      # ... other env vars
    depends_on:
      - postgres
      - redis
```

---

## Technical Decisions

### Why BullMQ Over Other Queue Systems?

**Chosen**: BullMQ  
**Alternatives Considered**: SQS, RabbitMQ, Celery

**Reasoning**:
1. **Redis-Backed**: We already use Redis for rate limiting and locks, no extra infrastructure
2. **Delayed Jobs**: Native support for scheduling jobs at specific times (core requirement)
3. **Retry Logic**: Built-in exponential backoff without custom code
4. **TypeScript Support**: First-class TypeScript types and async/await
5. **Job Tracking**: Automatic job state management (completed, failed, delayed)
6. **Concurrency Control**: Worker-level concurrency limits prevent resource exhaustion
7. **Job Deduplication**: Custom `jobId` prevents duplicate jobs in queue
8. **Performance**: Handles 10,000+ jobs/second with proper Redis configuration

**Trade-offs**:
- ❌ Single point of failure (Redis) - mitigated with Redis cluster/sentinel
- ✅ Simple architecture, no message broker needed
- ✅ Low latency (sub-millisecond job scheduling)

### Why Prisma Over Raw SQL or Other ORMs?

**Chosen**: Prisma  
**Alternatives Considered**: TypeORM, Sequelize, Knex

**Reasoning**:
1. **Type Safety**: Auto-generated TypeScript types from schema eliminate runtime errors
2. **Migration System**: Git-friendly migrations with automatic diff detection
3. **Relations**: Cascade deletes and nested includes handled automatically
4. **Developer Experience**: Autocomplete for all queries, no manual type definitions
5. **Query Performance**: Batching and connection pooling built-in
6. **Schema as Source of Truth**: Single `schema.prisma` file defines entire data model

**Trade-offs**:
- ❌ Generated queries may not be optimal for complex analytics (use raw SQL for those)
- ✅ Rapid development, fewer bugs
- ✅ Database schema changes are safe and version-controlled

### Why Redis for Rate Limiting?

**Chosen**: Redis atomic counters  
**Alternatives Considered**: Database counters, in-memory (Map/Object), rate-limiting libraries

**Reasoning**:
1. **Atomic Operations**: `INCR` is atomic, no race conditions between workers
2. **Distributed State**: All workers share same counters (horizontal scaling)
3. **TTL Support**: Keys auto-expire at hour boundary, no cleanup needed
4. **Performance**: Sub-millisecond operations even with high concurrency
5. **Simple Implementation**: ~10 lines of code vs complex locking logic

**Comparison**:
- **Database counters**: Too slow (10-100ms query latency), lock contention
- **In-memory (Map)**: Not shared across workers, lost on restart
- **Rate-limit libraries**: Often single-server, don't support distributed workers

### Why Three-Layer Idempotency?

**Reasoning**: Defense in depth - each layer protects against different failure modes:

1. **Database Layer**: Protects against application logic bugs and user errors
2. **BullMQ Layer**: Protects against infrastructure issues (race conditions, network retries)
3. **Redis Lock Layer**: Protects against concurrent worker processing

**Cost**: Minimal (one database constraint, one Redis SET operation)  
**Benefit**: Zero duplicate emails, even during:
- Concurrent API requests
- Worker crashes mid-send
- Network partitions
- BullMQ retries

### Why Dual-Process Architecture?

**Chosen**: Separate server and worker processes  
**Alternatives Considered**: Monolith (single process), microservices (separate codebases)

**Reasoning**:
1. **Separation of Concerns**: HTTP handling vs CPU-intensive background processing
2. **Independent Scaling**: Scale API servers horizontally, keep 1-2 dedicated workers
3. **Fault Isolation**: Server crash doesn't stop email processing (and vice versa)
4. **Resource Optimization**: Workers get 100% CPU, servers prioritize low latency
5. **Deploy Independence**: Can update/restart server without affecting worker

**Why Not Microservices?**:
- Shared domain logic (email validation, Prisma models, etc.)
- No need for separate databases
- Simpler deployment (single Docker image)
- Faster development (no inter-service communication)

**Trade-off**: Must run two processes (but same codebase, easy deployment)

### Why Staggered Delivery (delayBetweenSeconds)?

**Problem**: Sending 1000 emails instantly from same sender:
- Triggers ISP spam filters (burst detection)
- Damages sender reputation score
- May hit SMTP provider rate limits
- Increases bounce rate

**Solution**: Spread emails over time (0-60 second intervals)

**Example**:
```
Campaign: 1000 recipients, delay=30s
Timeline:
- Email 1: 10:00:00
- Email 2: 10:00:30
- Email 3: 10:01:00
- ...
- Email 1000: 10:08:20 (8 hours 20 minutes later)
```

**Benefits**:
- Sender reputation maintained
- Lower spam scores
- Gradual load on SMTP server
- Combined with hourly rate limits = professional email sender

---

## Security Features

### 1. Password Security

**Implementation**: [src/modules/auth/auth.utils.ts](src/modules/auth/auth.utils.ts)

```typescript
import bcrypt from "bcrypt";

// Hashing
const saltRounds = 10;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Verification
const isValid = await bcrypt.compare(password, passwordHash);
```

**Features**:
- **Bcrypt**: Industry-standard hashing with automatic salt
- **Salt Rounds**: 10 rounds (2^10 = 1024 iterations)
- **No Plaintext**: Passwords never stored in plain text
- **Timing-Safe**: `bcrypt.compare` prevents timing attacks

### 2. JWT Token Security

**Implementation**: [src/modules/auth/auth.utils.ts](src/modules/auth/auth.utils.ts)

```typescript
const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN  // Default: 7 days
});
```

**Cookie Configuration**: [src/config/cookie.ts](src/config/cookie.ts)

```typescript
res.cookie("token", token, {
  httpOnly: true,      // Prevents JavaScript access (XSS protection)
  secure: true,        // HTTPS only in production
  sameSite: "none",    // Cross-origin requests allowed
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

**Protection Against**:
- ✅ **XSS**: `httpOnly` prevents client-side JavaScript from accessing token
- ✅ **CSRF**: Requires valid JWT in cookie (not vulnerable to CSRF)
- ✅ **Token Theft**: `secure` flag requires HTTPS (prevents MITM)

### 3. CORS Configuration

**Implementation**: [src/app.ts](src/app.ts)

```typescript
app.use(cors({
  origin: FRONTEND_URL,          // Whitelist specific origin
  credentials: true              // Allow cookies
}));
```

**Prevents**: Unauthorized domains from making API requests

### 4. Request Validation

**Implementation**: [src/middleware/validateRequest.ts](src/middleware/validateRequest.ts)

```typescript
import { z } from "zod";

const emailSchema = z.object({
  senderId: z.string().cuid(),
  subject: z.string().min(1).max(200),
  recipients: z.array(z.string().email()).min(1).max(1000),
  // ...
});

// Middleware validates all inputs
app.post("/emails/schedule-emails", 
  validateRequest(emailSchema), 
  scheduleEmailsController
);
```

**Protection Against**:
- ✅ **SQL Injection**: Validated inputs + Prisma parameterization
- ✅ **XSS**: Input sanitization before storage
- ✅ **Type Errors**: Runtime validation of all request data
- ✅ **Invalid Data**: Rejects malformed requests before hitting controller

### 5. Authentication Middleware

**Implementation**: [src/middleware/requireAuth.ts](src/middleware/requireAuth.ts)

```typescript
export const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  try {
    const decoded = verifyJWT(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
```

**Protects**: All sensitive endpoints (emails, senders, campaigns)

### 6. Database-Level Security

**Features**:
1. **Cascade Deletes**: Prevent orphaned records that leak user data
2. **Unique Constraints**: Prevent duplicate emails, maintain data integrity
3. **Foreign Key Constraints**: Ensure referential integrity
4. **Row-Level Ownership**: All queries filter by `userId`

**Example**:
```typescript
// Users can only see their own campaigns
const campaigns = await prisma.campaign.findMany({
  where: { userId: req.user.id }  // ← Automatic user isolation
});
```

### 7. Environment Variable Protection

- **No Hardcoded Secrets**: All sensitive values in `.env`
- **gitignore**: `.env` never committed to repository
- **Validation**: [src/config/env.ts](src/config/env.ts) validates required variables on startup

### 8. SMTP Security

**Current**: Ethereal Email (testing only)

**Production Recommendations**:
- Use TLS-encrypted connections
- Authenticate with API keys (not passwords)
- Implement SPF, DKIM, DMARC records
- Monitor bounce rates and complaints

---

## Business Logic Details

### 1. Email Scheduling Algorithm

**Location**: [src/modules/emails/email.service.ts](src/modules/emails/email.service.ts)

**Input**:
- `startAt`: Base start datetime (e.g., 2026-02-07 15:00:00)
- `recipients`: Array of 500 emails
- `delayBetweenSeconds`: 30 seconds

**Calculation**:
```typescript
const emailJobs = recipients.map((recipient, index) => {
  const scheduledAt = new Date(startAt);
  scheduledAt.setSeconds(scheduledAt.getSeconds() + (index * delayBetweenSeconds));
  
  return {
    recipient,
    scheduledAt,
    status: "SCHEDULED"
  };
});
```

**Result**:
```
Email 0: 15:00:00
Email 1: 15:00:30
Email 2: 15:01:00
Email 3: 15:01:30
...
Email 499: 15:04:09:30 (4 hours 9 minutes 30 seconds later)
```

**BullMQ Delay Calculation**:
```typescript
const delayMs = scheduledAt.getTime() - Date.now();

await emailQueue.add("send-email", 
  { emailJobId: job.id },
  { 
    delay: delayMs,  // Wait time before processing
    jobId: job.id    // Idempotency
  }
);
```

### 2. Time Window Service

**Location**: [src/services/time/timewindow.service.ts](src/services/time/timewindow.service.ts)

**Purpose**: Generate consistent hour-based keys for rate limiting

```typescript
export function getHourWindowKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');
  
  return `${year}-${month}-${day}-${hour}`;
  // Example: "2026-02-07-14"
}

export function getNextHourStart(): Date {
  const now = new Date();
  const next = new Date(now);
  next.setHours(now.getHours() + 1, 0, 0, 0);
  return next;
  // Example: If now is 14:37:21 → returns 15:00:00
}
```

**Usage in Rate Limiting**:
```typescript
const key = `rateLimit:sender:${senderId}:${getHourWindowKey()}`;
// rateLimit:sender:cm4abc123:2026-02-07-14
```

### 3. Sleep Mechanism

**Location**: [src/services/time/sleep.ts](src/services/time/sleep.ts)

**Purpose**: Prevent SMTP server overload

```typescript
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Usage**:
```typescript
// After sending email
await sleep(MIN_DELAY_BETWEEN_EMAILS_SECONDS * 1000);  // Default: 2000ms
```

**Why Needed**:
- SMTP servers have connection/rate limits
- Prevents "too many connections" errors
- Spreads load over time
- Required by some email providers (e.g., Gmail: 100 emails/day for free tier)

### 4. Status State Machine

```
┌──────────────┐
│  SCHEDULED   │ ← Initial state when job created
└──────┬───────┘
       │
       │ Worker picks up job
       ▼
┌──────────────┐
│   SENDING    │ ← Actively being sent right now
└──────┬───────┘
       │
       ├─────► Success
       │       ┌──────────────┐
       │       │     SENT     │ ← Final success state
       │       └──────────────┘
       │
       └─────► Failure (after 3 retries)
               ┌──────────────┐
               │    FAILED    │ ← Final failure state
               └──────────────┘
```

**Transition Rules**:
1. `SCHEDULED` → `SENDING`: When worker starts processing
2. `SENDING` → `SENT`: After successful email send
3. `SENDING` → `SCHEDULED`: On error (for retry)
4. `SCHEDULED` → `FAILED`: After 3 failed attempts

**Query Patterns**:
```typescript
// Get all pending emails
WHERE status IN ('SCHEDULED', 'SENDING')

// Get completed emails
WHERE status IN ('SENT', 'FAILED')

// Get actionable emails for reconciliation
WHERE status = 'SCHEDULED' AND scheduledAt <= NOW()
```

### 5. Reconciliation Algorithm

**Trigger**: Worker startup (automatic)

**Logic**:
```typescript
async function reconcileOrphanedJobs() {
  // Step 1: Find potentially orphaned jobs
  const candidates = await prisma.emailJob.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: new Date() }
    },
    take: 500,
    orderBy: { scheduledAt: 'asc' }
  });
  
  let requeued = 0;
  let alreadyOk = 0;
  
  for (const job of candidates) {
    // Step 2: Check if job exists in BullMQ
    const bullmqJob = await emailQueue.getJob(job.id);
    
    if (!bullmqJob) {
      // Step 3: Job is orphaned - re-queue it
      const newJob = await schedulerEmailJob({
        emailJobId: job.id,
        delayMs: 0  // Send immediately (already past scheduledAt)
      });
      
      // Step 4: Update database with new BullMQ job ID
      await prisma.emailJob.update({
        where: { id: job.id },
        data: { bullmqJobId: newJob.id }
      });
      
      requeued++;
    } else {
      alreadyOk++;
    }
  }
  
  console.log(`Reconciliation: [Requeued: ${requeued} | Already OK: ${alreadyOk}]`);
}
```

**Edge Cases**:
- **Large backlog**: Processes in batches of 500
- **Duplicate calls**: Safe due to BullMQ jobId deduplication
- **Status race**: Only processes `SCHEDULED` jobs
- **Worker restart**: Runs again automatically (idempotent)

---

## License

MIT License - see LICENSE file for details

---

## Contributors

For questions or contributions, please open an issue or pull request on GitHub.

---

**Last Updated**: February 7, 2026
