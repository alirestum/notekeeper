const chai = require('chai');
const getUserByUserNameMW = require('../middlewares/getUserByUsernameMW');
const sinon = require('sinon');
const mongoose = require('mongoose');
const expect = chai.expect;
const afterEach = require('mocha').afterEach;
const before = require('mocha').before;
const it = require('mocha').it;

describe('getUserByUserNameMW', function () {

    afterEach('Should reset mongoose findOne to the default value', () => {
        mongoose.Model.findOne.restore();
    });

    it('should should set res.locals.error to some error when username can\'t be found', function (done) {
        let mockFindOne = {
            where: function (arg) {
                expect(arg).to.be.eql('username');
                return this;
            },
            equals: function (arg) {
                expect(arg).to.be.eql('ali');
                return this;
            },
            then: function (cb) {
                cb(null, 'Some db error!');
            }
        };

        sinon.stub(mongoose.Model, 'findOne').returns(mockFindOne);

        const mw = getUserByUserNameMW(mongoose.Model);
        const reqMock = {
            body: {
                username: 'ali'
            }
        };
        const resMock = {
          locals: {}
        };

        mw(reqMock, resMock, () =>{
           expect(resMock.locals.error).to.be.eql('No user with that username!');
            expect(resMock.locals.user).to.be.eql(undefined);
            done();
        });
    });
    it('should set res.locals.error to some error when no user is found in the db', function (done) {
        let mockFindOne = {
            where: function (arg) {
                expect(arg).to.be.eql('username');
                return this;
            },
            equals: function (arg) {
                expect(arg).to.be.eql('ali');
                return this;
            },
            then: function (cb) {
                cb(null, null);
            }
        };

        sinon.stub(mongoose.Model, 'findOne').returns(mockFindOne);

        const mw = getUserByUserNameMW(mongoose.Model);
        const reqMock = {
            body: {
                username: 'ali'
            }
        };
        const resMock = {
            locals: {}
        };

        mw(reqMock, resMock, () =>{
            expect(resMock.locals.error).to.be.eql('No user with that username!');
            expect(resMock.locals.user).to.be.eql(undefined);
            done();
        });
    });
    it('should should set res.locals.user to a user object', function (done) {
        let mockFindOne = {
            where: function (arg) {
                expect(arg).to.be.eql('username');
                return this;
            },
            equals: function (arg) {
                expect(arg).to.be.eql('ali');
                return this;
            },
            then: function (cb) {
                cb({name: 'TestUser', email: 'a@b.c'}, null);
            }
        };

        sinon.stub(mongoose.Model, 'findOne').returns(mockFindOne);

        const mw = getUserByUserNameMW(mongoose.Model);
        const reqMock = {
            body: {
                username: 'ali'
            }
        };
        const resMock = {
            locals: {}
        };

        mw(reqMock, resMock, () =>{
            expect(resMock.locals.error).to.be.eql(undefined);
            expect(resMock.locals.user).to.be.eql({name: 'TestUser', email: 'a@b.c'});
            done();
        });
    });

});