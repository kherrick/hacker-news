#!/usr/bin/env bash

# change directory to the project root
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.." || exit 1

sed -i 's#</title>#</title><base href="/hacker-news/" />#g' index.html

npx posthtml index.html -u htmlnano
