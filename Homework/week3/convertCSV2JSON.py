import sys


def convertToCSV(filename):
	try:
		csvfile = open(filename,'rb')
		jsonFilename = filename.split('.')[0]+'.json'
		print filename
	except:
		print filename + ' is not an existing file'
		return
	jsonfile = open(jsonFilename, 'w')
	indexes = next(csvfile).replace('\r\n','').split(",")
	
	jsonString = '[\n'

	for row in csvfile:
		rowList = row.replace('\r\n','').split(',')
		jsonString = jsonString + '{'
		# I use for i in range(len(rowList)) instead of for e in list
		# because I need the index number for another list.
		for i in range(len(rowList)):
			key = rowList[i].replace('\n','')
			indexes[i] = indexes[i].replace('\n','')
			jsonString = jsonString + '"' + indexes[i] + '" : "' + key + '",\n'
		jsonString = jsonString[:-2] + '\n},\n'
		#jsonfile.write(row)
	jsonfile.write(jsonString[:-2]+'\n]')
		
	print indexes


if __name__ == '__main__':
	filenames = sys.argv[1:]
	for filename in filenames:
		convertToCSV(filename)
