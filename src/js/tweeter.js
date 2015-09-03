// tweeter.js

module.exports = function (proxy) {
  let API = {}
  let tweet_hbs = require('../hbs/tweet.hbs')

  API.getTweets = function (callback) {
    let $ = require('jquery')
    $.get(proxy + '/tweets', callback, 'json')
  }

  API.streamTweets = function (callback) {
    let io = require('socket.io-client')
    let socket = io.connect(proxy)
    socket.on('tweet', callback)
  }

  API.isGif = function (tweet) {
    if (tweet.extended_entities) {
      return true
    }
  }

  API.renderTweet = function (tweet) {
    return tweet_hbs({
      url: tweet.extended_entities.media[0].video_info.variants[0].url,
      thumbnail: tweet.extended_entities.media[0].media_url
    })
  }

  API.newTweet = function (tweet, container) {
    if (API.isGif(tweet)) {
      container.prepend(API.renderTweet(tweet))
    }
  }
  return API
}
