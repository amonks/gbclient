// main.js

/* global PROXY_URL */

require('babelify/polyfill')
let $ = require('jquery')

window.$ = window.jQuery = $
let bootstrap = require('bootstrap')
console.log(bootstrap)

let Tweeter = require('./tweeter')
let tweeter = new Tweeter(PROXY_URL)

$(function () {
  let armShareButton = function (tweetElement, tweet) {
    tweetElement.find('.btn-share').click(function () {
      let parsed_tweet = tweeter.parse(tweet)

      // create and show modal
      let share_hbs = require('../hbs/share.hbs')
      let modal = $(share_hbs(parsed_tweet))
      $('body').append(modal)
      modal.modal('show')

      modal.find('.btn-email').click(function () {
        let email_hbs = require('../hbs/email.hbs')
        let emailModal = $(email_hbs())
        $('body').append(emailModal)
        emailModal.modal('show')

        // arm email send button
        emailModal.find('.btn-email-send').click(function (e) {
          e.preventDefault()

          let params = validate(emailModal, [
            'from_name',
            'from_email',
            'to_name',
            'to_email'
          ])
          if (params) {
            console.log('params', params, 'parsed_tweet', parsed_tweet)
            params.gif_url = parsed_tweet.gif_url
            email(params)
            emailModal.modal('hide')
          }
        })
      })
    })
  }
  let validate = function (container, things) {
    let params = {}
    for (let thing of things) {
      let whatever = container.find('#' + thing).val()
      if (whatever.length > 0) {
        container.find('#' + thing).parent().addClass('has-success')
        params[thing] = whatever
      } else {
        container.find('#' + thing).parent().addClass('has-error')
        console.log('form error!')
        return false
      }
    }
    return params
  }

  let newTweet = function (tweet, container) {
    if (tweeter.isGif(tweet)) {
      let tweetElement = $(renderTweet(tweet))
      container.prepend(tweetElement)
      armShareButton(tweetElement, tweet)
    }
  }

  let oldTweet = function (tweet, container) {
    let tweetElement = $(renderTweet(tweet))
    container.append(tweetElement)
    armShareButton(tweetElement, tweet)
  }

  let renderTweet = function (tweet) {
    let tweet_hbs = require('../hbs/tweet.hbs')
    return tweet_hbs(tweeter.parse(tweet))
  }

  let serialize = function (obj) {
    let str = []
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
      }
    }
    return str.join('&')
  }

  let email = function (params) {
    console.log('sending email', params)
    $.post(PROXY_URL + '/email?' + serialize(params))
  }

  let gotTweets = function (tweets) {
    $('#loading').addClass('hidden')
    $('#load-more').removeClass('hidden')
    console.log('got ' + tweets.length + ' tweets')
    // can't use 'for of' here cuz it doesn't guarantee order
    let any_new_tweets = false
    for (let i = 0; i <= tweets.length - 1; i++) {
      let tweet = tweets[i]

      if (tweet.id_str !== $('.tweet').last().attr('id') &&
          tweeter.isGif(tweet)) {
        oldTweet(tweet, $('#tweets'))
        any_new_tweets = true
      }
    }

    if (any_new_tweets === false) {
      $('#load-more').addClass('hidden')
      getMoreTweets = function () { console.log('no more tweets') }
    }
  }

  let getMoreTweets = function () {
    // get more tweets
    let maxID = $('.tweet').last().attr('id')
    tweeter.getMoreTweets(maxID, gotTweets)
  }

  $('#load-more').click(getMoreTweets)

  tweeter.getTweets(gotTweets)

  tweeter.streamTweets(function (tweet) {
    $('#loading').addClass('hidden')
    console.log('got a new tweet')
    newTweet(tweet, $('#tweets'))
  })
})
