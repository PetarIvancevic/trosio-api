module.exports = {
  "extends": [
    "standard",
    "plugin:promise/recommended"
  ],
  "rules": {
    "comma-dangle": ["error", "always-multiline"],
    "indent": ["error", 2, {
      "MemberExpression": 0
    }],
    "no-else-return": "error",
    "promise/valid-params": "off"
  }
}
