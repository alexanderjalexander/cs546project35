const wishlistArray = document.getElementById('wishlistArray');
const addWishlistItem = document.getElementById('addWishlistItem');
const removeWishlistItem = document.getElementById('removeWishlistItem');
const accountUpdateForm = document.getElementById('accountUpdateForm');

if (accountUpdateForm) {
    if (wishlistArray) {
        if (addWishlistItem) {
            addWishlistItem.addEventListener('click', () => {
                const wishlistInput = document.createElement('input', {
                    id: 'wishlist',
                    type: 'text',
                    name: 'wishlist',
                })
                const lineBreak = document.createElement('br');
                wishlistArray.appendChild(wishlistInput);
                wishlistArray.appendChild(lineBreak);
            })
        }

        if (removeWishlistItem) {
            removeWishlistItem.addEventListener('click', () => {
                wishlistArray.removeChild(wishlistArray.lastChild);
                wishlistArray.removeChild(wishlistArray.lastChild);
            })
        }
    }

    accountUpdateForm.addEventListener('submit', (event) => {
        const errors = [];
        const errorElem = document.getElementById('accountSettingsErrors');
        errorElem.innerHTML = '';

        let username = document.getElementById('username').value;
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;
        let newPassword = document.getElementById('newPassword').value;
        let newPasswordConfirm = document.getElementById('newPasswordConfirm').value;
        let wishlist = document.getElementById('wishlist');

        if (password.trim() === '') {
            errors.push('Error: you must supply your current password for verification');
        } else {
            password = tryCatchHelper(errors, () => checkPassword(password));
        }

        if (username.trim() === '' && email.trim() === '' && newPassword.trim() === ''
            && (wishlist === undefined
                || (typeof wishlist === 'string' && wishlist.trim().length === 0)
                || (Array.isArray(wishlist) && wishlist.length === 0))) {
            errors.push('Error: you must provide either a new username, new email, new password, or an updated wishlist.');
        }

        if (username.trim().length !== 0) {
            username = tryCatchHelper(errors, () => checkUsername(username))
        }

        if (email.trim().length !== 0) {
            email = tryCatchHelper(errors, () => checkEmail(email))
        }

        if (newPassword.trim().length !== 0) {
            newPassword = tryCatchHelper(errors, () => checkPassword(newPassword))
            if (newPassword !== newPasswordConfirm.trim()) {
                errors.push('Error: new passwords do not match.')
            }
        }

        if (errors.length !== 0) {
            event.preventDefault();
            for (let error of errors) {
                const errorLi = document.createElement('li');
                errorLi.textContent = error;
                errorElem.appendChild(errorLi);
            }
        }

    })
}

