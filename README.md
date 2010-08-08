Introduction
============

ONRTest is a test module to work with Maurits Lamers' [OrionNodeRiak library](http://github.com/mauritslamers/OrionNodeRiak).

ONRTest is run within a browser environment. The ONRTest directory contains:

    index.html
    OrionNodeRiakDataSource.js
    wstest.js
    sc/
      query.js
      runtime/
      foundation/
      datasource/

The parts of Sproutcore needed to simulate SC apps are contained within the sc directory.
These have been modified to run within a browser environment by:

    - replacing all calls of sc_super(); with the "magic" equivalent:
          arguments.callee.base.apply(this, arguments);
    - including javascript dependencies in necessary order of script tags within index.html

In order to run the test, you need, of course, OrionNodeRiak, which requires node.js, and
an installation of Riak. 

Once you have node, ONR, and Riak installed...

OrionNodeRiak
-------------

In one terminal window...

Configure a server.js file and run as:

    sudo node server.js

    You may add a users file, as an authModule, adding a test user
    and password to users.js, such as:

        exports.users = {
         'root': { passwd: 'password', isRoot: true},
         'test': { passwd: 'test', isRoot: false }
        };

Riak
----

In a second terminal window...

For running on Mac OS X, at least, edit the ../bin/riak file of Riak to add a line

    ulimit -n 11360

    just after the " RUNNER_USER=" line at about line 10.

    This increases the number of processes, but requires sudo, so Riak is started as:

        sudo ./riak console

    to see output to the screen. Control-g, followed by q, will exit.

ONRTest
-------

In a third terminal window, or in an Editor/IDE...

Edit wstest.js for developing, sometimes index.html for setting dependencies, if needed.

