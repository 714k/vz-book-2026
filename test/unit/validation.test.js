import { beforeEach, describe, expect, it } from 'vitest';
import {
  setError,
  setSuccess,
  validateEmailOnKeyUp,
  validateNotNull,
} from '../../src/scripts/validation.js';

function buildField({ type = 'text', labelText = 'Field*:' } = {}) {
  document.body.innerHTML = `
    <label for="field">${labelText}</label>
    <input id="field" type="${type}" class="required" />
    <span class="error"></span>
  `;
  return document.getElementById('field');
}

describe('validateNotNull', () => {
  it('marks an empty field as invalid', () => {
    const field = buildField();

    validateNotNull(field);

    expect(field.classList.contains('invalid')).toBe(true);
  });

  it('marks a filled field as valid', () => {
    const field = buildField();
    field.value = 'something';

    validateNotNull(field);

    expect(field.classList.contains('invalid')).toBe(false);
  });
});

describe('validateEmailOnKeyUp', () => {
  it.each(['person@example.com', 'first.last@sub.example.co', 'person@example.technology'])(
    'accepts %s, including TLDs longer than 4 chars',
    (value) => {
      const field = buildField({ type: 'email' });
      field.value = value;

      validateEmailOnKeyUp(field);

      expect(field.classList.contains('invalid')).toBe(false);
    },
  );

  it.each(['not-an-email', 'missing@tld', '@no-local-part.com'])('rejects %s', (value) => {
    const field = buildField({ type: 'email' });
    field.value = value;

    validateEmailOnKeyUp(field);

    expect(field.classList.contains('invalid')).toBe(true);
  });
});

describe('setError / setSuccess', () => {
  let field;

  beforeEach(() => {
    field = buildField();
  });

  it('shows an accessible error message', () => {
    setError(field, 'is required');

    const errorContainer = field.nextElementSibling;
    expect(errorContainer.classList.contains('visible')).toBe(true);
    expect(errorContainer.getAttribute('aria-hidden')).toBe('false');
    expect(errorContainer.getAttribute('aria-invalid')).toBe('true');
    expect(errorContainer.innerText).toContain('is required');
  });

  it('clears the error state on success', () => {
    setError(field, 'is required');

    setSuccess(field);

    const errorContainer = field.nextElementSibling;
    expect(field.classList.contains('invalid')).toBe(false);
    expect(errorContainer.classList.contains('visible')).toBe(false);
    expect(errorContainer.getAttribute('aria-hidden')).toBe('true');
    expect(errorContainer.getAttribute('aria-invalid')).toBe('false');
  });
});
