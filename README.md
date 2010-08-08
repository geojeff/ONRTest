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

Clone the [OrionNodeRiak repository](http://github.com/mauritslamers/OrionNodeRiak).

Configure a server.js file and run as:

    sudo node server.js

    You may add a users file, as an authModule, adding a test user
    and password to users.js, such as:

        exports.users = {
         'root': { passwd: 'password', isRoot: true},
         'test': { passwd: 'test', isRoot: false }
        };

    Add a reference to user.js in server.js, following the ONR example.

Riak
----

In a second terminal window...

For running on Mac OS X, at least, edit the ../bin/riak file of Riak to add a line

    ulimit -n 11360

    just after the " RUNNER_USER=" line at about line 10.

    This increases the number of processes, but requires sudo, so Riak is started as:

        sudo ./riak console

    to see output to the screen. Control-g, followed by q, will exit.

If you would like to install innostore, which we found does speed up things significantly,
you would follow these steps, depending on version:

    wget http://downloads.basho.com/innostore/innostore-1.0.0/innostore-1.0.0.tar.gz
    tar xvfz innostore-1.0.0.tar.gz 
    cd innostore-1.0.0
    make
    ./rebar install target=./rebar install target=$RIAK/lib
    ./rebar install target=/Users/geojeff/Development/riak-0.11.0-osx-x86_64/lib
    cd ..
    cd riak-0.11.0-osx-x86_64/
    cd etc
    vi app.config
    
        Add this within the Riak KV config session, as per Innostore README,

        {storage_backend, riak_kv_innostore_backend},

A nice thing about using Innostore is the way there are individual files for buckets.

ONRTest
-------

In a third terminal window...

Copy OrionNodeRiakDataStore.js from your OrionNodeRiak clone to your ONRTest dir.

Edit wstest.js for developing, sometimes index.html for setting dependencies, if needed.

Browser
-------

Use a recent Safari, Chrome, or other websocket-capable browser, to load index.html,
which contains <script> tags in the correct order to load dependencies. At the bottom
of the head section is a call to wstest.start(). Have the javascript console open to
see messages. (You will also see messages in your OrionNodeRiak terminal window).
