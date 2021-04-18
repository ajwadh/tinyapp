const { assert } = require('chai');

const { lookUpEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "http://www.google.com", userID: "aJ48lW" },
};

describe('lookUpEmail', function () {
  it('should return a user with valid email', function () {
    const user = lookUpEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert(user, expectedOutput);
    assert.equal(user, expectedOutput);
  });

  it('shoud return undefined if user does not exist', function () {
    const user = lookUpEmail("hossain.ajwad@gmail.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe("urlsForUser", () => {
  it(`should return corresponding object that specific user has`, function () {
    const result = urlsForUser("aJ48lW", testUrlDatabase);
    const expectedOutput = {
      b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
      i3BoGr: { longURL: "http://www.google.com", userID: "aJ48lW" },
    };
    assert.deepEqual(result, expectedOutput);
  });

  it(`should return empty object when there is no user`, () => {
    const result = urlsForUser('lighthouse', testUrlDatabase);
    const expectedOutput = {};

    assert.deepEqual(result, expectedOutput);
  });
});
