let svgoPrefixIdsCount = 0

module.exports = {
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            // Disable default remove viewbox plugin
            removeViewBox: false,
            // Do not remove ids which are not referenced within the svg (important for styling iQ floor plans)
            cleanupIds: false,
          },
        },
      },
      // Avoid collisions with ids in other SVGs,
      // which was causing incorrect gradient directions
      // https://github.com/svg/svgo/issues/1746#issuecomment-1803600573
      //
      // Previously, this was a problem where unique ids
      // could not be generated since svgo@3
      // https://github.com/svg/svgo/issues/674
      // https://github.com/svg/svgo/issues/1746
      {
        name: 'prefixIds',
        params: {
          delim: '__',
          prefixClassNames: false,
          prefix: (_, node) => {
            // Required to avoid svg path collision - each svg gets the file name and a differentiating index
            const svgName = node.path
              ? `${node.path.split('/').pop().split('.')[0]}-`
              : ''

            return `${svgName}${svgoPrefixIdsCount++}_svg`
          },
        },
      },
      // Do not remove elements hidden via styles, 0 height, 0 width, etc (important for styling iQ floor plans)
      { name: 'removeHiddenElems', active: false },
    ],
  },
}
