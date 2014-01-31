<?php
  // Turn error reporting on when on localhost
  if (preg_match("/localhost/i", $_SERVER['SERVER_NAME'])) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
  }

  // App Constants
  define('URL_COMMENTS', 'https://api.github.com/repos/tastejs/TasteMusic/issues/1/comments');
  define('PATH_COMMENTS', '../dist/comments.json');


  // Use cURL to get remote files
  function curl_file_get_contents($url) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:18.0) Gecko/20100101 Firefox/18.0");
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15); // The amount of seconds to wait for host to respond
    curl_setopt($ch, CURLOPT_TIMEOUT, 30); // The amount of seconds to allow this oparation to run for - by default it never times out
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    $curlError = curl_errno($ch);

    curl_close($ch);

    // Return result if we don't have errors, if there is a result, and if we have a 200 OK
    if (!$curlError && $result && $status == '200') {
      return $result;
    } else {
      return false;
    }
  }


  function json_error($msg = 'Oops, something has gone wrong!') {
    $json = new stdClass();
    $json->error = $msg;

    return exit(json_encode($json));
  }


  // Get local comments
  function get_local() {
    $comments = '';

    if (file_exists(PATH_COMMENTS)) {
      $comments = file_get_contents(PATH_COMMENTS);
    } else {
      return json_error('No links were found locally. Please refresh!');
    }

    return $comments;
  }


  // Get remote comments
  function get_remote() {
    $comments = curl_file_get_contents(URL_COMMENTS);

    if ($comments) {
      file_put_contents(PATH_COMMENTS, $comments);
    }

    return $comments;
  }


  // Get either remote or local comments
  function get_comments() {
    $json = new stdClass();

    if (isset($_GET['refresh'])) {
      $comments = get_remote();
    } else {
      $comments = get_local();
    }

    $json->comments = $comments;

    return json_encode($json);
  }
?>