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

import {IProduct} from './model';
import products from './schema';

export default class ProductService {

    public filterProducts(query: any, offset: number = 0, limit: number = 50, callback: any) {
        products.find(query, callback).skip(offset).limit(limit);
    }

    public filterProduct(query: any, callback: any) {
        products.findOne(query, callback);
    }

    public createProduct(product_params: IProduct, callback: any) {
        const _session = new products(product_params);
        _session.save(callback);
    }

    public updateProduct(product_params: IProduct, callback: any) {
        const query = {_id: product_params._id};
        products.findOneAndUpdate(query, product_params, callback);
    }

    public deleteProduct(_id: String, callback: any) {
        const query = {_id: _id};
        products.deleteOne(query, callback);
    }

}
