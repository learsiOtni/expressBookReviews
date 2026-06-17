const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {

    if (!isValid(username)) {
        users.push({
            "username": username,
            "password": password
        })
        return res.status(200).json({ message: "User successfully registered. Now you can login!"})
    } else {
        return res.status(404).json({ message: "User already exist."})
    }
  }

  return res.status(404).json({message: "Unable to register user!"});
});

const getBooks = () => {
    return new Promise((resolve, reject) => {
        setTimeout( () => {
            if (Object.keys(books).length > 0) {
                resolve(books);
            } else {
                reject("No Books found!")
            }
           
        }, 1000)
    })
}

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    try {
        return res.status(300).json(JSON.stringify(await getBooks(), null, 4));
    } catch(error) {
        return res.status(404).json({ error: error})
    }
  
});

const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout( () => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("No Book found!")
            }
            
        }, 1000)
    })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    try {
        const isbn = req.params.isbn
        return res.status(300).json(await getBookByISBN(isbn));
    } catch(error) {
        return res.status(404).json({ error: error})
    }
 });
  
 const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        setTimeout( () => {
            const filteredArray = Object.values(books).filter( book => book.author === author);

            if (filteredArray.length > 0) {
                resolve(filteredArray);
            } else {
                reject("No Book found!")
            }
        }, 1000)
    })
}
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  try {
        const author = req.params.author
        return res.status(300).json(await getBooksByAuthor(author));
    } catch(error) {
        return res.status(404).json({ error: error})
    }
});

const getBookByTitle = (title) => {
    return new Promise((resolve, reject) => {
        setTimeout( () => {
            const filteredArray = Object.values(books).filter( book => book.title.replaceAll(' ', '') === title)

            if (filteredArray.length > 0) {
                resolve(filteredArray);
            } else {
                reject("No Book found!")
            }
        }, 1000)
    })
}
// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  try {
        const title = req.params.title
        return res.status(300).json(await getBookByTitle(title));
    } catch(error) {
        return res.status(404).json({ error: error})
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if(book) {
    return res.status(300).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found!"})
  }
  
});

module.exports.general = public_users;
