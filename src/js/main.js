// main.js

require('babelify/polyfill')
var $ = require('jquery')

var Tweeter = require('./tweeter')
var tweeter = new Tweeter('//gifbooth-proxy.herokuapp.com')

$(function () {

  tweeter.getTweets(function (tweets) {
    $('#loading').addClass('hidden')
    console.log('got ' + tweets.length + ' tweets')
    // can't use 'for of' here cuz it doesn't guarantee order
    for (let i = tweets.length; i--; i <= 0) {
      let tweet = tweets[i]
      tweeter.newTweet(tweet, $('#tweets'))
    }
  })

  tweeter.streamTweets(function (tweet) {
    $('#loading').addClass('hidden')
    console.log('got a new tweet')
    tweeter.newTweet(tweet, $('#tweets'))
  })
})
