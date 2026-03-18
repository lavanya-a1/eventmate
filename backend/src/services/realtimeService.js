const clients = new Map();
let nextClientId = 1;

function writeEvent(res, eventName, payload) {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function subscribeClient(req, res) {
  const clientId = nextClientId++;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const client = {
    id: clientId,
    res,
    userId: String(req.user.id),
    role: String(req.user.role || ''),
  };

  clients.set(clientId, client);

  res.write('retry: 4000\n\n');
  writeEvent(res, 'connected', {
    message: 'Realtime stream connected',
    ts: Date.now(),
  });

  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    clients.delete(clientId);
  });
}

function publishRealtimeEvent({ type, payload = {}, roles, userIds }) {
  const allowRoles = Array.isArray(roles) && roles.length ? new Set(roles.map(String)) : null;
  const allowUsers = Array.isArray(userIds) && userIds.length ? new Set(userIds.map(String)) : null;

  for (const client of clients.values()) {
    if (allowRoles && !allowRoles.has(client.role)) continue;
    if (allowUsers && !allowUsers.has(client.userId)) continue;

    writeEvent(client.res, 'update', {
      type,
      ...payload,
      ts: Date.now(),
    });
  }
}

module.exports = {
  subscribeClient,
  publishRealtimeEvent,
};
