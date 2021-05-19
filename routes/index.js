var express = require('express');
var router = express.Router();
const { Book } = require('../models');


function asyncHandler(cb) {
  return async (req,res,next) => {
    try {
      await cb(req,res,next)
    } catch(error) {
      res.status(500).send(error);
    }
  }
}


/* GET home page. */
router.get('/', function(req, res, next) {
  // const books = await Book.findAll();
  // console.log(books);
  // res.json(books);
  res.redirect('/books');
});

//full list of books
router.get('/books', asyncHandler(async (req, res, next) => {
  const books = await Book.findAll();
  res.render('index', { books });
}));

//create new book route page
router.get('/books/new', (req, res, next) => {
  res.render('new-book', {});
});

//post a new book on database
router.post('/books/new', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books/')
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render('new-book', { book, errors: error.errors});
    }else {
      throw error;
    }
  }
  
}));

//show book detail form
router.get('/books/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  res.render('update-book.pug', { book })
}));

//updates book on database
router.post('/books/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  await book.update(req.body);
  res.redirect('/books');
}));

//delete a book
router.post('/books/:id/delete', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/books');
}));

module.exports = router;
