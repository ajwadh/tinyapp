const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { generateRandomString, lookUpEmail, urlsForUser } = require("./helpers.js");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

///////////////////////////
//////// Database//////////
///////////////////////////

const urlDatabase = {
  b2xVn2: { longURL: "https://www.nike.ca", userID: "aJ48lW" },
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

////////Get Requests///////

app.get("/", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  if (templateVars.user) {
    return res.redirect("/urls");
  }
  return res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]], urls: urlsForUser(req.session["user_id"], urlDatabase)
  };
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]], };
  if (templateVars.user) {
    return res.render("urls_new", templateVars)
  } else {
    return res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.redirect("/urls");
  }
  if (users[req.session["user_id"]] && users[req.session["user_id"]].id !== urlDatabase[shortURL].userID) {
    return res.send("You are not the owner of this url");
  }
  const templateVars = { user: users[req.session["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], };
  if (templateVars.user) {
    return res.render("urls_show", templateVars)
  } else {
    return res.redirect("../login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.redirect("/urls");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);
});

app.get("/login", (req, res) => {
  if (users[req.session["user_id"]]) {
    return res.redirect("urls");
  }
  return res.render("login");
});

app.get("/register", (req, res) => {
  if (users[req.session["user_id"]]) {
    return res.redirect("urls");
  }
  const templateVars = {
    user: users[req.session["user_id"]],
    error: null
  };
  return res.render("register", templateVars);
});


////////Post Requests////////

app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    return res.redirect("/login");
  }
  let shortURLKey = generateRandomString();
  urlDatabase[shortURLKey] = { longURL: req.body.longURL, userID };
  return res.redirect(`/urls/${shortURLKey}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!users[req.session["user_id"]]) {
    return res.redirect("/login");
  } else if (users[req.session["user_id"]] && users[req.session["user_id"]].id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  } else {
    return res.send("Error, you are not the owner of this URL")
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURLOne = req.params.shortURL;
  let longURL = req.body.longURL;
  if (users[req.session["user_id"]] && users[req.session["user_id"]].id === urlDatabase[shortURLOne].userID) {
    urlDatabase[shortURLOne].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.send("Error, you are not the owner of this URL");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  if (!users[req.session["user_id"]]) {
    return res.redirect("/login");
  } else if (users[req.session["user_id"]] && !longURL) {
    return res.redirect(`/urls/${shortURL}`);
  }

  if (users[req.session["user_id"]] && users[req.session["user_id"]].id !== urlDatabase[shortURL].userID) {
    return res.send("Error you can't edit the URL");
  } else {
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = lookUpEmail(userEmail, users);

  if (!userID) {
    return res.status(403).send("Incorrect email or does not exist");
  } else if (!bcrypt.compareSync(userPassword, users[userID].password)) {
    return res.status(403).send("Incorrect password");
  }
  req.session["user_id"] = userID;
  return res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    return res.status(400).render("register");
  } else if (lookUpEmail(userEmail, users)) {
    return res.status(400).render("register");
  }
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: userEmail,
    password: bcrypt.hashSync(userPassword, saltRounds)
  };

  req.session["user_id"] = userID;
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});