// Translation files merger
import commonUz from './common/uz.json'
import commonEn from './common/en.json'

// Tools
import toolsPageUz from './tools/tools-page/uz.json'
import toolsPageEn from './tools/tools-page/en.json'
import jsonFormatterUz from './tools/json-formatter/uz.json'
import jsonFormatterEn from './tools/json-formatter/en.json'
import loremIpsumUz from './tools/lorem-ipsum/uz.json'
import loremIpsumEn from './tools/lorem-ipsum/en.json'
import urlEncoderUz from './tools/url-encoder/uz.json'
import urlEncoderEn from './tools/url-encoder/en.json'
import deviceInfoUz from './tools/device-info/uz.json'
import deviceInfoEn from './tools/device-info/en.json'
import screenResolutionUz from './tools/screen-resolution/uz.json'
import screenResolutionEn from './tools/screen-resolution/en.json'
import base64ConverterUz from './tools/base64-converter/uz.json'
import base64ConverterEn from './tools/base64-converter/en.json'
import jwtDecoderUz from './tools/jwt-decoder/uz.json'
import jwtDecoderEn from './tools/jwt-decoder/en.json'
import latinCyrillicUz from './tools/latin-cyrillic/uz.json'
import latinCyrillicEn from './tools/latin-cyrillic/en.json'
import colorConverterUz from './tools/color-converter/uz.json'
import colorConverterEn from './tools/color-converter/en.json'
import hashGeneratorUz from './tools/hash-generator/uz.json'
import hashGeneratorEn from './tools/hash-generator/en.json'
import uuidGeneratorUz from './tools/uuid-generator/uz.json'
import uuidGeneratorEn from './tools/uuid-generator/en.json'
import qrGeneratorUz from './tools/qr-generator/uz.json'
import qrGeneratorEn from './tools/qr-generator/en.json'
import passwordGeneratorUz from './tools/password-generator/uz.json'
import passwordGeneratorEn from './tools/password-generator/en.json'
import ogMetaGeneratorUz from './tools/og-meta-generator/uz.json'
import ogMetaGeneratorEn from './tools/og-meta-generator/en.json'
import ipInfoEn from './tools/ip-info/en.json'
import ipInfoUz from './tools/ip-info/uz.json'

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
}

// Export default for Next.js i18n
export default { uz, en }
