// import the original type declarations
import 'i18next';
// import all namespaces (for the default language, only)
import {defaultNS, resources} from './index';

declare module 'i18next' {
    // Extend CustomTypeOptions
    interface CustomTypeOptions {
        // custom resources type
        resources: typeof resources['en'];
        returnNull: false;
        defaultNS: 'en';
    }
}
