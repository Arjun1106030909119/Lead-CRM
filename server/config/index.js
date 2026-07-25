const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lead-crm';
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-a-secure-secret';

module.exports = {
  PORT,
  MONGO_URI,
  JWT_SECRET,
};
