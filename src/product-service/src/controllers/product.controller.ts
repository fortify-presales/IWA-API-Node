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
import {IProduct} from '../modules/products/model';
import Logger from "../middleware/logger";

import ProductService from '../modules/products/service';
import path from 'path';

export class ProductController {

    private product_service: ProductService = new ProductService();

    public get_products(req: Request, res: Response) {
        Logger.debug(`Retrieving product(s) using query: ${JSON.stringify(req.query)}`);
        let product_filter = (req.query.keywords ? {$text: {$search: req.query.keywords}} : {});
        let offset = (req.query.offset ? Number(req.query.offset) : 0);
        let limit = (req.query.limit ? Number(req.query.limit) : 0);
        this.product_service.filterProducts(product_filter, offset, limit, (err: any, product_data: IProduct) => {
            if (err) {
                mongoError(err, res);
            } else {
                successResponse('Successfully retrieved product(s)', product_data, res);
            }
        });
    }

    public get_product(req: Request, res: Response) {
        Logger.debug(`Retrieving product with params: ${JSON.stringify(req.params)}`);
        if (req.params.id) {
            const product_filter = {_id: req.params.id};
            this.product_service.filterProduct(product_filter, (err: any, product_data: IProduct) => {
                if (err) {
                    mongoError(err, res);
                } else {
                    successResponse('Successfully retrieved product', product_data, res);
                }
            });
        } else {
            insufficientParameters(res);
        }
    }

    public get_product_image_by_id(req: Request, res: Response) {
        Logger.debug(`Retrieving product image with params: ${JSON.stringify(req.params)}`);
        if (req.params.id) {
            const product_filter = {_id: req.params.id};
            this.product_service.filterProduct(product_filter, (err: any, product_data: IProduct) => {
                if (err) {
                    mongoError(err, res);
                } else {
                    // TODO: image file not found 404
                    const imageName = product_data.image;
                    Logger.debug(`Resolved to product image with name: ${imageName}`);
                    res.sendFile(`${imageName}`, {
                        root: path.join(global.__basedir, 'public', 'images', 'products')
                    }, function (err) {
                        if (err) {
                            failureResponse(`Error sending image: ${err}`, null, res);
                        } else {
                            Logger.debug(`Sent image: ${imageName}`);
                        }
                    });
                }
            });

        } else {
            insufficientParameters(res);
        }
    }

    public get_product_image_by_name(req: Request, res: Response) {
        Logger.debug(`Retrieving product image with params: ${JSON.stringify(req.params)}`);
        if (req.params.name) {
            // TODO: image file not found 404
            res.sendFile(`${req.params.name}.jpg`, {
                root: path.join(global.__basedir, 'public', 'images', 'products')
            }, function (err) {
                if (err) {
                    failureResponse(`Error sending image: ${err}`, null, res);
                } else {
                    Logger.debug(`Sent image: ${req.params.id}.jpg}`);
                }
            });
        } else {
            insufficientParameters(res);
        }
    }

    public create_product(req: Request, res: Response) {
        Logger.debug(`Creating product with request body: ${JSON.stringify(req.body)}`);
        // this checks whether all the fields were sent through the request or not
        if (req.body.code && req.body.name && req.body.summary) {

            const product_params: IProduct = {
                code: req.body.code,
                name: req.body.name,
                summary: req.body.summary,
                description: req.body.description ? req.body.description : "",
                image: req.body.image ? req.body.image : "",
                price: req.body.price ? req.body.price : 0.0,
                on_sale: req.body.on_sale ? req.body.on_sale : false,
                sale_price: req.body.sale_price ? req.body.sale_price : 0.0,
                in_stock: req.body.in_stock ? req.body.in_stock : true,
                time_to_stock: req.body.time_to_stock ? req.body.time_to_stock : 0,
                rating: req.body.rating ? req.body.rating : 1,
                available: req.body.address ? req.body.available : true,
                modification_notes: [{
                    modified_on: new Date(Date.now()),
                    modified_by: "",
                    modification_note: 'New product created'
                }]
            };
            this.product_service.createProduct(product_params, (err: any, product_data: IProduct) => {
                if (err) {
                    mongoError(err, res);
                } else {
                    successResponse('Successfully created product', product_data, res);
                }
            });
        } else {
            // error response if some fields are missing in request body
            insufficientParameters(res);
        }
    }

    public update_product(req: Request, res: Response) {
        Logger.debug(`Updating product with params: ${JSON.stringify(req.params)}`);
        if (req.params.id) {
            const product_filter = {_id: req.params.id};
            this.product_service.filterProduct(product_filter, (err: any, product_data: IProduct) => {
                if (err) {
                    mongoError(err, res);
                } else if (product_data) {
                    product_data.modification_notes.push({
                        modified_on: new Date(Date.now()),
                        modified_by: "",
                        modification_note: 'Product data updated'
                    });
                    const product_params: IProduct = {
                        _id: req.params.id,
                        code: req.body.code ? req.body.code : product_data.code,
                        name: req.body.name ? req.body.name : product_data.name,
                        summary: req.body.summary ? req.body.summary : product_data.summary,
                        description: req.body.description ? req.body.description : product_data.description,
                        image: req.body.image ? req.body.image : product_data.image,
                        price: req.body.price ? req.body.price : product_data.price,
                        on_sale: req.body.on_sale ? req.body.on_sale : product_data.on_sale,
                        sale_price: req.body.sale_price ? req.body.sale_price : product_data.sale_price,
                        in_stock: req.body.in_stock ? req.body.in_stock : product_data.in_stock,
                        time_to_stock: req.body.time_to_stock ? req.body.time_to_stock : product_data.time_to_stock,
                        rating: req.body.rating ? req.body.rating : product_data.rating,
                        available: req.body.address ? req.body.available : product_data.available,
                        is_deleted: req.body.is_deleted ? req.body.is_deleted : product_data.is_deleted,
                        modification_notes: product_data.modification_notes
                    };
                    this.product_service.updateProduct(product_params, (err: any) => {
                        if (err) {
                            mongoError(err, res);
                        } else {
                            successResponse('Successfully updated product', product_data, res);
                        }
                    });
                } else {
                    failureResponse('Invalid product', null, res);
                }
            });
        } else {
            insufficientParameters(res);
        }
    }

    public delete_product(req: Request, res: Response) {
        Logger.debug(`Deleting product with params: ${JSON.stringify(req.params)}`);
        if (req.params.id) {
            this.product_service.deleteProduct(req.params.id, (err: any, delete_details: any) => {
                if (err) {
                    mongoError(err, res);
                } else if (delete_details.deletedCount !== 0) {
                    successResponse('Successfully deleted product', null, res);
                } else {
                    failureResponse('Invalid product', null, res);
                }
            });
        } else {
            insufficientParameters(res);
        }
    }
}
