(function() {
    class FormHandler {
        constructor() {
            this.loginForm = document.getElementById('signin-form');
            this.registerForm = document.getElementById('signup-form');
            this.errorContainer = document.getElementById('errorContainer');
            this.newTradeForm = document.getElementById('new-trade-form');
            this.newReviewForm = document.getElementById('new-review-form');
            this.editTradeForm = document.getElementById('edit-trade-form');
        }
    
        initialize() {
            if (this.loginForm) {
                this.loginForm.addEventListener('submit', (event) => this.validateLoginForm(event));
            }
            if (this.registerForm) {
                this.registerForm.addEventListener('submit', (event) => this.validateRegistrationForm(event));
            }
            if (this.newTradeForm){
                this.newTradeForm.addEventListener('submit', (event) => this.validateTradeForm(event));
            }
            if (this.editTradeForm){
                this.editTradeForm.addEventListener('submit', (event) => this.validateTradeForm(event));
            }
            if (this.newReviewForm){
                this.newReviewForm.addEventListener('submit', (event) => this.validateReviewForm(event))
            }
        }

        validateReviewForm(event){
            let comment = document.getElementById('commentInput').value;
            let rating = document.getElementById('ratingInput').value;
            let errorMessages = [];
    
            this.addErrorIfEmpty(comment, 'comment is required.', errorMessages);
            this.addErrorIfEmpty(rating, 'rating is required.', errorMessages);
            rating = Number.parseFloat(rating);
            if (rating){
                rating = tryCatchHelper(errorMessages, () => {
                    return checkRating(rating);
                })
            }
            if (comment){
                comment = tryCatchHelper(errorMessages, () => {
                    return checkComment(comment);
                })  
            }
            this.displayErrors(errorMessages, event);
        }
    
        validateLoginForm(event) {
            let email = document.getElementById('email').value;
            let password = document.getElementById('password').value;
            let errorMessages = [];
    
            this.addErrorIfEmpty(email, 'Email is required.', errorMessages);
            this.addErrorIfEmpty(password, 'Password is required.', errorMessages);
            if (email) {
                email = tryCatchHelper(errorMessages, () => {
                    return checkEmail(email);
                })
            }
            if (password){
                password = tryCatchHelper(errorMessages, () =>{
                    return checkPassword(password)
                })
            }
               
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
            if (username.length < 5) {
                errorMessages.push('Username must be at least 5 characters long.');
            }
            if (password.length < 8) {
                errorMessages.push('Password must be at least 8 characters long.');
            }
            if (!password.match(/[\!\@\#\$\%\^\&\*]/)) {
                errorMessages.push('Password must include at least one special character (!, @, #, $, %, ^, &, *).');
            }
            if (password !== confirmPassword) {
                errorMessages.push('Passwords do not match.');
            }

    
            this.displayErrors(errorMessages, event);
        }

        validateTradeForm(event) {
            const otherUserItems = document.getElementsByName("otherUserItems");
            const thisUserItems = document.getElementsByName("thisUserItems");
            //look through the .checked value of each thing in the nodelist
            let errorMessages = [];
            let thisItems = [];
            let otherItems = [];
            otherUserItems.forEach( (element) =>{
                if (element.checked){
                    otherItems.push(element.value);
                }
            })
            thisUserItems.forEach( (element) =>{
                if (element.checked){
                    thisItems.push(element.value);
                }
            })
            if (thisItems.length == 0 || otherItems.length == 0){
                errorMessages.push("must select at least 1 item from each user")
            }

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

    document.addEventListener('DOMContentLoaded', function() {
        const formHandler = new FormHandler();
        formHandler.initialize();
    });
})();
