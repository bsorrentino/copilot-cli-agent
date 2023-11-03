'use strict';

const termkit = require('..');
const assert = require('assert').strict;

assert.strictEqual(termkit(), 'Hello from termkit');
console.info('termkit tests passed');
