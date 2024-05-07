// Code solution to extend JQuery not showing modals
// Found on: https://stackoverflow.com/a/51452557

jQuery.fn.extend({showModal: function() {
    return this.each(function() {
        if(this.tagName=== "DIALOG"){
            this.showModal();
        }
    });
}});

// Same as above, modified to support close for dialogs as well
jQuery.fn.extend({close: function() {
    return this.each(function() {
        if(this.tagName=== "DIALOG"){
            this.close();
        }
    });
}});

(function ($) {
    // Reference to form element and where things will go
    let addItemJsonForm = $('#addProfileItemJson'),
        addProfileItemJsonErrors = $('#addProfileItemJsonErrors'),
        openItemJsonForm = $('#openAddProfileItemJson'),
        closeItemJsonForm = $('#closeAddProfileItemJson');

    // Form Items
    let nameJson = $('#nameJson'),
        descJson = $('#descJson'),
        priceJson = $('#priceJson'),
        imageJson = $('#imageJson');

    openItemJsonForm.click(function () {
        addItemJsonForm.showModal();
    })

    closeItemJsonForm.click(function () {
        addItemJsonForm.close();
    })

    addItemJsonForm.submit(function (event) {
        event.preventDefault();
        addProfileItemJsonErrors.empty();

        // Input checking. If fields are missing or empty, finish and return.
        const errors = []
        let name = tryCatchHelper(errors,
            () => checkItemName(nameJson.val()));
        let desc = tryCatchHelper(errors,
            () => checkItemDesc(descJson.val()));
        let price = tryCatchHelper(errors,
            () => checkPrice(Number(priceJson.val()), 'price'));
        let image = imageJson.prop('files');
        if (image[0] === undefined) {
            errors.push('Error: You must provide an image, either a .png, .jpeg, or a .jpg.')
        }

        if (errors.length !== 0) {
            for (let error of errors) {
                addProfileItemJsonErrors.append(`<li>${error}</li>`);
            }
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('desc', desc);
        formData.append('price', price);
        formData.append('image', image[0]);

        let requestConfig = {
            method: 'POST',
            type: 'POST',
            processData: false,
            contentType: false,
            url: '/items',
            data: formData,
        };

        $.ajax(requestConfig).then(function () {
            addItemJsonForm.close();
            alert('Success! Item added to the community.')
        }).catch(function (response) {
            if (!response.responseJSON.success) {
                for (let error of response.responseJSON.errors) {
                    addProfileItemJsonErrors.append(`<li>${error}</li>`);
                }
            }
        });
    })
})(window.jQuery)