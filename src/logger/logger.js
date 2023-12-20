import winston from 'winston';
import 'winston-mongodb'

export const httpLoggerDB = winston.createLogger({
  format: winston.format.combine(
    winston.format.json(),
    winston.format.metadata()
  ),
  transports: [
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      collection: 'logs',
      options: { useUnifiedTopology: true }
    }),
  ],
});
