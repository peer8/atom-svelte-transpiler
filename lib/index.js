'use strict'

const svelte = require('svelte/compiler')

module.exports = {
  getCacheKeyData: function (source, filename, options, meta) {
    const fs = require('fs')
    const path = require('path')

    const pkgJsonData = fs.readFileSync(path.join(meta.path, 'package.json'))

    let cacheKeyData = ''
    if (options.cacheKeyFiles) {
      cacheKeyData = options.cacheKeyFiles.reduce((acc, relPath) => {
        return `${acc}\n${fs.readFileSync(path.join(meta.path, relPath))}`
      }, '')
    }

    return `${cacheKeyData}\nenv:${process.env.BABEL_ENV}\nv:${pkgJsonData.version}`
  },

  transpile: function (source, filename, options, meta) {
    const path = require('path')

    const result = svelte.compile(source, Object.assign({}, options, {
      format: 'cjs',
      filename: filename
    }))

    return {code: result.js.code, map: result.js.map}
  }
}
