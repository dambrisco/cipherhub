var fs     = require('fs');
var path   = require('path');
var HOME   = process.env.HOME || process.env.USERPROFILE;
var rsa    = require('rsa-stream');

function decryptData(keyName, encoding, data){
  keyName = keyName || 'id_rsa';

  var keyFile = path.join(HOME, '.ssh', keyName)

  return fs.readFile(keyFile, function (err, privkey) {
    if (err) {
      console.log('Key File %s could not be read', keyFile)
      process.exit(1);
    }

    decrypt(data.toString().split('\n'));

    function decrypt(lines) {
      var curLine = lines.shift()
      if (!curLine || !curLine.length) return

      var decryptStream = rsa.decrypt(privkey, { encoding: encoding });

      decryptStream.on('error', function() {
        decrypt(lines)
      })

      decryptStream.on('end', function() {
        process.stdout.write('\n')
        decrypt(lines)
      })

      decryptStream.pipe(process.stdout)

      decryptStream.write(curLine)
      decryptStream.end()
    }
  });
}

module.exports = decryptData
