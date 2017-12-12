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

app.get('/', (req, res) => res.send('test!'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

//PORT=3000
//CLIENT_URL=http://localhost:8080
//DATABASE_URL=postgres://localhost:5432/books_app
