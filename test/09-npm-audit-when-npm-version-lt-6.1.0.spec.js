'use strict';

/* eslint-disable no-unused-vars */
const should = require('should');
const { mkdirp } = require('mkdirp');
const pathJoin = require('path').join;
const del = require('del');
const audit = require('../lib/utils/npm-audit');
const nodeInfos = require('../lib/utils/get-node-infos').getNodeInfosSync();
const writeFile = require('fs').writeFileSync;
const lineSeparator = '----------------------------------';

if (!nodeInfos.npmAuditHasJsonReporter) {
    describe.skip('npm audit analyzer when npm is < 6.1.0', () => {
        let originalWorkingDirectory;
        let projectDir;

        before(() => {
            originalWorkingDirectory = process.cwd();
            projectDir = pathJoin(__dirname, 'tmp', 'audit03');
            mkdirp.sync(projectDir);
        });
        beforeEach(() => {
            console.log(`${lineSeparator} begin test ${lineSeparator}`);
            del.sync(pathJoin(projectDir, 'package.json'));
            del.sync(pathJoin(projectDir, 'package-lock.json'));
            del.sync(pathJoin(projectDir, '.auditignore'));
            del.sync(pathJoin(projectDir, 'audit.opts'));
        });
        afterEach(() => {
            process.chdir(originalWorkingDirectory);
            console.log(`${lineSeparator} end test ${lineSeparator}\n`);
        });
        after(() => console.log(`cwd is restored to: ${process.cwd()}`));
        it('Cannot audit a project on npm < 6.1.0', () => {
            // Given
            const pkg = {
                name: 'testing-repo',
                scripts: {},
            };
            writeFile(
                pathJoin(projectDir, 'package.json'),
                JSON.stringify(pkg, null, 2)
            );

            // When
            return (
                Promise.resolve()
                    .then(() => audit(projectDir))

                    // Then
                    .then((result) => {
                        // prettier-ignore
                        nodeInfos.isAtLeastNpm6
                            // npm audit reports only with parseable reporter not json reporter
                            ? result.error.summary.should.containEql('Unexpected token = in JSON at position 104')
                            : result.error.summary.should.containEql('Command failed: npm audit');
                    })
            );
        });
    });
}
