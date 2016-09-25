// Match numbers to keys with: xmodmap -pke
"use strict";
var exec = require('child_process').exec; // import exec function
var spawn = require('child_process').spawn; // import spawn function
// regex tester
function regexp_exec(pattern, str, flags) {
    if (flags === void 0) { flags = "img"; }
    var match;
    var results = [];
    var re = new RegExp(pattern, flags);
    do {
        match = re.exec(str);
        if (match)
            results.push(([]).concat(match));
    } while (match);
    return results;
}
// get list of all xinput devices
function xinput_get_all_devices_id(callback) {
    // get text list
    exec('xinput --list', { timeout: 5000 }, function (error, stdout, stderr) {
        if (stdout) {
            // parse text list
            var devices_id_list = regexp_exec('^.*id=(\\d+?)\\t.*slave.*$', stdout);
            var only_id = [];
            // add founded IDs to array
            for (var _i = 0, devices_id_list_1 = devices_id_list; _i < devices_id_list_1.length; _i++) {
                var obj = devices_id_list_1[_i];
                only_id.push(+obj[1]);
            }
            // check: callback is set
            if (callback)
                callback(only_id);
            // exit from function if result is good
            return;
        }
        else if (stderr) {
            console.log('xinput-mouse-key-logger error', stderr);
        }
        // if error happened - return empty array
        if (callback)
            callback([]);
    });
}
exports.xinput_get_all_devices_id = xinput_get_all_devices_id;
// main xinput listener
var xinput_listener = (function () {
    function xinput_listener(good_devices_id_list, callback, response_interval) {
        var _this = this;
        if (response_interval === void 0) { response_interval = 3000; }
        this.destroyed = false; // destroy class status
        this.streams = []; // created streams array
        // init class variables
        this.devices = good_devices_id_list;
        this.callback = callback;
        this.response_interval = response_interval;
        this.clear_events();
        // create all streams
        for (var _i = 0, _a = this.devices; _i < _a.length; _i++) {
            var id = _a[_i];
            this.create_stream(id);
        }
        // if not live mode it init first timeout
        if (this.response_interval !== 0) {
            this.send_timeout = setTimeout(function () {
                _this.check();
            }, this.response_interval);
        }
        // when node destroyed it destroy all streams
        process.on('exit', function () {
            _this.destroy();
        });
    }
    // clear all buffered events
    xinput_listener.prototype.clear_events = function () {
        this.events = xinput_listener.get_clear_events();
    };
    // return clear events object
    xinput_listener.get_clear_events = function () {
        return {
            total_mouse_button_events: 0,
            total_mouse_move_events: 0,
            total_keyboard_events: 0,
            keys_code: [],
            mouse_button_codes: []
        };
    };
    // create new stream
    xinput_listener.prototype.create_stream = function (id) {
        var _this = this;
        // run stream with device id
        var stream = spawn('xinput', ['--test', String(id)]);
        // set event listener on data
        stream.stdout.on('data', function (data) {
            data = String(data); // convert bits to string
            var keys = regexp_exec("^key press\\s+(\\d+?)\\s{0,}$", data); // searching keyboard press events
            var mouse_keys = regexp_exec("^button press\\s+(\\d+?)\\s{0,}$", data); // searching mouse press events
            var mouse_moves = regexp_exec("^motion\\s{1}.*$", data); // searching mouse move events
            // if live mode enabled
            if (_this.response_interval === 0) {
                var new_events_list = xinput_listener.get_clear_events(); // create clear events list
                // add keys events
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    new_events_list.keys_code.push(+key[1]);
                    new_events_list.total_keyboard_events++;
                }
                // add mouse_keys events
                for (var _a = 0, mouse_keys_1 = mouse_keys; _a < mouse_keys_1.length; _a++) {
                    var mouse_key = mouse_keys_1[_a];
                    new_events_list.mouse_button_codes.push(+mouse_key[1]);
                    new_events_list.total_mouse_button_events++;
                }
                // add mouse moves events counter
                new_events_list.total_mouse_move_events += mouse_moves.length;
                // if it got new events run callback
                if ((keys.length > 0 || mouse_keys.length > 0 || mouse_moves.length > 0) && _this.callback)
                    _this.callback(new_events_list);
            }
            else {
                // add keys events
                for (var _b = 0, keys_2 = keys; _b < keys_2.length; _b++) {
                    var key = keys_2[_b];
                    _this.events.keys_code.push(+key[1]);
                    _this.events.total_keyboard_events++;
                }
                // add mouse_keys events
                for (var _c = 0, mouse_keys_2 = mouse_keys; _c < mouse_keys_2.length; _c++) {
                    var mouse_key = mouse_keys_2[_c];
                    _this.events.mouse_button_codes.push(+mouse_key[1]);
                    _this.events.total_mouse_button_events++;
                }
                // add mouse moves events counter
                _this.events.total_mouse_move_events += mouse_moves.length;
            }
        });
        // set event listener on ERROR data
        // stream.stderr.on('data', (data: string) => {
        //     console.log(`stderr: ${data}`);
        // });
        // push this stream to streams list
        this.streams.push(stream);
    };
    // send events to callback
    xinput_listener.prototype.check = function () {
        var _this = this;
        if (!this.destroyed) {
            if (this.callback)
                this.callback(this.events);
            this.send_timeout = setTimeout(function () {
                _this.check();
            }, this.response_interval);
        }
        this.clear_events();
    };
    // destroy all streams and this class
    xinput_listener.prototype.destroy = function () {
        // trying kill streams
        for (var _i = 0, _a = this.streams; _i < _a.length; _i++) {
            var stream = _a[_i];
            try {
                stream.kill();
            }
            catch (e) { }
        }
        // trying clear timeout
        try {
            clearTimeout(this.send_timeout);
        }
        catch (e) { }
        // set new status
        this.destroyed = true;
        // clear events array
        this.clear_events();
    };
    return xinput_listener;
}());
exports.xinput_listener = xinput_listener;
//# sourceMappingURL=index.js.map