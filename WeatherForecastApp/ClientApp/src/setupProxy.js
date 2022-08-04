const createProxyMiddleware = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:46569';

const context = ["/api", "/bff", "/signin-oidc", "/signout-callback-oidc"];

module.exports = function(app) {
  console.log(target);
  console.log(env);
  const appProxy = createProxyMiddleware(context, {
      target: target,
    secure: false
  });

  app.use(appProxy);
};
