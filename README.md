# WTD Tool

## What is WTD Tool?

WTD Tool is a tool for creating clips for Rifftrax the Game and What the Dub.

## How to Test Development

Make sure to run the following to install all of the dependencies.

    npm i
  
Then run the following to launch the application.

    npm run dev
  
## How to Build

Install and run electron-packager on the root of the project.

    npm i electron-packager --global
    npx electron-packager . --overwrite
  
If you want to build for all platforms use the following.

    npx electron-packager . --overwrite --all