'use strict';

const exec = require('cp-sugar').exec;
const inputWithConfirmation = require('../utils/inquires')
    .inputWithConfirmation;

module.exports = {
    option: 'branch',
    statusText: 'Validating branch',
    defaultParam: 'master',

    configurator(currentVal) {
        return inputWithConfirmation(
            'Would you like to verify that you are publishing from the correct git branch?',
            false,
            'Which branch should it be?',
            currentVal
        );
    },

    run(expected) {
        return exec('git branch --no-color')
            .then((branches) =>
                branches
                    .split('\n')
                    .filter((branch) => branch.includes('* '))[0]
                    .replace('* ', '')
            )
            .then((branch) => {
                if (branch !== expected)
                    throw `Expected branch to be '${expected}', but it was '${branch}'.`;
            });
    },
};
