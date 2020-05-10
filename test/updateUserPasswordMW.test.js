const chai = require('chai');
const updateUserPasswordMW = require('../middlewares/updateUserPassword');
const expect = chai.expect;
const it = require('mocha').it;
const mongoose = require('mongoose');


describe('updateUserPasswordMW', function () {

    it('should set res.locals.error to some error when there is a db error', function (done) {
        const repoMock = {
            findOneAndUpdate: (filter, data, opt, cb) => {
                expect(filter).to.be.eql({username: 'ali'});
                expect(data).to.be.eql({password: 'newHashedPW'});
                expect(opt).to.be.eql({});
                cb('Some error', null);
            }
        };

        const mw = updateUserPasswordMW(repoMock);

        const reqMock = {
            body: {
                username: 'ali'
            }
        };
        const resMock = {
            locals: {
                newpwHashed: 'newHashedPW'
            }
        };
        mw(reqMock, resMock, () => {
            expect(resMock.locals.error).to.be.eql('Some error');
            expect(resMock.locals.success_msg).to.be.false;
            done();
        });


    });
    it('should set res.locals.success_msg to true', function (done) {
        const repoMock = {
            findOneAndUpdate: (filter, data, opt, cb) => {
                expect(filter).to.be.eql({username: 'ali'});
                expect(data).to.be.eql({password: 'newHashedPW'});
                expect(opt).to.be.eql({});
                cb(null, 'Something back');
            }
        };

        const mw = updateUserPasswordMW(repoMock);

        const reqMock = {
            body: {
                username: 'ali'
            }
        };
        const resMock = {
            locals: {
                newpwHashed: 'newHashedPW'
            }
        };
        mw(reqMock, resMock, () => {
            expect(resMock.locals.error).to.be.eql(undefined);
            expect(resMock.locals.success_msg).to.be.true;
            done();
        });
    });
    it('should call next without doing anything if there\'s an error on the chain', function (done) {
        const userRepository = {};

        const mw = updateUserPasswordMW(userRepository);

        const resMock = {
            locals: {
                error: 'Some error on the chain'
            }
        };

        mw({}, resMock, () => {
            expect(resMock.locals.error).to.be.eql('Some error on the chain');
            expect(resMock.locals.success_msg).to.be.eql(undefined);
            done();
        });
    });
});
