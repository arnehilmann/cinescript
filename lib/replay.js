var timer;

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
    rows = typeof rows !== 'undefined' ? rows : 25;

    if (timer) {
        timer.pause();
    }

    var where = 0;
    var linenum = 0;
    var timings = timing.split("\n");

    typescript = typescript.replace(/.*\n/, '[1m');

    // try to guess terminal width
    var tsc = typescript;
    tsc = tsc.replace(//g, "\n").replace(/\r/g, "\n");
    tsc = tsc.replace(/.\[..?m/g, '');
    tsc = tsc.split("\n");
    var lens = tsc.map(function(line){return line.length;});
    var max = Math.max.apply(null, lens);
    cols = (cols < max) ? max : cols;

    terminal = new Terminal({cols: cols, rows: rows, screenKeys: false});
    terminal.open(element);

    function next_line() {
        var line = timings[linenum].split(" ");
        var time = parseFloat(line[0]);
        var bytes = parseInt(line[1]);
        var text = typescript.substr(where, bytes);
        where += bytes;
        linenum += 1;
        terminal.write(text);
        if (isFinite(time) && isFinite(bytes)) {
            timer = new Timer(next_line, time*1000.0/speed);
        }
    }

    timer = new Timer(next_line, 0);
}
