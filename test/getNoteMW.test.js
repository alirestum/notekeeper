let expect = require('chai');
let getNoteMW = require('../middlewares/getNoteMW');

describe('getNoteMW', function () {
    it('should set res.locals.note with a befott object from db', function () {
        const mw = getNoteMW({
           Note:{

           }
        });
    });
});