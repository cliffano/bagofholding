Bag Of Holding [![Build Status](https://secure.travis-ci.org/cliffano/bagofholding.png?branch=master)](http://travis-ci.org/cliffano/bagofholding) [![Dependencies Status](https://david-dm.org/cliffano/bagofholding.png)](http://david-dm.org/cliffano/bagofholding)
--------------

An uncursed bag of various Node.js utility functions.

This is an extract of the reusable parts of various Node.js modules I've written.

Mostly for internal use.

Installation
------------

    npm install bagofholding

or as a dependency in package.json file:

    "dependencies": {
      "bagofholding": "x.y.z"
    }

Usage
-----

    var bag = require('bagofholding');
    bag.cli.*;
    bag.http.*;
    bag.obj.*;
    bag.text.*;

Check out [lib](https://github.com/cliffano/bagofholding/tree/master/lib) for the available methods of each component.
