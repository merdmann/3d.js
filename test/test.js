"use strict";
/*
 * https://stackoverflow.com/questions/40646403/how-to-interact-with-the-controls-of-an-electron-app-using-spectron
 *
 */
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const appPath = path.join(__dirname, '..', "app", "background.js");
const electronPath = path.join(__dirname, "..", "node_modules", "electron", "dist", "electron.exe");

const Application = require('spectron').Application;
const assert = require('assert');
const  electron = require("electron")

global.before(function () {
  chai.should();
  chai.use(chaiAsPromised);
});

describe('application launch', function () {
  this.timeout(10000);

  beforeEach(function () {
    console.log("before ++++++");
    this.app = new Application({ "path" : electronPath, "args" : [ appPath ] })
    chaiAsPromised.transferPromiseness = this.app.transferPromiseness
    return this.app.start();
  })

  after(function () {
    console.log("after +++++");
    if ( this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  })

  it( "it shows the right title", function () {
    console.log("test ++++++");
    const title=this.app.client.getTitle();

    console.log("title :" + title);
    return title.should.eventually.equal("Traveling genes");
  })


  it( "refresh the screen", function () {
    var btnRefresh = this.app.client.element('button/*[text(),Refresh]');

    this.app.client.waitUntilWindowLoaded();
    console.log("btnRefresh" + btnRefresh );
    btnRefresh.click();

    // check the result

  });
})
