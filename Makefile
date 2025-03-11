#
# Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
#

.PHONY: default build clean diagnose help serve update

# set jekyll environment
#
# $PAGES_REPO_NWO substitutes for site.github.repository_nwo
#
export JEKYLL_ENV?=development
export PAGES_REPO_NWO=usefulworks/$(shell basename $(PWD))

# default target
default: build

# build site
b build: clean
	@echo building site with JEKYLL_ENV=$(JEKYLL_ENV)
	@echo PAGES_REPO_NWO=$(PAGES_REPO_NWO)
	bundle exec jekyll build --verbose

# nuke built site files#
clean:
	rm -rf _site

# deploy
#
# [[ commands to deploy to prod ]]

diagnose:
	bundle exec jekyll doctor

# list make targets in this Makefile
h help:
	@grep '^[a-z].*:' Makefile

# run local server
s serve: clean
	bundle exec jekyll serve -V --livereload --livereload-min-delay 3 --trace

# update gems
update:
	gem update --system && gem update
	bundle update --bundler && bundler update
