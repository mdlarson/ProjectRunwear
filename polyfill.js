// polyfill.js
const { TextEncoder, TextDecoder } = require('util');

// Global assignment of TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
