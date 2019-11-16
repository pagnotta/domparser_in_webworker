// import the bundled xmldom.DOMParser
importScripts('./build/domparser_bundle.js');

// add event listener to webworker
self.addEventListener('message', function(e) {
    // example taken from https://github.com/jindw/xmldom
    var doc = new DOMParser().parseFromString(e.data,'text/xml');
    doc.documentElement.setAttribute('x','y');
    doc.documentElement.setAttributeNS('./lite','c:x','y2');
    var nsAttr = doc.documentElement.getAttributeNS('./lite','x');
    console.info(nsAttr);
    console.info(doc);
    self.postMessage(doc);
  }, false);