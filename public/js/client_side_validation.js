
document.addEventListener('DOMContentLoaded', function() {
    const formHandler = new FormHandler();
    formHandler.initialize();
});

class FormHandler {
    constructor() {
        this.loginForm = document.getElementById('signin-form');
        this.registerForm = document.getElementById('signup-form');
        this.errorContainer = document.getElementById('errorContainer');
    }

    initialize() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (event) => this.validateLoginForm(event));
        }

        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (event) => this.validateRegistrationForm(event));
        }
    }

    validateLoginForm(event) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        let errorMessages = [];

        this.addErrorIfEmpty(email, 'Email is required.', errorMessages);
        this.addErrorIfEmpty(password, 'Password is required.', errorMessages);

        this.displayErrors(errorMessages, event);
    }

    validateRegistrationForm(event) {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        let errorMessages = [];

        this.addErrorIfEmpty(username, 'Username is required.', errorMessages);
        this.addErrorIfEmpty(email, 'Email is required.', errorMessages);
        this.addErrorIfEmpty(password, 'Password is required.', errorMessages);
        if (password !== confirmPassword) {
            errorMessages.push('Passwords do not match.');
        }
        this.addErrorIfEmpty(role, 'Role selection is required.', errorMessages);

        this.displayErrors(errorMessages, event);
    }

    addErrorIfEmpty(fieldValue, errorMessage, errorList) {
        if (!fieldValue) {
            errorList.push(errorMessage);
        }
    }

    displayErrors(errorMessages, event) {
        if (errorMessages.length > 0) {
            event.preventDefault();
            this.errorContainer.innerHTML = '';
            errorMessages.forEach(error => {
                const errorDiv = document.createElement('div');
                errorDiv.textContent = error;
                errorDiv.className = 'error'; 
                this.errorContainer.appendChild(errorDiv);
            });
        }
    }
}
