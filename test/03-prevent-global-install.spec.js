'use strict';

/* eslint-disable no-unused-vars */
const should = require('should');
const packageName = require('./utils/publish-please-version-under-test');
const preventGlobalInstall = require('../lib/prevent-global-install');
const rename = require('fs').renameSync;
const pathJoin = require('path').join;
const lineSeparator = '----------------------------------';

describe('Prevent Global Install', () => {
    let originalEnv;
    let nativeExit;
    let nativeConsoleLog;
    let exitCode;
    let output;

    beforeEach(() => {
        originalEnv = Object.assign({}, process.env);
        console.log(`${lineSeparator} begin test ${lineSeparator}`);
        exitCode = undefined;
        output = '';
        nativeExit = process.exit;
        nativeConsoleLog = console.log;
        process.exit = (val) => {
            // nativeConsoleLog(val);
            if (exitCode === undefined) exitCode = val;
        };
        console.log = (p1, p2) => {
            p2 === undefined ? nativeConsoleLog(p1) : nativeConsoleLog(p1, p2);
            output = output + p1;
        };
        delete require.cache[require.resolve('chalk')];
        rename('./node_modules/chalk', './node_modules/chalk0');
    });
    afterEach(() => {
        process.exit = nativeExit;
        console.log = nativeConsoleLog;
        rename('./node_modules/chalk0', './node_modules/chalk');
        console.log(`${lineSeparator} end test ${lineSeparator}\n`);
        process.env = Object.assign({}, originalEnv);
    });
    it(`Should not throw an error when chalk module is not found on 'npm install -g devexpress-${packageName}'`, () => {
        // Given
        process.env['npm_command'] = 'install';
        process.env['npm_config_global'] = true;
        // When
        preventGlobalInstall();
        // Then
        exitCode.should.be.equal(1);
        output.should.containEql("publish-please can't be installed globally");
    });

    it(`Should not throw an error when chalk module is not found on 'npm install --save-dev devexpress-${packageName}'`, () => {
        // Given
        process.env['npm_command'] = 'install';
        process.env['npm_config_save_dev'] = true;
        delete process.env['npm_config_global'];

        // When
        preventGlobalInstall();
        // Then
        (exitCode || 0).should.be.equal(0);
        output.should.be.equal('');
    });

    it.skip(`Should not throw an error when chalk module is not found on 'npx ${packageName}'`, () => {
        // Given
        const npxPath = JSON.stringify(
            pathJoin('Users', 'HDO', '.npm', '_npx', '78031')
        );
        process.env[
            'npm_config_argv'
        ] = `{"remain":["${packageName}"],"cooked":["install","${packageName}","--global","--prefix",${npxPath},"--loglevel","error","--json"],"original":["install","${packageName}","--global","--prefix",${npxPath},"--loglevel","error","--json"]}`;

        // When
        preventGlobalInstall();
        // Then
        (exitCode || 0).should.be.equal(0);
        output.should.be.equal('');
    });
});
