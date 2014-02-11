var terminal, timer;
var speed = 2;

function toHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ' '+str.charCodeAt(i).toString(16);
    }
    return hex;
}

function Timer(callback, delay) {
    var timerId, start, remaining = delay;
    this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
    };
    this.resume = function() {
        start = new Date();
        timerId = window.setTimeout(callback, remaining);
    };
    this.resume();
}

function replay(typescript, timing, element, speed, cols, rows) {
    speed = typeof speed !== 'undefined' ? speed : 2;
    cols = typeof cols !== 'undefined' ? cols : 80;
    rows = typeof rows !== 'undefined' ? rows : 24;
    terminal = new Terminal({cols: cols, rows: rows, screenKeys: true});
    terminal.open(element);

    if (timer) {
        timer.pause();
    }

    var where = 0;
    var linenum = 0;
    var timings = timing.split("\n");

    function next_line() {
        var line = timings[linenum].split(" ");
        var time = parseFloat(line[0]);
        var bytes = parseInt(line[1]);
        var text = typescript.substr(where, bytes);
        console.log(text);
        where += bytes;
        linenum += 1;
        terminal.write(text);
        if (isFinite(time) && isFinite(bytes)) {
            timer = new Timer(next_line, time*1000.0/speed);
        }
    }

    timer = new Timer(next_line, 0);
}
