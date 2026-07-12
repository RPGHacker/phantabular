import zipfile
import os
from pathlib import Path
import subprocess
import sys

self_dirname = os.path.dirname(__file__)

# Build extension
os.chdir(self_dirname)

if sys.platform == "win32":
    npm_requires_shell = True
else:
    npm_requires_shell = False


print("Installing dependencies...")
if subprocess.run(["npm", "install"], shell=npm_requires_shell).returncode != 0:
	sys.exit("npm install failed.")

print("Building extension...")
if subprocess.run(["npm", "run", "build"], shell=npm_requires_shell).returncode != 0:
	sys.exit("npm run build failed.")

# Package extension
print("Packaing extension...")

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

def add_dir(relative_dir_name, target_dir_override = None):
	if target_dir_override == None:
		target_dir_override = relative_dir_name
	source_dir_name = self_dirname + "/" + relative_dir_name
	add_dir_to_target_dir(source_dir_name, target_dir_override)
	
def add_file(relative_file_name):
	source_file_name = self_dirname + "/" + relative_file_name
	output_file.write(source_file_name, relative_file_name)



add_dir("dist", "")
add_file("LICENSE")

print("Packaging successfully completed!")
