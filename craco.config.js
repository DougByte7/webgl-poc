const path = require("path")
const { addBeforeLoader, loaderByName } = require("@craco/craco")

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
    configure: (webpackConfig, { env, paths }) => {
      const fragLoader = {
        test: /\.(vert|frag)$/,
        use: ["raw-loader"],
      }

      addBeforeLoader(webpackConfig, loaderByName("file-loader"), fragLoader)

      return webpackConfig
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "^@(.*)$": "<rootDir>/src$1",
      },
    },
  },
}
