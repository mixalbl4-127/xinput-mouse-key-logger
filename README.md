# xinput-mouse-key-logger
Node keyboard and mouse activity detector without root!

# Methods

## xinput_get_all_devices_id ( callback )
Get list of all xinput devices
### attributes
* callback - function - callback function

## new xinput_listener ( good_devices_id_list, callback, [optional] response_interval = 3000 )
Create new listener for devices
### attributes
* good_devices_id_list - array of numbers - list of devices id (you can get it from xinput_get_all_devices_id)
* callback - function - callback function
* response_interval - number - time interval for send events list to callback. **If set 0 - live mode**

## destroy ( )
Destroy all streams and clear class

# Info

## standard mode (if response_interval > 0 )
Every N seconds calls callback with events list

## live mode (if response_interval === 0 )
When any event triggered it create new event list with this event and immediately call callback, for every event make new call


# Installing
`npm install xinput-mouse-key-logger`

# Using

## Static mode
### TypeScript
```typescript
import {xinput_events_list, xinput_get_all_devices_id, xinput_listener} from 'xinput-mouse-key-logger';

xinput_get_all_devices_id((devices_id_list: number[])=> {
    var listener = new xinput_listener(devices_id_list, (xinput_events_list: xinput_events_list)=> {
        console.log('events!', xinput_events_list);
    });
    // Destroy after 10 sec
    setTimeout(function () {
        listener.destroy();
    }, 10000);
});
```
### JavaScript
```javascript
const xmkl = require('xinput-mouse-key-logger');
xmkl.xinput_get_all_devices_id(function (devices_id_list) {
    console.log('all', devices_id_list);
    var listener = new xmkl.xinput_listener(devices_id_list, function (xinput_events_list) {
        console.log('events!', xinput_events_list);
    });
    // Destroy after 10 sec
    setTimeout(function () {
        listener.destroy();
    }, 10000);
});
```

## LIVE mode
### TypeScript
```typescript
import {xinput_events_list, xinput_get_all_devices_id, xinput_listener} from 'xinput-mouse-key-logger';

xinput_get_all_devices_id((devices_id_list: number[])=> {
    var listener = new xinput_listener(devices_id_list, (xinput_events_list: xinput_events_list)=> {
        console.log('events!', xinput_events_list);
    }, 0); // <- 0 is live mode!
});
```
### JavaScript
```javascript
const xmkl = require('xinput-mouse-key-logger');
xmkl.xinput_get_all_devices_id(function (devices_id_list) {
    console.log('all', devices_id_list);
    var listener = new xmkl.xinput_listener(devices_id_list, function (xinput_events_list) {
        console.log('events!', xinput_events_list);
    }, 0); // <- 0 is live mode!
});
```