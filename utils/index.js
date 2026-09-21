import Compressor from "compressorjs";
import Constants from "@/utils/constants";
import {Chip} from "@mui/material";
import UtilMethods from "@/utils/UtilMethods";

const isDefined = _value => {
    return _value != null;
};

const intToStr = _nbr => {
    const nbr = parseInt(_nbr);
    if (nbr < 10) {
        return "0" + nbr;
    }
    return nbr;
};

const formatNumber = (_number, _lang = "fr", currency = Constants.CURRENCY, _withCurrency = true) => {
    let locale = _lang + "-" + _lang.toUpperCase();
    let test = new Intl.NumberFormat(locale, {style: "currency", currency: currency}).format(_number);
  // console.log(test);
    test = test.replace(/([a-zA-Z$￥€]+)/, "t;$1t;");
    let tab = test.split("t;");
    if (tab[0].length > 0) {
        return (
        <span className="__amount">
        <>{tab[0]}</>
        {_withCurrency ? <span className="__currency">{tab[1]}</span> : <></>}
        </span>
        );
    } else {
        return (
        <span className="__amount">
        {_withCurrency ? <span className="__currency">{tab[1]}</span> : <></>}
        <>{tab[2]}</>
        </span>
        );
    }
};

const formatNumberStr = (_number, _lang = "fr", currency = "XAF", withoutCurrency= false, fractionDigits = null) => {
    let locale = _lang + "-" + _lang.toUpperCase();

    if (withoutCurrency) {
        const options = fractionDigits !== null
            ? {maximumFractionDigits: fractionDigits}
            : {maximumSignificantDigits: 3};
        return new Intl.NumberFormat(locale, options).format(_number);
    }

    let test = new Intl.NumberFormat(locale, {style: "currency", currency: currency}).format(_number);
  // console.log(test);
    test = test.replace(/([a-zA-Z$￥€]+)/, "t;$1t;");
    let tab = test.split("t;"),
    str;
    if (tab[0].length > 0) {
        str = tab[0] + " " + tab[1];
    } else {
        str = tab[1] + " " + tab[2];
    }
    return str;
};

/**
 *
 * @returns {{label: string, value: string}[]}
 */
const getUrlParams = () => {
    if (typeof window === "undefined") return [];
    let url = window.location.href,
    tab = url.split("?"),
    params = tab.length > 1 ? tab[tab.length - 1].split("&") : [],
    ret = [];
    for (let i = 0; i < params.length; i++) {
        let temp = params[i].split("=");
        ret.push({
            label: temp[0],
            value: temp[1],
        });
    }
    return ret;
};

/**
 *
 * @returns {string}
 */
const getUid = () => {
    const params = getUrlParams();
    let uid = "";
    params.forEach(item => {
        if (item.label === "uid" || item.label === "uuid") {
            uid = item.value;
        }
    });
  return uid;
};

/**
 * @param _str {string}
 */
const getFirstLetter = _str => {
    return _str.charAt(0).toUpperCase();
};

/**
 *
 * @param _str {string}
 * @returns {string}
 */
const toCaptitalize = _str => {
    if (typeof _str !== "string") {
        throw new Error("Invalid parameter");
    }
    if (_str.length < 2) {
        return getFirstLetter(_str);
    }
    return getFirstLetter(_str) + _str.substring(1, _str.length);
};

function isIterable(obj)
{
  // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === "function";
}

/**
 *
 * @param _value
 */
const jsToFormDataValue = _value => {
    return typeof _value === "object" ? (_value instanceof File ? _value : JSON.stringify(_value)) : _value;
};

const jsonToFormData = _json => {
    let data = new FormData();
    for (let key in _json) {
        if (_json[key] !== undefined) {
            if (typeof _json[key] === "string" || typeof _json[key] === "number") {
                data.append(key, _json[key]);
            } else if (typeof _json[key] === "boolean") {
                data.append(key, JSON.stringify(_json[key]));
            } else if (typeof _json[key] === "object") {
                if (isIterable(_json[key])) {
                    if (typeof _json[key][0] === "object") {
                        if (_json[key][0] instanceof File) {
                            _json[key].forEach((item, index) => {
                                data.append(`${key}[${index}]`, jsToFormDataValue(item));
                            });
                        } else {
                            _json[key].forEach((item, index) => {
                                for (let ind in item) {
                                          data.append(`${key}[${index}][${ind}]`, jsToFormDataValue(item[ind]));
                                }
                            });
                        }
                    } else {
                        _json[key].forEach((item, index) => {
                            data.append(`${key}[${index}]`, jsToFormDataValue(item));
                        });
                    }
                } else if (_json[key] instanceof File) {
                    data.append(key, _json[key]);
                } else {
                    data.append(key, JSON.stringify(_json[key]));
                }
            }
        }
    }

    return data;
};

const getToken = () => {
    if (typeof window === 'undefined') return "";
    try {
        const {token} = JSON.parse(localStorage.getItem("storedValues") ?? Constants.defaultStoredValue);
        return token;
    } catch (e) {
        return "";
    }
};

const isSubscriber = () => {
    if (typeof window === 'undefined') return false;
    try {
        const {access, currentAccess} = JSON.parse(localStorage.getItem("storedValues") ?? Constants.defaultStoredValue);
        let ret = false;
        access.forEach(item => {
            if (item.uid === currentAccess && item.role.code === "SOUS") {
                ret = true;
            }
        });
        return ret;
    } catch (e) {
        return false;
    }
};

const getRoleCode = () => {
    if (typeof window === 'undefined') return "";
    try {
        const {access, currentAccess} = JSON.parse(localStorage.getItem("storedValues") ?? Constants.defaultStoredValue);
        let ret = "";
        access.forEach(item => {
            if (item.uid === currentAccess) {
                ret = item.role.code;
            }
        });
        return ret;
    } catch (e) {
        return "";
    }
};

const getAuthorization = () => {
    if (typeof window === 'undefined') return [];
    try {
        const {authorizations} = JSON.parse(localStorage.getItem("storedValues") ?? Constants.defaultStoredValue);
        return authorizations;
    } catch (e) {
        return [];
    }
};

const __ = () => {};
/**
 *
 * @param value {string}
 * @param tab {{value: string}[]}
 * @param _keyValue
 */
const getAutocompleteValue = (value, tab = [], _keyValue = "value") => {
    const selected = tab.filter(item => item[_keyValue] === value);
    if (selected.length) {
        return selected[0];
    }
    return null;
};

/**
 *
 * @param tab {array}
 * @param key {string}
 * @param value {string|number|any}
 * @returns {array}
 */
const arrayRemoveItem = (tab, key, value) => {
    return tab.filter(item => item[key] !== value);
};

/**
 *
 * @param _tab {{uid: string, label: string}[]}
 */
const getMoiMemeFiliation = _tab => {
    let value = "";
    const filtered = _tab.filter(item => item.label === "Moi-même");
    if (filtered.length) {
        value = filtered[0].uid;
    }
    return value;
};

/**
 *
 * @param _str {string}
 */
const getFileName = _str => {
    const splitted = _str.split("/");
    return splitted[splitted.length - 1];
};

/**
 *
 * @param _file {File|Blob}
 */
const compressImage = _file => {
    return new Promise((resolve, reject) => {
        new Compressor(_file, {
            quality: Constants.IMAGE_QUALITY,
            success(result) {
                const file = new File([result], result.name);
                resolve(file);
            },
            error(error) {
                console.log("Error while compressing::: ", error);
                reject(error);
            },
        });
    });
};

const sleep = _timeInMilliSec => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, _timeInMilliSec);
    });
};

/**
 *
 * @param _status {string}
 * @param t
 * @param _success
 * @param _isContract
 * @param _withLabel
 */
const getStatusBadge = (_status = "", t, _success = false, _isContract = false, _withLabel = false) => {
    let jsxElem;
    let status = _status;
    if (!_withLabel) {
        status = UtilMethods.statues(t)[_status];
    }
    _status = _status ?? "";
    switch (_status.toLowerCase()) {
        case "validated":
        case "read":
        case "success":
        case "active":
            jsxElem = <Chip label={toCaptitalize(status)} color={"primary"} />;
        break;
        case "payment":
            jsxElem = <Chip label={toCaptitalize(status)} color={"warning"} />;
        break;
        case "cancelled":
        case "rejected":
        case "failure":
        case "suspended":
            jsxElem = <Chip label={toCaptitalize(status)} color={"error"} />;
        break;
        default:
            jsxElem = <Chip label={toCaptitalize(status ?? _status)} />;
            if (_isContract && (_status.toLowerCase() === "processing" || _status.toLowerCase() === "in_processing")) {
                jsxElem = <Chip label={toCaptitalize(status ?? _status)} color={"primary"} />;
            }
            if (_success) {
                jsxElem = <Chip label={toCaptitalize(status ?? _status)} color={"primary"} />;
            }
        break;
    }
    return jsxElem;
};

const getLanguage = () => {
    if (typeof window === 'undefined') return "fr";
    try {
        const lang = localStorage.getItem(Constants.LANG);
        if (lang && lang.indexOf("en") > -1) {
            return "en";
        }
    } catch (e) {
        return "fr";
    }
    return "fr";
};

class DateDiff {
    static task(date1, date2)
    {
        return date1.getTime() - date2.getTime();
    }

    static inDays(date1, date2)
    {
        return this.task(date1, date2) / (1000 * 3600 * 24);
    }
}

const downloadCsvFile = (csv = "") => {
    const csvContent = "data:text/csv;charset=utf-8," + csv;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exported.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const handleDownloadCsv = (columns = [], tab = []) => {
    let header,
    csv = "";
    header = columns.filter(item => !item.unexport);
    for (let i = 0; i < header.length; i++) {
        if (i === 0) {
            csv += header[i].header;
        } else {
            csv += "; " + header[i].header;
        }
    }
    csv += "\n";
    tab.forEach(item => {
        for (let i = 0; i < header.length; i++) {
            if (i === 0) {
                csv += item[header[i].accessorKey];
            } else {
                csv += "; " + item[header[i].accessorKey];
            }
        }
        csv += "\n";
    });
  console.log("Csv value::: ", csv);
  downloadCsvFile(csv);
};

const formatTableFilters = (columnFilters = []) => {
    return (columnFilters ?? [])
    .map(column => {
        let values = new Map([[column.id, column.value]]);
        return Object.fromEntries(values);
    })
    .reduce((acc, item) => {
        acc = Object.assign(item, acc);
        return acc;
    }, {});
};

const formatTableSorting = (sorting = []) => {
    return (sorting ?? [])
    .map(column => {
        let values = new Map([[column.id, column.desc]]);
        return Object.fromEntries(values);
    })
    .reduce((acc, item) => {
        acc = Object.assign(item, acc);
        return acc;
    }, {});
};

export {
    isDefined,
    formatNumberStr,
    formatNumber,
    getUrlParams,
    getFirstLetter,
    jsonToFormData,
    isIterable,
    toCaptitalize,
    getToken,
    getAutocompleteValue,
    getAuthorization,
    arrayRemoveItem,
    getMoiMemeFiliation,
    getFileName,
    compressImage,
    sleep,
    intToStr,
    getUid,
    getStatusBadge,
    isSubscriber,
    getRoleCode,
    getLanguage,
    DateDiff,
    downloadCsvFile,
    handleDownloadCsv,
    formatTableSorting,
    formatTableFilters,
};
