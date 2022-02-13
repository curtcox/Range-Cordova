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

function RangeDevice(uuid, name) {
	this.uuid = uuid;  // get your UUID (iOS) or MAC address (Android) from bluetoothSerial.list
	this.name = name;
	this.temperatures = [];
	this.batteryLevel = null;
}

var range = {
    connectedDevice: null,
    allDiscoveredDevices: {},
    updateTemperaturesCallback: null,
    positionChangedCallback: null,
    buttonPressedCallback: null,
    temperatureInCelsius: false,
    debug: false,

    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
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
        console.log('Received Event: ' + id);
    },

    list: function(success) {
    	//bluetoothSerial.discoverUnpaired() for Android
        bluetoothSerial.list(
            function(results) {
               // [{id: "CFFEB103-B3FB-B6DB-95A7-55DDB5BFAD21", name: "RangeWhite03", uuid: "CFFEB103-B3FB-B6DB-95A7-55DDB5BFAD21"}]
                results.forEach(function(r) {
	                range.allDiscoveredDevices[r["id"]] = r;
	            });
                success(results);
            }
        );
    },
    
    isConnected: function(success ,failure) {
    	return bluetoothSerial.isConnected(success, failure);
    },

// TODO block if already in progress
    connect: function(uuid, success, failure) {
    	if (range.debug)
			console.log("Attempting to connect.");
		bluetoothSerial.connect(
					uuid,  // device to connect to
					function(){
						var deviceName = "";
						if (range.allDiscoveredDevices[uuid] != undefined)
							deviceName = range.allDiscoveredDevices[uuid]["name"];
						range.connectedDevice = new RangeDevice(uuid, deviceName);
						range.subscribe();
						success();
					},    // start listening if you succeed
					failure    // show the error if you fail
		);
    },
    
/*
    Connects if not connected, and disconnects if connected:
*/
	disconnect: function(uuid, success, failure) {
    	if (range.debug)
			console.log("Attempting to disconnect.");
		bluetoothSerial.disconnect(
			function(){
				range.unsubscribe();
                range.connectedDevice = null;
				success();
			},    // start listening if you succeed
			failure      // show the error if you fail
		);
	},

/*
    subscribes to a Bluetooth serial listener
*/
    subscribe: function() {
        // if you get a good Bluetooth serial connection:
    	if (range.debug)
	        console.log("Connected to: " + range.connectedDevice.name);
        // set up a listener
        bluetoothSerial.subscribeRawData(range.processData);
    },

/*
    unsubscribes from any Bluetooth serial listener
*/
    unsubscribe: function() {
        // if you get a good Bluetooth serial connection:
    	if (range.debug)
	        console.log("Disconnected from: " + range.connectedDevice.uuid);
        // unsubscribe from listening:
        bluetoothSerial.unsubscribeRawData(
                function (data) {
                    return data;
                },
                function(error) {
                	return error;
                }
        );
    }, 
    
    bytesToTemperatures: function(data) {
    	var result = [];
		var bytes = new Uint8Array(data);
		if (bytes.length % 2 != 0)
		{
			console.error("wrong number of bytes in temperature data");
			return result;
		}
		for (var i = 0; i < bytes.length; i += 2)
		{
			var tempData = bytes.slice(i, i+2);
			var tempOut = tempData[0]*256 + tempData[1];  // hundredths of Celcius
			
			if (tempOut == 0x810C)
				result.push(null);
			else {
				tempOut /= 100.0; 
				if (!range.temperatureInCelsius)
					tempOut = (tempOut * 9/5 + 32); // convert to Fahrenheit
				result.push(tempOut.toFixed(1));
			}
		}
		return result;
    },
    
    processData: function(data) {
		var bytes = new Uint8Array(data);
		if (bytes[0] == 'T'.charCodeAt(0))
		{
			range.connectedDevice.temperatures = range.bytesToTemperatures(bytes.slice(1));
			if (range.updateTemperaturesCallback != null)
				range.updateTemperaturesCallback(range.connectedDevice.temperatures); 
	    	if (range.debug)
				console.log(range.connectedDevice.temperatures);
		}
		else if (bytes[0] == 'D'.charCodeAt(0))
		{
			range.connectedDevice.position = bytes[1];
			if (range.positionChangedCallback != null)
				range.positionChangedCallback(range.connectedDevice.position); 
	    	if (range.debug)
				console.log('D'+range.connectedDevice.position);
		}
		else if (bytes[0] == 'B'.charCodeAt(0))
		{
			if (range.buttonPressedCallback != null)
				range.buttonPressedCallback(); 
	    	if (range.debug)
				console.log('B');
		}
		else if (bytes[0] == 'V'.charCodeAt(0))
		{
			if (bytes.length >= 3)
			{
				var dataValue = bytes.slice(1);
				var internalTempVal = 0;
				
				if (dataValue.length >= 6)
				{
					var tempBytes = dataValue.slice(2,6);
					var tempResult = range.bytesToTemperatures(tempBytes);
					if (tempResult.length > 0)
						internalTempVal = tempResult[0];
				}
				
				var val = dataValue[0]*256 + dataValue[1];
		    	if (range.debug)
					console.log('V'+(val/1000.0));
				range.connectedDevice.batteryLevel = val;
			}
		}
		else
		{
	    	if (range.debug)
				console.log(bytes);
		}
	}, 
	
	requestVersionInfo: function() {
		bluetoothSerial.write('F');
	}
};

range.initialize();
