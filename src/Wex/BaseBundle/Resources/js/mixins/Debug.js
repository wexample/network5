// Init early.
(() => {
    // Shortened debug methods.
    let shortcuts = {
            log: 'log',
            error: 'err',
            debug: 'deb',
            warn: 'warn',
            info: 'info',
            trace: 'trace',
        },
        console = window.console;
    // Loop through shortcuts.
    for (let key of Object.keys(shortcuts)) {
        // Save shortcut functions.
        window[shortcuts[key]] = (function (key) {
            // Build a new custom function.
            return function (msg) {
                return console[key](msg);
            };
        })(key);
    }

    window.dump = window.log;
    window.dd = function () {
        window.dump.call(this, arguments);
        throw 'Script manually stopped';
    }
})();

export default {
    name: 'debug',
};
