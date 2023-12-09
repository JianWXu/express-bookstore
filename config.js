/** Common config for bookstore. */


require("dotenv").config();


PW = process.env.PW;

let DB_URI = `postgresql://postgres:${PW}@localhost`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/books-test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/books`;
}


module.exports = { DB_URI };