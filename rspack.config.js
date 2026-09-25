module.exports = (config, _context) => {
  // Включаем принудительный опрос файлов (polling) каждые 1000 мс для Windows-томов
  config.watchOptions = {
    poll: 1000,
    ignored: /node_modules/,
  };
  return config;
};
