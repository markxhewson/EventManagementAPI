const { keys } = require("./apiKeys.json");

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['api-key'] || req.body['api-key'];

  if (apiKey && keys.includes(apiKey)) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = apiKeyMiddleware;