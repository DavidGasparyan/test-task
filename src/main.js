import 'dotenv/config'
import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import requestRouter from "./request-router.js";
import responseInterceptor from "./interceptors/response.interceptor.js";
import verifyToken from "./middlewre/verify-token.middleware.js";

const app = express();
const port = 3000;

const secretKey = process.env.SECRET;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

app.use(responseInterceptor);
app.post('/api', verifyToken, requestRouter);

app.post('/login', (req, res) => {
  // In a real-world scenario, you would validate the user's credentials here
  const user = { id: 1, username: 'exampleUser' };
  
  const token = jwt.sign(user, secretKey, { expiresIn: '1h' });
  
  res.json({ token });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
