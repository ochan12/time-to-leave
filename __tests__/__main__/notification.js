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
        notification.show();
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
        notification.show();
    });

});

