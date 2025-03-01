#!/bin/sh

kill -9 $(ps aux | grep '[j]ekyll' | awk '{print $2}')
clear
JEKYLL_ENV=development
bundle exec jekyll serve -V --livereload --livereload-min-delay 2 --trace
