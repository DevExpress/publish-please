'use strict';

module.exports.isInTestMode = isInTestMode;

function isInTestMode() {
    try {
        if (
            process &&
            process.env &&
            Boolean(process.env.PUBLISH_PLEASE_TEST_MODE) === true
        ) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}
