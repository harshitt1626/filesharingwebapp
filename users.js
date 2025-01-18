const users = [];

const findUserByUsername = (username) => {
  return users.find(u => u.username === username);
};

module.exports = {
  users,
  findUserByUsername,
};
