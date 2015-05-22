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

    $ ionic platform add android@3.5

Wee need to add whitelist to set permission in config.xml::

    $ ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git 

Run
---

Run::

    $ ionic emulate android
