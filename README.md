# Streamcrabs

## What is Streamcrabs?

Streamcrabs is an open source desktop Twitch Bot with functionality similar to Streamlabs.  More functionality will be added as we go on.

## Current Features

* Animated Raid/Subscription/Cheer Alerts with chroma keying.
* Customizable dynamic alerts that use a variable to change how many sprites appear on the screen.
* Customizable commands that can play sounds and videos.
* Sound and Video channel point redemption rewards.

## Planned Features

* Bot writeable files that can be used with OBS/XSplit for things like latest follower/latest sub/etc.
* More dynamic alert templates that can be customized.
* Other widgets like tip jars.

## How to Test Development

First you must setup a Twitch application at developer.twitch.tv and add a redirect url of http://localhost.  Then place the client id and secret into electron/config.json (generally you will want this setup for builds too).  Note though that I realize that having a client secret in the clear like this is not the best idea, but if someone else can help me come up with a better alternative I am open.

Finally make sure to run the following to install all of the dependencies.

    npm i
  
Then run the following to launch the application.

    npm run dev
  
## How to Build

Install and run electron-packager on the root of the project.

    npm i electron-packager --global
    npx electron-packager . --overwrite
  
If you want to build for all platforms use the following.

    npx electron-packager . --overwrite --all