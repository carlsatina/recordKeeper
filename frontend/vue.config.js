const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

const featureFlags = {
  __VUE_OPTIONS_API__: true,
  __VUE_PROD_DEVTOOLS__: false,
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
}

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin(featureFlags)
    ]
  },
  chainWebpack: config => {
    config.plugin('feature-flags').tap(() => {
      return [featureFlags]
    })
  }
})
