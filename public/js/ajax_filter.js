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
                        <img width='500' alt="${item.name}" src="${item.image}">
                    </div>
                `).join(''));
            }).catch(function(response) {
                console.error('Error filtering items:', response.responseJSON);
                $('#communityItemsErrors').append(`<li>${response.responseJSON.error}</li>`);
            });
        });

        $('#searchForm').submit(function(event) {
            event.preventDefault();
            let children = $('#communityItemsList').children();
            for (let child of children) {
                let item_elements = child.children;
                if (item_elements) {
                    let heading = item_elements[0].innerText;
                    child.hidden = !heading.toLowerCase().includes($('#searchBar').val().toLowerCase());
                }
            }
        })
    });
})(jQuery);
