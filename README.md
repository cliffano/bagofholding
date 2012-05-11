Bag Of Holding [![http://travis-ci.org/cliffano/bagofholding](https://secure.travis-ci.org/cliffano/bagofholding.png?branch=master)](http://travis-ci.org/cliffano/bagofholding)
-----------

Bag Of Holding is an uncursed bag of various Node.js utility functions.

It contains common functions used in various cliffano/* modules.

Installation
------------

    npm install bagofholding

or specify it as a dependency in package.json file:

    "dependencies": {
      "bagofholding": "x.y.z"
    }

Usage
-----

    var bag = require('bagofholding');
    bag.cli.*; // command-line tools utilities
    bag.mock.*; // mock IO-related Node.js API
    bag.obj.*; // object manipulation utilities
    bag.text.*; // string manipulation utilities

Check out the source code for a list of functions available for use.