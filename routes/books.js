const express = require("express");
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");
const ExpressError = require("../expressError");
const Router = require("express").Router;

const router = new express.Router();

/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  const result = jsonschema.validate(req.body, bookSchema);
  if (!result.valid) {
    let listErrors = result.errors.map((error) => error.stack);
    let error = new ExpressError(listErrors, 400);
    return next(error);
  }
  const { book } = req.body;
  await Book.create(book);
  return res.json(book);
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  const result = jsonschema.validate(req.body, bookSchema);
  if (!result.valid) {
    let listErrors = result.errors.map((error) => error.stack);
    let error = new ExpressError(listErrors, 400);
    return next(error);
  }
  const { book } = req.body;
  await Book.update(req.params.isbn, book);
  return res.json(book);
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
