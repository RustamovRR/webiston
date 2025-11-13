const fs = require('fs-extra')
const path = require('path')

const cesiumSource = path.join(__dirname, '../node_modules/cesium/Build/Cesium')
const cesiumDest = path.join(__dirname, '../public/cesium')

async function copyCesium() {
  try {
    console.log('📦 Copying Cesium static files...')
    await fs.copy(cesiumSource, cesiumDest)
    console.log('✅ Cesium files copied successfully!')
  } catch (err) {
    console.error('❌ Error copying Cesium files:', err)
  }
}

copyCesium()
