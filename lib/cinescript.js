function CineScript(typescript, timing, element, options) {
    options = options || {};

    typescript = typescript.replace(/.*\n/, ' ');
    //console.log("typescript: ..." + typescript + "...");
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
            this.running = false;
        };
        this.resume = function() {
            start = new Date();
            timerId = window.setTimeout(callback, remaining);
            this.running = true;
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
            //console.log("falling back to speed " + speed);
        }
        if (timer) {
            timer.resume();
            return;
        }

        var where = 0;
        var linenum = 0;
        var timings = timing.split("\n");
        var text = "";

        function next_line() {
            if (where < 0) {
                return;
            }
            //console.log("..." + text + "...");
            terminal.write(text);
            var line = timings[linenum].split(" ");
            var time = parseFloat(line[0]);
            var bytes = parseInt(line[1]);
            if (where > 0) {
                text = typescript.slice(where, where + bytes);
            }
            if (isFinite(time) && isFinite(bytes)) {
                where += bytes;
                linenum += 1;
                //console.log(linenum + " " + time + " " + bytes);
                timer = new Timer(next_line, time*1000.0/speed);
            } else {
                text = typescript.slice(where);
                terminal.write(text);
                //terminal.write("\r*** done ***");
                where = -1; // finished
            }
        }
        next_line();
    }

    self.pause = function() {
        timer.pause();
    }

    self.toggle = function() {
        if (timer && timer.running) {
            self.pause();
        } else {
            self.play();
        }
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
            //console.log("new speed: " + speed);
        }
        if (timer) {
            timer.resume();
        }
    }

    if (autoplay) {
        self.play();
    }
}


init_cinescripts = function() {
    $('[class="cinescript"]').each(function() {
        var container = this;
        var typescript_filename, timing_filename, options;
        typescript_filename = this.getAttribute('data-typescript');
        if (typescript_filename == undefined) {
            typescript_filename = $.getUrlVar("typescript") || "data/typescript";
            timing_filename = $.getUrlVar("timing") || "data/timing";
            options = {'autoplay': $.getUrlVar("autoplay") || false};
            options['rows'] = $.getUrlVar("rows");
            options['cols'] = $.getUrlVar("cols");
            options['speed'] = $.getUrlVar("speed");
        } else {
            timing_filename = this.getAttribute('data-timing');
            options = {'autoplay': this.getAttribute('data-autoplay') || false};
        }

        var pre = document.createElement("pre");
        this.appendChild(document.createElement("tt").appendChild(pre));

        var overlay = document.createElement("div");
        overlay.className = "overlay";
        this.appendChild(overlay);

        var restart = document.createElement("i");
        restart.className = "fa fa-fast-backward";
        var toggle = document.createElement("i");
        toggle.className = "fa fa-pause";
        var fastforward = document.createElement("i");
        fastforward.className = "fa fa-fast-forward";

        overlay.appendChild(restart);
        overlay.appendChild(toggle);
        overlay.appendChild(fastforward);

        $.get(typescript_filename, function(typescript) {
            $.get(timing_filename, function(timing) {
                if (typescript && timing) {
                    var cs = new CineScript(typescript, timing, pre, options);
                    var size = Math.min(container.clientHeight, container.clientWidth / 3);
                    restart.style.fontSize = size;
                    toggle.style.fontSize = size;
                    fastforward.style.fontSize = size;
                    $(restart).on('click', cs.restart);
                    $(toggle).on('click', cs.toggle);
                    $(fastforward).on('click', cs.skip);
                }
            }, "text");
        }, "text");
    });
};
