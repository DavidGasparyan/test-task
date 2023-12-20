import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import requestRouter from "./request-router.js";
import responseInterceptor from "./interceptors/response-interceptor.js";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

app.use(responseInterceptor);
app.post('/api', requestRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
