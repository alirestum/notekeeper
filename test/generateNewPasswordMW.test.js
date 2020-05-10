const chai = require('chai');
const generateNewPasswordMW = require('../middlewares/generateNewPasswordMW');
const expect = chai.expect;
const it = require('mocha').it;
chai.use(require('chai-match'));

describe('generateNewPasswordMW', function () {

    it('should set res.local.error to some error when there is a salt generation error', function (done) {

        const bcryptMock = {
            genSalt: (arg, cb) =>{
                expect(arg).to.be.eql(10);
                cb('Some salt generation error', null);
            }
        }
        const mw = generateNewPasswordMW(bcryptMock);

        const resMock ={
          locals: {}
        };
        mw({}, resMock, () =>{
            expect(resMock.locals.error).to.be.eql('Some salt generation error');
            expect(resMock.locals.newpw).to.be.eql(undefined);
            expect(resMock.locals.newpwHashed).to.be.eql(undefined);
            done();
        });


    });
    it('should set res.local.error to some error when there is a hashing error', function (done) {

        const bcryptMock = {
            genSalt: (arg, cb) =>{
                expect(arg).to.be.eql(10);
                cb(null, 'Some salt');
            },
            hash: (newPw, salt, cb) =>{
                expect(newPw).to.match(/([a-zA-Z0-9]*)/).and.capture(0).equals(newPw);
                expect(salt).to.be.eql('Some salt');
                cb('Hashing error', null);
            }
        }
        const mw = generateNewPasswordMW(bcryptMock);

        const resMock ={
            locals: {}
        };
        mw({}, resMock, () =>{
            expect(resMock.locals.error).to.be.eql('Hashing error');
            expect(resMock.locals.newpw).to.be.eql(undefined);
            expect(resMock.locals.newpwHashed).to.be.eql(undefined);
            done();
        });


    });
    it('should set res.local.newpw to the new PW, and newpwHashed to the hashed PW', function (done) {

        const bcryptMock = {
            genSalt: (arg, cb) =>{
                expect(arg).to.be.eql(10);
                cb(null, 'Some salt');
            },
            hash: (newPw, salt, cb) =>{
                expect(salt).to.be.eql('Some salt');
                cb(null, 'HashedPW');
            }
        }
        const mw = generateNewPasswordMW(bcryptMock);

        const resMock ={
            locals: {}
        };
        mw({}, resMock, () =>{
            expect(resMock.locals.error).to.be.eql(undefined);
            expect(resMock.locals.newpw).to.be.match(/([a-zA-Z0-9]*)/).and.capture(0).equals(resMock.locals.newpw);
            expect(resMock.locals.newpwHashed).to.be.eql('HashedPW');
            done();
        });


    });
    it('should call next without doing anything if there\'s an error on the chain', function (done) {
        const bcrypt ={};
        const mw = generateNewPasswordMW(bcrypt);

        const resMock = {
            locals: {
                error: 'Some error from the chain'
            }
        };

        mw({}, resMock, () =>{
            expect(resMock.locals.error).to.be.eql('Some error from the chain');
            expect(resMock.locals.newpw).to.be.eql(undefined);
            expect(resMock.locals.newpwHashed).to.be.eql(undefined);
            done();
        });
    });

})