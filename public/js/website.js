
function fnDeleteWebsite(id)
{

    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        jqXHR.setRequestHeader('X-CSRF-Token', $("#_csrf").val());
    });

    $.ajax({
        url: 'website/' + id,
        type: 'DELETE',
        success: function(data) {
            window.location.reload();
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }

    });
}