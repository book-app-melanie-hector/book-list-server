'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.use(cors());

app.get('/', (req, res) => res.send('Hello world!'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

//PORT=3000
//CLIENT_URL=http://localhost:8080
//DATABASE_URL=postgres://localhost:5432/books_app

// function loadDB() {
//   client.query(`
//   CREATE TABLE books (
//     book_id serial primary key,
//     author varchar(255) not null,
//     title varchar(255) not null,
//     isbn varchar(30),
//     image_url varchar(255),
//     description TEXT NOT NULL);
//     `)
// }
//
// function loadBooks () {
//   client.query('SELECT COUNT (*) FROM books')
//     .then(result => {
//       if(!parseInt(result.rows[0].count)) {
//         fs.readFile('./book-list-client/data/books.json', 'utf8', (err, fd) => {
//           JSON.parse(fd).forEach(ele => {
//             client.query(`
//               INSERT INTO
//               books(title, author, isbn, image_url, description)
//               SELECT book_id, &1, $2, $3, $4, $5;
//               `,
//                 [ele.title, ele.author, ele.isbn, ele.image_url, ele.description]
//             )
//             .catch(console.error);
//           })
//         }
//       )
//     }
//   })
// }
// loadBooks();
