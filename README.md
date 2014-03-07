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

1. record a terminal session: ```script -t 2> timing```

2. clone [cinescript](https://github.com/arnehilmann/cinescript)

3. include ```lib/*.js``` and ```init_cinescript()``` in your html

4. put your recorded ```typescript``` and ```timing``` files in the ```data``` subfolder.

Links
-----

Based on [term.js](https://github.com/chjj/term.js).
inspired by [scriptreplay](https://mister-muffin.de/scriptreplay/) and
[asciinema](https://github.com/sickill/asciinema.org)

