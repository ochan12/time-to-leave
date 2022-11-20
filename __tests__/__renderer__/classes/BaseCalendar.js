import ElectronStore from 'electron-store';
import {BaseCalendar} from '../../../js/classes/BaseCalendar';
const timeBalance = require('../../../js/time-balance');
jest.mock('../../../js/time-math', () =>
{
    const originalModule = jest.requireActual('../../../js/time-math');
    return {
        __esModule: true,
        ...originalModule,
        isNegative: jest.fn()
    };
});
const timeMath = require('../../../js/time-math');
window.$ = require('jquery');

describe('BaseCalendar.js', () =>
{
    class ExtendedClass extends BaseCalendar
    {
        constructor(preferences, languageData)
        {
            super(preferences, languageData);
        }
    }

    /**
     * @type {{[key: string]: jest.Mock}}
     */
    const mocks = {};

    beforeEach(() =>
    {
        const flexibleStore = new ElectronStore({name: 'flexible-store'});
        flexibleStore.clear();
        const waivedWorkdays = new ElectronStore({name: 'waived-workdays'});
        waivedWorkdays.clear();
    });

    describe('constructor', () =>
    {
        test('Should not build with default values', () =>
        {
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            expect(() => new ExtendedClass(preferences, languageData)).toThrow('Please implement this.');
        });

        test('Should not run _getTargetDayForAllTimeBalance with default values', () =>
        {
            ExtendedClass.prototype._initCalendar = () => {};
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            expect(() => new ExtendedClass(preferences, languageData)._getTargetDayForAllTimeBalance()).toThrow('Please implement this.');
        });

        test('Should build with default values', (done) =>
        {
            ExtendedClass.prototype._initCalendar = () => { done(); };
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            expect(calendar._calendarDate).toBeInstanceOf(Date);
            expect(calendar._languageData).toEqual(languageData);
            expect(calendar._internalStore).toEqual({});
            expect(calendar._internalWaiverStore).toEqual({});
            expect(calendar._preferences).toEqual(preferences);
        });

        test('Should build with default internal store values', (done) =>
        {
            ExtendedClass.prototype._initCalendar = () => { done(); };
            const flexibleStore = new ElectronStore({name: 'flexible-store'});
            flexibleStore.set('flexible', 'store');

            const waivedWorkdays = new ElectronStore({name: 'waived-workdays'});
            waivedWorkdays.set('2022-01-01', {
                reason: 'dismiss',
                hours: '10:00'
            });

            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            expect(calendar._calendarDate).toBeInstanceOf(Date);
            expect(calendar._languageData).toEqual(languageData);
            expect(calendar._internalStore).toEqual({
                flexible: 'store'
            });
            expect(calendar._internalWaiverStore).toEqual({
                '2022-01-01': {
                    reason: 'dismiss',
                    hours: '10:00'
                }
            });
            expect(calendar._preferences).toEqual(preferences);
        });
    });

    describe('_updateAllTimeBalance', () =>
    {
        test('Should not update value because of no implementation', (done) =>
        {
            mocks.compute = jest.spyOn(timeBalance, 'computeAllTimeBalanceUntilAsync').mockImplementation(() => Promise.resolve());
            ExtendedClass.prototype._initCalendar = () => {};
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            expect(() => calendar._updateAllTimeBalance()).toThrow('Please implement this.');
            expect(mocks.compute).toHaveBeenCalledTimes(0);
            done();
        });

        test('Should not update value because of rejection', (done) =>
        {
            mocks.compute = jest.spyOn(timeBalance, 'computeAllTimeBalanceUntilAsync').mockImplementation(() => Promise.reject());
            ExtendedClass.prototype._initCalendar = () => {};
            ExtendedClass.prototype._getTargetDayForAllTimeBalance = () =>  {};
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            calendar._updateAllTimeBalance();
            setTimeout(() =>
            {
                expect(mocks.compute).toHaveBeenCalledTimes(1);
                done();
            }, 500);
        });

        test('Should not update value because no overall-balance element', (done) =>
        {
            window.$ = () => false;
            mocks.compute = jest.spyOn(timeBalance, 'computeAllTimeBalanceUntilAsync').mockResolvedValue('2022-02-31');
            mocks.isNegative = jest.spyOn(timeMath, 'isNegative').mockImplementation(() => true);
            ExtendedClass.prototype._initCalendar = () => { };
            ExtendedClass.prototype._getTargetDayForAllTimeBalance = () =>  {};
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            calendar._updateAllTimeBalance();
            setTimeout(() =>
            {
                expect(mocks.isNegative).toHaveBeenCalledTimes(0);
                expect(mocks.compute).toHaveBeenCalledTimes(1);
                window.$ = require('jquery');
                done();
            }, 500);
        });

        test('Should update value with negative class', (done) =>
        {
            $('body').append('<span id="overall-balance" value="12:12">12:12</span>');
            $('#overall-balance').val('12:12');
            mocks.compute = jest.spyOn(timeBalance, 'computeAllTimeBalanceUntilAsync').mockResolvedValue('2022-02-31');
            mocks.isNegative = jest.spyOn(timeMath, 'isNegative').mockImplementation(() => true);
            ExtendedClass.prototype._initCalendar = () => {  };
            ExtendedClass.prototype._getTargetDayForAllTimeBalance = () =>  {};
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            calendar._updateAllTimeBalance();
            setTimeout(() =>
            {
                expect(mocks.compute).toHaveBeenCalledTimes(1);
                expect($('#overall-balance').val()).toBe('2022-02-31');
                expect($('#overall-balance').hasClass('text-danger')).toBe(true);
                done();
            }, 500);
        });

        test('Should update value with positive class', (done) =>
        {
            $('body').append('<span class="text-success text-danger" id="overall-balance" value="12:12">12:12</span>');
            $('#overall-balance').val('12:12');
            mocks.compute = jest.spyOn(timeBalance, 'computeAllTimeBalanceUntilAsync').mockResolvedValue('2022-02-31');
            mocks.isNegative = jest.spyOn(timeMath, 'isNegative').mockImplementation(() => false);
            ExtendedClass.prototype._initCalendar = () => {  };
            ExtendedClass.prototype._getTargetDayForAllTimeBalance = () =>  {};
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            calendar._updateAllTimeBalance();
            setTimeout(() =>
            {
                expect(mocks.compute).toHaveBeenCalledTimes(1);
                expect($('#overall-balance').val()).toBe('2022-02-31');
                expect($('#overall-balance').hasClass('text-success')).toBe(true);
                done();
            }, 500);
        });

    });

    afterEach(() =>
    {
        ExtendedClass.prototype._initCalendar = () =>
        {
            throw Error('Please implement this.');
        };

        ExtendedClass.prototype._getTargetDayForAllTimeBalance = () =>
        {
            throw Error('Please implement this.');
        };

        for (const mock of Object.values(mocks))
        {
            mock.mockRestore();
        }
        $('#overall-balance').remove();
    });

    afterAll(() =>
    {
        const flexibleStore = new ElectronStore({name: 'flexible-store'});
        flexibleStore.clear();
        const waivedWorkdays = new ElectronStore({name: 'waived-workdays'});
        waivedWorkdays.clear();
    });
});