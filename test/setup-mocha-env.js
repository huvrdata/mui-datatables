const Enzyme = require('enzyme');
const Adapter = require('@wojtekmaj/enzyme-adapter-react-17');

/* required when running >= 17.0 */
Enzyme.configure({ adapter: new Adapter() });

function setupDom() {
  const { JSDOM } = require('jsdom');
  const Node = require('jsdom/lib/jsdom/living/node-document-position');

  const dom = new JSDOM('<!doctype html><html><body></body></html>');

  global.window = dom.window;
  global.document = window.document;
  global.Node = Node;

  Object.defineProperty(global, 'navigator', {
    value: {
      userAgent: 'node.js',
      appVersion: '',
    },
    writable: true,
    configurable: true,
  });

  function copyProps(src, target) {
    const props = Object.getOwnPropertyNames(src)
      .filter(prop => typeof target[prop] === 'undefined')
      .map(prop => Object.getOwnPropertyDescriptor(src, prop));
    Object.defineProperties(target, props);
  }

  copyProps(dom.window, global);

  const KEYS = ['HTMLElement'];
  KEYS.forEach(key => {
    global[key] = window[key];
  });

  global.document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: {
        documentElement: window.document.body,
        parent: {
          nodeName: 'BODY',
        },
      },
    },
  });

  global.requestAnimationFrame = callback => {
    setTimeout(callback, 0);
  };

  global.window.cancelAnimationFrame = () => {};
  global.getComputedStyle = global.window.getComputedStyle;
  global.HTMLInputElement = global.window.HTMLInputElement;
  global.Element = global.window.Element;
  global.Event = global.window.Event;
  global.dispatchEvent = global.window.dispatchEvent;
  global.window.getComputedStyle = () => ({});

  Object.defineProperty(global.window.URL, 'createObjectURL', { value: () => {} });
  global.Blob = () => '';
}

setupDom();
console.error = function() {};
