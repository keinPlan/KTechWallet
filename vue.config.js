module.exports = {
  configureWebpack: {
    devtool: 'source-map',
  },

  pages: {
    index: {
      // entry for the page
      entry: 'src/KTechWallet/main.ts',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: 'index.html',
      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'KTechWallet',
      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },

  },

  baseUrl: process.env.BaseURL ? process.env.BaseURL :'/KTechWallet/',
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: false,
  parallel: undefined,
  css: undefined
}