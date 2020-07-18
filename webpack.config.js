module.exports = {
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        }
      ]
    },
    watch: true,
    watchOptions: {
      aggregateTimeout: 200,
      ignored : ["/node_modules/"]
    }
  };