/* eslint-disable no-undef */
'use strict';

const { createNotification } = require('../../js/notification');

describe('Notifications', function()
{
    test('displays a notification in test', async() =>
    {
        expect.assertions(1);
        try
        {
            process.env.NODE_ENV = 'test';
            await expect(createNotification('test').show()).toBeTruthy();
        }
        catch (error)
        {
            expect(error).toMatch('error');
        }
    });

    test('displays a notification in production', async() =>
    {
        expect.assertions(1);
        try
        {
            process.env.NODE_ENV = 'production';
            await expect(createNotification('production').show()).toBeTruthy();
        }
        catch (error)
        {
            expect(error).toMatch('error');
        }
    });

});

