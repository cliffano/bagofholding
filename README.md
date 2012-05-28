Overview [![http://travis-ci.org/cliffano/bagofholding](https://secure.travis-ci.org/cliffano/bagofholding.png?branch=master)](http://travis-ci.org/cliffano/bagofholding)
--------

Bag Of Holding is an uncursed bag of various Node.js utility functions.

This is an extract of the reusable parts from various Node.js modules I've written. It contains convenient utilities for command-line tools, unit test mock functions, and data manipulation.

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
    bag.mock.*;
    bag.obj.*;
    bag.text.*;

Check out the source code for a list of functions available for use.
