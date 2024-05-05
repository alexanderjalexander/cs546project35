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


(function($) {
    $(document).ready(function() {
        let messageForm = $('#messageNewForm'),
            senderId = $('#senderId'),
            recipientId = $('#recipientId'),
            messageInput = $('#messageInput'),
            messageDetails = $('#messageDetails'); 

        messageForm.submit(function(event) {
            event.preventDefault();

            if (!messageInput.val().trim()) {
                alert("Please enter a message to send.");
                return;
            }

            let requestConfig = {
                method: 'POST',
                url: '/api/dms/send',
                contentType: 'application/json',
                data: JSON.stringify({
                    senderId: senderId.val().trim(),
                    recipientId: recipientId.val().trim(),
                    message: messageInput.val().trim()
                })
            };

            $.ajax(requestConfig).then(function(response) {
                messageDetails.html(`<p>Message sent successfully to ${response.recipientId || 'recipient'}!</p>`).show();
                messageForm[0].reset(); 
            }).catch(function(error) {
                console.error('Error sending message:', error);
                messageDetails.html('<p>Error sending message.</p>').show();
            });
        });
    });
})(jQuery);
