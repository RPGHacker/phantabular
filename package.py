import zipfile
import os
from pathlib import Path

self_dirname = os.path.dirname(__file__)

Path(self_dirname + "/build").mkdir(parents=True, exist_ok=True)

output_file = zipfile.ZipFile(self_dirname + "/build/phantabular.xpi", "w", compression=zipfile.ZIP_DEFLATED)

def add_dir_to_target_dir(source_dir_name, target_dir_name):
	for (dirpath, dirnames, filenames) in os.walk(source_dir_name):
		for dirname in dirnames:
			source = dirpath + "/" + dirname
			target = target_dir_name + "/" + dirname
			print("Writing dir: \"" + source + "\" -> \"" + target + "\"")
			add_dir_to_target_dir(source, target)
			
			dirnames[:] = []
		
		for filename in filenames:
			source = dirpath + "/" + filename
			target = target_dir_name + "/" + filename
			print("Writing file: \"" + source + "\" -> \"" + target + "\"")
			output_file.write(source, target)

def add_dir(relative_dir_name):
	source_dir_name = self_dirname + "/" + relative_dir_name
	add_dir_to_target_dir(source_dir_name, relative_dir_name)
	
def add_file(relative_file_name):
	source_file_name = self_dirname + "/" + relative_file_name
	output_file.write(source_file_name, relative_file_name)



# We manually select what to include in our archive, so that we can exclude
# unused stuff and minimize overall package size.
add_dir("archive")
add_dir("background")
add_dir("deps/dexie/dist")
add_file("deps/dexie/LICENSE")
add_file("deps/jexl/jexl.bundle.js")
add_file("deps/jexl/LICENSE.txt")
add_file("deps/mvp/mvp.css")
add_file("deps/mvp/LICENSE")
add_file("deps/open-color/open-color.css")
add_file("deps/open-color/LICENSE")
add_dir("icons")
add_dir("images")
add_dir("popup")
add_dir("settings")
add_dir("shared")
add_dir("LICENSE")
add_file("manifest.json")