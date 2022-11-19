const { getContextMenuTemplate, getDockMenuTemplate, getEditMenuTemplate, getHelpMenuTemplate, getMainMenuTemplate, getViewMenuTemplate} = require('../../js/menus.js');

jest.mock('../../src/configs/i18next.config.js', () => ({
    getCurrentTranslation: jest.fn().mockImplementation((key) => key)
}));

jest.mock('../../js/windows', () => ({
    openWaiverManagerWindow: jest.fn(),
    prefWindow: jest.fn(),
    getDialogCoordinates: jest.fn()
}));

jest.mock('electron', () =>
{
    const originalModule = jest.requireActual('electron');
    return {
        __esModule: true,
        ...originalModule,
        ipcRenderer: {
            ...originalModule.ipcRenderer,
            invoke: jest.fn().mockResolvedValueOnce('./').mockResolvedValue('./dummy_file.txt'),
        },
        app: {
            quit: jest.fn()
        },
        BrowserWindow: {
            ...originalModule.BrowserWindow,
            getFocusedWindow: () =>
            {
                return {
                    reload: jest.fn()
                };
            }
        },
        shell: {
            ...originalModule.shell,
            openExternal: jest.fn()
        }
    };
});

jest.mock('../../js/notification', () => ({
    createNotification: jest.fn().mockImplementation(() => ({
        show: jest.fn()
    }))
}));

jest.mock('../../js/update-manager', () => ({
    checkForUpdates: jest.fn()
}));

const updateManager = require('../../js/update-manager');
const notification = require('../../js/notification');
const windows = require('../../js/windows');
const {app, BrowserWindow, shell} = require('electron');
describe('menus.js', () =>
{
    const mocks = {};

    describe('getMainMenuTemplate', () =>
    {
        test('Should have 3 options', () =>
        {
            expect(getMainMenuTemplate().length).toBe(3);
        });

        getMainMenuTemplate().forEach((menu) =>
        {
            test('Should be a separator or valid field', () =>
            {
                const tests = [
                    {field : 'label', type: 'string'},
                    {field : 'click', type: 'function'},
                ];
                if ('type' in menu)
                {
                    expect(menu.type).toBe('separator');
                }
                else
                {
                    for (const t of tests)
                    {
                        expect(menu[t.field]).toBeTruthy();
                        expect(typeof menu[t.field]).toBe(t.type);
                    }
                    if ('id' in menu)
                    {
                        expect(typeof menu.id).toBe('string');
                    }
                    if ('accelerator' in menu)
                    {
                        expect(typeof menu.accelerator).toBe('string');
                    }
                }
            });
        });

        test('Should open waiver window', (done) =>
        {
            mocks.waiver = jest.spyOn(windows, 'openWaiverManagerWindow').mockImplementationOnce( () =>
            {
                done();
            });
            getMainMenuTemplate()[0].click();
        });

        test('Should close app', (done) =>
        {
            mocks.quit = jest.spyOn(app, 'quit').mockImplementationOnce(() =>
            {
                done();
            });
            getMainMenuTemplate()[2].click();
        });
    });

    describe('getContextMenuTemplate', () =>
    {
        test('Should have 3 options', () =>
        {
            expect(getContextMenuTemplate().length).toBe(3);
        });

        getContextMenuTemplate().forEach((menu) =>
        {
            test('Should be a valid field', () =>
            {
                const tests = [
                    {field : 'label', type: 'string'},
                    {field : 'click', type: 'function'},
                ];
                for (const t of tests)
                {
                    expect(menu[t.field]).toBeTruthy();
                    expect(typeof menu[t.field]).toBe(t.type);
                }
            });

        });

        test('Should quit on click', () =>
        {
            const mainWindow = {
                webContents: {
                    executeJavaScript: (key) =>
                    {
                        expect(key).toBe('calendar.punchDate()');
                    }
                }
            };
            mocks.createNotificationSpy = jest.spyOn(notification, 'createNotification');
            getContextMenuTemplate(mainWindow)[0].click();
            expect(mocks.createNotificationSpy).toBeCalledTimes(1);
        });

        test('Should create notification on click', (done) =>
        {
            const mainWindow = {
                show: done
            };
            getContextMenuTemplate(mainWindow)[1].click();
        });

        test('Should show window on click', (done) =>
        {
            mocks.quit = jest.spyOn(app, 'quit').mockImplementationOnce(() =>
            {
                done();
            });
            getContextMenuTemplate({})[2].click();
            expect(mocks.quit).toBeCalledTimes(1);
        });
    });

    describe('getDockMenuTemplate', () =>
    {
        test('Should have 1 option', () =>
        {
            expect(getDockMenuTemplate().length).toBe(1);
        });

        getDockMenuTemplate().forEach((menu) =>
        {
            test('Should be a valid field', () =>
            {
                const tests = [
                    {field : 'label', type: 'string'},
                    {field : 'click', type: 'function'},
                ];
                for (const t of tests)
                {
                    expect(menu[t.field]).toBeTruthy();
                    expect(typeof menu[t.field]).toBe(t.type);
                }
            });
        });

        test('Should create notification on click', () =>
        {
            const mainWindow = {
                webContents: {
                    executeJavaScript: (key) =>
                    {
                        expect(key).toBe('calendar.punchDate()');
                    }
                }
            };
            mocks.createNotificationSpy = jest.spyOn(notification, 'createNotification');
            getContextMenuTemplate(mainWindow)[0].click();
            expect(mocks.createNotificationSpy).toBeCalledTimes(1);
        });
    });

    describe('getViewMenuTemplate', () =>
    {
        test('Should have 2 option', () =>
        {
            expect(getViewMenuTemplate().length).toBe(2);
        });

        getViewMenuTemplate().forEach((menu) =>
        {
            test('Should be a valid field', () =>
            {
                const tests = [
                    {field : 'label', type: 'string'},
                    {field : 'click', type: 'function'},
                ];
                for (const t of tests)
                {
                    expect(menu[t.field]).toBeTruthy();
                    expect(typeof menu[t.field]).toBe(t.type);
                }
            });
        });

        test('Should reload window', (done) =>
        {
            mocks.window = jest.spyOn(BrowserWindow, 'getFocusedWindow').mockImplementation(() =>
            {
                return {
                    reload: () => done()
                };
            });

            getViewMenuTemplate()[0].click();
            expect(mocks.window).toBeCalledTimes(1);
        });

        test('Should toggle devtools', (done) =>
        {
            mocks.window = jest.spyOn(BrowserWindow, 'getFocusedWindow').mockImplementation(() =>
            {
                return {
                    toggleDevTools: () => done()
                };
            });

            getViewMenuTemplate()[1].click();
            expect(mocks.window).toBeCalledTimes(1);
        });
    });

    describe('getHelpMenuTemplate', () =>
    {
        test('Should have 5 option', () =>
        {
            expect(getHelpMenuTemplate().length).toBe(5);
        });

        getHelpMenuTemplate().forEach((menu) =>
        {
            test('Should be a valid field', () =>
            {
                const tests = [
                    {field : 'label', type: 'string'},
                    {field : 'click', type: 'function'},
                ];
                if ('type' in menu)
                {
                    expect(menu.type).toBe('separator');
                }
                else
                {
                    for (const t of tests)
                    {
                        expect(menu[t.field]).toBeTruthy();
                        expect(typeof menu[t.field]).toBe(t.type);
                    }
                }
            });
        });

        test('Should open github', (done) =>
        {
            mocks.window = jest.spyOn(shell, 'openExternal').mockImplementation((key) =>
            {
                expect(key).toBe('https://github.com/thamara/time-to-leave');
                done();
            });
            getHelpMenuTemplate()[0].click();
        });

        test('Should open github', (done) =>
        {
            mocks.window = jest.spyOn(updateManager, 'checkForUpdates').mockImplementation((key) =>
            {
                expect(key).toBe(true);
                done();
            });
            getHelpMenuTemplate()[1].click();
        });

        test('Should open feedback', (done) =>
        {
            mocks.window = jest.spyOn(shell, 'openExternal').mockImplementation((key) =>
            {
                expect(key).toBe('https://github.com/thamara/time-to-leave/issues/new');
                done();
            });
            getHelpMenuTemplate()[2].click();
        });
    });

    describe('getEditMenuTemplate', () =>
    {
        test('Should have 10 options', () =>
        {
            expect(getEditMenuTemplate().length).toBe(10);
        });
        getEditMenuTemplate().forEach((menu) =>
        {
            test('Should be a separator or valid field', () =>
            {
                const tests = [
                    {field : 'label', type: 'string'},
                ];
                if ('type' in menu)
                {
                    expect(menu.type).toBe('separator');
                }
                else
                {
                    for (const t of tests)
                    {
                        expect(menu[t.field]).toBeTruthy();
                        expect(typeof menu[t.field]).toBe(t.type);
                    }
                    if ('id' in menu)
                    {
                        expect(typeof menu.id).toBe('string');
                    }
                    if ('accelerator' in menu)
                    {
                        expect(typeof menu.accelerator).toBe('string');
                    }
                    if ('selector' in menu)
                    {
                        expect(typeof menu.selector).toBe('string');
                    }
                    if ('click' in menu)
                    {
                        expect(typeof menu.click).toBe('function');
                    }
                }
            });
        });
    });

    afterEach(() =>
    {
        for (const mock of Object.values(mocks))
        {
            mock.mockClear();
        }
    });

    afterAll(() =>
    {
        jest.restoreAllMocks();
    });

});