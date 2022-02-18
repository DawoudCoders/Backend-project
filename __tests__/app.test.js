const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("Get api/topics", () => {
  test("Should return with an array of length 3 ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        body.length;
        expect(body.topics.rows.length).toBe(3);
      });
  });
  test("Should return with an array of object, all of which have a slug and description key  ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const topicsArr = body.topics.rows;
        topicsArr.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("Get specific article ID", () => {
  test("Should respond with only the comments that match the id", () => {
    return request(app)
      .get("/api/article/3")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          articleByID: {
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z",
            votes: 0,
            comment_count: "2",
            article_id: 3,
          },
        });
      });
  });
  test("Should return correct key types of object", () => {
    return request(app)
      .get("/api/article/3")
      .expect(200)
      .then(({ body }) => {
        expect(body.articleByID).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(String),
            article_id: expect.any(Number),
          })
        );
      });
  });
  test("Should return article not found if id not valid ", () => {
    return request(app)
      .get("/api/article/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});

describe("PATCH /api/articles/:article_id ", () => {
  test("Status 200 : responds with status 200 ", () => {
    return request(app)
      .patch("/api/article/3")
      .send({ inc_votes: 1 })
      .expect(200);
  });
  test("Status 200 : responds with an object of the updated article ", () => {
    return request(app)
      .patch("/api/article/3")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          updatedArticle: {
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z",
            votes: 1,
          },
        });
      });
  });
  test("Status 200 : responds with an object of the updated article -- SECOND TEST ", () => {
    return request(app)
      .patch("/api/article/3")
      .send({ inc_votes: -15 })
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          updatedArticle: {
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z",
            votes: -15,
          },
        });
      });
  });
  //bad path
  test("status 400: respond with status 400 for invalid update request i.e inc_votes: aaa", () => {
    return request(app)
      .patch("/api/article/3")
      .send({ inc_votes: "aaa" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid input type");
      });
  });

  test("status 404: if article non existant", () => {
    return request(app)
      .patch("/api/article/9999")
      .send({ inc_votes: "12" })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});

describe("GET /api/users", () => {
  test("status 200: should respond with object of array of objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);

        expect(body).toEqual({
          users: [
            {
              username: "butter_bridge",
            },
            {
              username: "icellusedkars",
            },
            {
              username: "rogersop",
            },
            {
              username: "lurker",
            },
          ],
        });
        body.users.forEach((object) => {
          expect(object).toEqual(
            expect.objectContaining({
              username: expect.any(String),
            })
          );
        });
      });
  });
});

describe.only("GET /api/articles", () => {
  test("Status 200: return with array of objects ommiting the article body & should be sorted in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(12);

        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_id: expect.any(Number),
              comment_count: expect.any(String),
            })
          );
        });
        expect(body.articles).toBeSortedBy("created_at");
      });
  });
});
//badPath no 400 or 404 only path not found error

describe("GET /api/articles/:id/comments", () => {
  test("Status 200:Should response with an array of comment objects", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(2);
        body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              body: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              article_id: 3,
            })
          );
        });
      });
  });
  test("Status 400: bad req if invalid  input type used by user ", () => {
    return request(app)
      .get("/api/articles/aaa/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid input type");
      });
  });
  test("Status 404:Article not found ", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});
