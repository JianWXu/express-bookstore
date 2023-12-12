process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let sampleBook;

beforeEach(async () => {
  let result = await db.query(`
      INSERT INTO
        books (isbn, amazon_url,author,language,pages,publisher,title,year)
        VALUES(
          '123432122',
          'https://amazon.com/taco',
          'Elie',
          'English',
          100,
          'Nothing publishers',
          'my first book', 2008)
        RETURNING isbn`);

  sampleBook = result.rows[0].isbn;
});

describe("get all books /books", function () {
  test("Get a list of 1 book", async function () {
    const resp = await request(app).get(`/books`);
    const books = resp.body.books;
    expect(books).toHaveLength(1);
    expect(books[0]).toHaveProperty("isbn");
    expect(books[0]).toHaveProperty("pages");
  });
});

describe("get /books/:isbn ", function () {
  test("Get a certain book from isbn", async function () {
    const resp = await request(app).get(`/books/${sampleBook}`);
    const book = resp.body.book;
    expect(book).toHaveProperty("isbn");
    expect(book).toHaveProperty("pages");
  });

  test("Respond with 404 if can't find book", async function () {
    const resp = await request(app).get("/books/6");
    expect(resp.statusCode).toBe(404);
  });
});

describe("post /books", function () {
  test("Posting a new book", async function () {
    const resp = await request(app)
      .post(`/books`)
      .send({
        book: {
          isbn: "123456",
          amazon_url: "https://hellworld.com",
          author: "Jenny",
          language: "English",
          pages: 123,
          publisher: "idklol",
          title: "what am I doing here?",
          year: 2024,
        },
      });
    expect(resp.statusCode).toBe(200);
    expect(resp.body.author).toBe("Jenny");
  });

  test("Prevent posting a book without required isbn", async function () {
    const resp = await request(app).post("/books").send({
      author: "Vad",
    });
    expect(resp.statusCode).toBe(400);
  });
});

describe("put /books/:isbn", function () {
  test("Changing a book", async function () {
    const resp = await request(app)
      .put(`/books/${sampleBook}`)
      .send({
        book: {
          isbn: "123456",
          amazon_url: "https://hellworld.com",
          author: "Jenny",
          language: "English",
          pages: 123,
          publisher: "idklol",
          title: "what am I doing here?",
          year: 2024,
        },
      });
    expect(resp.body).toHaveProperty("isbn");
    expect(resp.body.author).toBe("Jenny");
  });

  test("Can't find isbn", async function () {
    const resp = await request(app)
      .post("/books/123")
      .send({
        book: {
          isbn: "123456",
          amazon_url: "https://hellworld.com",
          author: "Jenny",
          language: "English",
          pages: 123,
          publisher: "idklol",
          title: "what am I doing here?",
          year: 2024,
        },
      });
    expect(resp.statusCode).toBe(404);
  });

  test("Prevent updating a book without required year", async function () {
    const resp = await request(app).put(`/books/${sampleBook}`).send({
      author: "Vad",
    });
    expect(resp.statusCode).toBe(400);
  });
});

describe("delete a book /books/:isbn", function () {
  test("Deletes a book", async function () {
    const response = await request(app).delete(`/books/${sampleBook}`);
    expect(response.body).toEqual({ message: "Book deleted" });
  });
});

afterEach(async function () {
  await db.query("DELETE FROM books");
});

afterAll(async function () {
  await db.end();
});
