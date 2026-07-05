// jsdom does not implement `innerText` (only `textContent`). Polyfill it so
// code written for real browsers behaves the same way under test.
// https://github.com/jsdom/jsdom/issues/1245
if (typeof Element !== 'undefined' && !('innerText' in Element.prototype)) {
  Object.defineProperty(Element.prototype, 'innerText', {
    get() {
      return this.textContent;
    },
    set(value) {
      this.textContent = value;
    },
    configurable: true,
  });
}
