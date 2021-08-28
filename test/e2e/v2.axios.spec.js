'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compileWithTypescript = require('./scripts/compileWithTypescript');
const compileWithBabel = require('./scripts/compileWithBabel');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('v2.axios', () => {
    beforeAll(async () => {
        await generate('v2/axios', 'v2', 'axios');
        await copy('v2/axios');
        // compileWithTypescript('v2/axios');
        compileWithBabel('v2/axios');
        await server.start('v2/axios');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await server.stop();
        await browser.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = window.api;
            OpenAPI.TOKEN = window.tokenRequest;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('complexService', async () => {
        const result = await browser.evaluate(async () => {
            const { ComplexService } = window.api;
            return await ComplexService.complexTypes({
                first: {
                    second: {
                        third: 'Hello World!',
                    },
                },
            });
        });
        expect(result).toBeDefined();
    });
});
