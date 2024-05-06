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
                url: '/directmsgs/send',
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


$(document).ready(function() {
    $('#messageBox').submit(function(event) {
        event.preventDefault();
        var messageInput = $('#messageInput');
        var messageText = messageInput.val().trim();
        var dmId = $('#dmId').val();
        var senderId=$("#senderId").val();

        if (!messageText) {
            alert("Please enter a message to send.");
            return;
        }

        $.ajax({
            method: 'POST',
            url: '/directmsgs/send',
            contentType: 'application/json',
            data: JSON.stringify({
                senderId, 
                dmId,
                message: messageText
            }),
            success: function(response) {
                $('#dm').append(`
                    <li>
                        <div>
                            <label id="sender">You</label>
                            <p id="content">${messageText}</p>
                            <p id="timestamp">${new Date().toLocaleString()}</p>
                        </div>
                    </li>
                `);
                messageInput.val(''); // Clear the input after sending
            },
            error: function() {
                alert('Failed to send message.');
            }
        });
    });
});

/* (function($) {
    $(document).ready(function() {
        let messageForm = $('#messageBox'),
            messageInput = $('#messageInput'),
            messageList = $('#dm'); 
            senderId = $('#senderId').val(), 
            recipientId = $('#recipientId').val(); 

        messageForm.submit(function(event) {
            event.preventDefault();

            let messageText = messageInput.val().trim();
            if (!messageText) {
                alert("Please enter a message to send.");
                return;
            }

            let requestConfig = {
                method: 'POST',
                url: '/api/dms/send', // Make sure this matches your API endpoint
                contentType: 'application/json',
                data: JSON.stringify({
                    senderId: senderId,
                    recipientId: recipientId,
                    message: messageText
                })
            };

            $.ajax(requestConfig).then(function(response) {
                let newMessageHtml = `<li>
                    <div>
                        <label id="sender">${'You'}</label>
                        <p id="content">${messageText}</p>
                        <p id="timestamp">${new Date().toLocaleString()}</p>
                    </div>
                </li>`;
                messageList.append(newMessageHtml);

                messageInput.val('');
            }).catch(function(error) {
                console.error('Error sending message:', error);
                alert('Failed to send message.');
            });
        });
    });
})(jQuery);

 */