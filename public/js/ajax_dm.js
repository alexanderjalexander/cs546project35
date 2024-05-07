(function($) {
    $(document).ready(function() {
        let messageForm = $('#messageNewForm'),
            senderId = $('#senderId'),
            recipientId = $('#recipientId'),
            messageInput = $('#messageInput'),
            messageDetails = $('#messageDetails'),
            dmList = $('#dmList'),
            noDmsMessage = $('#noDmsMessage');

        messageForm.submit(function(event) {
            event.preventDefault();
            messageDetails.html(`<p></p>`);

            if (!messageInput.val().trim()) {
                alert("Please enter a message to send.");
                return;
            }

            let requestConfig = {
                method: 'POST',
                url: '/directmsgs',
                contentType: 'application/json',
                data: JSON.stringify({
                    senderId: senderId.val().trim(),
                    recipientId: recipientId.val().trim(),
                    message: messageInput.val().trim()
                })
            };

            $.ajax(requestConfig).then(function(response) {
                messageDetails.html(`<p>Message sent successfully to ${response.recipientId || 'recipient'}!</p>`);
                if (noDmsMessage) {
                    noDmsMessage.remove();
                }
                if (response.created) {
                    dmList.append(`<li><a href='/directmsgs/${response.data._id}'>${recipientId.val().trim()}</a></li>`);
                }
                messageForm[0].reset(); 
            }).catch(function(error) {
                console.error('Error sending message:', error.responseJSON);
                messageDetails.html(`<p>Error sending message: ${error.responseJSON.error}</p>`);
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
            url: `/directmsgs/${dmId}`,
            contentType: 'application/json',
            data: JSON.stringify({
                senderId, 
                dmId,
                message: messageText
            }),
            success: function(response) {
                $('#dm').html('');
                for (let message of response.data.messages) {
                    $('#dm').append(`
                    <li class="message">
                        <div>
                            <p id="sender">${message.sender}</p>
                            <p id="content">${message.content}</p>
                            <p id="timestamp">${message.timestamp}</p>
                        </div>
                    </li>
                `);
                }
                messageInput.val(''); 
            },
            error: function() {
                alert('Failed to send message.');
            }
        });
    });
});