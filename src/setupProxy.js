const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
	app.use(
    '/map',
    createProxyMiddleware({
      target: 'https://test.space365.live',
      changeOrigin: true,
    })
  )
};