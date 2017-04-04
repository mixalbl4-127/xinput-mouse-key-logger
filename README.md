# xinput-mouse-key-logger
Node keyboard and mouse activity detector without root!

# Methods

## xinput_get_all_devices_id ( callback )
Gets list of all xinput devices
### attributes
* callback - function - callback function

## new xinput_listener ( good_devices_id_list, callback, [optional] response_interval = 3000 )
Creates new listener for devices
### attributes
* good_devices_id_list - array of numbers - list of devices id (you can get it from xinput_get_all_devices_id)
* callback - function - callback function
* response_interval - number - time interval for sending list of events to callback. **If 0 is set, live mode is active**

## destroy ( )
Destroys all streams and clears class

# Info

## standard mode (if response_interval > 0 )
Calls callback with list of events every N seconds

## live mode (if response_interval === 0 )
When any event triggers, it creates new event list with this event calls callback immediately. For new call is made for every event.


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
    // Destroys listener after 10 sec
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
    // Destroys listener after 10 sec
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
    }, 0); // <- 0 is set, live mode is active!
});
```
### JavaScript
```javascript
const xmkl = require('xinput-mouse-key-logger');
xmkl.xinput_get_all_devices_id(function (devices_id_list) {
    console.log('all', devices_id_list);
    var listener = new xmkl.xinput_listener(devices_id_list, function (xinput_events_list) {
        console.log('events!', xinput_events_list);
    }, 0); // <- 0 is set, live mode is active!
});
```