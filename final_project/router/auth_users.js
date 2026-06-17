const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userwithsamename = users.filter( (user) => {
        return user.username === username;
    })

    if (userwithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter( (user) => {
        return (user.username === username && user.password === password)
    })

    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in!"});
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
        data: password,
    }, 'access', { expiresIn: 60*60});

    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).send("User successfully logged in.")
  } else {
    return res.status(208).json({ message: `Invalid login. Check ${username} and ${password} and ${JSON.stringify(users)}`});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const review = req.query.review;
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const book = books[isbn];
  const bookReviews = book.reviews;

  //return res.status(300).json({ message: `${review} ${username} ${JSON.stringify(book)} ${JSON.stringify(bookReviews)}`});

  if (book && bookReviews[username]) {
    books[isbn].reviews[username] = review;
    return res.status(300).json({ message: "Review successfully edited"});
  } else {
    books[isbn].reviews = {...books[isbn].reviews, [username]: review}
    return res.status(300).json({ message: "Review successfully added"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;

    let deletedReview = Object.keys(books[isbn].reviews).filter( key => key === username);

    if (deletedReview.length > 0) {
        books[isbn].reviews[username] = null;
        return res.status(300).json({ message: "Review successfully deleted"});
    } else {
        return res.status(401).json({ message: "Unauthorised. Unable to delete"});
    }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
