import { useState, useCallback } from 'react';


export const useForm = ( initialState = {}, prefix = "" ) => {
    
    const [values, setValues] = useState(initialState);

    const reset = () => {
        setValues( initialState );
    }

    const set = (newState) => {
        setValues( newState );
    }

    const handleInputChange = ({ target }) => {

        setValues({
            ...values,
            [ target.name.replace(prefix, '') ]: 
                (target.type === 'checkbox') ? target.checked :
                (target.type === 'select-one') ? parseInt(target.value) :
                (target.type === 'date') ? target.value : //la conversion la hace DatePickerCustom
                target.value
        });

    }

    return [ values, handleInputChange, reset, set ];

}