/*
 * 2017 Supermechanical
 * based on code from don's bluetooth serial cordova plugin
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    chars: "",

    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        connectButton.addEventListener('touchend', app.manageConnection, false);
        
        range.updateTemperaturesCallback = app.updateTemperatures;
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.ready');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

/*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function() {

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
			connectButton.innerHTML = "Scanning...";
			
			var success = function(devices) {
				if (devices.length > 0)
				{
					var devicelist = "<ul>";
					devices.forEach( function(device) {
						devicelist += '<li><a id="'+device["id"]+'">'+device["name"]+'</a></li>';
					});
					devicelist += "</ul>";
					
					picker.innerHTML = devicelist;
					connectButton.innerHTML = "Scan";
					
					devices.forEach( function(device) {
						document.getElementById(device["id"]).addEventListener("click", function(){
							app.connectToDevice(device["id"]);
						});
					});
				}
				else
				{
					connectButton.innerHTML = "Scan";
					picker.innerHTML = "No devices found.";
				}
			};
			
        	range.list(success);

       };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
			connectButton.innerHTML = "Disconnecting...";

			range.disconnect("",
            	function() {
					rangeName.innerHTML = "Range Dial";
			        connectButton.innerHTML = "Scan";
			        app.updateTemperatures([null,null]);
            	},
                app.showError      // show the error if you fail
			);
        };

        // here's the real action of the manageConnection function:
        range.isConnected(disconnect, connect);
    },
    
    connectToDevice: function(uuid) {
		range.connect(
			uuid, 
			function() {
				rangeName.innerHTML = range.connectedDevice.name;
				connectButton.innerHTML = "Disconnect";
				var picker = document.getElementById("picker"); // the message div
				picker.innerHTML = "";
				app.clear();
			}, 
			function(error) {
				rangeName.innerHTML = range.connectedDevice.name;
				connectButton.innerHTML = "Disconnect";
				var picker = document.getElementById("picker"); // the message div
				picker.innerHTML = "";
				app.showError(error);
			}
		);
    },

/*
    appends @error to the message div:
*/
    showError: function(error) {
        app.display('error: '+error);
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    },
    
    updateTemperatures(temps) {
        var temp1 = document.getElementById("temp1");
        var temp2 = document.getElementById("temp2");

        if (temps[0] != null)
	        temp1.innerHTML = temps[0]+"&deg;";
	    else
	    	temp1.innerHTML = "";
        if (temps[1] != null)
	        temp2.innerHTML = temps[1]+"&deg;";
	    else
	    	temp2.innerHTML = "";
    }

};

app.initialize();
