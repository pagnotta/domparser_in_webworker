// create DOMParser variable from xmldom
var DOMParser = require('xmldom').DOMParser;

// necessary to create a standalone browserify version
module.exports = {
    DOMParser: DOMParser
}