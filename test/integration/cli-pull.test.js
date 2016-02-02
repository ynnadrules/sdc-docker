/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright 2016, Joyent, Inc.
 */

/*
 * Integration tests for 'docker pull'.
 */

var format = require('util').format;
var test = require('tape');

var h = require('./helpers');
var cli = require('../lib/cli');



// --- Tests


test('docker pull', function (tt) {

    tt.test('setup: alice init', cli.init);

    /**
     * Check for reasonable error messages for some 'docker pull' failures.
     * Some related issues: DOCKER-639, DOCKER-689
     */
    tt.test('docker pull no-such-repo (error message)', function (t) {
        cli.docker('pull no-such-repo', function (err, stdout, stderr) {
            var unauthorizedCode;
            var unauthorizedMsg;

            /*
             * Actually expect a zero exit status, because `docker pull`s
             * JSON progress protocol doesn't handle communicating an error,
             * AFAIK.
             */
            t.ifError(err, 'expected successful pull');

            unauthorizedCode = /UNAUTHORIZED/.test(stdout);

            //JSSTYLED
            unauthorizedMsg = /access to the requested resource is not authorized/.test(stdout);

            t.ok(unauthorizedCode, 'error code is "UNAUTHORIZED"'
                + (unauthorizedCode ? '' : ', got: ' + stdout));

            t.ok(unauthorizedMsg,
                'error message matches "access ... not authorized"'
                + (unauthorizedMsg ? '' : ', got: ' + stdout));

            t.end();
        });
    });

    tt.test('docker pull quay.io/no-such-user (error message)', function (t) {
        cli.docker('pull quay.io/no-such-user',
                function (err, stdout, stderr) {
            var match;

            // expect zero exit status, see above
            t.ifError(err, 'expected successful pull');

            // JSSTYLED
            match = /Not Found \(404\) error from registry quay.io trying to pull no-such-user/.test(stdout);

            t.ok(match, 'expected that error is "Not Found ..."'
                + (match ? '' : format(', got: %j', stdout)));
            t.end();
        });
    });

    tt.test('docker pull nope.example.com/nope (error message)', function (t) {
        cli.docker('pull nope.example.com/nope',
            function (err, stdout, stderr) {
            var notFound;

            // expect zero exit status, see above
            t.ifError(err, 'expected successful pull');

            // JSSTYLED
            notFound
                = /\(ENOTFOUND\) nope.example.com host not found/.test(stdout);
            t.ok(notFound, 'error is "ENOTFOUND"'
                + (notFound ? '' : ', got: ' + stdout));
            t.end();
        });
    });

});