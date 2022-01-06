import React, {useState} from 'react';
import { withStyles } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import Switch from '@material-ui/core/Switch';

const BlueSwitch = withStyles({
  switchBase: {
    '&$checked': {
      color: blue[700],
    },
    '&$checked + $track': {
      backgroundColor: blue[700],
    },
  },
  checked: {},
  track: {},
})(Switch);

// useLocalStorage hook implementation taken from here:
// implementation taken from here: https://usehooks.com/useLocalStorage/

function ToggleItem({propertyName, defaultValue, label, changeHandler}) {
    const [localStorageProp, setLocalStorageProp] = useLocalStorage(propertyName, defaultValue);

    const toggleValue = () => {
        let newLocalStoragePropVal = !localStorageProp;
        setLocalStorageProp(newLocalStoragePropVal);
        changeHandler(newLocalStoragePropVal);
    }

    return (
        <div>
            <BlueSwitch
                checked={localStorageProp}
                onChange={() => toggleValue()}
                name="checkedValue"
            /> {label}
        </div>                                                   
    );
}

// Hook
function useLocalStorage(key, initialValue) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.log(error);
            return initialValue;
        }
    });
    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
            value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

export default ToggleItem;
