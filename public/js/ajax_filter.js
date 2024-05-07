(function($) {
    $(document).ready(function() {
        $('#filterForm').submit(function(event) {
            event.preventDefault();
            let selectedFilter = $('#filterSelect').val();
            $('#communityItemsErrors').empty();

            let requestConfig = {
                method: 'POST',
                url: '/items/filterJSON',
                data: {
                    filter: selectedFilter
                }
            };

            $.ajax(requestConfig).then(function(response) {
                $('#communityItemsList').html(response.map(item => `
                    <div>
                        <h2><a href="/items/${item._id}">${item.name}</a></h2>
                        <dl>
                            <dt>Description:</dt>
                            <dd>${item.desc}</dd>
                            <dt>Price:</dt>
                            <dd>${item.price}</dd>
                        </dl>
                        <img width='500px' alt="${item.name}" src="${item.image}">
                    </div>
                `).join(''));
            }).catch(function(response) {
                console.error('Error filtering items:', response.responseJSON);
                $('#communityItemsErrors').append(`<li>${response.responseJSON.error}</li>`);
            });
        });
    });
})(jQuery);
