cinescript
==========

or: how to showcase your terminal sessions

*plain files only, embedded in your webpage, hosted on your own server*

See the short examples:
[cowsay](http://arnehilmann.github.io/cinescript/index.html?typescript=examples/cowsay/typescript&timing=examples/cowsay/timing&rows=31&cols=106),
[vi](http://arnehilmann.github.io/cinescript/index.html?typescript=examples/vi/typescript&timing=examples/vi/timing&rows=31&cols=106),
[tmux](http://arnehilmann.github.io/cinescript/index.html?typescript=examples/tmux/typescript&timing=examples/tmux/timing&rows=31&cols=106).


tl;dr
----

1. clone [cinescript](https://github.com/arnehilmann/cinescript)

2. (for color terminals): set 16color mode with ```export TERM=xterm-16colors```

3. record a terminal session: ```script -t 2> timing```

4. include the html snippets from "template.html" in your page

5. put your recorded ```typescript``` and ```timing``` files in the ```data``` subfolder.


Customize
---------

You can specify parameters to your cinescript element via data- attributes
(see [template.html](https://github.com/arnehilmann/cinescript/blob/master/template.html)):
```
    data-typescript
    data-timing
    data-autoplay
    data-cols
    data-rows
    data-speed
```
*Note:* Your html element **must** have the ```cinescript``` class.

Or, if you want to use your terminal.html file, you can define the
filenames and some other usefull options in the URL (see the linked examples above, too):

* typescript=[string]: name of the typescript file (created by ```script``` automagically)

* timing=[string]: name of the timing file (created by the ```2> timing``` part)

* rows=[int] / cols=[int]: dimension of the terminal you ran ```script``` in; needed for
    sessions which use fancy ncurses stuff or other fullscreen magic (like vi or tmux)

* speed=[int]: speed factor for replay, default: 2


To determine the dimension of your terminal, you could use (at least under ubuntu)
```tput cols; tput lines```

Links
-----

Based on [term.js](https://github.com/chjj/term.js).
inspired by [scriptreplay](https://mister-muffin.de/scriptreplay/) and
[asciinema](https://github.com/sickill/asciinema.org)

