const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// middleware? to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

//server static files?
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'cschmidt',
    password: 'ubcar21ME!car',
    database: 'loginData'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

//serve registration form
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
})

// user registration
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    // hash the password
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return res.status(500).send('Server error');
        }

        // Insert new user into db
        const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
        db.query(query, [username, hash, email], (err, result) => {
            if (err) {
                return res.status(500).send('Server error');
            }
            res.send('User registered successfully');
        })
    })
})

// serve login form
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})


// handle login form submissions
app.post('/index',(req, res) => {
    const { username, password } = req.body;
    
    //query database to find user
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(401).send('Invalid username or password');
        }

        const user = results[0];

        // compare hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Server error')
            }
            if (!isMatch) {
                return res.status(401).send('Invalid username or password');
            }

            //if pass matches, auth user
            res.send('Login successful');
        })
    })
})


//start server
app.listen(3000, '0.0.0.0', () => {
    console.log('Server started on port 3000');
});