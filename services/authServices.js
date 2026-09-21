import axios from 'axios'
import { BASE_URL } from '@/utils/api/api'
import {getLanguage, getToken} from "@/utils";
import UtilMethods from "@/utils/UtilMethods";


// login method
export const login = async formData => {

    // header config
    const config = {
        headers: {
            "Id-Device": navigator.userAgent ,
            'X-localization': UtilMethods.getLanguage(),
            'Skip-Auth': true
        },
    };
  // login request
    return await axios.post(`${ BASE_URL }/auth/login`, formData, config)

};


// logout method
export const logout = async token => {
    token = getToken();
    const config = {
        headers: { 
            Authorization: `Bearer ${ token }`,
            'Skip-Auth': true
        }
    };

    const bodyParameters = {
        key: "value"
    };

    return await axios.post(`${ BASE_URL }/auth/logout`, bodyParameters, config)
}

export const refreshToken = async (arg1, creds) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Skip-Auth': true,
      'X-localization': UtilMethods.getLanguage(),
    },
  };
  let body;
  if (typeof arg1 === 'string') {
    // Backward compatible path
    body = { refresh_token: arg1 };
    if (creds && (creds.username || creds.password)) {
      body.username = creds.username;
      body.password = creds.password;
    }
  } else if (arg1 && typeof arg1 === 'object') {
    body = { ...arg1 };
  } else {
    body = {};
  }
  return await axios.post(`${BASE_URL}/auth/refresh`, body, config);
}


// forgot password identifier
export const forgot = async (formData) => {
    const header = await  fetch(`${ BASE_URL }/auth/forgot`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Skip-Auth': true
        },
        body: JSON.stringify(formData)
    })
    const data = await header.json();

    if (header.status !== 200) {
        throw new Error(data.message || header.statusText)
    }

    return data.message
};


// reset password
export const passwordReset = async formData => {
    const header = await  fetch(`${ BASE_URL }/auth/reset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Skip-Auth': true
        },
        body: JSON.stringify(formData)
    })
    const data = await header.json();

    if (header.status !== 200) {
        throw new Error(data.message || header.statusText)
    }

    return data.message
}

export const resendTokenCode = async (username, _context) =>{
    _context.togglePageLoading(true)
    const header = await  fetch(`${ BASE_URL }/auth/resend-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Skip-Auth': true,
            'X-localization': 'en'
        },
        body: JSON.stringify({username})
    })
    const data = await header.json();

    if (header.status !== 200) {
        throw new Error(data.message || header.statusText)
    }

      return data.message
}

