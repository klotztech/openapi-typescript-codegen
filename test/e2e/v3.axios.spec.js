'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compileWithTypescript = require('./scripts/compileWithTypescript');
const compileWithBabel = require('./scripts/compileWithBabel');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('v3.axios', () => {
    beforeAll(async () => {
        await generate('v3/axios', 'v3', 'axios');
        await copy('v3/axios');
        // compileWithTypescript('v3/axios');
        compileWithBabel('v3/axios');
        await server.start('v3/axios');
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
            OpenAPI.USERNAME = undefined;
            OpenAPI.PASSWORD = undefined;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = window.api;
            OpenAPI.TOKEN = undefined;
            OpenAPI.USERNAME = 'username';
            OpenAPI.PASSWORD = 'password';
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
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
