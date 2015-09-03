// main.js
var $ = require('jquery')
require('jquery-bridget')
var Masonry = require('masonry-layout')
$.bridget('masonry', Masonry)

var Tweeter = require('./tweeter')
var tweeter = new Tweeter('//localhost:8000')

$(function () {
  $('#tweets').masonry({
    itemSelector: '.tweet',
    columnWidth: 648
  })

  tweeter.getTweets(function (tweets) {
    for (let tweet of tweets) {
      tweeter.newTweet(tweet, $('#tweets'))
    }
  })

  tweeter.streamTweets(function (tweet) {
    tweeter.newTweet(tweet, $('#tweets'))
  })
})
