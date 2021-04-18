const generateRandomString = () => {
  const randomKey = Math.random().toString(36).substring(7);
  return randomKey
};

const lookUpEmail = (email, password) => {
  for (const key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return false;
};

const urlsForUser = (id) => {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
}

module.exports = {generateRandomString, lookUpEmail, urlsForUser};