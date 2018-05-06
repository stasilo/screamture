# Screamture

This is the Screamture - a sculpture generator using sound recorded through your microphone. Featuring live visualization of the sculpture being recorded/created.

The app exports 3d models i STL binary format ready for 3d-printing in software like Cura. Note that you'll get better results not printing support structures, as is often suggested by, at least, Cura. Built using THREE.js and the web audio api.

![Example1](/assets/example.jpg?raw=true "Example")

![Example2](/assets/example.gif?raw=true "Example")

By Jakob Stasilowicz - kontakt [at] stasilo.se

## Building & running

This was done too fast & hacky to setup build tools. Just clone the repo and start a http server in the root. For example:

```sh
$ npm install -g http-server
$ cd path/to/repo/ && http-server
```
