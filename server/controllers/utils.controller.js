const usernameRegex = /^[a-zA-Z0-9_.-]*$/;
const usernameStrippedRegex = /^[a-z0-9]*$/;

module.exports = {
  isValidUsername,
  isValidStrippedUsername,
  stripUsername,
};

/**
 *
 * @param {string} username
 * @return {boolean}
 */
function isValidUsername(username) {
  return usernameRegex.test(username);
}

/**
 *
 * @param {string} username
 * @return {boolean}
 */
function isValidStrippedUsername(username) {
  return usernameStrippedRegex.test(username);
}

/**
 *
 * @param {string} username
 * @return {string}
 */
function stripUsername(username) {
  return username
      .split('.').join('')
      .split('_').join('')
      .split('-').join('')
      .toLowerCase();
}
