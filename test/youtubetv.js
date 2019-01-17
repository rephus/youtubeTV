var assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();


chai.use(chaiHttp);

describe('/GET random', () => {
    it('it should return a random video from youtube API', (done) => {
      chai.request(server)
          .get('/random')
          .end((err, res) => {
                res.should.have.status(200);
            done();
          });
    });
});
