import fs from 'fs'

export default class {
  #config

  constructor(config) {
    this.#config = config
  }

  removeFile(dirPath, fileName) {
    if (!fileName) return

    try {
      fs.unlinkSync(`${this.#config.uploads.path}/${dirPath}/${fileName}`)
    } catch(e) {}
  }

  saveFromDataUrl(dirPath, fileName, data) {
    fs.mkdirSync(`${this.#config.uploads.path}/${dirPath}`, {mode: 0o755, recursive: true})
    const content = data.dataUrl.replace(/^data:[^;]*;base64,/, '')
    fs.writeFileSync(`${this.#config.uploads.path}/${dirPath}/${fileName}`, Buffer.from(content, 'base64'))
  }
}
