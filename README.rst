Crapstore
=========

This is the manual to build crabstore a google market client.

Setup
-----

We need to use android in version 3.5 because we need to set the user agent and
this it not pissible with the latest codova-android or crosswalk.

Download android sdk and install sdk-tools api 19 aka 4.4.2.

Download node and npm.

Install
-------

Set path::

    $ export PATH=${PATH}:/opt/develop/privat/android-sdk-linux/platform-tools:/opt/develop/privat/android-sdk-linux/tools

Set install ionic::

    $ npm install -g ionic

Add platform::

    $ ionic platform add android

We need to add whitelist to set permission in config.xml::

    $ ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git 
    $ ionic plugin add cordova-plugin-file-transfer

See log:

    $ adb logcat

Edit file transfer java:

    platforms/android/src/org/apache/cordova/filetransfer/FileTransfer.java

Run
---

Run::

    $ ionic emulate android

Run local with proxy
--------------------

Ionic uses a proxy middleware but i wasn't able to get it running properly :/

``ionic/node_modules/proxy-middleware/index.js``

Configure app to use proxy http://ionicframework.com/docs/cli/test.html

To get the google api running we also need to set the user-agent there is a
plugin for ff to do that.

https://addons.mozilla.org/de/firefox/addon/user-agent-overrider/

Icons & splash
--------------

Icon sollte 192x192 px haben und splash 2208x2208

Erstellen::
    
    $ ionic resources --icon
    $ ionic resources --splash

Testing
-------

First we install all needed dependencies::

    $ npm install

Now we are able to run tests::

    $ node_modules/gulp/bin/gulp.js test 

Build after checkout
--------------------
::

    $ ionic state restore
    $ ionic state restore --plugins
