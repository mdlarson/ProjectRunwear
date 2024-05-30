// jest.setup.js
require('./polyfill'); // Ensure this is required before jsdom

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Read the HTML file from the templates folder
const htmlFilePath = path.resolve(__dirname, './templates/runwear.html');
const html = fs.readFileSync(htmlFilePath, 'utf8');

// Create a JSDOM instance with the HTML
const dom = new JSDOM(html);

// Set the global window and document objects to the ones from JSDOM
global.window = dom.window;
global.document = dom.window.document;
