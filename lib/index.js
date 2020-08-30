'use strict'

const svelte = require('svelte/compiler')
const sass = require('sass')
const { dirname } = require('path')

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

  transpile: async function (source, filename, options, meta) {
    const path = require('path')

    const code = await svelte.preprocess(source, {
      style: ({ content, attributes }) => {
		    // only process <style lang="sass">
		    if (!['scss', 'sass'].includes(attributes.lang)) return

				const filepath = filename || arguments[1]

				const { css, stats } = sass.renderSync({
					file: filepath,
					data: content,
					includePaths: [
						dirname(filepath),
					],
				})

		    return {
			    code: css.toString(),
			    dependencies: stats.includedFiles
		    }
	    }
    })

    const result = svelte.compile(
      code.code,
      Object.assign({}, options, {
        format: 'cjs',
        filename: filename,
        css: false,
      }))

    return {code: result.js.code, map: result.js.map}
  }
}
