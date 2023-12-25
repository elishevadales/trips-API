
const mongoose = require('mongoose');
const { config } = require('../config/secret');

main().catch(err => console.log(err));

async function main() {
  //אם יש באג בווינדוס 10 או 11
  // mongoose.set('strictQuery' , false);

  await mongoose.connect(`mongodb+srv://${config.userDb}:${config.passDb}@cluster0.jymclmm.mongodb.net/trips`);

  console.log("mongo connect to 'trips' database")
  
}