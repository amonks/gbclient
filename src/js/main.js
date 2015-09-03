// main.js
var $ = require('jquery')

var Tweeter = require('./tweeter')
var tweeter = new Tweeter('//gifbooth-proxy.herokuapp.com')

$(function () {

  tweeter.getTweets(function (tweets) {
    $('#loading').addClass('hidden')
    console.log('got ' + tweets.length + ' tweets')
    for (let tweet of tweets) {
      tweeter.newTweet(tweet, $('#tweets'))
    }
  })

  tweeter.streamTweets(function (tweet) {
    $('#loading').addClass('hidden')
    console.log('got a new tweet')
    tweeter.newTweet(tweet, $('#tweets'))
  })
})
