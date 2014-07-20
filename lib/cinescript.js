function CineScript(typescript, timing, options, container) {
    var FONTRATIO = 3;
    options = options || {};
    var self = this;

    var pre = document.createElement("pre");
    container.appendChild(document.createElement("tt").appendChild(pre));

    $(container).data("cinescript", self);

    typescript = typescript.replace(/.*\n/, ' ');
    //console.log("typescript: ..." + typescript + "...");
    var speed = (options['speed'] != null ? options['speed'] : 2);
    var cols = typeof options['cols'] !== 'undefined' ? options['cols'] : guess_terminal_width(typescript);
    var rows = typeof options['rows'] !== 'undefined' ? options['rows'] : 25;
    var autoplay = typeof options['autoplay'] !== 'undefined' ? options['autoplay'] : false;
    var showcontrols = (options['show-controls'] != null ? options['show-controls'] : true);
    var orig_speed = undefined;
    var fontsize = (options['font-size'] != null ? options["font-size"] : "auto");

    speed = Math.max(+speed, 1);
    cols = +cols;
    rows = +rows;

    console.log("speed: " + speed);
    var FAST = 1000;

    var terminal = new Terminal({cols: cols, rows: rows, screenKeys: false});
    terminal.open(pre);

    var timer = undefined;
    function Timer(callback, delay) {
        var timerId, start, remaining = delay;
        this.running = false;
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
        if (fontsize == "auto") {
            var new_size = Math.floor(FONTRATIO * $(container).width() / cols);
            if (new_size > 0) {
                fontsize = new_size + "px";
            }
        }
        console.log("setting font-size to " + fontsize);
        $(container).css("font-size", fontsize);

        if (typeof orig_speed !== 'undefined') {
            speed = orig_speed;
            orig_speed = undefined;
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
            try {
                terminal.write(text);
            } catch(err) {
                console.log(err);
            }
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
                timer = undefined;
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

    if (showcontrols) {
        var overlay = document.createElement("div");
        overlay.className = "overlay";
        container.appendChild(overlay);

        var restart = document.createElement("i");
        restart.className = "fa fa-fast-backward";
        var toggle = document.createElement("i");
        toggle.className = "fa fa-pause";
        var fastforward = document.createElement("i");
        fastforward.className = "fa fa-fast-forward";

        var controls = document.createElement("span");
        controls.appendChild(restart);
        controls.appendChild(toggle);
        controls.appendChild(fastforward);

        overlay.appendChild(controls);
        $(restart).on('click', self.restart);
        $(toggle).on('click', self.toggle);
        $(fastforward).on('click', self.skip);
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
            options['show-controls'] = $.getUrlVar('show-controls');
        } else {
            timing_filename = this.getAttribute('data-timing');
            options = {'autoplay': this.getAttribute('data-autoplay') || false};
            options['rows'] = this.getAttribute("data-rows") || undefined;
            options['cols'] = this.getAttribute("data-cols") || undefined;
            options['speed'] = this.getAttribute("data-speed") || undefined;
            options['show-controls'] = this.getAttribute('data-show-controls');
            options['font-size'] = this.getAttribute('data-font-size');
        }

        $.get(typescript_filename, function(typescript) {
            $.get(timing_filename, function(timing) {
                if (typescript && timing) {
                    new CineScript(typescript, timing, options, container);
                }
            }, "text");
        }, "text");
    });
};

trigger_cinescripts = function(event) {
    var cs_elements = $(event.currentSlide).find(".cinescript");
    if (cs_elements.length > 0) {
        for (var i=0; i<cs_elements.length; i++) {
            var cs_element = cs_elements[i];
            var cinescript = $(cs_element).data("cinescript");
            if (cinescript) {
                cinescript.restart();
            }
        };
    }
};

