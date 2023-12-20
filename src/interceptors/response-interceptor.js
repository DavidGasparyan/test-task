import {httpLoggerDB} from "../logger/logger.js";
import formatHTTPLoggerResponse from "../logger/format-http-logger-response.js";

const responseInterceptor = (req, res, next) => {
  const originalSend = res.send;
  
  const requestStartTime = Date.now();
  let responseSent = false;
  
  res.send = function (body) {
    if (!responseSent) {
      if (res.statusCode < 400) {
        httpLoggerDB.info(
          body.message,
          formatHTTPLoggerResponse(req, res, body, requestStartTime)
        );
      } else {
        httpLoggerDB.error(
          body.message,
          formatHTTPLoggerResponse(req, res, body, requestStartTime)
        );
      }
      
      responseSent = true;
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

export default responseInterceptor
