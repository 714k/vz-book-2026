const form = document.getElementById('formMessage');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const reason = document.getElementById('reason');
const messageField = document.getElementById('messageField');
const policy = document.getElementById('policy');

const submit = document.getElementById('submit');
const formMessage = document.getElementById('formMessage');
const requiredFields = document.querySelectorAll('.required');

requiredFields.forEach((requiredField) => {
  requiredField.addEventListener('blur', handleBlur);
});

requiredFields.forEach((requiredField) => {
  requiredField.addEventListener('keyup', handleKeyUp);
});

form.addEventListener('submit', validateForm);
// formMessage.addEventListener('submit', validateForm);


function handleBlur(event) {
  event.preventDefault();

  validateNotNull(event);
  
  if(event.target.type === 'select-one') {
    validateSelect(event);
  }

  if(event.target.type === 'email') {
    validateNotNull(event);
  }
  
  if(event.target.type === 'checkbox') {
    validateCheckbox(event);
  }
}

function validateNotNull(event) {
  if(!event.target.value) {
    showError(event, event.target, 'can not be empty');
  } else {
    event.target.addEventListener('keyup', handleKeyUp);
  }
}

function validateSelect(event) {
  console.log('option');
  if(event.target.value.trim() === '') {
    showError(event, event.target, 'is required');
  } else {
    hideError(event, event.target);
  }
}

function validateEmailOnKeyUp(event) {
  const validEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  
  if(event.target.type === 'email' && !event.target.value.match(validEmail)) {
    showError(event, event.target, 'is not valid');
  } else {
    hideError(event, event.target);
  }
}

function validateCheckbox(event) {
  if(!event.target.checked) {
    showError(event, event.target, 'Privacy policies must be checked');
  } else {
    hideError(event, event.target);
  }
}

function handleKeyUp(event) {
  const value = event.target.value.replace(/s/g, null);

  if(value.length < Number(event.target.attributes?.minLength?.value)) {
    showError(event, event.target, `must have at least ${Number(event.target.attributes.minLength.value)} chars`);
    return;
  } else {
    hideError(event, event.target);
  }

  validateEmailOnKeyUp(event);
}

function showError(event, target, message) {
  let errorContainer;
  // console.log('event show Error', event);
  // console.log('event show Error attrs', Number(target.attributes.minLength.value));
  // console.log('event show Error labels', target.labels[0].innerText);
  // console.log('event show Error', target.nextElementSibling);
  if(target.type === 'checkbox') {
    errorContainer = event.target.labels[0].nextElementSibling;
    errorContainer.innerText = `${message}`;
  } else {
    errorContainer = event.target.nextElementSibling;
    errorContainer.innerText = `${target.labels[0].innerText.replace('*:', '')} ${message}`;
  }

  event.target.classList.add('invalid');

  errorContainer.classList.add("visible");
  errorContainer.setAttribute("aria-hidden", false);
  errorContainer.setAttribute("aria-invalid", true);
  target.classList.add("invalid");
}

function hideError(event, target) {
  let errorContainer;

  if(target.type === 'checkbox') {
    errorContainer = event.target.labels[0].nextElementSibling;
  } else {
    errorContainer = event.target.nextElementSibling;
  }

  errorContainer.classList.remove("visible");
  errorContainer.setAttribute("aria-hidden", true);
  errorContainer.setAttribute("aria-invalid", false);
  target.classList.remove("invalid");
}

function handleChange(event) {
  console.log('handle', event.target.value)
  if(event.target.value === 'reason') {
    showError(event, event.target, 'Please select a reason');
  } else {
    hideError(event, event.target);
  }
}

function validateForm(event) {
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();
  const emailValue = email.value.trim();
  const reasonValue = reason.value.trim();
  const messageFieldValue = messageField.value.trim();
  const policyValue = policy.value.trim();

  // if (!this.checkValidity() ) {
  //   event.preventDefault();
  // }

  validateNotNull(event);

  return false;

  debugger;
  // requiredFields.forEach((requiredField) => {
  //   requiredField.addEventListener('blur', validateField);
  // });
}