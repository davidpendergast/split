import os
import shutil

    
DIST_DIR = "dist"
ITEMS_TO_INCLUDE = [
    "assets", 
    "index.html", 
    "game.js", 
    "utils.js",
    "sounds.js", 
    "INFO.txt"
]

def _ask_yes_or_no_question(question):
    print("")  # newline to make it a little less claustrophobic
    answer = None
    while answer is None:
        txt = input("  " + question + " (y/n): ")
        if txt == "y" or txt == "Y":
            answer = True
        elif txt == "n" or txt == "N":
            answer = False
    print("")
    return answer
    
def _copy_item(item, dest_dir):
    if os.path.isdir(item):
        print("INFO: copying directory {} to {}...".format(item, dest_dir))
        shutil.copytree(item, os.path.join(dest_dir, item))
    elif os.path.isfile(item):
        print("INFO: copying file {} to {}...".format(item, dest_dir))
        shutil.copy(item, dest_dir)
    else:
        raise ValueError("ERROR: item is not a file or directory: {}".format(item))

if __name__ == "__main__":
    
    if os.path.exists(DIST_DIR):
        ans = _ask_yes_or_no_question("Overwrite {}?".format(DIST_DIR))
        if ans:
            print("INFO: deleting pre-existing build {}".format(DIST_DIR))
            for filename in os.listdir(DIST_DIR):
                file_path = os.path.join(DIST_DIR, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    print('Failed to delete %s. Reason: %s' % (file_path, e))
        else:
            print("INFO: user opted to not overwrite pre-existing build, exiting")
    
    print("")
    for item in ITEMS_TO_INCLUDE:
        _copy_item(item, DIST_DIR)
        
    print("\nINFO: Successfully created {} and transferred {} item(s). Exiting."
            .format(DIST_DIR, len(ITEMS_TO_INCLUDE)))
    
        
