// GitHub API: http://developer.github.com/guides/getting-started/#issues
;(function($, _, window, undefined) {

  var xhr, refresh_xhr, xhr_options;
  var fragment = document.createDocumentFragment();
  var $fragment = $(fragment);
  var $linksContainer = $('#shared-links').hide();


  // Same as: `curl https://api.github.com/repos/tastejs/TasteMusic/issues/1/comments`
  // TODO Pagination: 
  // `curl https://api.github.com/repos/tastejs/TasteMusic/issues/1/comments?page=2, ?page=3, ...`
  xhr_options = {
    cache: false,
    dataType: 'json',
    url: 'lib/urls.php'
  };

  
  function xhr_success(data, status) {
    var comments;

    if (status == 'success' && data['comments']) {
      comments = $.parseJSON(data['comments']);
      renderHTML(comments);
      $linksContainer.removeClass('error');
    } else {
      $linksContainer.addClass('error').text(data['error'] || 'No idea what happened!');
    }

    $linksContainer.fadeIn();
  }


  function xhr_error(jqXHR, textStatus, errorThrown) {
    $linksContainer.addClass('error').text(errorThrown);
    $linksContainer.fadeIn();
  }


  // Regex: https://gist.github.com/dperini/729294
  var re_weburl = new RegExp(
    "^" +
      // protocol identifier
      "(?:(?:https?|ftp)://)" +
      // user:pass authentication
      "(?:\\S+(?::\\S*)?@)?" +
      "(?:" +
        // IP address exclusion
        // private & local networks
        "(?!10(?:\\.\\d{1,3}){3})" +
        "(?!127(?:\\.\\d{1,3}){3})" +
        "(?!169\\.254(?:\\.\\d{1,3}){2})" +
        "(?!192\\.168(?:\\.\\d{1,3}){2})" +
        "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
        // IP address dotted notation octets
        // excludes loopback network 0.0.0.0
        // excludes reserved space >= 224.0.0.0
        // excludes network & broacast addresses
        // (first & last IP address of each class)
        "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
        "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
        "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
      "|" +
        // host name
        "(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)" +
        // domain name
        "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*" +
        // TLD identifier
        "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
      ")" +
      // port number
      "(?::\\d{2,5})?" +
      // resource path
      "(?:/[^\\s]*)?" +
    "$", "i"
  );


  // Collect URLs from a single chunk of string
  function collectUrls(string_chunk) {
    var string_lines = [];
    var words = [];
    var URLs = [];

    // Split on new lines
    string_lines = string_chunk.split(/\r\n/);

    // Get words out of each line
    _.each(_.compact(string_lines), function(line) {
      words.push(line.split(/\s/));
    });

   // Collect URLs
   URLs = _.chain(words)
    .flatten()
    .filter(function(str) {
      return re_weburl.test(str);
    }).value();

    // console.log('Before: ', string_chunk);
    // console.log('\nAfter: ', URLs);

    return URLs;
  }


  function renderHTML(comments) {
    var comment_urls, item;
    var list = document.createElement('ol');
    var dfd = $.Deferred();
    var currentLength = 0;
    var comments_length = comments.length;

    // Collect urls from comment's body
    _.each(comments, function(comment) {
      comment_urls = collectUrls(comment['body']);

      // For each url in comment build a list item & a link
      _.each(comment_urls, function(url) {
        item = document.createElement('li');
        item.innerHTML = '<a href="'+url+'" target="_blank">' + url + '</a>';
        list.appendChild(item);
      });

      currentLength += 1;

      // Are we done?
      if (currentLength == comments_length) {
        dfd.resolve();
      }
    });

    // We've created the list!
    dfd.done(function() {
      // Gets the length of the first 30 comments
      // We must take into account pagination
      console.log('Parsed URLs from ' + comments_length + ' comments!');

      fragment.appendChild(list);
      $linksContainer.html(fragment);
    });
  }


  // Send ajax!
  xhr = $.ajax(xhr_options);
  xhr.done(xhr_success);
  xhr.fail(xhr_error);


  // Refresh ajax
  $('#refresh').on('click', function(e) {
    e.preventDefault();

    $linksContainer.hide();

    xhr_options['url'] = 'lib/urls.php?refresh';

    // Send for new!
    refresh_xhr = $.ajax(xhr_options);
    refresh_xhr.done(xhr_success);
    refresh_xhr.fail(xhr_error);
  });  
}(jQuery, _, window));