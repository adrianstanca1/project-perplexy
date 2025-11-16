# 📊 Monitoring & Observability Setup

This guide covers setting up monitoring, logging, and observability for the ConstructAI platform in production.

## Table of Contents

1. [Health Monitoring](#health-monitoring)
2. [Error Tracking](#error-tracking)
3. [Performance Monitoring](#performance-monitoring)
4. [Log Aggregation](#log-aggregation)
5. [Uptime Monitoring](#uptime-monitoring)
6. [Alerts & Notifications](#alerts--notifications)

---

## Health Monitoring

### Built-in Health Checks

The platform includes health check endpoints:

**Backend:**
```bash
curl http://localhost:3001/health
# Response: {"status":"ok","timestamp":"..."}
```

**Frontend:**
```bash
curl http://localhost:3000
# Response: 200 OK
```

### Automated Health Checks

Use the included health check script:

```bash
# Run health checks
./health-check.sh

# With custom URLs
BACKEND_URL=https://api.yourdomain.com \
FRONTEND_URL=https://app.yourdomain.com \
./health-check.sh
```

### Docker Health Checks

Health checks are built into Docker containers:

```bash
# Check container health
docker ps

# View health status
docker inspect constructai-backend | grep -A 10 Health
```

---

## Error Tracking

### Sentry Integration

[Sentry](https://sentry.io) provides real-time error tracking.

#### Setup

1. **Create Sentry Project**
   - Go to https://sentry.io
   - Create new project for Node.js and React

2. **Install Sentry SDK** (already included)
   ```bash
   # Backend
   cd packages/backend
   pnpm add @sentry/node

   # Frontend
   cd packages/frontend
   pnpm add @sentry/react
   ```

3. **Configure Environment Variables**
   ```bash
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

4. **Backend Integration** (`packages/backend/src/index.ts`)
   ```typescript
   import * as Sentry from '@sentry/node'

   if (process.env.NODE_ENV === 'production') {
     Sentry.init({
       dsn: process.env.SENTRY_DSN,
       environment: process.env.NODE_ENV,
       tracesSampleRate: 1.0,
     })
   }
   ```

5. **Frontend Integration** (`packages/frontend/src/main.tsx`)
   ```typescript
   import * as Sentry from '@sentry/react'

   if (import.meta.env.PROD) {
     Sentry.init({
       dsn: import.meta.env.VITE_SENTRY_DSN,
       integrations: [
         Sentry.browserTracingIntegration(),
         Sentry.replayIntegration(),
       ],
       tracesSampleRate: 1.0,
       replaysSessionSampleRate: 0.1,
       replaysOnErrorSampleRate: 1.0,
     })
   }
   ```

#### Features

- Real-time error alerts
- Stack trace analysis
- User context tracking
- Performance monitoring
- Session replay

---

## Performance Monitoring

### Application Performance Monitoring (APM)

#### Option 1: New Relic

1. **Sign up** at https://newrelic.com
2. **Install agent:**
   ```bash
   pnpm add newrelic
   ```

3. **Configure** (`newrelic.js`):
   ```javascript
   exports.config = {
     app_name: ['ConstructAI'],
     license_key: 'YOUR_LICENSE_KEY',
     distributed_tracing: { enabled: true },
     logging: { level: 'info' }
   }
   ```

4. **Start with New Relic:**
   ```bash
   node -r newrelic packages/backend/dist/index.js
   ```

#### Option 2: DataDog

1. **Install DD Agent:**
   ```bash
   pnpm add dd-trace
   ```

2. **Initialize** (first line in `index.ts`):
   ```typescript
   import tracer from 'dd-trace'
   tracer.init()
   ```

3. **Set environment variables:**
   ```bash
   DD_AGENT_HOST=localhost
   DD_TRACE_AGENT_PORT=8126
   DD_SERVICE=constructai
   DD_ENV=production
   ```

### Database Monitoring

#### MongoDB Atlas Monitoring

If using MongoDB Atlas:
- Built-in performance advisor
- Query performance insights
- Real-time performance panel
- Automated index suggestions

Access: https://cloud.mongodb.com → Performance tab

#### Self-hosted MongoDB

Install MongoDB Compass or use mongotop/mongostat:

```bash
# Real-time statistics
mongostat --host localhost:27017 -u admin -p password

# Top queries
mongotop --host localhost:27017 -u admin -p password
```

### Redis Monitoring

```bash
# Real-time monitoring
redis-cli INFO
redis-cli INFO stats

# Monitor commands
redis-cli MONITOR
```

---

## Log Aggregation

### Option 1: ELK Stack (Elasticsearch, Logstash, Kibana)

#### Docker Compose Setup

```yaml
# docker-compose.logging.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

#### Logstash Configuration

```conf
# logstash.conf
input {
  file {
    path => "/var/log/constructai/*.log"
    start_position => "beginning"
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "constructai-%{+YYYY.MM.dd}"
  }
}
```

### Option 2: Papertrail

1. Sign up at https://papertrailapp.com
2. Configure log forwarding:
   ```bash
   # In your backend
   pnpm add winston-papertrail
   ```

3. Update Winston config:
   ```typescript
   import { Papertrail } from 'winston-papertrail'

   const papertrail = new Papertrail({
     host: 'logs.papertrailapp.com',
     port: YOUR_PORT,
   })

   logger.add(papertrail)
   ```

### Option 3: CloudWatch (AWS)

```bash
# Install CloudWatch agent
pnpm add winston-cloudwatch
```

```typescript
import CloudWatchTransport from 'winston-cloudwatch'

logger.add(new CloudWatchTransport({
  logGroupName: 'constructai',
  logStreamName: 'backend',
  awsRegion: 'us-east-1',
}))
```

---

## Uptime Monitoring

### Option 1: UptimeRobot (Free)

1. Visit https://uptimerobot.com
2. Add HTTP(S) monitors:
   - **Backend:** https://api.yourdomain.com/health
   - **Frontend:** https://app.yourdomain.com
3. Configure alerts (email, SMS, Slack)

### Option 2: Pingdom

1. Sign up at https://pingdom.com
2. Create uptime checks
3. Set up alert policies

### Option 3: Custom Script with Cron

```bash
# /etc/cron.d/constructai-health
*/5 * * * * /path/to/health-check.sh || mail -s "ConstructAI Health Check Failed" admin@example.com
```

---

## Alerts & Notifications

### Slack Integration

#### Sentry → Slack

1. In Sentry, go to Settings → Integrations
2. Add Slack integration
3. Configure alert rules

#### Custom Alerts Script

```bash
#!/bin/bash
# alert-to-slack.sh

SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
MESSAGE="$1"

curl -X POST -H 'Content-type: application/json' \
  --data "{\"text\":\"🚨 ConstructAI Alert: $MESSAGE\"}" \
  $SLACK_WEBHOOK
```

### Email Alerts

#### Using Nodemailer (Backend)

```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
})

// Send alert
await transporter.sendMail({
  from: 'alerts@constructai.com',
  to: 'admin@example.com',
  subject: 'ConstructAI Alert',
  text: 'Alert message here'
})
```

### PagerDuty Integration

1. Create PagerDuty service
2. Get integration key
3. Configure in Sentry or monitoring tool
4. Set up escalation policies

---

## Monitoring Checklist

### Essential Metrics

- [ ] **Application Health**
  - Backend uptime
  - Frontend availability
  - API response times

- [ ] **Database Performance**
  - Connection pool usage
  - Query performance
  - Storage usage

- [ ] **Server Resources**
  - CPU usage
  - Memory usage
  - Disk space

- [ ] **Error Rates**
  - 4xx errors
  - 5xx errors
  - Unhandled exceptions

- [ ] **User Experience**
  - Page load times
  - API latency
  - WebSocket connection stability

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| API Response Time | > 500ms | > 2s |
| Error Rate | > 1% | > 5% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |
| Disk Space | < 20% free | < 10% free |
| Database Connections | > 80% | > 95% |

---

## Quick Start Commands

```bash
# Run health checks
./health-check.sh

# Run smoke tests
./smoke-tests.sh

# View backend logs (PM2)
pm2 logs constructai-backend

# View Docker logs
docker-compose logs -f backend

# Check Docker container health
docker ps

# Monitor MongoDB
mongostat --host localhost:27017

# Monitor Redis
redis-cli INFO stats

# Test alert notifications
./alert-to-slack.sh "Test alert"
```

---

## Monitoring Dashboard Recommendations

### Free Options
- **Grafana** + **Prometheus** (self-hosted)
- **PM2 Monitoring** (if using PM2)
- **Docker stats** (if using Docker)

### Paid Options
- **Datadog** - All-in-one APM
- **New Relic** - Application monitoring
- **Sentry** - Error tracking
- **LogRocket** - Frontend monitoring

---

## Additional Resources

- [Winston Logging](https://github.com/winstonjs/winston)
- [Sentry Documentation](https://docs.sentry.io/)
- [New Relic APM](https://docs.newrelic.com/)
- [Prometheus + Grafana](https://prometheus.io/docs/visualization/grafana/)
- [MongoDB Monitoring](https://docs.mongodb.com/manual/administration/monitoring/)

---

**Last Updated:** 2024-11-16  
**Version:** 1.0.0
