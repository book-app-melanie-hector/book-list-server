'use strict';

// Application Dependencies ///////
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const fs = require('fs');
const bodyParser = require('body-parser')
const superagent = require('superagent');

// Application Setup ///////
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
const client = new pg.Client(process.env.DATABASE_URL);
const TOKEN = process.env.TOKEN;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Database Setup /////////
client.connect();
client.on('error', err => console.error(err));

// Application Middleware /////////
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Test for server side
app.get('/', (req, res) => res.send('Hello world!'));

// API Endpoints

app.get('/api/v1/admin', (request, response) => {
  response.send(TOKEN === parseInt(request.query.token));
})

// This gets all boks for home page
app.get('/api/v1/books', (request, response) => {
  client.query(`SELECT book_id, title, author, image_url, isbn FROM books;`)
    .then(result => response.send(result.rows))
    .catch(console.error);
});

// Superagent request to Google Books API
app.get('/api/v1/books/find', (req, res) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';
  superagent.get(url)
    .query({'q': `+isbn:${req.params.isbn}`})
    .query({'key': GOOGLE_API_KEY})
    .then(response => response.body.items.map((book, idx) => {
      let { title, authors, industryIdentifiers, imageLinks, description } = book.volumeInfo;
      let placeholderImage = 'http://www.newyorkpaddy.com/images/covers/NoCoverAvailable.jpg';

      return {
        title: title ? title : 'No title available',
        author: authors ? authors[0] : 'No authors available',
        isbn: industryIdentifiers ? `ISBN_13 ${industryIdentifiers[0].identifier}` : 'No ISBN available',
        image_url: imageLinks ? imageLinks.smallThumbnail : placeholderImage,
        description: description ? description : 'No description available',
      }
    }))
    .then(book => res.send(book[0]))
    .catch(console.error)
})

// This gets a specific book for detail view
app.get('/api/v1/books/:id', (req, res) => {
  client.query(`SELECT book_id, title, author, image_url, isbn, description FROM books
    WHERE book_id=$1;`,
      [req.params.id])
      .then(result => res.send(result.rows))
      .catch(console.error);
});

 // This inserts new books into database
app.post('/api/v1/books', (request, response) => {
  client.query(
    'INSERT INTO books (title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
      [request.body.title, request.body.author, request.body.isbn, request.body.image_url, request.body.description],
    function(err) {
      if (err) console.error(err)
      response.send('insert complete');
    }
  )
});

// This deletes a specific book in database
app.delete('/api/v1/books/:id', (request, response) => {
  client.query(`DELETE FROM books WHERE book_id=$1;`,
    [request.params.id]
  )
  .then(() => response.sendStatus(204))
  .catch(console.error);
});

// This updates a book in the database
app.put('/api/v1/books', (request, response) => {
  console.log('here in query')
  console.log(request.body);

  client.query(`UPDATE books SET title=$1, author=$2, image_url=$3, isbn=$4, description=$5 WHERE book_id=$6;`,
    [request.body.title, request.body.author, request.body.image_url, request.body.isbn, request.body.description, request.body.book_id]
  )
    .then(() => response.sendStatus(200))
    .catch(console.error);
});


////////////// DATABASE LOAD FUNCTIONS /////////////////////

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


//AIzaSyBh3CRyJhRAU00mgJwr5TyFQCZ9brHH79c
