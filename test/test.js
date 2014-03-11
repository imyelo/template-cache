var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var cache = require('../');
var basepath = path.join(__dirname, './fixture/tpl');
var ext = '.tpl';

describe('template-cache', function () {
  describe('case', function () {
    describe('base', function () {
      it('1 work', function () {
        cache.load(basepath, {slim: false, extension: ext});
        expect(cache.require('a')).to.be.equal('foo\nbar\nbaz');
      });
      it('2 work', function () {
        cache.load(basepath, {slim: true, extension: ext});
        console.log(cache.toJSON());
        expect(cache.require('a')).to.be.equal('foobarbaz');
        // expect(cache.toJSON());
      });
    });
  });
});

