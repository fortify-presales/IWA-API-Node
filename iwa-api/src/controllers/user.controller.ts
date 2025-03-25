/*
        IWA-API - An insecure Node/Express REST API for use in Fortify demonstrations.

        Copyright 2024 Open Text or one of its affiliates.

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import {Request, Response} from 'express';

import {failureResponse, insufficientParameters, mongoError, successResponse} from '../modules/common/service';
import {IUser} from '../modules/users/model';
import {EncryptUtils} from "../utils/encrypt.utils";
import Logger from "../middleware/logger";

import UserService from '../modules/users/service';

export class UserController {

    private user_service: UserService = new UserService();

    public get_users(req: Request, res: Response) {
        Logger.debug(`Retrieving users(s) using query: ${JSON.stringify(req.query)}`);
        let user_filter = (req.query.keywords ? {$text: {$search: req.query.keywords}} : {});
        let offset = (req.query.offset ? Number(req.query.offset) : 0);
        let limit = (req.query.limit ? Number(req.query.limit) : 0);
        this.user_service.filterUsers(user_filter, offset, limit, (err: any, user_data: IUser) => {
            if (err) {
                mongoError(err, res);
            } else {
                successResponse('Successfully retrieved user(s)', user_data, res);
            }
        });
    }

    public get_user(req: Request, res: Response) {
        Logger.debug(`Retrieving user with params: ${JSON.stringify(req.params)}`);
        if (req.params.id) {
            const user_filter = {user_id: req.params.id};
            this.user_service.filterUser(user_filter, (err: any, user_data: IUser) => {
                if (err) {
                    mongoError(err, res);
                } else {
                    successResponse('Successfully retrieved user', user_data, res);
                }
            });
        } else {
            insufficientParameters(res);
        }
    }

    public create_user(req: Request, res: Response) {
        Logger.debug(`Creating user with request body: ${JSON.stringify(req.body)}`);
        // this checks whether all the fields were sent through with the request or not
        if (req.body.user_id &&
            req.body.name && req.body.name.first_name && req.body.name.last_name &&
            req.body.email &&
            req.body.phone_number) {

            const user_params: IUser = {
                user_id: req.body.user_id,
                name: {
                    first_name: req.body.name.first_name,
                    middle_name: req.body.name.middle_name ? req.body.name.middle_name : "",
                    last_name: req.body.name.last_name
                },
                email: req.body.email,
                phone_number: req.body.phone_number,
                address: {
                    street: req.body.address.street ? req.body.address.street : "",
                    city: req.body.address.city ? req.body.address.city : "",
                    state: req.body.address.state ? req.body.address.state : "",
                    zip: req.body.address.zip ? req.body.address.zip : "",
                    country: req.body.address.country ? req.body.address.country : "",
                },
                is_enabled: req.body.is_enabled ? req.body.is_enabled : false,
                is_admin: req.body.is_admin ? req.body.is_admin : false,
                modification_notes: [{
                    modified_on: new Date(Date.now()),
                    modified_by: "",
                    modification_note: 'New user created'
                }]
            };
            this.user_service.createUser(user_params, (err: any, user_data: IUser) => {
                if (err) {
                    mongoError(err, res);
                } else {
                    successResponse('Successfully created user', user_data, res);
                }
            });
        } else {
            // error response if some fields are missing in request body
            insufficientParameters(res);
        }
    }

    public update_user(req: Request, res: Response) {
        Logger.debug(`Updating user with params: ${JSON.stringify(req.params)}`);
        if (req.params.id) {
            const user_filter = {user_id: req.params.id};
            this.user_service.filterUser(user_filter, (err: any, user_data: IUser) => {
                if (err) {
                    mongoError(err, res);
                } else if (user_data) {
                    user_data.modification_notes.push({
                        modified_on: new Date(Date.now()),
                        modified_by: "",
                        modification_note: 'User data updated'
                    });
                    const user_params: IUser = {
                        user_id: req.params.id,
                        name: req.body.name ? {
                            first_name: req.body.name.first_name ? req.body.name.first_name : user_data.name.first_name,
                            middle_name: req.body.name.first_name ? req.body.name.middle_name : user_data.name.middle_name,
                            last_name: req.body.name.first_name ? req.body.name.last_name : user_data.name.last_name
                        } : user_data.name,
                        email: req.body.email ? req.body.email : user_data.email,
                        phone_number: req.body.phone_number ? req.body.phone_number : user_data.phone_number,
                        address: req.body.address ? {
                            street: req.body.address.street ? req.body.address.street : user_data.address.street,
                            city: req.body.address.city ? req.body.address.city : user_data.address.city,
                            state: req.body.address.state ? req.body.address.state : user_data.address.state,
                            zip: req.body.address.zip ? req.body.address.zip : user_data.address.zip,
                            country: req.body.address.country ? req.body.address.country : user_data.address.country,
                        } : user_data.address,
                        is_enabled: req.body.is_enabled ? req.body.is_enabled : user_data.is_enabled,
                        is_admin: req.body.is_admin ? req.body.is_admin : user_data.is_admin,
                        is_deleted: req.body.is_deleted ? req.body.is_deleted : user_data.is_deleted,
                        modification_notes: user_data.modification_notes
                    };
                    this.user_service.updateUser(user_params, (err: any) => {
                        if (err) {
                            mongoError(err, res);
                        } else {
                            successResponse('Successfully updated user', null, res);
                        }
                    });
                } else {
                    failureResponse('Invalid user', null, res);
                }
            });
        } else {
            insufficientParameters(res);
        }
    }

    public delete_user(req: Request, res: Response) {
        Logger.debug(`Deleting user with params: ${JSON.stringify(req.params)}`);
        if (req.params.id) {
            this.user_service.deleteUser(req.params.id, (err: any, delete_details: any) => {
                if (err) {
                    mongoError(err, res);
                } else if (delete_details.deletedCount !== 0) {
                    successResponse('Successfully deleted user', null, res);
                } else {
                    failureResponse('Invalid user', null, res);
                }
            });
        } else {
            insufficientParameters(res);
        }
    }
}
