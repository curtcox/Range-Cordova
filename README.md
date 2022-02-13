## Install
 Get the Bluetooth serial plugin: 
 ~~~~ cordova plugin add cordova-plugin-bluetooth-serial ~~~~ 

## Methods

## range.list(success: function(device_array))

Return a list of available Bluetooth devices to connect to.

## range.connect(uuid, success, failure)

Connect to a Range Dial and listen for data from it.

## range.disconnect(uuid, success, failure)

Disconnect from a Range Dial.

## range.isConnected(success, failure)

Checks the status of the connection of the currently connected Range Dial.


## Properties

## range.connectedDevice

## range.updateTemperaturesCallback = function([0,0])

Set a function to be called whenever temperatures are updated. The temperatures will be passed as an array of numbers, with null values for absent probes.

## positionChangedCallback = function(0),

Set a function to be called whenever the knob position changes. The position will be passed as a number.

## buttonPressedCallback = function(),

Set a function to be called when the button is pressed.

## temperatureInCelsius: false,

Boolean property to report temperatures in Fahrenheit (default) or Celsius.

## debug: false

Show console.log messages.