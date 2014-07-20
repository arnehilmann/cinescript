cinescript
==========

or: how to showcase your terminal sessions

*plain files only, embedded in your webpage, hosted on your own server*

The [minimal example showcase](http://arnehilmann.github.io/cinescript/cinescript-template.html)


tl;dr
----

```
git clone https://github.com/arnehilmann/cinescript
cd cinescript
export TERM=xterm-16color
script -t 2> timing
# type something here...
exit
mv typescript timing data-example/
firefox cinescript-template.html
```


Customize
---------

You can specify parameters to your cinescript element via data- attributes
(see [template.html](https://github.com/arnehilmann/cinescript/blob/master/cinescript-template.html)):
```
    data-typescript="path/to/typescript/file"
    data-timing="path/to/timing/file"
    data-autoplay="true|false"
    data-cols=nr_of_columns
    data-rows=nr_of_rows
    data-speed=typespeed_multiplier
    data-font-size=console_font_size
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

Based on [term.js](https://github.com/chjj/term.js),
inspired by [asciinema](https://github.com/sickill/asciinema.org)

