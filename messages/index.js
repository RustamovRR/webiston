// Translation files merger
import commonUz from './common/uz.json'
import commonEn from './common/en.json'

// Tools
import toolsPageUz from './tools/tools-page/uz.json'
import toolsPageEn from './tools/tools-page/en.json'
import jsonFormatterUz from './tools/json-formatter/uz.json'
import jsonFormatterEn from './tools/json-formatter/en.json'
import urlEncoderUz from './tools/url-encoder/uz.json'
import urlEncoderEn from './tools/url-encoder/en.json'
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

// Merge all translations
export const uz = {
  ...commonUz,
  ...toolsPageUz,
  ...jsonFormatterUz,
  ...urlEncoderUz,
  ...base64ConverterUz,
  ...jwtDecoderUz,
  ...latinCyrillicUz,
  ...colorConverterUz,
  ...hashGeneratorUz,
  ...uuidGeneratorUz,
  ...qrGeneratorUz,
}

export const en = {
  ...commonEn,
  ...toolsPageEn,
  ...jsonFormatterEn,
  ...urlEncoderEn,
  ...base64ConverterEn,
  ...jwtDecoderEn,
  ...latinCyrillicEn,
  ...colorConverterEn,
  ...hashGeneratorEn,
  ...uuidGeneratorEn,
  ...qrGeneratorEn,
}

// Export default for Next.js i18n
export default { uz, en }
