// tweeter.js

/* global $ io ENV */

window.Tweeter = function (proxy) {
  let API = {}
  let gettingTweets = false
  let last_maxID = false

  API.getTweets = function (callback) {
    if (gettingTweets === false) {
      gettingTweets = true
      $.get(proxy + '/tweets', function (data) {
        gettingTweets = false
        callback(data)
      }, 'json')
    }
  }

  API.getMoreTweets = function (maxID, callback) {
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
    let socket = io.connect(proxy)
    socket.on('tweet', callback)
  }

  API.isGif = function (tweet) {
    if (tweet.extended_entities && tweet.extended_entities.media) {
      return true
    }
  }

  API.parse = function (tweet) {
    return {
      mp4_url: tweet.extended_entities.media[0].video_info.variants[0].url,
      thumbnail: tweet.extended_entities.media[0].media_url,
      gif_url: ENV.GIFS_URL + '/' + tweet.id_str + '.gif',
      media_id: tweet.entities.media[0].id_str,
      tweet_id: tweet.id_str
    }
  }

  return API
}
