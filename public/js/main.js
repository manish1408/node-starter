/* eslint-env jquery, browser */
$(document).ready(() => {

  // Place JavaScript code here...

  //List Of Website Code Start
  
  var listOfWebsites=$('#hdnlistofwebsites');
  if(listOfWebsites!=null && listOfWebsites!=undefined && listOfWebsites.length>0)
  {
    listOfWebsites=listOfWebsites.val().split(',');
    for(var i = 0;i<listOfWebsites.length;i++)
    {
      if(listOfWebsites[i]=='') continue;
       var span='<div class="input-group col-xs-3 entry"><input class="form-control" type="text" value="'+listOfWebsites[i]+'" name="listofwebsites" autocomplete=""><span class="input-group-btn"><button class="btn btn-remove btn-danger" type="button"><span class="fas fa-minus fa-sm "></span></button></span></div>'
       var controlForm = $('.static-form');
       $(span).insertBefore(controlForm);

    }
  }
  $(document).on('click', '.btn-add', function (e) {
    e.preventDefault();

    var controlForm = $('.myctrl'),
    currentEntry = $(this).parents('.entry:first'),
    newEntry = $(currentEntry.clone()).appendTo(controlForm);

    newEntry.find('input').val('');
    controlForm.find('.entry:not(:last) .btn-add')
      .removeClass('btn-add').addClass('btn-remove')
      .removeClass('btn-success').addClass('btn-danger')
      .html('<span class="fas fa-minus fa-sm "></span>');
  }).on('click', '.btn-remove', function (e) {
    $(this).parents('.entry:first').remove();
    e.preventDefault();
    return false;
  });
  //List Of Website Code End

});
