# CvTech Webhook Use Case

## Use case choice
When a new CV is created, notify an external HR or ATS system so it can start indexing, scoring, or review immediately. This avoids polling and keeps CvTech decoupled from partner systems.

## Why a webhook
- Event driven: external systems receive the CV event in real time.
- Loose coupling: CvTech does not depend on partner availability for core actions.
- Extensible: new consumers can subscribe without changing CV creation logic.

## Implementation summary
A webhook is emitted after a CV is created. The app sends a JSON POST request with event metadata and a signed payload. The webhook is optional and enabled only if `WEBHOOK_URL` is set.

## Event sent
- Event name: `cv.created`
- Trigger: `CvsService.create`
- Delivery model: fire and forget (errors are logged, but CV creation still succeeds)

## Headers
- `Content-Type: application/json`
- `X-CvTech-Event: cv.created`
- `X-CvTech-Delivery: <uuid>`
- `X-CvTech-Timestamp: <iso8601>`
- `X-CvTech-Signature: sha256=<hex>` (only if `WEBHOOK_SECRET` is set)

## Payload example
```json
{
  "event": "cv.created",
  "timestamp": "2026-04-27T18:00:00.000Z",
  "deliveryId": "8c3a7d2c-6e4c-4a5d-8e9c-2bd1cc3a6e6f",
  "data": {
    "id": "cv-123",
    "firstname": "John",
    "job": "Backend Dev",
    "userId": "user-1",
    "createdAt": "2026-04-27T18:00:00.000Z"
  }
}
```

## Signature verification
The signature is computed as `sha256` HMAC of the raw JSON body using `WEBHOOK_SECRET`.
Example verification (pseudo):

```
expected = HMAC_SHA256(secret, rawBody)
check header == "sha256=" + expected
```

## Configuration
Set these environment variables:

- `WEBHOOK_URL`: target URL for the webhook (required to enable)
- `WEBHOOK_SECRET`: shared secret for signature (optional but recommended)

If `WEBHOOK_URL` is not set, webhook delivery is skipped.

## Local consumer demo
This repository includes a simple Node.js consumer in `WebhookConsumer`.

Run it:

```bash
cd WebhookConsumer
npm install
npm run start
```

Then set the CvTech environment variable:

```
WEBHOOK_URL=http://localhost:4001
```

When a CV is created, the consumer logs headers and body in the console.

### Verifying signatures on the consumer side
The consumer can verify the `X-CvTech-Signature` header using the shared `WEBHOOK_SECRET`.

Header format: `sha256=<hex>` where `<hex>` is the HMAC-SHA256 of the raw JSON body.

On the consumer (Node) side you can compute and compare using a timing-safe check:

```js
const crypto = require('crypto');
const expected = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET).update(rawBody).digest('hex');
const provided = (req.headers['x-cvtech-signature'] || '').replace(/^sha256=/, '');
const valid = Buffer.from(expected, 'hex').length === Buffer.from(provided, 'hex').length &&
  crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
```

If `process.env.WEBHOOK_SECRET` is not set, the consumer will skip verification (useful for local testing with `webhook.site`).
