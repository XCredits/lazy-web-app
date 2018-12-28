const usernameRegex = /^[a-zA-Z0-9_.-]*$/;

module.exports = {
  isValidUsername,
}

function isValidUsername(username) {
  return usernameRegex.test(username);
}

function stripUsername(username) {
  return username
      .split('.').join('')
      .split('_').join('')
      .split('-').join('')
      .toLowerCase();
}
