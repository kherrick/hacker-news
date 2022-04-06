#!/usr/bin/env bash

# change directory to the project root
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.." || exit 1

# number of commits to log, "-1", "-100", etc.
number_of_commits="$1"

get_commits() {
  cat - \
    | grep 'Latest data: ' -B4 \
    | grep 'commit' \
    | cut -d' ' -f2
}

get_tsv_from_index() {
  if [[ -n "$1" ]]; then
    commits="$(git --no-pager log "$1" | get_commits)"
  else
    commits="$(git --no-pager log | get_commits)"
  fi

  for commit in $commits; do
    while read -r line; do
      printf '%s\n' "$line"
    done < <(git --no-pager show "$commit":index.json | bin/json-to-tsv.js)
  done
}

prep_latest_data() {
  printf '['
  (
    while read -r line; do
      date="$(printf '%s' "$line" | awk -F '\t' '{print $1}' | tail -c +2 | head -c -2)"
      item_title="$(printf '%s' "$line" | awk -F '\t' '{print $2}' | tail -c +2 | head -c -2)"
      comment_url="$(printf '%s' "$line" | awk -F '\t' '{print $3}' | tail -c +2 | head -c -2)"
      item_url="$(printf '%s' "$line" | awk -F '\t' '{print $4}' | tail -c +2 | head -c -2)"

      printf '{"item_url": "%s", "item_title": "%s", "comment_url": "%s", "date": "%s"},' "$item_url" "$item_title" "$comment_url" "$date"
    done < <(get_tsv_from_index "$number_of_commits" | sort -u -t$'\t' -k1)
  ) | sed 's/.$//'
  printf ']'
}

prep_latest_data | bin/filter-items.js
