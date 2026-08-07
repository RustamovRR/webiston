// Translation files merger

import commonEn from "./common/en.json"
import commonRu from "./common/ru.json"
import commonUz from "./common/uz.json"
import base64ConverterEn from "./tools/base64-converter/en.json"
import base64ConverterRu from "./tools/base64-converter/ru.json"
import base64ConverterUz from "./tools/base64-converter/uz.json"
import cameraRecorderEn from "./tools/camera-recorder/en.json"
import cameraRecorderRu from "./tools/camera-recorder/ru.json"
import cameraRecorderUz from "./tools/camera-recorder/uz.json"
import colorConverterEn from "./tools/color-converter/en.json"
import colorConverterRu from "./tools/color-converter/ru.json"
import colorConverterUz from "./tools/color-converter/uz.json"
import deviceInfoEn from "./tools/device-info/en.json"
import deviceInfoRu from "./tools/device-info/ru.json"
import deviceInfoUz from "./tools/device-info/uz.json"
import hashGeneratorEn from "./tools/hash-generator/en.json"
import hashGeneratorRu from "./tools/hash-generator/ru.json"
import hashGeneratorUz from "./tools/hash-generator/uz.json"
import ipInfoEn from "./tools/ip-info/en.json"
import ipInfoRu from "./tools/ip-info/ru.json"
import ipInfoUz from "./tools/ip-info/uz.json"
import jsonFormatterEn from "./tools/json-formatter/en.json"
import jsonFormatterRu from "./tools/json-formatter/ru.json"
import jsonFormatterUz from "./tools/json-formatter/uz.json"
import jwtDecoderEn from "./tools/jwt-decoder/en.json"
import jwtDecoderRu from "./tools/jwt-decoder/ru.json"
import jwtDecoderUz from "./tools/jwt-decoder/uz.json"
import latinCyrillicEn from "./tools/latin-cyrillic/en.json"
import latinCyrillicRu from "./tools/latin-cyrillic/ru.json"
import latinCyrillicUz from "./tools/latin-cyrillic/uz.json"
import loremIpsumEn from "./tools/lorem-ipsum/en.json"
import loremIpsumRu from "./tools/lorem-ipsum/ru.json"
import loremIpsumUz from "./tools/lorem-ipsum/uz.json"
import microphoneTestEn from "./tools/microphone-test/en.json"
import microphoneTestRu from "./tools/microphone-test/ru.json"
import microphoneTestUz from "./tools/microphone-test/uz.json"
import ogMetaGeneratorEn from "./tools/og-meta-generator/en.json"
import ogMetaGeneratorRu from "./tools/og-meta-generator/ru.json"
import ogMetaGeneratorUz from "./tools/og-meta-generator/uz.json"
import passwordGeneratorEn from "./tools/password-generator/en.json"
import passwordGeneratorRu from "./tools/password-generator/ru.json"
import passwordGeneratorUz from "./tools/password-generator/uz.json"
import qrGeneratorEn from "./tools/qr-generator/en.json"
import qrGeneratorRu from "./tools/qr-generator/ru.json"
import qrGeneratorUz from "./tools/qr-generator/uz.json"
import screenResolutionEn from "./tools/screen-resolution/en.json"
import screenResolutionRu from "./tools/screen-resolution/ru.json"
import screenResolutionUz from "./tools/screen-resolution/uz.json"
import toolsPageEn from "./tools/tools-page/en.json"
import toolsPageRu from "./tools/tools-page/ru.json"
// Tools
import toolsPageUz from "./tools/tools-page/uz.json"
import urlEncoderEn from "./tools/url-encoder/en.json"
import urlEncoderRu from "./tools/url-encoder/ru.json"
import urlEncoderUz from "./tools/url-encoder/uz.json"
import uuidGeneratorEn from "./tools/uuid-generator/en.json"
import uuidGeneratorRu from "./tools/uuid-generator/ru.json"
import uuidGeneratorUz from "./tools/uuid-generator/uz.json"

// Merge all translations
export const uz = {
  ...commonUz,
  ...toolsPageUz,
  ...jsonFormatterUz,
  ...urlEncoderUz,
  ...deviceInfoUz,
  ...screenResolutionUz,
  ...base64ConverterUz,
  ...jwtDecoderUz,
  ...latinCyrillicUz,
  ...colorConverterUz,
  ...hashGeneratorUz,
  ...uuidGeneratorUz,
  ...qrGeneratorUz,
  ...passwordGeneratorUz,
  ...ogMetaGeneratorUz,
  ...loremIpsumUz,
  ...ipInfoUz,
  ...cameraRecorderUz,
  ...microphoneTestUz
}

export const en = {
  ...commonEn,
  ...toolsPageEn,
  ...jsonFormatterEn,
  ...urlEncoderEn,
  ...deviceInfoEn,
  ...screenResolutionEn,
  ...base64ConverterEn,
  ...jwtDecoderEn,
  ...latinCyrillicEn,
  ...colorConverterEn,
  ...hashGeneratorEn,
  ...uuidGeneratorEn,
  ...qrGeneratorEn,
  ...passwordGeneratorEn,
  ...ogMetaGeneratorEn,
  ...loremIpsumEn,
  ...ipInfoEn,
  ...cameraRecorderEn,
  ...microphoneTestEn
}

export const ru = {
  ...commonRu,
  ...toolsPageRu,
  ...jsonFormatterRu,
  ...urlEncoderRu,
  ...deviceInfoRu,
  ...screenResolutionRu,
  ...base64ConverterRu,
  ...jwtDecoderRu,
  ...latinCyrillicRu,
  ...colorConverterRu,
  ...hashGeneratorRu,
  ...uuidGeneratorRu,
  ...qrGeneratorRu,
  ...passwordGeneratorRu,
  ...ogMetaGeneratorRu,
  ...loremIpsumRu,
  ...ipInfoRu,
  ...cameraRecorderRu,
  ...microphoneTestRu
}

// Export default for Next.js i18n
export default { uz, en, ru }
