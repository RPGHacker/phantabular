import { defineConfig } from "vite";
import { resolve } from "path";
import cssSourcemap from 'vite-plugin-css-sourcemap';

export default defineConfig(({ mode }) => {
	const config = {
		plugins: [],
		
		root: resolve(__dirname, "src"),
		publicDir: "../assets/public",
		
		build: {
			outDir: "../dist",
			emptyOutDir: true,
			
			sourcemap: mode !== "release",
			minify: mode === "release",
			cssMinify: mode === "release" ? undefined : false,
			
			rollupOptions: {
				input: {
					archive: resolve(__dirname, "src/archive/archive.html"),
					background: resolve(__dirname, "src/background/background.html"),
					popup: resolve(__dirname, "src/popup/popup.html"),
					settings: resolve(__dirname, "src/settings/settings.html"),
				},
			},
		},
		
		css: {
			devSourcemap: mode !== "release",
		},
	};
	
	if (mode !== "release") {
		config.plugins.push(cssSourcemap());
	}
	
	return config;
});
