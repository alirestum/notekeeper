const chai = require('chai');
const getNoteMW = require('../middlewares/getNoteMW');
const sinon = require('sinon');
const mongoose = require('mongoose');
const expect = chai.expect;
const afterEach = require('mocha').afterEach;
const it = require('mocha').it;


describe('getNoteMW', function () {

    afterEach('Should reset mongoose findOne to the default value', () => { mongoose.Model.findOne.restore(); });


    it('should set res.locals.note with a note object from db', function (done) {

        //Custom mock func for model.findOne
        let mockFindOneGetNoteMW = {
            where: function (arg) {
                expect(arg).to.be.eql('noteId');
                return this;
            },
            equals: function (arg) {
                expect(arg).to.be.eql(13);
                return this;
            },
            populate: function (arg) {
                expect(arg).to.be.eql('attachments');
                return this;
            },
            then: function (cb) {
                cb('note', null);
            }
        };

        //Swap Model's findOne func with our mock func
        sinon.stub(mongoose.Model, 'findOne').returns(mockFindOneGetNoteMW);

        const mw = getNoteMW(mongoose.Model);

        const resMock = {
            locals: {}
        };

        const reqMock = {
            params: {
                noteId: 13
            }
        }

        mw(reqMock, resMock,
            (err) => {
                expect(err).to.be.eql(undefined);
                expect(resMock.locals).to.be.eql({note: 'note'});
                done();
            });
    });
    it('should call next with error, when there is a db error', function (done) {

        //Replace then func so it returns an error
        let mockFindOneGetNoteMW = {
            where: function (arg) {
                expect(arg).to.be.eql('noteId');
                return this;
            },
            equals: function (arg) {
                expect(arg).to.be.eql(13);
                return this;
            },
            populate: function (arg) {
                expect(arg).to.be.eql('attachments');
                return this;
            },
            then: function (cb) {
                cb(null, 'database error');
            }
        };

        sinon.stub(mongoose.Model, 'findOne').returns(mockFindOneGetNoteMW);

        const mw = getNoteMW(mongoose.Model);

        const resMock = {
            locals: {}
        };

        const reqMock = {
            params: {
                noteId: 13
            }
        }

        mw(reqMock, resMock,
            (err) => {
                expect(resMock.locals.note).to.be.eql(undefined);
                expect(err).to.be.eql('database error');
                done();
            }
        );
    });
});