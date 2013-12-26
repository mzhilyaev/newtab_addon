/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";
const {Ci,Cu,Cc} = require("chrome");
const {setTimeout} = require("timers");
const {WindowTracker} = require("window-utils");
const request = require("request");
const tabs = require("sdk/tabs");
const {data} = require("self");
const Promise = require('sdk/core/promise');

Cu.import("resource://gre/modules/Services.jsm", this);

// list of hosts granted access permission to apps installation list
/**
 * User profile object
*/

function recommendLinks(callback) {
   let req = request.Request({
        url: "http://127.0.0.1:4355/nytimes/mostpopular/Technology.json",
        onComplete: function(response) {
          dump( "response" + response.status );
          if( response.status == 200 ) {
            //dump(JSON.stringify(response.json, null , 2));
            callback(response.json);
          }
          else {
            dump("failed to load\n");
          }
        }
      });
   req.get();
};

function addApplicationFrame(document) {
 try {
  let tabGrid = document.getElementById("newtab-grid");
  let sideBar = tabGrid.cloneNode(false);
  sideBar.appendChild(document.createTextNode("HELLO THERE"));
  sideBar.setAttribute("id" , "sidebar");
  sideBar.setAttribute("style" , "display: -moz-box;  margin: 10px 50px 20px 0px; background-color: yellow;");
  tabGrid.parentNode.appendChild(sideBar);

  let window = document.defaultView;
  // Add a row and cell for the showing the app frame
  recommendLinks();
 } catch ( ex ) {
  console.log( "Error " + ex );
 }
}

exports.main = function(options) {

  tabs.on('ready' , function(tab) {
    if (tab.url == "about:newtab") {
      let worker = tab.attach({
          contentScriptFile: [data.url("jquery.js"),data.url("run.js")] ,
          onMessage: function (message) {
                      console.log(message);
                    }
      });
      worker.port.emit("style",data.url("run.css"));
      worker.port.on("recomend" , function() {
        recommendLinks(json => {
          worker.port.emit("show",json);
        });
      });
    }
  });

}
