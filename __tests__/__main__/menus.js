const { getContextMenuTemplate, getDockMenuTemplate, getEditMenuTemplate, getHelpMenuTemplate, getMainMenuTemplate, getViewMenuTemplate} = require('../../js/menus.js');

jest.mock('../../src/configs/i18next.config.js', () => ({
    getCurrentTranslation: jest.fn().mockImplementation((key) => key)
}));

describe('menus.js', () =>
{
    beforeAll(() =>
    {
    });

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
                for (const t of tests)
                {
                    expect(menu[t.field]).toBeTruthy();
                    expect(typeof menu[t.field]).toBe(t.type);
                }
                if ('accelerator' in menu)
                {
                    expect(typeof menu.accelerator).toBe('string');
                }
            });
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

    afterAll(() =>
    {
        jest.restoreAllMocks();
    });

});