function AjaxSend(type, url, data) {
  return $.ajax({
    type: type,
    url: url,
    dataType: 'json',
    data: data
  });
}

(function($) {
$.fn.AjaxSendFormData = function(type, url) {
  let form_data = this.serialize();
  /*for (var n of form_data)
    console.log(n);*/
  return $.ajax({
    type: type,
    dataType: 'json',
    data: form_data,
    url: url
  });
};

})(jQuery);
