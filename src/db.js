import { MongoClient } from "mongodb";

const connectionString = 'mongodb://mongo:mongo@localhost:27017';
const client = new MongoClient(connectionString);

let connection;

try {
  connection = await client.connect();
} catch(e) {
  console.error(e);
}
export let logsDB = connection.db("logs");
