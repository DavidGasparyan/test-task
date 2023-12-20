const formatHTTPLoggerResponse = (req, res, responseBody, requestStartTime) => {
  let requestDuration;
  
  if (requestStartTime) {
    const endTime = Date.now() - requestStartTime;
    requestDuration = `${endTime / 1000}s`; // ms to s
  }
  
  return {
    request: {
      headers: req.headers,
      host: req.headers.host,
      baseUrl: req.baseUrl,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req?.params,
      query: req?.query,
      clientIp:
        req?.headers['HTTPHeaders.ForwardedFor'] ?? req?.socket.remoteAddress,
    },
    response: {
      headers: res.getHeaders(),
      statusCode: res.statusCode,
      body: responseBody,
      requestDuration,
    }
  };
};

export default formatHTTPLoggerResponse;
