import { BASE_URL } from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

export default class ImageService {
    static async update(token, account, file) {
        token = getToken();
        const formData = new FormData();
        formData.append("picture", file);

        const response = await fetch(`${BASE_URL}/account/${account}/create-picture`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
                'X-localization': UtilMethods.getLanguage() // Add space after 'Bearer'
            },
            body: formData,
        });

        const data = await response.json();

        if (response.status !== 200) {
            throw new Error(data.message || response.statusText);
        }

        return data;
    }

    /**
     *
     * @param {string} token
     * @param {string} account
     * @returns {Promise<*>}
     */
    static async delete(token, account) {
        token = getToken();
        const response = await fetch(`${BASE_URL}/account/${account}/delete-picture`, {
            method: 'POST', // Changed method to DELETE
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
                'X-localization': UtilMethods.getLanguage() // Add space after 'Bearer'
            },
        });

        const data = await response.json();

        if (response.status !== 200) {
            throw new Error(data.message || response.statusText);
        }

        return data.message;
    }
}
