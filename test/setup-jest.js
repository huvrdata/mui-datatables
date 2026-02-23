require('@testing-library/jest-dom');

if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', { value: () => '' });
}

if (typeof global.Blob === 'undefined') {
  global.Blob = function () {
    return '';
  };
}

// Suppress console.error noise in tests
console.error = function () {};
