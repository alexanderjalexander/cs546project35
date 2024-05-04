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