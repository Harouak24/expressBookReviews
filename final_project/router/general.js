const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    if (!isValid(username, password)) {
        return res.status(400).json({ message: "Invalid username or password" });
    }

    // Add the new user to the list of registered users
    users.push({ username, password });
    return res.status(200).json({ message: "Registration successful" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    axios.get('https://mharouak-5000.theiadocker-2-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/') 
        .then(response => {
            const booksData = response.data;
            res.json(booksData);
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            res.status(500).json({ message: 'Error fetching books' });
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    axios.get(`https://mharouak-5000.theiadocker-2-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/${isbn}`) 
        .then(response => {
            const bookDetails = response.data;
            res.json(bookDetails);
        })
        .catch(error => {
            console.error('Error fetching book details:', error);
            res.status(500).json({ message: 'Error fetching book details' });
        });
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const response = await axios.get('https://mharouak-5000.theiadocker-2-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/'); 
        const books = response.data;
        
        const booksByAuthor = books.filter(book => book.author.toLowerCase() === author.toLowerCase());
        res.json(booksByAuthor);
    } catch (error) {
        console.error('Error fetching book details:', error);
        res.status(500).json({ message: 'Error fetching book details' });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        const response = await axios.get('https://mharouak-5000.theiadocker-2-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/'); 
        const books = response.data;
        
        const booksByTitle = books.filter(book => book.title.toLowerCase() === title.toLowerCase());
        res.json(booksByTitle);
    } catch (error) {
        console.error('Error fetching book details:', error);
        res.status(500).json({ message: 'Error fetching book details' });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    res.send({ review: book.review });
});

module.exports.general = public_users;
