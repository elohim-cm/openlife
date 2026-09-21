import validate from "validate.js";

const onInputBlur = (_name, _datas, _schema, _errors) => {
    let formData = Object.assign({}, _datas), errors = {}, schema = Object.assign({}, _schema);
    for(let key_ in formData) {
        if(key_ !== _name) delete formData[key_];
    }
    for(let key_ in schema) {
        if(key_ !== _name) delete schema[key_];
    }
    console.log("FormData::: ", formData, schema);
    const validation = validate(formData, schema);
    console.log("Validation::: ", validation);
    if(validation) {
        errors = ({..._errors, ...validation});
    } else {
        console.log("No error");
        let cErrors = _errors;
        for(let key_ in cErrors) {
            if(key_ === _name) delete cErrors[key_];
        }
        errors = cErrors;
    }

    return errors;
};

export { onInputBlur };