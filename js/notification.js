'use strict';

const notifier = require('node-notifier');
const path = require('path');
const {Notification} = require('electron');

const {
    subtractTime,
    validateTime,
    hourToMinutes
} = require('./time-math.js');
const {
    getNotificationsInterval,
    notificationIsEnabled,
    repetitionIsEnabled
} = require('./user-preferences.js');
const { getDateStr } = require('./date-aux.js');
const { getCurrentTranslation } = require('../src/configs/i18next.config.js');
const title = 'Time to Leave';
let dismissToday = null;

function notify(msg, actions = [])
{
    const appPath = process.env.NODE_ENV === 'production'
        ? `${process.resourcesPath}/app`
        : path.join(__dirname, '..');

    return new Promise((resolve, reject) =>
    {
        if (process.platform === 'win32')
        {
            notifier.notify({
                title: title,
                message: msg,
                icon: path.join(appPath, 'assets/ttl.png'), // Absolute path (doesn't work on balloons)
                sound: true, // Only Notification Center or Windows Toasters
                wait: true,
                actions: actions.map(action => action.text),
                appID: 'Time To Leave'
            }, (error, action) =>
            {
                if (error) reject(error);
                else resolve(action);
            });
        }
        else
        {
            try
            {
                new Notification({
                    title,
                    body: msg,
                    icon: path.join(appPath, 'assets/ttl.png'),
                    timeoutType: 'default',
                    sound: true,
                    actions
                }).show();
                resolve();
            }
            catch (error)
            {
                reject(error);
            }
        }
    });

}

/*
 * Notify user if it's time to leave
 */
async function notifyTimeToLeave(leaveByElement)
{
    const now = new Date();
    const dateToday = getDateStr(now);
    const skipNotify = dismissToday === dateToday;

    if (!notificationIsEnabled() || !leaveByElement || skipNotify)
    {
        return;
    }

    if (validateTime(leaveByElement))
    {
        /**
         * How many minutes should pass before the Time-To-Leave notification should be presented again.
         * @type {number} Minutes post the clockout time
         */
        const notificationInterval = getNotificationsInterval();
        const curTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

        // Let check if it's past the time to leave, and the minutes line up with the interval to check
        const minutesDiff = hourToMinutes(subtractTime(leaveByElement, curTime));
        const isRepeatingInterval = curTime > leaveByElement && (minutesDiff % notificationInterval === 0);

        if (curTime === leaveByElement || (isRepeatingInterval && repetitionIsEnabled()))
        {
            try
            {
                const dismissBtn = {type: 'button', text: getCurrentTranslation('$Notification.dismiss-for-today')};
                const actionBtn = await notify(getCurrentTranslation('$Notification.time-to-leave'), [dismissBtn]);
                if (actionBtn && dismissBtn.text.toLowerCase() !== actionBtn.toLowerCase())
                {
                    return;
                }
                dismissToday = dateToday;
            }
            catch (err)
            {
                console.error(err);
            }
        }
    }
}

module.exports = {
    notify,
    notifyTimeToLeave
};
