"use strict";

const autoUpdater = require('auto-updater');
const os = require('os').platform();
//Relative to index.html not app.js
const SerialScanner = require("../back-end/serial_scanner");
const PortSelect = require("./js/port_select");
const packageInfo = require('./package.json');

function $(id) { return document.getElementById(id); }

const flashButton = $("flash-button");
const appStatus = $("status");
const portsSelect = new PortSelect($("ports"));
const serialScanner = new SerialScanner();
const pollTime = 1000; // One second

var last_notification = "";

flashButton.addEventListener("click", event => {
    var notification = new Notification("Flash Finished!");
});

serialScanner.on("ports", (ports) => {
    portsSelect.addAll(ports);
    readyToFlash();
});

serialScanner.on("deviceAdded", (port) => {
    portsSelect.add(port);
    new Notification(`Added: ${port}!`);
});

serialScanner.on("deviceRemoved", (port ) => {
    portsSelect.remove(port);
    new Notification(`Removed: ${port}!`);
});

serialScanner.on("error", onError);

autoUpdater.on("checking-for-update", () => {
    new Notification("Checking for updates");
});

/**
 * Updates UI to say it's ready
 */
function readyToFlash() {
    appStatus.textContent = "Ready";
    enableInputs();
}

/**
 * Enabled the serial port SELECT and flash BUTTON elements.
 */
function enableInputs(){
    portsSelect.disabled = false;
    flashButton.disabled = false;
}

/**
 * Generic catch all error. Shows notification at the moment.
 * @param error
 */
function onError(error){
    if(last_notification !== error.message) {
        last_notification = error.message;
        new Notification(last_notification);
    }
    appStatus.textContent = error.message;
}

function initUpdater() {
    let updateFeed = `http://localhost:3000/updates/${packageInfo.name}/latest`;
    autoUpdater.setFeedURL(updateFeed + '?v=' + packageInfo.version);
    autoUpdater.checkForUpdates();
}

/**
 * Sets up UI
 */
function init() {
    serialScanner.scan();
    setInterval(serialScanner.checkForChanges.bind(serialScanner), pollTime);
    initUpdater();
}

init();