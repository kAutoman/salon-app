var exec = require('cordova/exec');

exports.signin = function(arg0, success, error) {
  exec(success, error, "SignInWithApple", "signin", [arg0]);
};
