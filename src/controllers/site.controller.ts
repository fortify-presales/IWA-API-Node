/*
        IWA-Express - Insecure Express JS REST API

        Copyright 2023 Open Text or one of its affiliates.

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
import {
    failureResponse,
    insufficientParameters,
    mongoError,
    successResponse,
    unauthorised
} from '../modules/common/service';
import {IUser} from '../modules/users/model';
import {EncryptUtils} from "../utils/encrypt.utils";

import Logger from "../middleware/logger";

import UserService from '../modules/users/service';

import {AuthenticationHandler} from "../middleware/authentication.handler";
import {JwtJson, SubscribingUser} from "../common/types";
import {FileUtils} from "../utils/file.utils";

const {JSDOM} = require("jsdom");
const {window} = new JSDOM("");
const jQuery = require("jquery")(window);

export class SiteController {

    private user_service: UserService = new UserService();

    public login_user(req: Request, res: Response) {
        Logger.debug(`Logging in user with with request body: ${JSON.stringify(req.body)}`);
        // this check whether all the fields were sent through the request or not
        if (req.body.email && req.body.password) {
            const hashPassword = EncryptUtils.cryptPassword(req.body.password);
            const user_filter = {email: req.body.email, password: hashPassword};
            this.user_service.filterUser(user_filter, (err: any, user_data: IUser) => {
                if (err) {
                    mongoError(err, res);
                } else {
                    if (user_data) {
                        const jwtJson: JwtJson = AuthenticationHandler.createJWT(user_data);
                        // set cookie for refreshToken
                        res.cookie('refreshToken', jwtJson.refreshToken,
                            {httpOnly: true, sameSite: 'strict'}
                        );
                        successResponse('Successfully logged in user', jwtJson, res);
                    } else {
                        unauthorised('Invalid credentials', res);
                    }
                }
            });
        } else {
            insufficientParameters(res);
        }
    }

    public subscribe_user(req: Request, res: Response) {
        Logger.debug(`Subscribing user with details: ${JSON.stringify(req.body)}`);
        let userObj = <SubscribingUser>{};

        if (req.body.email !== null) {
            userObj = JSON.parse(`
                {
                    "firstName": "${req.body.first_name}",
                    "lastname": "${req.body.last_name}",
                    "email": "${req.body.email}",
                    "role": "user" 
                }
            `);
        }

        try {
            FileUtils.updateNewsletterDb(userObj);
        } catch (err) {
            failureResponse(`Error updating newsletter database: ${err}`, null, res);
        }

        successResponse('Successfully updated newsletter database', null, res);
    }

    public backup_newsletter_db(req: Request, res: Response) {
        Logger.debug(`Backing up newsletter database with details: ${req.params}`)
        try {
            FileUtils.backupNewsletterDb(<String>req.query.file_path)
        } catch (err) {
            failureResponse(`Error backing up newsletter database: ${err}`, null, res);
        }

        successResponse('Successfully backed up newsletter database', null, res);
    }

}
