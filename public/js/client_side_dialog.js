const addProfileItem = document.getElementById('addProfileItem');
const openAddProfileItem = document.getElementById('openAddProfileItem');
const closeAddProfileItem = document.getElementById('closeAddProfileItem');

if (addProfileItem) {
    if (openAddProfileItem) {
        openAddProfileItem.addEventListener('click', () => {
            addProfileItem.showModal();
        })
    }
    if (closeAddProfileItem) {
        closeAddProfileItem.addEventListener('click', () => {
            addProfileItem.close();
        })
    }

    addProfileItem.addEventListener('submit', (event) => {
        const errorElem = document.getElementById('addProfileItemErrors');
        errorElem.innerHTML = '';

        const errors = [];
        tryCatchHelper(errors,
            () => checkItemName(document.getElementById('name').value));
        tryCatchHelper(errors,
            () => checkItemDesc(document.getElementById('desc').value));
        tryCatchHelper(errors,
            () => checkPrice(Number(document.getElementById('price').value), 'item price'));
        const file = document.getElementById('image').files[0];
        if (file === undefined) {
            errors.push('Error: you must supply an image in .png, .jpg, or .jpeg format.')
        } else if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
            errors.push('Error: the file supplied is the wrong type. Please supply an image in .png, .jpg, or .jpeg format.')
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

const editProfileItem = document.getElementById('editProfileItem');
const openEditProfileItem = document.getElementById('openEditProfileItem');
const closeEditProfileItem = document.getElementById('closeEditProfileItem');

if (editProfileItem) {
    if (openEditProfileItem) {
        openEditProfileItem.addEventListener('click', () => {
            editProfileItem.showModal();
        })
    }
    if (closeEditProfileItem) {
        closeEditProfileItem.addEventListener('click', () => {
            editProfileItem.close();
        })
    }

    editProfileItem.addEventListener('submit', (event) => {
        const errorElem = document.getElementById('editProfileItemErrors');
        errorElem.innerHTML = '';

        const errors = [];
        const name = document.getElementById('name').value;
        const desc = document.getElementById('desc').value;
        const price = document.getElementById('price').value;
        const file = document.getElementById('image').files[0];
        if (name.trim() === '' && desc.trim() === '' && price.trim() === '' && file === undefined) {
            errors.push('Error: you must provide at least one of the following fields to update!')
        }

        if (name.trim() !== '') {
            tryCatchHelper(errors,
                () => checkItemName(document.getElementById('name').value));
        }
        if (desc.trim() !== '') {
            tryCatchHelper(errors,
                () => checkItemDesc(document.getElementById('desc').value));
        }
        if (price.trim() !== '') {
            tryCatchHelper(errors,
                () => checkPrice(Number(document.getElementById('price').value), 'item price'));
        }
        if (file !== undefined) {
            if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
                errors.push('Error: the file supplied is the wrong type. Please supply an image in .png, .jpg, or .jpeg format.')
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

const deleteProfileItem = document.getElementById('deleteProfileItem');
const openDeleteProfileItem = document.getElementById('openDeleteProfileItem');
const closeDeleteProfileItem = document.getElementById('closeDeleteProfileItem');

if (deleteProfileItem) {
    if (openDeleteProfileItem) {
        openDeleteProfileItem.addEventListener('click', () => {
            deleteProfileItem.showModal();
        })
    }
    if (closeDeleteProfileItem) {
        closeDeleteProfileItem.addEventListener('click', () => {
            deleteProfileItem.close();
        })
    }
}

const deleteAccount = document.getElementById('deleteAccount');
const openDeleteAccount = document.getElementById('openDeleteAccount');
const closeDeleteAccount = document.getElementById('closeDeleteAccount');

if (deleteAccount) {
    if (openDeleteAccount) {
        openDeleteAccount.addEventListener('click', () => {
            deleteAccount.showModal();
        })
    }
    if (closeDeleteAccount) {
        closeDeleteAccount.addEventListener('click', () => {
            deleteAccount.close();
        })
    }
}

