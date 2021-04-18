const generateRandomString = () => {
  const randomKey = Math.random().toString(36).substring(7);
  return randomKey
};

const lookUpEmail = (email, users) => {
  for (const key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return undefined;
};

const urlsForUser = (id, urlDatabase) => {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
}

module.exports = {generateRandomString, lookUpEmail, urlsForUser};