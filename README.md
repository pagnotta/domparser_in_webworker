# How to replace DOMParser in a webworker
## Preface - The Problem
Trying to parse something (e.g. a XML-String) in a webworker, one quickly realizes that [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) is not available, since `window` is missing. I needed an equivalent output to `window.DOMParser` in my webworker tool chain. Therefore I could not use some custom parsing library which would produce some custom object unusable in the further chain.

After some research I came across [xmldom](https://github.com/jindw/xmldom). It promises a W3C standard compatible API and output. But sadly it is a node module and can not simply be used, since `require()` is not available in a browser/webworker.

Enter [browserify](http://browserify.org/). It allows to turn the node module into code that would run in a client browser. This is a little documentation for myself on how to get xmldom running in webworker.

## How to get xmldom running in a webworker (example)
### Install basic components with npm

Create a project folder and inside

* `npm init`
    * creates a `package.json` file
* `npm install --save-dev browserify`
    * the tool needed to make the xmldom node-module run in a webworker
* `npm install --save-dev xmldom`
    * Yes, [xmldom](https://www.npmjs.com/package/xmldom) can simply be installed using npm, browserify is able to fetch it later on from `node_modules`. This library will replace the missing DOMParser.

### Create a basic webpage

Create a basic webpage including your webworker. I chose...

* `index.html`
    * `app.js` is being included here
* `app.js`
    * here the worker is created
* `worker.js`
    * contains the code to be executed in the webworker
    * loads the "_browserified_" version of `domparser.js`
* `domparser.js`
    * here we `require()` the `xmldom` library
    * this file will be "_browserified_" later on

In `worker.js` the (not yet existent) "_browserified_" version of `domparser.js` is imported. For testing if the DOMParser works, I use the example code from the [xmldom GitHub page](https://github.com/jindw/xmldom#example) inside the webworker event listener:

```javascript
// import the bundled xmldom.DOMParser
importScripts('./build/domparser_bundle.js');

var DOMParser = xmldom.DOMParser;

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
```

Inside `domparser.js` the `xmldom` library which was installed with npm is `require()`ed. It is necessary to export the `DOMParser` variable, because otherwise browserify can not produce a standalone version of the file:

```javascript
// create DOMParser variable from xmldom
var DOMParser = require('xmldom').DOMParser;

// necessary to create a standalone browserify version
module.exports = {
    DOMParser: DOMParser
}

```

I ignore the fact that this code would not run in a browser/webworker because it contains a `require()`. Browserify will transform it later into standalone code that runs in the webworker.

### Setup browserify

Next Browserify needs to be configured to transform the `domparser.js` code, by adding the following to `package.json`:

```json
{
  ...

  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "browserify domparser.js --s xmldom > ./build/domparser_bundle.js"
  },

  ...
}
```

The parameter `--s` is for [--standalone](https://github.com/browserify/browserify#usage). The `xmldom` parameter is the name of the variable under which the exported `DOMParser` variable will be available (as `xmldom.DOMParser`).

Then running

`npm run build`

will execute browserify an let it do it's magic :)

Voilà! There is the `./build/domparser_bundle.js` file which we import into the webworker using `importScript()`. Browserify has pulled all the necessary code from the `xmldom` library into `./build/domparser_bundle.js`. This code can now be used to replace the missing `window.DOMParser` inside the webworker. Mission accomplished.

### Run the example

Finally, to see that it works:

* run a local server
    * e.g. `python -m http.server 8082`
* open `index.html` in browser and see the console output
    * e.g. `http://localhost:8082/`



## How to run the example from scratch
* git clone
* enter root folder
* `npm install`
* `npm run build`
* run a local server
    * e.g. `python -m http.server 8082`
* open `index.html` in browser and see the console output
    * e.g. `http://localhost:8082/`

## Docu
### Browserify
* http://browserify.org/
* https://www.youtube.com/watch?v=CTAa8IcQh1U
* https://www.youtube.com/watch?v=X5FGk2G5KO0

### xmldom
* https://github.com/jindw/xmldom

### Webworker
* https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
* https://www.html5rocks.com/de/tutorials/workers/basics/ (German)
