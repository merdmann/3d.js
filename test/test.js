"use strict";
/*
 * https://stackoverflow.com/questions/40646403/how-to-interact-with-the-controls-of-an-electron-app-using-spectron
 * 
 */
const path = require('path');
const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
const appPath = path.join(__dirname, '..', "app", "background.js");

var Application = require('spectron').Application
var assert = require('assert')

describe('application launch', function () {
  this.timeout(10000)

  beforeEach(function () {
    this.app = new Application({
      "path" : electronPath,
      "args" : [appPath]
    })
    return this.app.start();
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it("refresh the screen", function () {
    var btnRefresh = this.app.client.element('//button/*[text(),Refresh]');

    btnRefresh.click();

    // check the result

  });
  
})
