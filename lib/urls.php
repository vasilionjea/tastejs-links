<?php
  include_once('config.php');

  // Exit by returning the comments in JSON format.
  $comments = get_comments();
  exit($comments);
?>