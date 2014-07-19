var request = require('request')

function githubKeys (user, cb) {
  if(!user || !cb && typeof(user) === 'function') {
    cb = cb || user
    return cb(new Error('No user defined'))
  }

  var url = 'https://github.com/' + user + '.keys';
  request(url, function(err, res, body){
    if(err) return cb(err, body)

    var keys = body.split(/\r?\n/).map(trim).filter(isRSA)

    cb(null, keys)
  });

  function trim(key) { return key.trim() }
  function isRSA(key) { return /^ssh-rsa\b/.test(key) }
}


module.exports = githubKeys
