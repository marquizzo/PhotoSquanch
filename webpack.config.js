var webpack = require("webpack");
var path = require("path");
//var ExtractTextPlugin = require("extract-text-webpack-plugin");

// http://webpack.github.io/docs/configuration.html
module.exports = {
	entry:{
		photoSquanch: "./src/App.ts",
	},

	output:{
		path: __dirname + "/web/",
		filename: "js/[name].js"
	},

	resolve: {
	   extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
	},

	externals:{
		Hammer: "hammerjs",
		dat: "dat",
		Stats: "stats",
		TweenMax: "TweenMax"
	},

	module:{
		rules: [
			// Test file extension to run loader
			{
				test: /\.(glsl|vs|fs)$/, 
				loader: "ts-shader-loader"
			},
			{
				test: /\.tsx?$/, 
				exclude: [/node_modules/, /tsOld/],
				loader: "ts-loader"
			},
			/*{
				test: /\.less$/,
				use: ExtractTextPlugin.extract({
					use: ["css-loader?url=false", "less-loader"]
				})
			}*/
		]
	},

	plugins:[
		// LESS/CSS output
		/*new ExtractTextPlugin({
			filename: "css/[name].css"
		})*/
	],

	// Enables dev server to be accessed by computers in local network
	devServer: {
		host: "0.0.0.0",
		port: 8000,
		publicPath: "/web/",
		disableHostCheck: true
	}
}