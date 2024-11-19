const username = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;

exports.MONGO_URL = `mongodb+srv://${username}:${password}@spass.aew6k.mongodb.net/?retryWrites=true&w=majority&appName=spass`;

