# WebhookConsumer

Simple Node.js webhook consumer for CvTech. It logs headers and body for any POST request.

## Run

```bash
npm install
npm run start
```

Default port is 4001. You can override it with `PORT`.

## Quick test

```bash
curl -X POST http://localhost:4001 \
  -H "Content-Type: application/json" \
  -d "{\"event\":\"cv.created\",\"data\":{\"id\":\"cv-1\"}}"
```

## Connect with CvTech

Set `WEBHOOK_URL` in the main app environment:

```
WEBHOOK_URL=http://localhost:4001
```

### Signature verification
If you set a `WEBHOOK_SECRET` in the sender, the consumer will validate the `X-CvTech-Signature` header (format `sha256=<hex>`).

Example: compute signature locally and send the header with `curl` (replace `secret` with your secret):

```bash
SIG="sha256=$(node -e "const c=require('crypto');console.log(c.createHmac('sha256', 'secret').update('{\"event\":\"cv.created\",\"data\":{\"id\":\"cv-1\"}}').digest('hex'))")"
curl -X POST http://localhost:4001 -H "Content-Type: application/json" -H "X-CvTech-Signature: $SIG" -d '{"event":"cv.created","data":{"id":"cv-1"}}'
```

When `WEBHOOK_SECRET` is set in the consumer, requests missing the signature or with an invalid signature will be rejected with HTTP `401`.
