'use strict';

/* eslint-disable no-unused-vars */
const pathJoin = require('path').join;
const should = require('should');
const writeFile = require('fs').writeFileSync;
const getOptions = require('../lib/publish-options').getOptions;
const { mkdirp } = require('mkdirp');
const del = require('del');
const readPkg = require('../lib/utils/read-package-json').readPkgSync;

const lineSeparator = '----------------------------------';

/* eslint-disable max-nested-callbacks */
describe('package.json file reader', () => {
    let originalWorkingDirectory;
    let projectDir;
    before(() => {
        originalWorkingDirectory = process.cwd();
        projectDir = pathJoin(__dirname, 'tmp', 'pkg01');
        mkdirp.sync(projectDir);
    });
    beforeEach(() => {
        console.log(`${lineSeparator} begin test ${lineSeparator}`);
        del.sync(pathJoin(projectDir, 'package.json'));
    });
    afterEach(() => {
        process.chdir(originalWorkingDirectory);
        console.log(`${lineSeparator} end test ${lineSeparator}\n`);
    });
    after(() => console.log(`cwd is restored to: ${process.cwd()}`));

    it('Should throw an error when package.json is missing', () => {
        // Given

        // When
        return Promise.resolve()
            .then(() => readPkg(projectDir))
            .then(() => {
                throw new Error('Promise rejection expected');
            })
            .catch((err) => {
                // Then I should receive an error message
                return err.message.should.containEql(
                    "package.json file doesn't exist."
                );
            });
    });

    it('Should throw an error when package.json is badly formed', () => {
        // Given
        const content = '<bad json>';
        const pkgFile = pathJoin(projectDir, 'package.json');
        writeFile(pkgFile, content);

        // When
        return Promise.resolve()
            .then(() => readPkg(projectDir))
            .then(() => {
                throw new Error('Promise rejection expected');
            })
            .catch((err) => {
                // Then I should receive an error message
                return err.message.should.containEql(
                    'package.json is not a valid JSON file.'
                );
            });
    });

    it('Should read package.json file', () => {
        // Given
        const expectedPackage = {
            name: 'testcafe',
            description:
                'Automated browser testing for the modern web development stack.',
            license: 'MIT',
            version: '0.23.0',
            author: {
                name: 'Developer Express Inc.',
                url: 'https://www.devexpress.com/',
            },
            bugs: {
                url: 'https://github.com/DevExpress/testcafe/issues',
            },
            homepage: 'https://devexpress.github.io/testcafe/',
            repository: {
                type: 'git',
                url: 'git+https://github.com/DevExpress/testcafe.git',
            },
            engines: {
                node: '>=6.0.0',
            },
            main: 'lib/index',
            types: 'ts-defs/index.d.ts',
            bin: {
                testcafe: './bin/testcafe-with-v8-flag-filter.js',
            },
            files: ['lib', 'bin', 'ts-defs'],
            keywords: [
                'automated',
                'functional',
                'browser',
                'browsers',
                'website',
                'webapp',
                'testing',
                'automation',
                'test',
                'runner',
                'tdd',
                'assert',
                'assertion',
                'QA',
                'ES6',
                'ES2015',
                'async',
                'await',
            ],
            scripts: {
                test: 'gulp travis',
                'publish-please': 'publish-please',
                prepublishOnly: 'publish-please guard',
            },
            dependencies: {
                'async-exit-hook': '^1.1.2',
                'babel-core': '^6.22.1',
                'babel-plugin-transform-class-properties': '^6.24.1',
                'babel-plugin-transform-for-of-as-array': '^1.1.1',
                'babel-plugin-transform-runtime': '^6.22.0',
                'babel-preset-env': '^1.1.8',
                'babel-preset-flow': '^6.23.0',
                'babel-preset-stage-2': '^6.22.0',
                'babel-runtime': '^6.22.0',
                'bin-v8-flags-filter': '^1.1.2',
                callsite: '^1.0.0',
                'callsite-record': '^4.0.0',
                chai: '^4.1.2',
                chalk: '^1.1.0',
                'chrome-emulated-devices-list': '^0.1.0',
                'chrome-remote-interface': '^0.25.3',
                coffeescript: '^2.3.1',
                commander: '^2.8.1',
                debug: '^2.2.0',
                dedent: '^0.4.0',
                del: '^3.0.0',
                'elegant-spinner': '^1.0.1',
                'endpoint-utils': '^1.0.2',
                'error-stack-parser': '^1.3.6',
                globby: '^3.0.1',
                'graceful-fs': '^4.1.11',
                'gulp-data': '^1.3.1',
                'indent-string': '^1.2.2',
                'is-ci': '^1.0.10',
                'is-glob': '^2.0.1',
                lodash: '^4.17.10',
                'log-update-async-hook': '^2.0.2',
                'make-dir': '^1.3.0',
                'map-reverse': '^1.0.1',
                moment: '^2.10.3',
                'moment-duration-format-commonjs': '^1.0.0',
                mustache: '^2.1.2',
                nanoid: '^1.0.1',
                'node-version': '^1.0.0',
                'os-family': '^1.0.0',
                parse5: '^1.5.0',
                pify: '^2.3.0',
                pinkie: '^2.0.4',
                pngjs: '^3.3.1',
                'promisify-event': '^1.0.0',
                'ps-node': '^0.1.6',
                'qrcode-terminal': '^0.10.0',
                'read-file-relative': '^1.2.0',
                replicator: '^1.0.0',
                'resolve-cwd': '^1.0.0',
                'resolve-from': '^4.0.0',
                'sanitize-filename': '^1.6.0',
                'source-map-support': '^0.5.5',
                'strip-bom': '^2.0.0',
                'testcafe-browser-tools': '1.6.5',
                'testcafe-hammerhead': '14.3.1',
                'testcafe-legacy-api': '3.1.8',
                'testcafe-reporter-json': '^2.1.0',
                'testcafe-reporter-list': '^2.1.0',
                'testcafe-reporter-minimal': '^2.1.0',
                'testcafe-reporter-spec': '^2.1.1',
                'testcafe-reporter-xunit': '^2.1.0',
                'time-limit-promise': '^1.0.2',
                tmp: '0.0.28',
                'tree-kill': '^1.1.0',
                typescript: '^2.2.2',
                useragent: '^2.1.7',
            },
            devDependencies: {
                '@types/chai': '^3.5.2',
                'babel-eslint': '^7.1.1',
                'babel-plugin-add-module-exports': '^0.2.0',
                'basic-auth': '^1.1.0',
                'body-parser': '^1.17.1',
                'broken-link-checker': '^0.7.0',
                'browserstack-connector': '^0.1.5',
                caller: '^1.0.1',
                'chai-string': '^1.5.0',
                connect: '^3.4.0',
                'cross-spawn': '^4.0.0',
                'dom-walk': '^0.1.1',
                'eslint-plugin-hammerhead': '0.1.10',
                express: '^4.13.3',
                'express-ntlm': '^2.1.5',
                gulp: '^4.0.0',
                'gulp-babel': '^6.1.1',
                'gulp-clone': '^2.0.1',
                'gulp-eslint': '^4.0.0',
                'gulp-gh-pages': '^0.5.4',
                'gulp-git': '^2.4.2',
                'gulp-less': '^4.0.0',
                'gulp-ll-next': '^2.1.0',
                'gulp-mocha': '^5.0.0',
                'gulp-mocha-simple': '^1.0.0',
                'gulp-mustache': '^3.0.1',
                'gulp-prompt': '^1.0.1',
                'gulp-qunit-harness': '^1.0.2',
                'gulp-rename': '^1.3.0',
                'gulp-sourcemaps': '^2.6.4',
                'gulp-step': '^1.0.1',
                'gulp-uglify': '^3.0.0',
                'gulp-util': '^3.0.7',
                'gulp-webmake': '0.0.4',
                'http-server': '^0.11.1',
                'js-yaml': '^3.6.1',
                'license-checker': '^20.0.0',
                markdownlint: '>=0.0.8',
                'merge-stream': '^1.0.1',
                minimist: '^1.2.0',
                multer: '^1.1.0',
                'npm-auditor': '^1.1.1',
                'openssl-self-signed-certificate': '^1.1.6',
                opn: '^4.0.2',
                'publish-please': 'file:publish-please-5.0.0.tgz',
                'recursive-copy': '^2.0.5',
                request: '^2.58.0',
                'run-sequence': '^1.2.2',
                'saucelabs-connector': '^0.2.0',
                'serve-static': '^1.10.0',
                'stack-chain': '^2.0.0',
                'strip-ansi': '^3.0.0',
                webmake: '0.3.42',
            },
        };
        const pkgFile = pathJoin(projectDir, 'package.json');
        writeFile(pkgFile, JSON.stringify(expectedPackage, null, 2));

        // When
        return (
            Promise.resolve()
                .then(() => readPkg(projectDir))
                // Then
                .then((result) => {
                    result.should.containDeep(expectedPackage);
                })
                // when
                .then(process.chdir(projectDir))
                .then(() => readPkg())
                // Then
                .then((result) => {
                    result.should.containDeep(expectedPackage);
                })
        );
    });
});
