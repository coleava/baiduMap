const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
	app.use(
    '/',
    createProxyMiddleware({
      target: 'https://test.space365.live',
      changeOrigin: true,
    })
  )
};