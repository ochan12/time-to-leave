const { BrowserWindow, ipcMain } = require('electron');
const {getMainWindow, createWindow, resetMainWindow} = require('../../js/main-window.js');
const notification = require('../../js/notification.js');
describe('main-window.js', () =>
{

    describe('getMainWindow', () =>
    {
        test('Should be null  if it has not been started', () =>
        {
            expect(getMainWindow()).toBe(null);
        });

        test('Should get window', () =>
        {
            createWindow();
            expect(getMainWindow()).toBeInstanceOf(BrowserWindow);
        });
    });

    describe('createWindow()', () =>
    {
        test('Should create and get window default behaviour', () =>
        {
            const loadFileSpy = jest.spyOn(BrowserWindow.prototype, 'loadFile');
            createWindow();
            /**
             * @type {BrowserWindow}
             */
            const mainWindow = getMainWindow();
            expect(mainWindow).toBeInstanceOf(BrowserWindow);
            expect(ipcMain.listenerCount('TOGGLE_TRAY_PUNCH_TIME')).toBe(1);
            expect(ipcMain.listenerCount('RESIZE_MAIN_WINDOW')).toBe(1);
            expect(ipcMain.listenerCount('VIEW_CHANGED')).toBe(1);
            expect(ipcMain.listenerCount('RECEIVE_LEAVE_BY')).toBe(1);
            expect(mainWindow.listenerCount('minimize')).toBe(2);
            expect(mainWindow.listenerCount('close')).toBe(1);
            expect(mainWindow.getSize()).toEqual([1010, 912]);
            expect(loadFileSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('emit RESIZE_MAIN_WINDOW', () =>
    {
        test('It should resize window', (done) =>
        {
            createWindow();
            /**
             * @type {BrowserWindow}
             */
            const mainWindow = getMainWindow();
            mainWindow.on('show', () =>
            {
                ipcMain.emit('RESIZE_MAIN_WINDOW', {}, 500, 600);
                expect(mainWindow.getSize()).toEqual([500, 600]);
                done();
            });
        });
        test('It should not resize window if values are smaller than minimum', (done) =>
        {
            createWindow();
            /**
             * @type {BrowserWindow}
             */
            const mainWindow = getMainWindow();
            mainWindow.on('show', () =>
            {
                ipcMain.emit('RESIZE_MAIN_WINDOW', {}, 100, 100);
                expect(mainWindow.getSize()).toEqual([450, 450]);
                done();
            });
        });
    });

    describe('emit VIEW_CHANGED', () =>
    {
        test('It should send new event to ipcRendered', (done) =>
        {
            createWindow();
            /**
             * @type {BrowserWindow}
             */
            const mainWindow = getMainWindow();
            mainWindow.on('show', () =>
            {
                const windowSpy = jest.spyOn(mainWindow.webContents, 'send').mockImplementation((event, savedPreferences) =>
                {
                    ipcMain.emit('FINISH_TEST', event, savedPreferences);
                });
                ipcMain.removeHandler('GET_LANGUAGE_DATA');
                ipcMain.handle('GET_LANGUAGE_DATA', () => ({
                    'language': 'en',
                    'data': {}
                }));
                ipcMain.on('FINISH_TEST', (event, savedPreferences) =>
                {
                    expect(windowSpy).toBeCalledTimes(1);
                    expect(savedPreferences).toEqual({ new: 'prefrences' });
                    done();
                });
                ipcMain.emit('VIEW_CHANGED', {}, { new: 'prefrences' });
                windowSpy.mockRestore();
            });
        });
    });

    describe('emit RECEIVE_LEAVE_BY', () =>
    {
        test('Should not show notification when notifications is not sent', (done) =>
        {
            createWindow();
            /**
             * @type {BrowserWindow}
             */
            const mainWindow = getMainWindow();
            mainWindow.on('show', () =>
            {
                const windowSpy = jest.spyOn(notification, 'notifyTimeToLeave').mockImplementation(() =>
                {
                    return false;
                });
                ipcMain.emit('RECEIVE_LEAVE_BY', {}, undefined);
                expect(windowSpy).toBeCalledTimes(1);
                windowSpy.mockRestore();
                done();
            });
        });
        test('Should show notification', (done) =>
        {
            createWindow();
            /**
             * @type {BrowserWindow}
             */
            const mainWindow = getMainWindow();
            mainWindow.on('show', () =>
            {
                const windowSpy = jest.spyOn(notification, 'notifyTimeToLeave').mockImplementation(() =>
                {
                    return {
                        show: () =>
                        {
                            windowSpy.mockRestore();
                            done();
                        }
                    };
                });
                const now = new Date();
                ipcMain.emit(
                    'RECEIVE_LEAVE_BY',
                    {},
                    `0${now.getHours()}`.slice(-2) + ':' + `0${now.getMinutes()}`.slice(-2)
                );
            });
        });
    });

    afterEach(() =>
    {
        jest.restoreAllMocks();
        resetMainWindow();
    });

});