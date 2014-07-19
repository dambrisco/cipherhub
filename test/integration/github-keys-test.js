var expect     = require('chai').expect
var githubKeys = require('../../lib/retrieve-github-keys')

describe('retrieve github keys', function(){
  it('should call callback with err if no user', function(done){
    githubKeys(function(err, keys){
      expect(err).to.exist
        .and.be.instanceof(Error)

      done()
    })

  })

  it('should retrieve keys for a given user', function(done){
    this.slow(500)

    githubKeys('wasbazi', function(err, keys){
      if(err) return done(err)

      expect(keys.length).to.be.above(0)
      done()
    })

  })
})
