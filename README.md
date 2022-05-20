# WTD Tool

## What is WTD Tool?

WTD Tool is a tool for creating clips for Rifftrax the Game and What the Dub.

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