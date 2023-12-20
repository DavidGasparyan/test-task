import express from 'express';
import bodyParser from 'body-parser';
import requestRouter from "./request-router.js";
import axios from "axios";

const app = express();
const port = 3000;
const router = express.Router();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

// app.use('/api', router);

app.post('/api', requestRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
