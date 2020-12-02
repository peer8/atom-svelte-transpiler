'use strict'

const svelte = require('svelte/compiler')
const sass = require('sass')
const { dirname, join } = require('path')
const { readFileSync } = require('fs')

module.exports = {
  getCacheKeyData: function (source, filename, options, meta) {
    const pkgJsonData = readFileSync(join(meta.path, 'package.json'))
    let cacheKeyData = ''
    if (options.cacheKeyFiles) {
      cacheKeyData = options.cacheKeyFiles.reduce((acc, relPath) => {
        return `${acc}\n${readFileSync(join(meta.path, relPath))}`
      }, '')
    }

    return `${cacheKeyData}\nenv:${process.env.BABEL_ENV}\nv:${pkgJsonData.version}`
  },

  transpile: async function (source, filename, options, meta) {
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
      source,
      Object.assign({}, options, {
        format: 'cjs',
        filename: filename,
      }))

    return {code: result.js.code, map: result.js.map}
  }
}
