'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.use(cors());

app.get('/', (req, res) => res.send('Hello world!'));

app.get('/api/v1/books', (request, response) => {
  client.query(`SELECT book_id, title, author, image_url, isbn FROM books;`)
    .then(result => response.send(result.rows))
    .catch(console.error);
})



//PORT=3000
//CLIENT_URL=http://localhost:8080
//DATABASE_URL=postgres://localhost:5432/books_app



//
//
//
// function loadBooks () {
//         fs.readFile('./book-list-client/data/books.json', (err, fd) => {
//           JSON.parse(fd.toString()).forEach(ele => {
//             client.query(`
//               INSERT INTO
//               books(title, author, isbn, image_url, description)
//               VALUES ($1, $2, $3, $4, $5)
//               ON CONFLICT (isbn) DO NOTHING;
//         }
//       )
//     }
//   })
// }



function loadBooks () {
  client.query('SELECT COUNT(*) FROM books')
    .then(result => {
      if(!parseInt(result.rows[0].count))
        fs.readFile('../book-list-client/data/books.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            client.query(`
              INSERT INTO
              books (title, author, isbn, image_url, description)
              VALUES ($1, $2, $3, $4, $5)
              `,
                [ele.title, ele.author, ele.isbn, ele.image_url, ele.description]
            )
            .catch(console.error);
          })
        })
      })
  }

  function loadDB() {
    console.log('loadDB triggered');
    client.query(`

    CREATE TABLE IF NOT EXISTS books(
      book_id SERIAL PRIMARY KEY,
      author VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      isbn VARCHAR(30),
      image_url VARCHAR(255),
      description TEXT NOT NULL);
      `)
      .then(loadBooks)
      .catch(console.error);
  }
  loadDB();

  app.get('*', (req,res) => res.redirect(CLIENT_URL));

  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
