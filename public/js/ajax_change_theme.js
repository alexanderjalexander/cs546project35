(function ($) {
    // Reference to form element and where things will go
    let changeThemeButton = $('#changeTheme');
    let websiteBody = $('#websiteBody');

    changeThemeButton.click(function (event) {
        event.preventDefault();
        let currentTheme = changeThemeButton.val();

        let requestConfig = {
            method: 'POST',
            type: 'POST',
            url: '/theme',
            data: {
                themePreference: (currentTheme === 'dark') ? 'light' : 'dark',
            },
        };

        $.ajax(requestConfig).then(function (response) {
            if (websiteBody.hasClass('dark')) {
                websiteBody.removeClass('dark');
                websiteBody.addClass(response.themePreference);
                changeThemeButton.val(response.themePreference);
            } else {
                websiteBody.removeClass('light');
                websiteBody.addClass(response.themePreference);
                changeThemeButton.val(response.themePreference);
            }
        }).catch(function (response) {

        });
    })
})(window.jQuery)