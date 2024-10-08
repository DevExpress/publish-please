'use strict';

/* eslint-disable no-unused-vars */
const should = require('should');
const packageName = require('./utils/publish-please-version-under-test');
const reporter = require('../lib/reporters/elegant-status-reporter');
const rename = require('fs').renameSync;
const pathJoin = require('path').join;
const emoji = require('node-emoji').emoji;
const chalk = require('chalk');
const envType = require('../lib/reporters/env-type');
const lineSeparator = '----------------------------------';

describe('Elegant status reporter', () => {
    let nativeExit;
    let nativeConsoleLog;
    let nativeIsCI;
    let exitCode;
    let output;

    beforeEach(() => {
        console.log(`${lineSeparator} begin test ${lineSeparator}`);
        exitCode = undefined;
        output = '';
        nativeExit = process.exit;
        nativeConsoleLog = console.log;
        nativeIsCI = envType.isCI;
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
        envType.isCI = nativeIsCI;
        rename('./node_modules/chalk0', './node_modules/chalk');
        console.log(`${lineSeparator} end test ${lineSeparator}\n`);
    });
    it('Cannot run when chalk module is not found', () => {
        // Given

        // When
        const result = reporter.canRun();

        // Then
        result.should.be.false();
    });
});

describe('Elegant status reporter', () => {
    let nativeExit;
    let nativeConsoleLog;
    let exitCode;
    let output;

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
        console.log = (p1, p2, p3) => {
            // prettier-ignore
            // eslint-disable-next-line no-nested-ternary
            p2 === undefined
                ? nativeConsoleLog(p1)
                : p3 === undefined
                    ? nativeConsoleLog(p1, p2)
                    : nativeConsoleLog(p1, p2, p3);

            output = `${output}${p1 === undefined ? '' : p1}${
                p2 === undefined ? '' : p2
            }${p3 === undefined ? '' : p3}`;
        };
    });
    afterEach(() => {
        process.exit = nativeExit;
        console.log = nativeConsoleLog;
        console.log(`${lineSeparator} end test ${lineSeparator}\n`);
    });
    it('Can run when chalk module is found', () => {
        // Given

        // When
        const result = reporter.canRun();

        // Then
        result.should.be.true();
    });
    it('Should report success', () => {
        // Given
        const message = 'yo success message';

        // When
        reporter.reportSuccess(message);
        // Then
        output.should.containEql(message);
        if (process.env.CI !== 'true') {
            output.should.containEql('\u001b[32m');
        }
    });

    it('Should report error', () => {
        // Given
        const message = 'yo error message';

        // When
        reporter.reportError(message);
        // Then
        output.should.containEql(message);
        if (process.env.CI !== 'true') {
            output.should.containEql('\u001b[31m');
        }
    });

    it('Should report step', () => {
        // Given
        const message = 'yo step message';

        // When
        reporter.reportStep(message);
        // Then
        output.should.containEql(message);
        if (process.env.CI !== 'true') {
            output.should.containEql('\u001b[34m');
        }
    });

    it('Should report information', () => {
        // Given
        const message = 'yo information message';

        // When
        reporter.reportInformation(message);
        // Then
        output.should.containEql(message);
        if (process.env.CI !== 'true') {
            output.should.containEql('\u001b[7m');
        }
    });

    it('Should report as is', () => {
        // Given
        const message = 'yo line 1\nyo line 2\nyo line 3';

        // When
        reporter.reportAsIs(message);
        // Then
        output.should.containEql(message);
        if (process.env.CI !== 'true') {
            output.should.not.containEql('\u001b');
            output.should.not.containEql('[');
        }
    });

    it('Should report a running sequence', () => {
        // Given
        const message = 'running yo steps';

        // When
        reporter.reportRunningSequence(message);
        // Then
        output.should.containEql(message);
        if (process.env.CI !== 'true') {
            output.should.containEql('\u001b[33m');
        }
    });

    it('Should report a succeeded sequence', () => {
        // Given
        const message = 'yo steps passed';

        // When
        reporter.reportSucceededSequence(message);
        // Then
        output.should.containEql('-------------------');
        if (process.env.CI !== 'true') {
            output.should.containEql(emoji['+1']);
        }
    });

    it('Should report a succeeded process', () => {
        // Given
        const message = 'yo process passed';

        // When
        reporter.reportSucceededProcess(message);
        // Then
        if (process.env.CI !== 'true') {
            output.should.containEql(emoji.tada);
        }
    });

    it('Should format as elegant path', () => {
        // Given
        const path = 'publish-please>ban-sensitive-files > ggit> lodash';
        const sep = '>';
        // When
        const result = reporter.formatAsElegantPath(path, sep);
        // Then
        result.should.containEql(
            `publish-please -> ban-sensitive-files -> ggit -> ${chalk.red.bold(
                'lodash'
            )}`
        );
    });
});

describe('Elegant status reporter', () => {
    let nativeIsCI;
    beforeEach(() => {
        console.log(`${lineSeparator} begin test ${lineSeparator}`);
        nativeIsCI = envType.isCI;
    });
    afterEach(() => {
        envType.isCI = nativeIsCI;
        console.log(`${lineSeparator} end test ${lineSeparator}\n`);
    });
    it('Should run by default non CI', () => {
        // Given
        envType.isCI = () => false;
        // When
        const result = reporter.shouldRun();
        // Then
        result.should.be.true();
    });

    it('Should not run by default on CI', () => {
        // Given
        envType.isCI = () => true;
        // When
        const result = reporter.shouldRun();
        // Then
        result.should.be.false();
    });
});
