/* tslint:disable */
import { Controller, ValidateParam, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { AccountsController } from './../../src/controllers/accout.controller';
import { UsersController } from './../../src/controllers/user.comtroller';

const models: TsoaRoute.Models = {
    "User": {
        "properties": {
            "id": { "dataType": "double", "required": true },
            "email": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
        },
    },
    "TestAccount": {
        "properties": {
            "id": { "dataType": "double", "required": true },
            "address": { "dataType": "string" },
            "name": { "dataType": "string", "required": true },
            "users": { "dataType": "array", "array": { "ref": "User" } },
            "fields": { "dataType": "array", "array": { "dataType": "string" } },
        },
    },
};

export function RegisterRoutes(app: any) {
    app.get('/Accounts/Current',
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = new AccountsController();


            const promise = controller.current.apply(controller, validatedArgs);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/Accounts/Users',
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = new AccountsController();


            const promise = controller.getUsers.apply(controller, validatedArgs);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/Users/:id',
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
                name: { "in": "query", "name": "name", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.getUser.apply(controller, validatedArgs);
            promiseHandler(controller, promise, response, next);
        });


    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode;
                if (isController(controllerObj)) {
                    const headers = controllerObj.getHeaders();
                    Object.keys(headers).forEach((name: string) => {
                        response.set(name, headers[name]);
                    });

                    statusCode = controllerObj.getStatus();
                }

                if (data || data === false) { // === false allows boolean result
                    response.status(statusCode || 200).json(data);
                } else {
                    response.status(statusCode || 204).end();
                }
            })
            .catch((error: any) => next(error));
    }

    function getValidatedArgs(args: any, request: any): any[] {
        const fieldErrors: FieldErrors = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return ValidateParam(args[key], request.query[name], models, name, fieldErrors);
                case 'path':
                    return ValidateParam(args[key], request.params[name], models, name, fieldErrors);
                case 'header':
                    return ValidateParam(args[key], request.header(name), models, name, fieldErrors);
                case 'body':
                    return ValidateParam(args[key], request.body, models, name, fieldErrors, name + '.');
                case 'body-prop':
                    return ValidateParam(args[key], request.body[name], models, name, fieldErrors, 'body.');
            }
        });
        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }
}
