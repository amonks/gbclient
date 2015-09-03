# gifbooth client

This is the static gifbooth website. It gets data from the [gifbooth proxy](https://github.com/amonks/gbproxy).

When this repository is pushed to, travisci builds and deploys it to [this s3 bucket](http://gifbooth.co.s3-website-us-east-1.amazonaws.com/). That deploy process usually takes about 2 minutes.

## building

To build this website, you need npm and gulp. Once you have them, run `gulp` to build the website into a new folder called `dist/`.
