var express = require('express');
const { Sequelize } = require('sequelize');
var router = express.Router();
const { Book } = require('../models');
const {substring, or} = Sequelize.Op;


//Error async handler
function asyncHandler(cb) {
  return async (req,res,next) => {
    try {
      await cb(req,res,next)
    } catch(error) {
      next(error)
    }
  }
}


//Redirects to page 1 of book list.
router.get(['/', '/books'], function(req, res, next) {
  res.redirect('/books/pages/1');
});


//full list of books - pagination included
router.get('/books/pages/:page', asyncHandler(async (req, res, next) => {
  let books = await Book.findAll();
  const totalPages = Math.ceil(books.length / 10);
  const startIndex = (req.params.page * 10) - 10;
  const endIndex = req.params.page * 10;
  let booksFiltered = books.slice(startIndex, endIndex);
  if (req.params.page > totalPages || isNaN(req.params.page)) {
    next()
  } else {
    res.render('index', { books , booksFiltered, page: req.params.page, totalPages, startIndex, endIndex });
  }
}));

//Search feature
router.get('/books/search', asyncHandler( async (req, res, next) => {
    if (req.query.query === "") {
      res.redirect('/');
    } else {
      const books = await Book.findAll(
        { where: {
          [or]: [ { title: {[substring]: req.query.query}} ,
                    {author: {[substring]: req.query.query }},
                    {genre: {[substring]: req.query.query }},
                    {year:  {[substring]: +req.query.query }},
          ]
        }});
      res.render('searchResults', {books})
    }
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
    res.redirect('/books/pages/1')
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
    if (book === null) {
      next()
    } else {
      res.render('update-book.pug', { book });
    }
}));

//updates book on database
router.post('/books/:id', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect('/books/pages/1');
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.findByPk(req.params.id);
      res.render('update-book', { book, errors: error.errors});
    } else {
      throw error;
    }
  } 
}));

//delete a book
router.post('/books/:id/delete', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/books/pages/1');
}));

module.exports = router;
