var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

// http://webpack.github.io/docs/configuration.html
module.exports = {
	entry:{
		/////////////////////// WEBGL PROJECTS ///////////////////////
		// script: "./ts/scroll/index.ts",
		// ffzero1: "./ts/ffzero1/index.ts",
		// autoloop: "./ts/autoloop/index.ts",
		// sphere: "./ts/sphere/index.ts",
		// preload: "./ts/preload/index.ts",
		// spaCity: "./ts/spaCity/index.ts",
		// introCity: "./ts/introCity/index.ts",
		// noise4d: "./ts/noise4d/index.ts",
		ripplesFF: "./ts/ripplesFF/index.ts",
		// stereographs: "./ts/stereographs/index.ts",
		// gimbal: "./ts/gimbal/index.ts",
		// volumetric: "./ts/volumetric/index.ts",
		// countdown: "./ts/countdown/index.ts",
		// videoSync: "./ts/videoSync/index.ts",
		// seat: "./ts/seat/index.ts",
		// terrainMap: "./ts/terrainMap/index.ts",

		/////////////////////// WEB 4.0 PROTOTYPES ///////////////////////
		// mosaics: "./ts/web4/mosaics/index.ts",
		// billboards: "./ts/web4/billboards/index.ts",
		// jumbo: "./ts/web4/jumbotron/index.ts"
	},

	output:{
		path: __dirname + "/web/",
		filename: "[name]/js/[name].js"
	},

	resolve: {
	   extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
	},

	externals:{
		Hammer: "hammerjs",
		dat: "dat",
		THREE: "three",
		Stats: "stats",
		TweenMax: "TweenMax"
	},

	module:{
		rules: [
			// Test file extension to run loader
			{test: /\.(glsl|vs|fs)$/, loader: "shader-loader" },
			{test: /\.tsx?$/, exclude: [/node_modules/, /tsOld/], loader: "ts-loader" },
			{test: /\.less$/, use: ExtractTextPlugin.extract({
				use: ["css-loader?url=false", "less-loader"]
			})}
		]
	},

	plugins:[
		// LESS/CSS output
		new ExtractTextPlugin({
			filename: "[name]/css/[name].css"
		})
	],

	// Enables dev server to be accessed by computers in local network
	devServer: {
		host: "0.0.0.0",
		port: 8000,
		publicPath: "/web/",
		disableHostCheck: true
	}
}