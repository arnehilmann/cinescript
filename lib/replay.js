var terminal, timer;
var speed = 2;

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
    var firstlinelen = typescript.indexOf("\n") + 1;
    var text = typescript.substr(0, firstlinelen);
    var newtext = "";
    where += firstlinelen;

    timer = new Timer(
        function() {
            terminal.write(text);
            text = newtext;
            var line = timings[linenum].split(" ");
            var time = parseFloat(line[0]);
            var bytes = parseInt(line[1]);
            if (isFinite(time) && isFinite(bytes)) {
                newtext = typescript.substr(where, bytes);
                where += bytes;
                linenum += 1;
                timer = new Timer(arguments.callee, time*1000.0/speed);
            } else {
                terminal.write(typescript.substr(where, typescript.length-where));
            }
        }, 0);
}
