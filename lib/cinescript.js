function CineScript(typescript, timing, element, options) {
    options = options || {};

    typescript = typescript.replace(/.*\n/, '[1m');
    speed = typeof options['speed'] !== 'undefined' ? options['speed'] : 2;
    cols = typeof options['cols'] !== 'undefined' ? options['cols'] : guess_terminal_width(typescript);
    rows = typeof options['rows'] !== 'undefined' ? options['rows'] : 25;
    autoplay = typeof options['autoplay'] !== 'undefined' ? options['autoplay'] : false;
    orig_speed = undefined;

    var FAST = 1000;

    var terminal = new Terminal({cols: cols, rows: rows, screenKeys: false});
    terminal.open(element);

    var self = this;

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

    self.play = function() {
        if (typeof orig_speed !== 'undefined') {
            speed = orig_speed;
            orig_speed = undefined;
            console.log("falling back to speed " + speed);
        }
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

    self.pause = function() {
        timer.pause();
    }

    self.restart = function() {
        if (timer) {
            timer.pause();
            timer = undefined;
        }
        terminal.reset();
        self.play();
    }

    self.skip = function() {
        if (speed < FAST) {
            orig_speed = speed;
            speed = FAST;
            console.log("new speed: " + speed);
        }
        if (timer) {
            timer.resume();
        }
    }

    if (autoplay) {
        self.play();
    }
}


init_cinescript = function(element, options) {
    options = options || {'autoplay': true};
    var typescript_filename = $.getUrlVar("typescript") || "data/typescript";
    var timing_filename = $.getUrlVar("timing") || "data/timing";
    var rows = $.getUrlVar("rows");
    if (rows) {
        options['rows'] = rows;
    }
    $.get(typescript_filename, function(typescript) {
        $.get(timing_filename, function(timing) {
            if (typescript && timing) {
                var cs = new CineScript(typescript, timing, element, options);
                $('.emit-restart').on('click', cs.restart);
                $('.emit-play').on('click', cs.play);
                $('.emit-pause').on('click', cs.pause);
                $('.emit-skip').on('click', cs.skip);
            }
        }, "text");
    }, "text");
};
