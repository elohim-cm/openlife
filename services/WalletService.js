import { BASE_URL } from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

export default class WalletService {
    static async allProspects(token, page = 1, query = '', lg = 'en') {
        return this.fetchData('prospects', token, page, query, lg);
    }

    static async allCustomers(token, page = 1, query = '', lg = 'en') {
        return this.fetchData('customers', token, page, query, lg);
    }

    static async customer(token, person){
        try {
            token = getToken();
            const header = await fetch(`${BASE_URL}/wallet/customers/${person}`, this.init(token));
            const response = await header.json();

            if (header.status !== 200) {
                throw new Error(response.message || header.statusText);
            }

            return response.data;
        } catch (error) {
            throw new Error(error.message || 'An error occurred while fetching data');
        }
    }

    /**
     * @typedef {Object} Person - Represents a person's information.
     * @property {string} first_name - The first name of the person.
     * @property {string} last_name - The last name of the person.
     * @property {string} email - The email address of the person.
     * @property {string} main_phone - The main phone number of the person.
     * @property {string} secondary_phone - The secondary phone number of the person.
     * @property {string} birth_day - The birth day of the person (in string format).
     * @property {string} birth_place - The birth place of the person.
     * @property {string} address - The address of the person.
     * @property {string} cni_number - The CNI (National Identity Card) number of the person.
     * @property {string} cni_expired_date
     * @property {string} nui_number
     * @property {{uid:string, label:string}} marital_status
     * @property {{uid:string, label:string}} gender
     */

    /**
     * Fetches prospect information from the server.
     *
     * @param {string} token - The authentication token.
     * @param {string|string[]} person - The unique identifier(s) of the person.
     * @return {Promise<Person>} - A promise that resolves to a Person object representing the fetched prospect information.
     * @throws {Error} - If an error occurs during the fetching process.
     */
    static async prospect(token, person){
        try {
            const header = await fetch(`${BASE_URL}/wallet/prospects/${person}`, this.init(token));
            const response = await header.json();

            if (header.status !== 200) {
                throw new Error(response.message || header.statusText);
            }

            return response.data;
        } catch (error) {
            throw new Error(error.message || 'An error occurred while fetching data');
        }
    }
    static async client(token, person){
        try {
            const header = await fetch(`${BASE_URL}/wallet/customers/${person}`, this.init(token));
            const response = await header.json();

            if (header.status !== 200) {
                throw new Error(response.message || header.statusText);
            }

            return response.data;
        } catch (error) {
            throw new Error(error.message || 'An error occurred while fetching data');
        }
    }
    static async fetchData(endpoint, token, page = 1, query = '', lg = 'en', method = 'GET') {
        const url = `${BASE_URL}/wallet/${endpoint}?page=${page}&q=${query}`;
        const headers = this.init(token, method, lg);

        try {
            const header = await fetch(url, headers);
            const response = await header.json();

            if (header.status !== 200) {
                throw new Error(response.message || header.statusText);
            }

            return response.data;
        } catch (error) {
            throw new Error(error.message || 'An error occurred while fetching data');
        }
    }

    static init(token, method = 'GET', lg='en', data=null) {
        token = getToken();
        const header = {
            method,
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + token,
                'X-localization': UtilMethods.getLanguage()
            }
        }
        if(data !==null){
            header.body = JSON.stringify(data)
            header.headers = {
                ...header.headers,
                "Content-Type": 'application/json'
            }
        }
        return header
    }

    static async contracts(token, person, page=1, query=''){
        try{
            const header = await fetch(`${BASE_URL}/wallet/customers/${person}/contracts?page=${page}&q=${query}`, this.init(token, 'GET'))
            const response = header.json()

            if (header.status !== 200) {
                throw new Error(response.message || header.statusText);
            }

            return response;

        }catch (e) {
            throw new Error(e.message || 'An error occurred while fetching data');
        }
    }

    static async subscriptions(token, person, page=1, query=''){
        try{
            const header = await fetch(`${BASE_URL}/wallet/prospects/${person}/subscriptions?page=${page}&q=${query}`, this.init(token, 'GET'))
            const response = header.json()

            if (header.status !== 200) {
                throw new Error(response.message || header.statusText);
            }

            return response;

        }catch (e) {
            throw new Error(e.message || 'An error occurred while fetching data');
        }
    }

    static async update(token, person, data){
        try{
            const header = await  fetch(`${BASE_URL}/wallet/prospects/${person}/update`, this.init(token, 'PUT', UtilMethods.getLanguage(), data))
            const response = header.json()

            if (header.status !== 200) {
                throw new Error(response.message || header.statusText);
            }

            return response;
        }catch (e) {
            throw new Error(e.message || 'An error occurred while fetching data');
        }
    }

    
    static async updateClient(token, person, data){
        try{
            const header = await  fetch(`${BASE_URL}/wallet/clients/${person}/update`, this.init(token, 'PUT', UtilMethods.getLanguage(), data))
            const response = header.json()

            if (header.status !== 200) {
                throw new Error(response.message || header.statusText);
            }

            return response;
        }catch (e) {
            throw new Error(e.message || 'An error occurred while fetching data');
        }
    }
}
