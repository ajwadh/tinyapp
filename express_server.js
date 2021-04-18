const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {generateRandomString, lookUpEmail, urlsForUser} = require("./helpers.js");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

///////////////////////////
//////// Database//////////
///////////////////////////

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  }
};

///////////////////////////
//////////Routes///////////
///////////////////////////

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]], urls: urlsForUser(req.session["user_id"], urlDatabase)
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURLKey = generateRandomString();
  urlDatabase[shortURLKey] = { longURL: req.body.longURL, userID: [req.session["user_id"]] };
  res.redirect(`/urls/${shortURLKey}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURLOne = req.params.shortURL;
  if(users[req.session["user_id"]] && users[req.session["user_id"]].id === urlDatabase[shortURLOne].userID){
    delete urlDatabase[shortURLOne];
    res.redirect("/urls");
  }
  res.send("Error, you are not the owner of this URL");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURLOne = req.params.shortURL;
  let longURL = req.body.longURL;
  if(users[req.session["user_id"]] && users[req.session["user_id"]].id === urlDatabase[shortURLOne].userID){
    urlDatabase[shortURLOne].longURL = longURL;
    res.redirect("/urls");
  } else {
  res.send("Error, you are not the owner of this URL");
  }
});

app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.session["user_id"]], };
  if (templateVars.user) {
    res.render('urls_new', templateVars)
  } else {
    res.redirect('../login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],};
  res.render("urls_show", templateVars);
  if (templateVars.user) {
    res.render('urls_show', templateVars)
  } else {
    res.redirect('../login');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userId = lookUpEmail(userEmail, users);

  if (!userId) {
    return res.status(403).send("Incorrect email or does not exist");
  } else if (!bcrypt.compareSync(userPassword, users[userId].password)) {
    return res.status(403).send("Incorrect password");
  }
  res.session("user_id", userId);
  res.redirect("/urls");
});
app.post('/logout', (req, res) => {
  res.session['user_id'] = null;
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] }
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const userRandomID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  users[userRandomID] = {
    id: userRandomID,
    email: userEmail,
    password: bcrypt.hashSync(userPassword, saltRounds)
  };
  res.session['user_id'] = userRandomID;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});