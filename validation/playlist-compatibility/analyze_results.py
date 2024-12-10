import csv

def analyze_import(filename):
    with open(filename) as file:
        reader = csv.reader(file, delimiter=",")
        next(reader)
        total = 0
        successful = 0
        multiple = 0
        for row in reader:
            total += 1
            num_recordings = int(row[1])
            if num_recordings > 0:
                successful += 1
                if num_recordings > 1:
                    multiple += 1

        print(f"Analysis of {filename}")
        print(f"Total number of import attempts: {total}")
        print(f"Total number of successful imports: {successful}")
        print(f"Number of imported ISRCs resolving to multiple recordings: {multiple}")

def analyze_export(filename):
    with open(filename) as file:
        reader = csv.reader(file, delimiter=",")
        next(reader)
        total = 0
        successful = 0
        multiple = 0
        for row in reader:
            total += 1
            num_resolved = int(row[1])
            if num_resolved> 0:
                successful += 1
                if num_resolved> 1:
                    multiple += 1

        print(f"Analysis of {filename}")
        print(f"Total number of export attempts: {total}")
        print(f"Total number of successful exports: {successful}")
        print(f"Number of exported ISRCs resolving to multiple tracks: {multiple}")

print("IMPORT ANALYSIS\n")
analyze_import("import/spotify-import-results.csv")
print()
analyze_import("import/apple-music-import-results.csv")

print("\nEXPORT ANALYSIS\n")
analyze_export("export/spotify-export-results.csv")
print()
analyze_export("export/apple-export-results.csv")
