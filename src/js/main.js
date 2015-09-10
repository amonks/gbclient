// main.js

/* global ENV Handlebars $ Gifbooth Tweeter Typekit */

Handlebars.registerHelper('url', function (s) {
  return encodeURIComponent(s)
})

let tweeter = new Tweeter(ENV.PROXY_URL)

$(function () {
  let armShareButton = function (tweetElement, tweet) {
    tweetElement.find('.btn-share').click(function () {
      let parsed_tweet = tweeter.parse(tweet)

      if (mobileCheck()) {
        parsed_tweet.mobile = true
      }
      console.log('goin mobile?', parsed_tweet)

      // create and show modal
      let modal = $(Gifbooth.templates.share(parsed_tweet))
      $('body').append(modal)
      modal.modal('show')

      // arm facebook share button
      let fb_share_link = ENV.PROXY_URL + '/share/facebook/?gif_url=' + encodeURIComponent(parsed_tweet.gif_url)
      modal.find('.btn-fb').attr('href', fb_share_link)

      // arm tumbl button
      let tumblUrl = 'https://www.tumblr.com/widgets/share/tool?posttype=photo&tags=GIFbooth&canonicalUrl=http://gifbooth.co&content=' + parsed_tweet.gif_url
      modal.find('.btn-tumbl').attr('href', tumblUrl)

      // arm tweet button
      modal.find('.btn-tweet').click(function () {
        let tweetModal = $(Gifbooth.templates.tweet())
        $('body').append(tweetModal)
        tweetModal.modal('show')

        tweetModal.find('#text').attr('value', ENV.TWEET_TEXT)

        // arm tweet send button
        tweetModal.find('.btn-post-tweet').click(function (e) {
          e.preventDefault()

          let params = validate(tweetModal, ['text'])
          if (params) {
            params.mp4_url = parsed_tweet.mp4_url
            params.tweet_id = parsed_tweet.tweet_id
            if (params) {
              let postUrl = ENV.PROXY_URL + '/share/twitter?' + serialize(params)
              console.log(postUrl)
              window.location.href = window.location = postUrl
            }
          }
        })
      })

      modal.find('.btn-mms').click(function () {
        let mmsModal = $(Gifbooth.templates.mms())
        $('body').append(mmsModal)
        mmsModal.modal('show')
        mmsModal.find('.btn-send').click(function (e) {
          e.preventDefault()

          let params = validate(mmsModal, ['to_number'])
          if (params) {
            params.gif_url = parsed_tweet.gif_url
            mms(params)
            mmsModal.modal('hide')
          }
        })
      })

      modal.find('.btn-email').click(function () {
        let emailModal = $(Gifbooth.templates.email())
        $('body').append(emailModal)
        emailModal.modal('show')

        // arm email send button
        emailModal.find('.btn-email-send').click(function (e) {
          e.preventDefault()

          let params = validate(emailModal, [
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
    return Gifbooth.templates.gif(tweeter.parse(tweet))
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
    $.post(ENV.PROXY_URL + '/share/email', params)
    .done(function () {
      alert('Email sent!', 'success')
    })
    .fail(function () {
      alert('Error sending email.', 'danger')
    })
  }

  let mms = function (params) {
    console.log('sending mms', params)
    let postUrl = ENV.PROXY_URL + '/share/mms'
    $.post(postUrl, params)
    .done(function () {
      alert('MMS sent!', 'success')
    })
    .fail(function () {
      alert('Error sending MMS.', 'danger')
    })
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

  let alert = function (text, level) {
    let alertElem = $(Gifbooth.templates.alert({text: text, level: level}))
    $('#alerts').append(alertElem)
  }

  let paramsFromQueryString = function () {
    return (function (a) {
      if (a === '') return {}
      var b = {}
      for (var i = 0; i < a.length; i++) {
        var p = a[i].split('=')
        if (p.length !== 2) continue
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '))
      }
      return b
    })(window.location.search.substr(1).split('&'))
  }

  let alertFromQueryString = function () {
    let params = paramsFromQueryString()
    let text, level
    if (params.alert) {
      text = params.alert
      if (params.alert_level) {
        level = params.alert_level
      } else {
        level = 'info'
      }
      alert(text, level)
    }
  }

  /* eslint-disable */
  // from http://stackoverflow.com/a/11381730/3943439
  let mobileCheck = function () {
    var check = false
    ;(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera)
    return check
  }
  /* eslint-enable */

  let typekit = function () {
    try {
      Typekit.load({ async: true })
      console.log('loaded typekit')
    } catch (e) {
      console.log(e)
    }
  }

  typekit()

  alertFromQueryString()

  $('#load-more').click(getMoreTweets)

  tweeter.getTweets(gotTweets)

  tweeter.streamTweets(function (tweet) {
    $('#loading').addClass('hidden')
    console.log('got a new tweet')
    newTweet(tweet, $('#tweets'))
  })
})
