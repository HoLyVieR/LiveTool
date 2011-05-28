LiveTool
========

This is a work in progress project that aims to provide a collaborative graphic editor that can be used in a browser.

Technologies
------------

**Server :** Node.JS (v0.4.x)

**Database :** Redis

**Communication :**

 - RTMFP for P2P communication
 - Socket.IO as fallback for P2P communication 
 - Socket.IO for communication with the server.

**Library :** RaphaelJS, jQuery, Connect

Setup
-----

 - Install Redis
 - Configure Redis in /redis/index.js (Note: if you have a default installation you don't need to change anything).
 - sudo node serverstart.js