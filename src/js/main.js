// main.js

/* global PROXY_URL */

require('babelify/polyfill')
var $ = require('jquery')
window.$ = window.jQuery = $
let bootstrap = require('bootstrap')
console.log(bootstrap)

let Tweeter = require('./tweeter')
let tweeter = new Tweeter(PROXY_URL)

$(function () {
  let setButton = function (tweetElement, tweet) {
    tweetElement.find('.btn-share').click(function () {
      let share_hbs = require('../hbs/share.hbs')
      console.log(tweet)
      let modal = $(share_hbs(tweeter.parse(tweet)))
      $('body').append(modal)
      console.log(modal)
      modal.modal('show')
    })
  }

  let newTweet = function (tweet, container) {
    if (tweeter.isGif(tweet)) {
      let tweetElement = $(renderTweet(tweet))
      container.prepend(tweetElement)
      setButton(tweetElement, tweet)
    }
  }

  let renderTweet = function (tweet) {
    let tweet_hbs = require('../hbs/tweet.hbs')
    return tweet_hbs(tweeter.parse(tweet))
  }

  tweeter.getTweets(function (tweets) {
    $('#loading').addClass('hidden')
    console.log('got ' + tweets.length + ' tweets')
    // can't use 'for of' here cuz it doesn't guarantee order
    for (let i = tweets.length; i--; i <= 0) {
      let tweet = tweets[i]
      newTweet(tweet, $('#tweets'))
    }
  })

  tweeter.streamTweets(function (tweet) {
    $('#loading').addClass('hidden')
    console.log('got a new tweet')
    newTweet(tweet, $('#tweets'))
  })
})
