
const usernameRegex = /^[a-z0-9]*$/;
const displayUsernameRegex = /^[a-zA-Z0-9_.-]*$/;


export {
  isValidUsername,
  isValidDisplayUsername,
  normalizeUsername,
  normalizeContact,
  usernameRegex,
  displayUsernameRegex,
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
function normalizeUsername(username) {
  return username
      .split('.').join('')
      .split('_').join('')
      .split('-').join('')
      .toLowerCase();
}


/**
 *
 * @param {string} contact
 * @return {string}
 */
function normalizeContact(contact) {
  return contact
      .split('.').join('')
      .split('_').join('')
      .split('-').join('')
      .toLowerCase()
      .charAt(0).toUpperCase() + contact.slice(1).toLowerCase();
}
