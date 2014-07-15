#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var hyperquest = require('hyperquest');
var stream = require('stream');
var concat = require('concat-stream');
var rsa = require('rsa-stream');
var HOME = process.env.HOME || process.env.USERPROFILE;

var minimist = require('minimist');
var argv = minimist(process.argv.slice(2), {
  alias: {
    e: 'encoding',
    d: 'decrypt',
    h: 'help',
    k: 'keyname'
  },
  'default': {
    encoding: 'base64'
  }
});

process.stdin.pipe(concat(function(data) {
  main(argv, data);
}));

function main(argv, data) {
  if (argv.help) {
    return fs.createReadStream(__dirname + '/usage.txt')
    .pipe(process.stdout)
    ;
  }

  //assume the user is decrypting when there is no args,
  //but they are piping something in.
  if(!argv.decrypt && (argv._.length === 0 && !process.stdin.isTTY))
    argv.decrypt = true

  if (argv.decrypt) {
    var keyfile = argv.decrypt;
    if (keyfile === true) {
      var keyname = 'id_rsa';
      if (argv.keyname)
        keyname = argv.keyname;
      keyfile = path.join(
        process.env.HOME || process.env.USERPROFILE,
        '.ssh', keyname
      );
    }
    return fs.readFile(keyfile, function (err, privkey) {
      if (err) {
        error(err);
        process.exit(1);
      }

      decrypt(data.toString().split('\n'));

      function decrypt(lines) {
        if (lines[0] === undefined || lines[0].length == 0) {
          return;
        }
        var dec = rsa.decrypt(privkey, { encoding: argv.encoding });
        dec.on('error', function(err) {
          decrypt(lines.slice(1));
        });
        dec.on('end', function() {
          process.stdout.write('\n');
          decrypt(lines.slice(1));
        });
        dec.pipe(process.stdout);
        dec.end(lines[0]);
      }
    });
  }

  if (argv._.length === 0) {
    fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
    return;
  }

  var user = argv._[0];
  keyOf(user, function (err, keys, fromGithub) {
    if (err) {
      console.error(err);
      return process.exit(10);
    }
    if (!keys || keys.length === 0) {
      console.error(
        'No RSA keys available for the requested user.\n'
      );
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
      var enc = rsa.encrypt(pubkeys[0], { encoding: argv.encoding });
      enc.on('error', function(err){
        encrypt(pubkeys.slice(1));
      });
      enc.on('end', function() {
        process.stdout.write('\n');
        encrypt(pubkeys.slice(1));
      });
      enc.pipe(process.stdout);
      enc.end(data.toString());
    }
  });
}

function keyOf (user, cb) {
  githubKeys(user, function(err, keys){
    cb(err, keys, true);
  })
}

function githubKeys (user, cb) {
  var u = 'https://github.com/' + user + '.keys';
  var hq = hyperquest(u);
  hq.on('error', function (err) {
    cb(err);
    cb = function () {};
  });
  hq.pipe(concat(function (body) {
    var keys = body.toString().split(/\r?\n/)
    .map(function (key) { return key.trim() })
    .filter(function (key) {
      return /^ssh-rsa\b/.test(key);
    })
    ;
    cb(null, keys);
  }));
}

process.on('uncaughtException', function(err) {
  console.error(err);
});
