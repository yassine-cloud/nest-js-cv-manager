const http = require('http');
const crypto = require('crypto');
require('dotenv').config();


const port = Number.parseInt(process.env.PORT || '4001', 10);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Webhook consumer is running');
    return;
  }

  let rawBody = '';
  req.on('data', (chunk) => {
    rawBody += chunk;
    if (rawBody.length > 1024 * 1024) {
      req.socket.destroy();
    }
  });

  req.on('end', () => {
    let jsonBody = null;
    try {
      jsonBody = rawBody ? JSON.parse(rawBody) : null;
    } catch (e) {
      jsonBody = null;
    }

    console.log('--- Webhook Received ---');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Raw Body:', rawBody);

    // Signature verification (if secret configured)
    const sigHeader =
      req.headers['x-cvtech-signature'] ||
      req.headers['x-hub-signature-256'] ||
      req.headers['x-hub-signature'];

    if (WEBHOOK_SECRET) {
      if (!sigHeader) {
        console.warn('Missing signature header while WEBHOOK_SECRET is configured');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'missing_signature' }));
        return;
      }

      let provided = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;
      if (typeof provided === 'string' && provided.startsWith('sha256=')) {
        provided = provided.slice('sha256='.length);
      }

      try {
        const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
        const expectedBuf = Buffer.from(expected, 'hex');
        const providedBuf = Buffer.from(provided, 'hex');
        let valid = false;
        if (expectedBuf.length === providedBuf.length) {
          valid = crypto.timingSafeEqual(expectedBuf, providedBuf);
        }
        if (!valid) {
          console.warn('Invalid signature');
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'invalid_signature' }));
          return;
        }
        console.log('Signature verified');
      } catch (err) {
        console.warn('Signature verification error:', err && err.message ? err.message : err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'signature_verification_error' }));
        return;
      }
    } else {
      console.log('No WEBHOOK_SECRET configured; skipping signature verification.');
    }

    if (jsonBody) {
      console.log('JSON:', jsonBody);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  });
});

server.listen(port, () => {
  console.log(`Webhook consumer listening on http://localhost:${port}`);
});
