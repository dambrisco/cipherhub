var stream = require('stream');
var rsa    = require('rsa-stream');

var githubKeys = require('../lib/retrieve-github-keys')

function encryptData(user, data, encoding){
  githubKeys(user, encryptWithKeys)

  function encryptWithKeys(err, keys) {
    if (err) {
      console.error(err);
      return process.exit(10);
    }

    if (!keys || keys.length === 0) {
      console.error('No RSA keys available for the requested user.\n');
      return process.exit(20);
    }

    encrypt(keys);
  }

  function encrypt (pubKeys) {
    var curLine = pubKeys.shift()
    if (curLine  === undefined) return

    var string = new stream();
    string.pipe = function(dest) {
      dest.write(data.toString());
      return dest;
    }

    var encryptStream = rsa.encrypt(curLine, { encoding: encoding });
    encryptStream.on('error', function(){
      encrypt(pubKeys);
    });

    encryptStream.on('end', function() {
      process.stdout.write('\n');
      encrypt(pubKeys);
    });

    encryptStream.pipe(process.stdout);

    encryptStream.write(data.toString());
    encryptStream.end()
  }
}

module.exports = encryptData
