# The technology behind this is no longer relevant. This is archived for historical purpose.

LiveTool
========

This project is a demo that was made up to show what can be done with RTMFP. At the current stage it's a mini-graphical editor that can be used by multiple people at the same time. It was also a project to show that it can be possible to integrate RTMFP technology without sacrificing support for user that don't have Flash. 

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
