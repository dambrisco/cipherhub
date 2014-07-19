var fs     = require('fs');
var path   = require('path');
var HOME   = process.env.HOME || process.env.USERPROFILE;
var rsa    = require('rsa-stream');

function decryptData(keyName, encoding, data){
  keyName = keyName || 'id_rsa';

  var encryptedStr = data.toString().split('\n')
  var keyFile = path.join(HOME, '.ssh', keyName)
  fs.readFile(keyFile, handleFile)

  function handleFile(err, privateKey) {
    if (err) {
      console.log('Key File %s could not be read', keyFile)
      process.exit(1);
    }

    decrypt(encryptedStr, privateKey);
  }

  function decrypt(lines, privateKey) {
    var curLine = lines.shift()
    if (!curLine || !curLine.length) return

    var decryptStream = rsa.decrypt(privateKey, { encoding: encoding });

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
}

module.exports = decryptData
