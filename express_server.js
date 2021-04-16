const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
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

const newUser = (id, email, password) => {
  if (users[id]) {
    return { error: "Sorry! This user is taken", data: null }
  }
  if (!email || !password) {
    return { error: "There is missing info", data: null }
  }
  user[id] = { id, email, password }
  return { error: null, data: { id, email, password } }
}

const generateRandomString = function () {
  let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = [];
  for (let i = 0; i < 6; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * characters.length)));
  }
  return result.join(" ");
};

const newUserInfo = (email, password) => {
  const userId = generateRandomString()
  users[userId] = {
    id: userId,
    email,
    password,
  }
  return userId
}

const locateUser = (email) => {
  for (let user of Object.values(users)) {
    if (user.email === email) {
      return user
    }
  }
  return false
};

const verify = (email, password, action) => {
  const user = locateUser(email);
  if (!email || !password) {
    return "Error, missing information";
  }
  if (user && action === "register") {
    return "Error, this email already exists";
  }
  if (!user && action === "login") {
    return "Not found";
  }
  return false
}

const confirm = (email, password) => {
  const user = locateUser(email)
  if (user && user.password === password) {
    return user
  }
  return false
}

app.get("/", (req, res) => {
  res.send("/urls");
});

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] }
  res.render('register', templateVars)
})

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const message = verify(email, password, "register")
  if (message) {
    res.status(400).send(message)
  } else {
    res.cookie('user_id', newUserInfo(email, password))
    res.redirect('/urls')
  }
})

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`)
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body
  const message = verify(email, password, "login")
  if (message) {
    res.status(403).send(message)
    return;
  }
  let validUser = confirm(email, password)
  if (!validUser) {
    res.status(403).send("Incorrect Password")
    return;
  }
  res.cookie("user_id", validUser.id)
  res.redirect('/urls')
})

app.get('/login', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] }
  res.render('urls_login', templateVars)
})

app.get('/users', (req, res) => {
  res.json(users)
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});