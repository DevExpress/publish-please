'use strict';

/* eslint-disable no-unused-vars */
const should = require('should');
const npmArgs = require('../lib/utils/get-npm-args');
const packageName = require('./utils/publish-please-version-under-test');
const pathJoin = require('path').join;
const lineSeparator = '----------------------------------';

describe('npm args parser util', () => {
    let processEnv;
    beforeEach(() => {
        console.log(`${lineSeparator} begin test ${lineSeparator}`);
    });
    afterEach(() => {
        console.log(`${lineSeparator} end test ${lineSeparator}\n`);
        processEnv = {};
    });
    it('Should return an empty object when process.env is undefined', () => {
        // Given
        processEnv = undefined;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.should.be.empty();
    });
    it('Should parse the command `npm publish`', () => {
        // Given
        processEnv['npm_command'] = 'publish';
        // When
        const args = npmArgs(processEnv);
        // Then
        args.publish.should.be.true();
        args.install.should.be.false();
        args.runScript.should.be.false();
        args.npx.should.be.false();
        args['--with-publish-please'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
    it('Should parse the command `npm publish --with-publish-please`', () => {
        // Given
        processEnv['npm_command'] = 'publish';
        processEnv['npm_config_with_publish_please'] = true;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.publish.should.be.true();
        args.install.should.be.false();
        args.runScript.should.be.false();
        args.npx.should.be.false();
        args['--with-publish-please'].should.be.true();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
    it('Should parse the command `npm run preinstall`', () => {
        // Given
        processEnv['npm_command'] = 'run-script';
        // When
        const args = npmArgs(processEnv);
        // Then
        args.publish.should.be.false();
        args.install.should.be.false();
        args.runScript.should.be.true();
        args.npx.should.be.false();
        args['--save-dev'].should.be.false();
        args['--save'].should.be.false();
        args['--global'].should.be.false();
        args['--with-publish-please'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
    it('Should parse the command `npm install`', () => {
        // Given
        processEnv['npm_command'] = 'install';
        // When
        const args = npmArgs(processEnv);
        // Then
        args.publish.should.be.false();
        args.install.should.be.true();
        args.runScript.should.be.false();
        args.npx.should.be.false();
        args['--save-dev'].should.be.false();
        args['--save'].should.be.false();
        args['--global'].should.be.false();
        args['--with-publish-please'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
    it('Should parse the command `npm i`', () => {
        // Given
        processEnv['npm_command'] = 'install';
        // When
        const args = npmArgs(processEnv);
        // Then
        args.publish.should.be.false();
        args.install.should.be.true();
        args.runScript.should.be.false();
        args.npx.should.be.false();
        args['--save-dev'].should.be.false();
        args['--save'].should.be.false();
        args['--global'].should.be.false();
        args['--with-publish-please'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
    it(`Should parse the command 'npm install --save-dev devexpress-${packageName}'`, () => {
        // Given
        processEnv['npm_command'] = 'install';
        processEnv['npm_config_save_dev'] = true;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.install.should.be.true();
        args.publish.should.be.false();
        args.runScript.should.be.false();
        args.npx.should.be.false();
        args['--save-dev'].should.be.true();
        args['--save'].should.be.false();
        args['--global'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
    it(`Should parse the command 'npm i -D devexpress-${packageName}'`, () => {
        // Given
        processEnv['npm_command'] = 'install';
        processEnv['npm_config_save_dev'] = true;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.install.should.be.true();
        args.publish.should.be.false();
        args.runScript.should.be.false();
        args.npx.should.be.false();
        args['--save-dev'].should.be.true();
        args['--save'].should.be.false();
        args['--global'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
    it(`Should parse the command 'npm install --global devexpress-${packageName}'`, () => {
        // Given
        processEnv['npm_command'] = 'install';
        processEnv['npm_config_global'] = true;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.install.should.be.true();
        args.publish.should.be.false();
        args.runScript.should.be.false();
        args.npx.should.be.false();
        args['--global'].should.be.true();
        args['--save-dev'].should.be.false();
        args['--save'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
    it(`Should parse the command 'npm i -g devexpress-${packageName}'`, () => {
        // Given
        processEnv['npm_command'] = 'install';
        processEnv['npm_config_global'] = true;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.install.should.be.true();
        args.publish.should.be.false();
        args.runScript.should.be.false();
        args.npx.should.be.false();
        args['--global'].should.be.true();
        args['--save-dev'].should.be.false();
        args['--save'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
    it("Should parse the command 'npm run publish-please --dry-run'", () => {
        // Given
        processEnv['npm_command'] = 'run-script';
        processEnv['npm_config_dry_run'] = true;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.install.should.be.false();
        args.publish.should.be.false();
        args.runScript.should.be.true();
        args.npx.should.be.false();
        args['--global'].should.be.false();
        args['--save-dev'].should.be.false();
        args['--save'].should.be.false();
        args['--dry-run'].should.be.true();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
    it("Should parse the command 'npm run publish-please --ci'", () => {
        // Given
        processEnv['npm_command'] = 'run-script';
        processEnv['npm_config_ci'] = true;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.install.should.be.false();
        args.publish.should.be.false();
        args.runScript.should.be.true();
        args.npx.should.be.false();
        args['--global'].should.be.false();
        args['--save-dev'].should.be.false();
        args['--save'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.true();
        args['config'].should.be.false();
    });
    it("Should parse the command 'npm run publish-please --dry-run --ci'", () => {
        // Given
        processEnv['npm_command'] = 'run-script';
        processEnv['npm_config_dry_run'] = true;
        processEnv['npm_config_ci'] = true;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.install.should.be.false();
        args.publish.should.be.false();
        args.runScript.should.be.true();
        args.npx.should.be.false();
        args['--global'].should.be.false();
        args['--save-dev'].should.be.false();
        args['--save'].should.be.false();
        args['--dry-run'].should.be.true();
        args['--ci'].should.be.true();
        args['config'].should.be.false();
    });
    it("Should parse the command 'npm run publish-please config'", () => {
        // Given
        processEnv['npm_command'] = 'run-script';
        processEnv['npm_config_config'] = true;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.install.should.be.false();
        args.publish.should.be.false();
        args.runScript.should.be.true();
        args.npx.should.be.false();
        args['--global'].should.be.false();
        args['--save-dev'].should.be.false();
        args['--save'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.true();
    });

    it.skip("Should parse the command 'npx publish-please'", () => {
        // Given
        const npxPath = JSON.stringify(
            pathJoin('Users', 'HDO', '.npm', '_npx', '78031')
        );
        processEnv[
            'npm_config_argv'
        ] = `{"remain":["publish-please"],"cooked":["install","publish-please","--global","--prefix",${npxPath},"--loglevel","error","--json"],"original":["install","publish-please","--global","--prefix",${npxPath},"--loglevel","error","--json"]}`;
        // When
        const args = npmArgs(processEnv);
        // Then
        args.install.should.be.true();
        args.publish.should.be.false();
        args.runScript.should.be.false();
        args.npx.should.be.true();
        args['--global'].should.be.true();
        args['--save-dev'].should.be.false();
        args['--save'].should.be.false();
        args['--dry-run'].should.be.false();
        args['--ci'].should.be.false();
        args['config'].should.be.false();
    });
});
