// Match numbers to keys with: xmodmap -pke

// Main import
import {ChildProcess} from "child_process"; // imports ChildProcess type
const exec = require('child_process').exec; // imports exec function
const spawn = require('child_process').spawn; // imports spawn function

// regex tester
function regexp_exec(pattern: string, str: string, flags: string = "img"): string[] {
    var match: RegExpExecArray;
    var results: string[] = [];
    var re: RegExp = new RegExp(pattern, flags);
    do {
        match = re.exec(str);
        if (match)
            results.push(<any>([]).concat(<any>match));
    } while (match);
    return results;
}

// gets list of all xinput devices
export function xinput_get_all_devices_id(callback: (devices_id_list: number[])=>any) {
    // gets text list
    exec('xinput --list', {timeout: 5000}, function (error: any, stdout: string, stderr: string) {
        if (stdout) {
            // parses text list
            var devices_id_list: string[] = regexp_exec('^.*id=(\\d+?)\\t.*slave.*$', stdout);
            var only_id: number[] = [];
            // adding found IDs to array
            for (var obj of devices_id_list)
                only_id.push(+obj[1]);
            // checks if callback is set
            if (callback)
                callback(only_id);
            // exits from function if the result is good
            return;
        } else if (stderr) {
            console.log('xinput-mouse-key-logger error', stderr);
        }
        // return empty array if error has happens
        if (callback)
            callback([]);
    });
}

// interface type for events list
export interface xinput_events_list {
    total_mouse_button_events: number,
    total_mouse_move_events: number,
    total_keyboard_events: number,
    keys_code: number[],
    mouse_button_codes: number[]
}

// main xinput listener
export class xinput_listener {
    private devices: number[]; // devices id
    private callback: (xinput_events_list: xinput_events_list)=>any; // callback
    private response_interval: number; // if set 0 == live mode, callback run interval!
    private events: xinput_events_list; // list of events buffer
    private destroyed: boolean = false; // destroying class status
    private send_timeout: NodeJS.Timer; // variable for interval
    private streams: ChildProcess[] = []; // already created streams array

    constructor(good_devices_id_list: number[], callback: (xinput_events_list: xinput_events_list)=>any, response_interval: number = 3000) {
        // init class variables
        this.devices = good_devices_id_list;
        this.callback = callback;
        this.response_interval = response_interval;
        this.clear_events();

        // creates all streams
        for (var id of this.devices) {
            this.create_stream(id);
        }

        // if the live mode is not set, it init first timeout
        if (this.response_interval !== 0) {
            this.send_timeout = setTimeout(()=> {
                this.check()
            }, this.response_interval);
        }

        // when node is destroyed, it destroys all streams
        process.on('exit', ()=> {
            this.destroy();
        });
    }

    // clears all buffered events
    public clear_events() {
        this.events = xinput_listener.get_clear_events();
    }

    // return clear object of events
    static get_clear_events(): xinput_events_list {
        return <xinput_events_list>{
            total_mouse_button_events: 0,
            total_mouse_move_events: 0,
            total_keyboard_events: 0,
            keys_code: [],
            mouse_button_codes: []
        };
    }

    // creates new stream
    private create_stream(id: number) {
        // runs stream with device id
        var stream: ChildProcess = spawn('xinput', ['--test', String(id)]);

        // sets event listener on data
        stream.stdout.on('data', (data: string) => {
            data = String(data); // converts bits to string
            var keys: string[] = regexp_exec("^key press\\s+(\\d+?)\\s{0,}$", data); // searches keyboard press events
            var mouse_keys: string[] = regexp_exec("^button press\\s+(\\d+?)\\s{0,}$", data); // searches mouse press events
            var mouse_moves: string[] = regexp_exec("^motion\\s{1}.*$", data); // searches mouse move events

            // if live mode is enabled
            if (this.response_interval === 0) {
                var new_events_list = xinput_listener.get_clear_events(); // create clear list of events
                // add events of keyboard keys
                for (var key of keys) {
                    new_events_list.keys_code.push(+key[1]);
                    new_events_list.total_keyboard_events++;
                }
                // adds events of mouse keys
                for (var mouse_key of mouse_keys) {
                    new_events_list.mouse_button_codes.push(+mouse_key[1]);
                    new_events_list.total_mouse_button_events++;
                }
                // adds events of mouse keys
                new_events_list.total_mouse_move_events += mouse_moves.length;
                // if new events are got, run callback
                if ((keys.length > 0 || mouse_keys.length > 0 || mouse_moves.length > 0) && this.callback)
                    this.callback(new_events_list);
            } else {
                // adds events of keys
                for (var key of keys) {
                    this.events.keys_code.push(+key[1]);
                    this.events.total_keyboard_events++;
                }
                // adds events of mouse_keys
                for (var mouse_key of mouse_keys) {
                    this.events.mouse_button_codes.push(+mouse_key[1]);
                    this.events.total_mouse_button_events++;
                }
                // adds counter of mouse move events
                this.events.total_mouse_move_events += mouse_moves.length;
            }
        });

        // sets event listener on ERROR data
        // stream.stderr.on('data', (data: string) => {
        //     console.log(`stderr: ${data}`);
        // });

        // pushed this stream to the list of streams
        this.streams.push(stream);
    }

    // sends events to callback
    private check() {
        if (!this.destroyed) {
            if (this.callback)
                this.callback(this.events);
            this.send_timeout = setTimeout(()=> {
                this.check()
            }, this.response_interval);
        }
        this.clear_events();
    }

    // destroys all streams and this class
    public destroy() {
        // trying to kill streams
        for (var stream of this.streams) {
            try {
                stream.kill();
            } catch (e) {}
        }
        // trying to clear timeout
        try {
            clearTimeout(this.send_timeout);
        } catch (e) {}
        // sets new status
        this.destroyed = true;
        // clears array of events
        this.clear_events();
    }
}