import json, sys

# USAGE
# python3 bump_version.py 'X.X.X'


package_files = [
    'packages/cashc/package.json',
    'packages/utils/package.json',
    'packages/cashscript/package.json',
]

index_file = 'packages/cashc/src/index.ts'

editing = lambda filename: print('editing %s...' % filename)
# packages/cashc/src/index.ts
if __name__ == "__main__":
    _, version = sys.argv
    for file in package_files: 
        with open(file, 'r+') as f:
            data = json.load(f)
            data['version'] = str(version)
            f.seek(0)
            json.dump(data, f, indent=4)
            f.truncate()
        editing(file)
    
    with open(index_file, 'r+') as f:
        data = f.readlines()
        data[0] = "export const version = '%s'; // Need to keep version on line 1\n" % version
        f.seek(0)
        f.write(''.join(data))
        editing(index_file)
    print("Changed package version to '%s'." % version)