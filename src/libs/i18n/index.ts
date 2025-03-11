import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import cn from "./locales/cn.json";
import bm from "./locales/bm.json";

export const defaultNS = "common";
export const resources = {
  en: {
    // common: common_en,
    translation: en,
    // validation: validation_en,
  },
  cn: {
    // common: common_zh_cn,
    translation: cn,
    // validation: validation_zh_cn,
  },
  bm: {
    // common: common_zh_cn,
    translation: bm,
    // validation: validation_zh_cn,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // returnNull: false,
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: resources,
    compatibilityJSON: "v3",
    lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: ["en", "cn", "bm"],
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

const changeLg = (lg: string) => {
  i18n.changeLanguage(lg);
};

// let translateLg: TFunction<Namespace<'common' | 'translation' | 'validation'>> = (lg: any) => {
//     return i18n.t(lg);
// };

export {
  useTranslation,
  changeLg,
  // translateLg
};
