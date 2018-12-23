module.exports = {
    "env": {
        "browser": false,
        "node": true,
        "es6": true
    },
    "extends": "google",
    "parserOptions": {
        "ecmaVersion": 6
    },
    "rules": {
        "max-len": ["warn"],
        "eqeqeq": "warn",
        "no-redeclare": "warn",
        "no-undef": "warn",
        "no-unused-vars": "warn",
        "quotes": ["warn", "single", "avoid-escape"],
    }
};