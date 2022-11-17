/* eslint-disable no-undef */
'use strict';

const { createNotification } = require('../../js/notification');

describe('Notifications', function()
{
    test('displays a notification in test', (done) =>
    {
        process.env.NODE_ENV = 'test';
        const notification = createNotification('test');
        expect(notification.body).toBe('test');
        expect(notification.title).toBe('Time to Leave');
        notification.on('show', (event) =>
        {
            expect(event).toBeTruthy();
            notification.close();
            done();
        });
        if (process.env.CI && process.platform === 'linux')
        {
            // Linux window notifications are not shown on CI
            // so this is a way to emit the same event that actually happens.
            // Timeout error is visible here https://github.com/thamara/time-to-leave/actions/runs/3488950409/jobs/5838419982
            notification.emit('show', {
                sender: {
                    title: 'Time to Leave'
                }
            });
        }
        else
        {
            notification.show();
        }
    });

    test('displays a notification in production', (done) =>
    {
        process.env.NODE_ENV = 'production';
        const notification = createNotification('production');
        expect(notification.body).toBe('production');
        expect(notification.title).toBe('Time to Leave');
        notification.on('show', (event) =>
        {
            expect(event).toBeTruthy();
            expect(event.sender.title).toBe('Time to Leave');
            notification.close();
            done();
        });
        if (process.env.CI && process.platform === 'linux')
        {
            notification.emit('show', {
                sender: {
                    title: 'Time to Leave'
                }
            });
        }
        else
        {
            notification.show();
        }
    });

});

