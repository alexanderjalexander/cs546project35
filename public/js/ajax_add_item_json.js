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
    // Validation Function Declarations
    function tryCatchHelper (errors, fn) {
        try {
            return fn();
        } catch(e) {
            errors.push(e);
        }
    }

    function checkString(str, name) {
        if (typeof str !== 'string') throw `${name} must be a string`;
        if (str.trim().length === 0)
            throw `${name} cannot be an empty string or just spaces`;
        str = str.trim();
        return str;
    }

    function checkPrice(price, varName) {
        if (price === null || price === undefined) {
            throw `Error: Provided arg ${varName} doesn't exist`;
        }
        if (typeof price !== 'number') {
            throw `Error: Provided arg ${varName} is not a number. Must be a number >= 0.`;
        }
        if (price <= 0) throw `Error: Provided arg ${varName} must be > 0.`
        if (calcDecimalPlaces(price) > 2) {
            throw `Error: Provided arg ${varName} must be a price with <= 2 decimal places.`
        }
        return price;
    }

    function calcDecimalPlaces(num) {
        if (Math.floor(num) !== num || !Number.isInteger(num)) {
            let splitnum = num.toString().split('.');
            return splitnum[1].length;
        } else {
            return 0;
        }
    }

    // Reference to form element and where things will go
    let addItemJsonForm = $('#addProfileItemJson'),
        addProfileItemJsonErrors = $('#addProfileItemJsonErrors'),
        openItemJsonForm = $('#openAddProfileItemJson'),
        closeItemJsonForm = $('#closeAddProfileItemJson'),
        noItemsText = $('#noItemsText'),
        communityItems = $('#communityItemsList');

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
            () => checkString(nameJson.val(), 'name'));
        let desc = tryCatchHelper(errors,
            () => checkString(descJson.val(), 'description'));
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