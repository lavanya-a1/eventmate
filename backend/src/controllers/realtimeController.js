const { subscribeClient } = require('../services/realtimeService');

exports.streamUpdates = (req, res) => {
  subscribeClient(req, res);
};
