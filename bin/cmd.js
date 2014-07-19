#!/usr/bin/env node

var fs     = require('fs');
var concat = require('concat-stream');

var decrypt = require('../lib/decrypt')
var encrypt = require('../lib/encrypt')

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

// User has requested help or did not provide a github username and did not request a decrypt
if (argv.help || (argv._.length === 0 && !argv.decrypt)) {
  return fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
}

process.stdin.pipe(concat(function(data) {
  main(argv, data);
}));

function main(argv, data) {
  if (argv.help || argv._.length === 0) {
    return fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout)
  }

  //assume the user is decrypting when there is no args,
  //but they are piping something in.
  if(!argv.decrypt && (argv._.length === 0 && !process.stdin.isTTY))
    argv.decrypt = true

  if (argv.decrypt) {
    return decrypt(argv.keyname, argv.encoding, data)
  }

  encrypt(argv._[0])
}

process.on('uncaughtException', function(err) {
  console.error(err);
  process.exit(1)
});
