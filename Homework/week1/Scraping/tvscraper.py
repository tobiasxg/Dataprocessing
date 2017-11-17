#!/usr/bin/env python
# Name: Tobias Garritsen
# Student number: 10779582
'''
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
'''
import csv

from pattern.web import URL, DOM

from bs4 import BeautifulSoup

import string

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'

def dom_elements_by_class(dom):
	# get body of dom
	dom_body = dom.body
	titles = list()
	# find all tags by tagname = 'a'
	all_a = dom_body.get_elements_by_tagname('a')
	next_is_title = False
	# loop over all data
	for a in all_a:
		if next_is_title:
			next_is_title=False
			# check if indeed title, if and only if next image is found, as said in the next if statement
			if 'adv_li_tt' in a.source:
				titles.append(a.content)
		# when an image is found, the next 'a' will very likely be the title
		a_img = a.get_elements_by_tagname('img')
		if a_img != []:
			# used to find the right 'a' with title
			next_is_title = True

	# value gives the serie rating
	ratings = dom_body.get_elements_by_classname("value")
	for i in range(len(ratings)):
		ratings[i] = ratings[i].content

	# genre gives the serie genre
	genres = dom_body.get_elements_by_classname("genre")
	for i in range(len(genres)):
		genres[i] = genres[i].content.replace("\n","")

	# find all tags by tagname = 'p'
	actors_raw = dom_body.get_elements_by_tagname("p")
	actors = list()
	for star in actors_raw:
		# if in a tag = 'p' is the word Stars, all actors are given in that part
		if "Stars" in star.content:
			star_list = ""
			# add all moviestars to a single String of stars
			for movie_stars in star.get_elements_by_tagname("a"):
				star_list = star_list + movie_stars.content + ", "
			actors.append(star_list)

	# runtime gives the serie runtime
	runtimes = dom_body.get_elements_by_classname("runtime")[1:] # first is not nessesary
	for i in range(len(runtimes)):
		runtimes[i] = runtimes[i].content

	# sort the list with all corresponding fields and remove strange characters
	# (for the strange characters, two options where possible, one is removing the entire movie, the other one is removing only the characters, I did the second option)
	end_list = list()
	for i in range(len(titles)):
		print titles[i]
		end_list.append([titles[i].encode('ascii',errors='ignore'), ratings[i].encode('ascii',errors='ignore'), genres[i].encode('ascii',errors='ignore'),actors[i].encode
			('ascii',errors='ignore'),runtimes[i].encode('ascii',errors='ignore')])
	return end_list
	

def extract_tvseries(dom):
	'''
	Extract a list of highest rated TV series from DOM (of IMDB page).

	Each TV series entry should contain the following fields:
	- TV Title
	- Rating
	- Genres (comma separated if more than one)
	- Actors/actresses (comma separated if more than one)
	- Runtime (only a number!)
	'''

	# my code is in the dom_elements_by_class function
	data = dom_elements_by_class(dom)

	return data


def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest rated TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # loop over all tvseries to load their right values in the csv
    for i in range(len(tvseries)):
	    print tvseries[i]
	    writer.writerow(tvseries[i])


if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)
    print tvseries

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)

