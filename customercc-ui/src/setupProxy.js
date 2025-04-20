import createProxyMiddleware from 'http-proxy-middleware'

export default function (app) {
  //   // Error handler
  //   const onError = (err, req, res) => {
  //     console.error('Proxy error:', err.message);

  //     // Set response status and message
  //     res.writeHead(500, {
  //       'Content-Type': 'application/json',
  //     });
  //     res.end(
  //       JSON.stringify({
  //         error: 'Proxy error occurred. Please try again later.',
  //         details: err.message,
  //       })
  //     );
  //   };

  // Proxy for API 1
  app.use(
    '/api1', // Route to match
    createProxyMiddleware({
      //  target: 'http://localhost:8081',
      target: 'http://host.docker.internal:8081',
      changeOrigin: true,
      pathRewrite: { '^/api1': '' }, // Optional: Removes `/api1` from the request path
      // logLevel: 'debug',
      // onError,
    })
  );

  // Proxy for API 2
  app.use(
    '/api2',
    createProxyMiddleware({
      // target: 'http://localhost:8091',
      target: 'http://host.docker.internal:8091',
      changeOrigin: true,
      pathRewrite: { '^/api2': '' }, // Optional: Removes `/api2` from the request path
      // onError,
    })
  );
};
