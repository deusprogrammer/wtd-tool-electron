const path = require('path');
const fs = require('fs');

const { app, ipcMain, protocol, BrowserWindow, dialog, Menu, MenuItem } = require('electron');

const defaultConfig = require('./defaultConfig');

const CONFIG_FILE = path.join(__dirname, "config.json");
const REACT_APP_LOCATION = `file://${path.join(__dirname, '../build/index.html')}`;

let isDev = false;
try {
    isDev = require('electron-is-dev');
} catch (e) {
    console.log("Running in production mode using react app at: " + REACT_APP_LOCATION);
}

let config = defaultConfig;
if (process.platform === 'darwin') {
    config.whatTheDubDirectory = "~/Library/Application Support/Steam/steamapps/common/WhatTheDub/WhatTheDub.app/Contents/Resources/Data";
    config.rifftraxDirectory = "~/Library/Application Support/Steam/steamapps/common/RiffTraxTheGame/RiffTraxTheGame.app/Contents/Resources/Data";
    config.isMac = true;
}

if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
} else {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, {}).toString());
}

let win;
const createWindow = async () => {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            webSecurity: false,
            preload: path.join(__dirname, "preload.js") // use a preload script
        },
    });

    win.loadURL(
        isDev ? 'http://localhost:3000' :
        REACT_APP_LOCATION
    );

    protocol.interceptFileProtocol('app', function (request, callback) {
        let url = request.url.substr(6);
        let dir = path.normalize(path.join(__dirname, '.', url));
        callback(dir);
    }, function (err) {
        if (err) {
            console.error('Failed to register protocol');
        }
    });

    // Open the DevTools.
    if (isDev) {
        win.webContents.openDevTools({ mode: 'detach' });
    }

    win.on('close', function() { //   <---- Catch close event
        app.quit();
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Create window
    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Bridged functionality

ipcMain.handle('updateConfig', (event, newConfig) => {
    console.log("CONFIG: " + JSON.stringify(newConfig));
    config = newConfig;
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    return;
});

ipcMain.handle('getConfig', () => {
    return config;
});

ipcMain.handle('getVideos', (event, game) => {
    let clipsDirectory = null;
    if (game === "rifftrax") {
        clipsDirectory = `${config.rifftraxDirectory}/StreamingAssets/VideoClips`.replace("~", process.env.HOME);
    } else if (game === "whatthedub") {
        clipsDirectory = `${config.whatTheDubDirectory}/StreamingAssets/VideoClips`.replace("~", process.env.HOME);
    } else {
        return [];
    }

    const files = fs.readdirSync(clipsDirectory);
    const fileObjects = files.filter(file => file.endsWith(".mp4") || file.endsWith(".mp4.disabled")).map((file) => {return {_id: file.substring(0, file.lastIndexOf(".mp4")), name: file.replace(/_/g, " ").substring(0, file.lastIndexOf(".mp4")), game, disabled: file.endsWith(".disabled")}});
    return fileObjects;
});

ipcMain.handle('getVideo', (event, {id, game}) => {
    console.log("Opening: " + id + " from game " + game);

    let directory = null;
    if (game === "rifftrax") {
        directory = config.rifftraxDirectory;
    } else if (game === "whatthedub") {
        directory = config.whatTheDubDirectory;
    } else {
        return [];
    }
    
    const clipsDirectory = `${directory}/StreamingAssets/VideoClips`.replace("~", process.env.HOME);
    const subsDirectory = `${directory}/StreamingAssets/Subtitles`.replace("~", process.env.HOME);
    const videoFilePath = `${clipsDirectory}/${id}.mp4`;
    const subFilePath = `${subsDirectory}/${id}.srt`;

    const videoBase64 = fs.readFileSync(videoFilePath, {encoding: 'base64'});
    const subtitles = fs.readFileSync(subFilePath, {encoding: 'base64'});

    return {
        name: id.replace(/_/g, " "),
        videoUrl: `data:video/mp4;base64,${videoBase64}`,
        subtitles: [],
        srtBase64: subtitles 
    }
});

ipcMain.handle('storeVideo', (event, {base64ByteStream, subtitles, title, clipNumber, game}) => {
    console.log(`STORING ${title}-${clipNumber} for game ${game} with subtitles ${subtitles}`);

    let directory = null;
    if (game === "rifftrax") {
        directory = config.rifftraxDirectory;
    } else if (game === "whatthedub") {
        directory = config.whatTheDubDirectory;
    } else {
        return;
    }

    let baseFileName = title ? title.replace(" ", "_") + `-Clip${`${clipNumber}`.padStart(3, "0")}` : `${uuidv4()}`;

    const clipsDirectory = `${directory}/StreamingAssets/VideoClips`.replace("~", process.env.HOME);
    const subsDirectory = `${directory}/StreamingAssets/Subtitles`.replace("~", process.env.HOME);
    const videoFilePath = `${clipsDirectory}/_${baseFileName}.mp4`;
    const subFilePath = `${subsDirectory}/_${baseFileName}.srt`;

    console.log("SAVING TO " + videoFilePath + "\n" + subFilePath);

    fs.writeFileSync(videoFilePath, Buffer.from(base64ByteStream, "base64"));
    fs.writeFileSync(subFilePath, subtitles);
});

ipcMain.handle('deleteVideo', (event, {id, game}) => {
    console.log("DELETING " + id + " FOR GAME " + game);

    let directory = null;
    if (game === "rifftrax") {
        directory = config.rifftraxDirectory;
    } else if (game === "whatthedub") {
        directory = config.whatTheDubDirectory;
    } else {
        return;
    }
    const clipsDirectory = `${directory}/StreamingAssets/VideoClips`.replace("~", process.env.HOME);
    const subsDirectory = `${directory}/StreamingAssets/Subtitles`.replace("~", process.env.HOME);
    const videoFilePath = `${clipsDirectory}/${id}.mp4`;
    const subFilePath = `${subsDirectory}/${id}.srt`;

    console.log("DELETING " + videoFilePath + "\n" + subFilePath);

    fs.unlinkSync(videoFilePath);
    fs.unlinkSync(subFilePath);
});

ipcMain.handle('openDialog', async () => {
    const response = await dialog.showOpenDialog({properties: ['openDirectory', 'createDirectory'] });
    if (!response.canceled) {
        return response.filePaths[0];
    } else {
        return null;
    }
});

ipcMain.handle('setActive', async (event, {id, game, isActive}) => {
    console.log("TOGGLING " + id + " in game " + game + " to " + isActive);

    let directory = null;
    if (game === "rifftrax") {
        directory = config.rifftraxDirectory;
    } else if (game === "whatthedub") {
        directory = config.whatTheDubDirectory;
    } else {
        return;
    }
    const clipsDirectory = `${directory}/StreamingAssets/VideoClips`.replace("~", process.env.HOME);
    const subsDirectory = `${directory}/StreamingAssets/Subtitles`.replace("~", process.env.HOME);
    const videoFilePath = `${clipsDirectory}/${id}.mp4`;
    const subFilePath = `${subsDirectory}/${id}.srt`;

    if(isActive) {
        fs.renameSync(`${videoFilePath}.disabled`, videoFilePath);
        fs.renameSync(`${subFilePath}.disabled`, subFilePath);
    } else {
        fs.renameSync(videoFilePath, `${videoFilePath}.disabled`);
        fs.renameSync(subFilePath, `${subFilePath}.disabled`);
    }
});