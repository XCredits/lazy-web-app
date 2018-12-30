const displayUsernameRegex = /^[a-zA-Z0-9_.-]*$/;
const usernameRegex = /^[a-z0-9]*$/;

module.exports = {
  isValidUsername,
  isValidDisplayUsername,
  convertToDisplayUsername,
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
function isValidDisplayUsername(username) {
  return displayUsernameRegex.test(username);
}


/**
 *
 * @param {string} username
 * @return {string}
 */
function convertToDisplayUsername(username) {
  return username
      .split('.').join('')
      .split('_').join('')
      .split('-').join('')
      .toLowerCase();
}
