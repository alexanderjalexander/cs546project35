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