module.exports = (config, _context) => {
  config.watchOptions = {
    poll: 1000,
    ignored: /node_modules/,
  };
  return config;
};
