var exec           = require('child_process').exec;
var spawn          = require('child_process').spawn;
var readFile       = require('fs').readFileSync;
var elegantSpinner = require('elegant-spinner');
var logUpdate      = require('log-update');
var inquirer       = require('inquirer');
var chalk          = require('chalk');
var defaults       = require('defaults');
var PluginError    = require('gulp-util').PluginError;
var Promise        = require('pinkie-promise');
var OS             = require('os-family');
var noop           = require('noop-fn');
var emoji          = require('node-emoji').emoji;

function createSpinner (text) {
    if (module.exports.testMode)
        return noop;

    var frame = elegantSpinner();

    var animation = setInterval(function () {
        logUpdate(chalk.yellow(frame()) + ' ' + text);
    });

    animation.unref();

    return function (ok) {
        var status = ok ?
                     chalk.green(OS.win ? '√' : '✓') :
                     chalk.red(OS.win ? '×' : '✖');

        clearInterval(animation);
        logUpdate(status + ' ' + text);
        console.log();
    };
}

function throwError (msg) {
    throw new PluginError('publish-please', msg);
}

function confirmPublishing () {
    return new Promise(function (resolve) {
        var question = {
            type:    "confirm",
            name:    "publish",
            message: "Are you sure you want to publish this version to npm?",
            default: false
        };

        inquirer.prompt(question, function (answer) {
            resolve(answer.publish);
        });
    });
}

function cmd (command) {
    return new Promise(function (resolve, reject) {
        exec(command, function (err, stdout) {
            if (err)
                reject(err);
            else
                resolve(stdout.trim());
        });
    });
}

function run (command) {
    var args = command.split(/\s/);

    command = args.shift();

    var stdio = module.exports.testMode ? 'ignore' : 'inherit';
    var proc  = spawn(command, args, { stdio: stdio });

    return new Promise(function (resolve, reject) {
        proc.on('exit', function (code) {
            if (code === 0)
                resolve();
            else {
                reject(code);
            }
        })
    });
}

function validateGitTag (pkgVersion) {
    var stopSpinner = createSpinner('Validating git tag');

    return cmd('git describe --exact-match --tags HEAD')
        .catch(function () {
            stopSpinner(false);
            throw "Latest commit doesn't have git tag.";
        })
        .then(function (tag) {
            if (tag !== pkgVersion && tag !== 'v' + pkgVersion) {
                stopSpinner(false);
                throw 'Expected git tag to be `' + pkgVersion + '` or ' +
                      '`v' + pkgVersion + '`, but it was `' + tag + '`.';
            }

            stopSpinner(true);
        })
}

function validateBranch (expected) {
    var stopSpinner = createSpinner('Validating branch');

    return cmd("git branch | sed -n '/\\* /s///p'")
        .then(function (branch) {
            if (branch !== expected) {
                stopSpinner(false);
                throw 'Expected branch to be `' + expected + '`, but it was `' + branch + '`.';
            }

            stopSpinner(true);
        });
}

function checkForUncommittedChanges () {
    var stopSpinner = createSpinner('Checking for the uncommitted changes');

    // NOTE: see http://stackoverflow.com/questions/2657935/checking-for-a-dirty-index-or-untracked-files-with-git
    return cmd('git status --porcelain')
        .then(function (result) {
            if (/^(M| M)/m.test(result)) {
                stopSpinner(false);
                throw 'There are uncommitted changes in the working tree.';
            }

            stopSpinner(true);
        });
}

function checkForUntrackedFiles () {
    var stopSpinner = createSpinner('Checking for the untracked files');

    // NOTE: see http://stackoverflow.com/questions/2657935/checking-for-a-dirty-index-or-untracked-files-with-git
    return cmd('git status --porcelain')
        .then(function (result) {
            if (/^\?\?/m.test(result)) {
                stopSpinner(false);
                throw 'There are untracked files in the working tree.';
            }

            stopSpinner(true);
        });
}

function printReleaseInfo (pkgVersion) {
    return cmd('git log -1 --oneline')
        .then(function (commitInfo) {
            console.log(chalk.yellow('Release info'));
            console.log(chalk.yellow('------------'));
            console.log('  ' + chalk.magenta('Version:       ') + pkgVersion);
            console.log('  ' + chalk.magenta('Latest commit: ') + commitInfo);
            console.log();
        });
}

function readPkgVersion () {
    try {
        var version = JSON.parse(readFile('package.json').toString()).version;
    }
    catch (err) {
        throwError("Can't parse package.json: file doesn't exist or it's not a valid JSON file.");
    }

    if (!version)
        throwError('Version is not specified in package.json.');

    return version;
}

function runValidations (opts, pkgVersion) {
    var errs     = [];
    var addError = errs.push.bind(errs);

    var validations = [
        function () {
            if (opts.validateBranch)
                return validateBranch(opts.validateBranch);
        },
        function () {
            if (opts.validateGitTag)
                return validateGitTag(pkgVersion);
        },
        function () {
            if (opts.checkUncommitted)
                return checkForUncommittedChanges();
        },
        function () {
            if (opts.checkUntracked)
                return checkForUntrackedFiles();
        }
    ];

    var validationPromise = validations.reduce(function (validationPromise, validation) {
        return validationPromise
            .then(validation)
            .catch(addError);
    }, Promise.resolve());

    return validationPromise.then(function () {
        if (errs.length) {
            var msg = errs.map(function (err) {
                return '  * ' + err;
            }).join('\n');

            throwError(msg);
        }
    });
}

function runPrepublishScript (command) {
    if (!module.exports.testMode) {
        console.log(chalk.yellow('Running prepublish script'));
        console.log(chalk.yellow('--------------------------'));
    }

    return run(command)
        .then(function () {
            if (!module.exports.testMode) {
                console.log(chalk.yellow('--------------------------'));
                console.log(emoji['+1'], emoji['+1'], emoji['+1']);
                console.log();
            }
        })
        .catch(function (code) {
            throwError('Prepublish script `' + command + '` exited with code ' + code + '.');
        });
}

function getOptions (opts) {
    var rcFileContent = null;
    var rcOpts        = {};

    try {
        rcFileContent = readFile('.publishrc').toString();
    }
    catch (err) {
        // NOTE: we don't have .publishrc file, just ignore the error
    }

    if (rcFileContent) {
        try {
            rcOpts = JSON.parse(rcFileContent);
        }
        catch (err) {
            throwError('.publishrc is not a valid JSON file.');
        }

        opts = defaults(opts, rcOpts);
    }

    return defaults(opts, {
        confirm:          true,
        checkUncommitted: true,
        checkUntracked:   true,
        validateGitTag:   true,
        validateBranch:   'master',
        prepublishScript: null
    });
}

module.exports = function (opts) {
    var pkgVersion = null;

    opts = getOptions(opts);

    return Promise.resolve()
        .then(function () {
            pkgVersion = readPkgVersion();
        })
        .then(function () {
            if (opts.prepublishScript)
                return runPrepublishScript(opts.prepublishScript);
        })
        .then(function () {
            return runValidations(opts, pkgVersion);
        })
        .then(function () {
            if (!module.exports.testMode)
                return printReleaseInfo(pkgVersion);
        })
        .then(function () {
            if (opts.confirm)
                return confirmPublishing();
            else
                return true;
        })
        .then(function () {
            if (!module.exports.testMode)
                console.log('\n', emoji.tada, emoji.tada, emoji.tada);
        });
};

// Exports for the testing purposes
module.exports.cmd        = cmd;
module.exports.testMode   = false;
module.exports.getOptions = getOptions;