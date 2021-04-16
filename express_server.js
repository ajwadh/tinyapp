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
    return { error: "Sorry! This user is taken", data:null }
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

app.get("/", (req, res) => {
  res.send("/urls");
});

//Register
// app.get("/register", (req, res) => {
//   //const user_id = req.cookies["user_id"];
//   //res.cookie('user_id', user_id);
//   const templateVars = { user: users["user_id"], urls: urlDatabase };
//   res.render("register", templateVars);
// });
//Maybe
app.get('/register', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] }
  res.render('register', templateVars)
})

//Register
app.post("/register", (req, res) => {
  const userID = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  users[userID] = { id: userID, email, password };
  console.log(users);
  res.cookie('user_id', userID);
  res.redirect(`/urls`);
});
//maybe
// app.post('/register', (req, res) => {
//   const { email, password } = req.body;
//   let user_id = generateRandomString();

//   const result = createNewUser(user_id, email, password)

//   if (result.error) {
//     return res.send(result.error)
//   }

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["username"]] };
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
//ok
app.post('/login', (req, res) => {
  res.cookie('user_id', users[req.cookies['user_id']['email']]);
  res.redirect('/urls');
});
//test
 app.get('/login', (req, res) => {
   let templateVars = { user: users[req.cookies["user_id"]] }
   res.render('urls_login', templateVars)
 })

 app.get('/users', (req, res) => {
   res.json(users)
 })
//ok
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["username"]] };
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