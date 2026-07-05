
const form = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');
const requiredFields = document.querySelectorAll('.required');

submitBtn.addEventListener('click', (event) => {
  validateInputs(event);
});

function validateInputs(event) {
  const reason = document.getElementById('reason');
  let isValidForm;

  requiredFields.forEach((requiredField) => {

    if(requiredField.type !== 'checkbox') {
      validateNotNull(requiredField);
      requiredField.addEventListener('keyup', handleKeyUp);
    }

    if(requiredField.type === 'checkbox') {
      validateCheckbox(requiredField);
      requiredField.addEventListener('change', handleChange);
    }
  });

  reason.addEventListener('change', validateSelect);

  isValidForm = checkFormValid();

  if(isValidForm === true) {
    form.submit();
  } else {
    event.preventDefault();
  }
}

function checkFormValid() {
  let isValid = true;

  requiredFields.forEach((requiredField) => {
    if(requiredField.classList.contains('invalid')) {
      isValid = false;
    }
  });

  return isValid;
} 

function validateNotNull(element) {
  if(!element.value) {
    setError(element, 'can not be empty');
  } else {
    setSuccess(element);
  }
}

function handleKeyUp(event) {
  const element = event.target;

  if(element.value.length < Number(element.attributes?.minLength?.value)) {
    setError(element, `must have at least ${Number(element.attributes.minLength.value)} chars`);
    return;
  } else {
    setSuccess(element);
  }

  validateEmailOnKeyUp(element);
}

function handleChange(event) {
  const element = event.target;

  // checkbox
  if(!element.checked) {
    setError(element, 'Privacy policies must be checked');
  } else {
    setSuccess(element);
  }
}

function validateEmailOnKeyUp(element) {
  const validEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  
  if(element.type === 'email' && !element.value.match(validEmail)) {
    setError(element, 'is not valid');
  } else {
    setSuccess(element);
  }
}

function validateSelect(event) {
  const element = event.target;

  if(element.value.trim() === '') {
    setError(element, 'is required');
  } else {
    setSuccess(element);
  }
}

function validateCheckbox(element) {
  if(!element.checked) {
    setError(element, 'Privacy policies must be checked');
  } else {
    setSuccess(element);
  }
}

function setError(element, message) {
  let errorContainer = element.nextElementSibling;

  if(element.type === 'checkbox') {
    errorContainer = element.labels[0].nextElementSibling;
    errorContainer.innerText = `${message}`;
  } else {
    errorContainer.innerText = `${element.labels[0].innerText.replace('*:', '')} ${message}`;
  }

  errorContainer.classList.add("visible");
  errorContainer.setAttribute("aria-hidden", false);
  errorContainer.setAttribute("aria-invalid", true);
  element.classList.add("invalid");
  element.focus();
}

function setSuccess(element) {
  let errorContainer;

  if(element.type === 'checkbox') {
    errorContainer = element.labels[0].nextElementSibling;
  } else {
    errorContainer = element.nextElementSibling;
  }

  errorContainer.classList.remove("visible");
  errorContainer.setAttribute("aria-hidden", true);
  errorContainer.setAttribute("aria-invalid", false);
  element.classList.remove("invalid");
}