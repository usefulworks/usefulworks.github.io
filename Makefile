#
# Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
#

# default target
default: build

# build site
b build:
	bundle exec jekyll build --verbose

# nuke built site files#
clean:
	rm -rf _site

# deploy
#
# [[ commands to deply to prod ]]

# list make targets in this Makefile
h help:
	@grep '^[a-z]' Makefile

# run local server
s serve:
	kill -9 $(ps aux | grep '[j]ekyll' | awk '{print $2}')
	clear
	JEKYLL_ENV=development
	bundle exec jekyll serve -V --livereload --livereload-min-delay 3 --trace

# update gems
update:
	bundle update --bundler && bundler update
