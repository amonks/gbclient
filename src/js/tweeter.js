// tweeter.js

module.exports = function (proxy) {
  let API = {}
  let gettingTweets = false
  let last_maxID = false

  API.getTweets = function (callback) {
    let $ = require('jquery')
    if (gettingTweets === false) {
      gettingTweets = true
      $.get(proxy + '/tweets', function (data) {
        gettingTweets = false
        callback(data)
      }, 'json')
    }
  }

  API.getMoreTweets = function (maxID, callback) {
    let $ = require('jquery')
    if (gettingTweets === false && maxID !== last_maxID) {
      gettingTweets = true
      $.get(proxy + '/tweets/' + maxID, function (data) {
        gettingTweets = false
        callback(data)
      }, 'json')
      last_maxID = maxID
    }
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

  API.parse = function (tweet) {
    return {
      mp4_url: tweet.extended_entities.media[0].video_info.variants[0].url,
      thumbnail: tweet.extended_entities.media[0].media_url,
      gif_url: 'http://gifs.gifbooth.co.s3-website-us-east-1.amazonaws.com/' + tweet.id_str + '.gif',
      tweet_id: tweet.id_str
    }
  }

  return API
}
