function CineScript(typescript, timing, element, options) {
    options = options || {};

    typescript = typescript.replace(/.*\n/, '[1m');
    speed = typeof options['speed'] !== 'undefined' ? options['speed'] : 2;
    cols = typeof options['cols'] !== 'undefined' ? options['cols'] : guess_terminal_width(typescript);
    rows = typeof options['rows'] !== 'undefined' ? options['rows'] : 25;
    autoplay = typeof options['autoplay'] !== 'undefined' ? options['autoplay'] : false;

    var terminal = new Terminal({cols: cols, rows: rows, screenKeys: false});
    terminal.open(element);

    var timer = undefined;
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

    function guess_terminal_width(tsc) {
        tsc = tsc.replace(//g, "\n").replace(/\r/g, "\n");
        tsc = tsc.replace(/.\[..?m/g, '');
        tsc = tsc.split("\n");
        var lens = tsc.map(function(line){return line.length;});
        return Math.max.apply(80, lens);
    }

    this.play = function() {
        if (timer) {
            timer.resume();
            return;
        }

        var where = 0;
        var linenum = 0;
        var timings = timing.split("\n");

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

    this.pause = function() {
        timer.pause();
    }

    this.restart = function() {
        if (timer) {
            timer.pause();
            timer = undefined;
        }
        terminal.reset();
        this.play();
    }

    if (autoplay) {
        this.play();
    }
}
