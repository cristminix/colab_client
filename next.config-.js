const { ESBuildMinifyPlugin } = require('esbuild-loader');

function useEsbuildMinify(config, options) {
  const { minimizer } = config.optimization;
  const terserIndex = minimizer.findIndex(
    minifier => minifier.constructor.name === 'TerserPlugin',
  );

  minimizer.splice(terserIndex, 1, new ESBuildMinifyPlugin(options));
}

function useEsbuildLoader(config, options) {
  const { rules } = config.module;
  try{
    const rule = rules.find((rule) => {
      if(typeof rule.test != 'undefined'){
        rule.test.test('.js')
        // console.log(rule)       
      }
    
    });

    if(typeof rule != 'undefined'){
      rule.use = {
        loader: 'esbuild-loader',
        options,
      };  
    }
    
  }catch(e){
    // console.log(e)
  }
  
}

module.exports = {
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        React: 'react',
      }),
    );

    useEsbuildMinify(config);
    useEsbuildLoader(config, {
      // Specify `tsx` if you're using TypeScript
      loader: 'jsx',
      target: 'es2017',
    });

    return config;
  },
};
