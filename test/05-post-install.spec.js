'use strict';

/* eslint-disable no-unused-vars */
const should = require('should');
const requireUncached = require('import-fresh');
const packageName = require('./utils/publish-please-version-under-test');
const mkdirp = require('mkdirp');
const init = require('../lib/init');
const pathJoin = require('path').join;
const writeFile = require('fs').writeFileSync;
const del = require('del');
const readPkg = require('../lib//utils/read-package-json').readPkgSync;
const nodeInfos = require('../lib/utils/get-node-infos').getNodeInfosSync();
const shouldUsePrePublishOnlyScript = nodeInfos.shouldUsePrePublishOnlyScript;
const lineSeparator = '----------------------------------';

describe.skip('Post-Install Execution', () => {
    let nativeExit;
    let nativeConsoleLog;
    let exitCode;
    let output;

    before(() => (process.env.PUBLISH_PLEASE_TEST_MODE = 'true'));
    after(() => delete process.env.PUBLISH_PLEASE_TEST_MODE);

    beforeEach(() => {
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
    });
    afterEach(() => {
        process.exit = nativeExit;
        console.log = nativeConsoleLog;
        console.log(`${lineSeparator} end test ${lineSeparator}\n`);
    });

    it(`Should return a warning message on 'npm install' after a fresh git clone of ${packageName}'`, () => {
        // Given
        process.env['npm_config_argv'] =
            '{"remain":[],"cooked":["install"],"original":["install"]}';

        // When
        requireUncached('../lib/post-install');
        // Then
        (exitCode || 0).should.be.equal(0);
        output.should.containEql('post-install hooks are ignored in dev mode');
    });

    it(`Should return an error message when the package.json file is missing on 'npm install --save-dev ${packageName}'`, () => {
        // Given
        process.env[
            'npm_config_argv'
        ] = `{"remain":["${packageName}"],"cooked":["install","--save-dev","${packageName}"],"original":["install","--save-dev","${packageName}"]}`;
        mkdirp.sync('test/tmp');
        const projectDir = pathJoin(__dirname, 'tmp');
        del.sync(pathJoin(projectDir, 'package.json'));

        // When
        init(projectDir);
        // Then
        exitCode.should.be.equal(1);
        output.should.containEql("project's package.json either missing");
    });
    it(`Should add hooks in the package.json file on 'npm install --save-dev ${packageName}'`, () => {
        // Given
        process.env[
            'npm_config_argv'
        ] = `{"remain":["${packageName}"],"cooked":["install","--save-dev","${packageName}"],"original":["install","--save-dev","${packageName}"]}`;
        mkdirp.sync('test/tmp');
        const pkg = {
            name: 'testing-repo',
            scripts: {},
        };
        const projectDir = pathJoin(__dirname, 'tmp');
        writeFile(
            pathJoin(projectDir, 'package.json'),
            JSON.stringify(pkg, null, 2)
        );

        // When
        return (
            init(projectDir)
                // Then
                .then(() => {
                    (exitCode || 0).should.be.equal(0);
                    output.should.containEql(
                        'publish-please hooks were successfully setup for the project'
                    );
                    /* prettier-ignore  */
                    const expectedHooks = shouldUsePrePublishOnlyScript
                        ? {
                            'publish-please': 'publish-please',
                            prepublishOnly: 'publish-please guard',
                        }
                        : {
                            'publish-please': 'publish-please',
                            prepublish: 'publish-please guard',
                        };

                    readPkg(projectDir).scripts.should.containEql(
                        expectedHooks
                    );
                })
        );
    });

    it(`Should add hooks in the package.json file on 'npm install --save-dev ${packageName}', even if there is no script section in package.json`, () => {
        // Given
        process.env[
            'npm_config_argv'
        ] = `{"remain":["${packageName}"],"cooked":["install","--save-dev","${packageName}"],"original":["install","--save-dev","${packageName}"]}`;
        mkdirp.sync('test/tmp');
        const pkg = {
            name: 'testing-repo',
        };
        const projectDir = pathJoin(__dirname, 'tmp');
        writeFile(
            pathJoin(projectDir, 'package.json'),
            JSON.stringify(pkg, null, 2)
        );

        // When
        return (
            init(projectDir)
                // Then
                .then(() => {
                    (exitCode || 0).should.be.equal(0);
                    output.should.containEql(
                        'publish-please hooks were successfully setup for the project'
                    );
                    /* prettier-ignore  */
                    const expectedHooks = shouldUsePrePublishOnlyScript
                        ? {
                            'publish-please': 'publish-please',
                            prepublishOnly: 'publish-please guard',
                        }
                        : {
                            'publish-please': 'publish-please',
                            prepublish: 'publish-please guard',
                        };

                    readPkg(projectDir).scripts.should.containEql(
                        expectedHooks
                    );
                })
        );
    });

    it(`Should not add/modify hooks in the package.json file on 'npm install --save-dev ${packageName}' when publish-please has already been installed`, () => {
        // Given
        process.env[
            'npm_config_argv'
        ] = `{"remain":["${packageName}"],"cooked":["install","--save-dev","${packageName}"],"original":["install","--save-dev","${packageName}"]}`;
        mkdirp.sync('test/tmp');
        const existingPrePublishScript = 'npm run my-pre-publish-script';
        const existingPrePublishOnlyScript =
            'npm run my-pre-publish-only-script';
        const pkg = {
            name: 'testing-repo',
            scripts: {
                'publish-please': 'publish-please',
                prepublish: existingPrePublishScript,
                prepublishOnly: existingPrePublishOnlyScript,
            },
        };
        const projectDir = pathJoin(__dirname, 'tmp');
        writeFile(
            pathJoin(projectDir, 'package.json'),
            JSON.stringify(pkg, null, 2)
        );

        // When
        init(projectDir);
        // Then
        (exitCode || 0).should.be.equal(0);
        output.should.not.containEql(
            'publish-please hooks were successfully setup for the project'
        );
        readPkg(projectDir).scripts.should.containEql({
            'publish-please': 'publish-please',
            prepublish: existingPrePublishScript,
            prepublishOnly: existingPrePublishOnlyScript,
        });
    });

    it(`Should preserve existing prepublish script in the package.json file on 'npm install --save-dev ${packageName}'`, () => {
        // Given
        process.env[
            'npm_config_argv'
        ] = `{"remain":["${packageName}"],"cooked":["install","--save-dev","${packageName}"],"original":["install","--save-dev","${packageName}"]}`;
        mkdirp.sync('test/tmp');
        const existingPrePublishScript = 'npm run my-pre-publish-script';
        const pkg = {
            name: 'testing-repo',
            scripts: {
                prepublish: existingPrePublishScript,
            },
        };
        const projectDir = pathJoin(__dirname, 'tmp');
        writeFile(
            pathJoin(projectDir, 'package.json'),
            JSON.stringify(pkg, null, 2)
        );

        // When
        return init(projectDir).then(() => {
            // Then
            (exitCode || 0).should.be.equal(0);
            output.should.containEql(
                'publish-please hooks were successfully setup for the project'
            );
            readPkg(projectDir).scripts.should.containEql({
                'publish-please': 'publish-please',
                prepublish: `publish-please guard && ${existingPrePublishScript}`,
            });
        });
    });

    it(`Should show a deprecation message on npm version > 5 if existing prepublish script in the package.json file on 'npm install --save-dev ${packageName}'`, () => {
        // Given
        process.env[
            'npm_config_argv'
        ] = `{"remain":["${packageName}"],"cooked":["install","--save-dev","${packageName}"],"original":["install","--save-dev","${packageName}"]}`;
        mkdirp.sync('test/tmp');
        const existingPrePublishScript = 'npm run my-pre-publish-script';
        const pkg = {
            name: 'testing-repo',
            scripts: {
                prepublish: existingPrePublishScript,
            },
        };
        const projectDir = pathJoin(__dirname, 'tmp');
        writeFile(
            pathJoin(projectDir, 'package.json'),
            JSON.stringify(pkg, null, 2)
        );

        // When
        return init(projectDir).then(() => {
            // Then
            (exitCode || 0).should.be.equal(0);
            if (shouldUsePrePublishOnlyScript) {
                output.should.containEql(
                    "See the deprecation note in 'npm help scripts'"
                );
            }
            if (!shouldUsePrePublishOnlyScript) {
                output.should.not.containEql(
                    "See the deprecation note in 'npm help scripts'"
                );
            }
        });
    });

    it(`Should not run postinstall script on 'npx ${packageName}'`, () => {
        // Given
        const npxPath = JSON.stringify(
            pathJoin('Users', 'HDO', '.npm', '_npx', '78031')
        );
        process.env[
            'npm_config_argv'
        ] = `{"remain":["${packageName}"],"cooked":["install","${packageName}","--global","--prefix",${npxPath},"--loglevel","error","--json"],"original":["install","${packageName}","--global","--prefix",${npxPath},"--loglevel","error","--json"]}`;

        // When
        requireUncached('../lib/post-install');
        // Then
        (exitCode || 0).should.be.equal(0);
        output.should.be.equal('');
    });
});
