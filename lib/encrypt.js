var stream = require('stream');
var rsa    = require('rsa-stream');

var githubKeys = require('../lib/retrieve-github-keys')

function encryptData(user, data, encoding){
  githubKeys(user, function (err, keys) {
    if (err) {
      console.error(err);
      return process.exit(10);
    }

    if (!keys || keys.length === 0) {
      console.error('No RSA keys available for the requested user.\n');
      return process.exit(20);
    }

    if (keys.length > 0) {
      encrypt(keys);
    }

    function encrypt (pubkeys) {
      if (pubkeys[0] === undefined) {
        return;
      }

      var string = new stream();
      string.pipe = function(dest) {
        dest.write(data.toString());
        return dest;
      }

      var enc = rsa.encrypt(pubkeys[0], { encoding: encoding });
      encryptStream.on('error', function(err){
        encrypt(pubkeys.slice(1));
      });

      encryptStream.on('end', function() {
        process.stdout.write('\n');
        encrypt(pubkeys.slice(1));
      });

      encryptStream.pipe(process.stdout);

      encryptStream.write(data.toString());
      encryptStream.end()
    }
  });
}

module.exports = encryptData
