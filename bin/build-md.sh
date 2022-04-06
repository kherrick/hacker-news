#!/usr/bin/env bash

project_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."

# change directory to the project root
cd "$project_root" || exit 1

declare -a detected_dates

flag=0
count=0
last_date=""

# default number of commits set to 300
number_of_commits="-300"
if [[ -n "$1" ]]; then
  number_of_commits="$1"
fi

# loop through lines returned from commits-to-tsv
while IFS=$'\t' read -r -a line; do
  item_url="${line[0]}"
  comment_url="${line[1]}"
  item_title="${line[2]}"
  date_time="$(printf '%s' "${line[3]}" | cut -c1-20)"
  date="$(printf '%s' "$date_time" | cut -c1-10)"

  # generate a filename from the line
  md5sum="$(printf '%s\t%s' "$comment_url" "$item_url" | md5sum | cut -c1-32)"
  filepath="archives/$(printf '%s' "$date" | cut -c1-4)/$date"
  filename="$filepath/$md5sum.md"

  # if the file already exists, move on
  if [[ -f "$filename" ]]; then
    continue;
  fi

  # keep track of the first time we see a date
  if [[ "$date" != "$last_date" ]]; then
    flag=0
  fi

  if [[ $flag -eq 0 ]]; then
    mkdir -p "$filepath"

    # build an array of dates
    detected_dates[$count]="$date";
    # increment count
    ((count = count + 1))

    flag=1
  fi

  # add content to filename
  printf '# [Published on %s](index.md)\n\n' "$date" > "$filename"
  printf '%s\n' "* [$date_time]($comment_url) - [$item_title]($item_url)" >> "$filename"

  last_date="$date"
done < <(./bin/commits-to-tsv.sh "$number_of_commits")

# loop through the array of dates
for archive_date in "${detected_dates[@]}"; do
  getFiles() {
    for file in *; do
      if [[ $file == 'index.md' ]]; then
        continue;
      fi

      grep '\*' "$file"
    done
  }

  archive_year="$(printf '%s' "$archive_date" | cut -c1-4)"
  filepath="archives/$archive_year/$archive_date"

  # move to dated archives directory
  cd "$project_root/$filepath" || exit 1

  # add archives headers to index.md
  printf '# [Hacker News](../../../README.md)\n\n' > "index.md"
  printf '## [Archives](../../index.md) for [%s](../index.md)\n\n' "$archive_year" >> "index.md"
  printf '### [Archives](../../index.md) for [%s](index.md)\n\n' "$archive_date" >> "index.md"

  # add content to index
  while read -r line; do
    # add line to index.md
    printf '%s\n' "$line" >> "index.md"
  done < <(getFiles |  sort -r)
done

# add sub header to README.md
printf '\n## [Archives](archives/index.md)\n\n' >> "$project_root/README.md"

# move to archives directory
mkdir -p "$project_root/archives"
cd "$project_root/archives" || exit 1

# add header to archives/index.md
printf '# [Hacker News](../README.md)\n\n' > "index.md"

# add sub header to archives/index.md
printf '## [Archives](index.md)\n\n' >> "index.md"

# shellcheck disable=SC2012
for archive_year in $(ls -1 | sort -r | grep -v index.md); do
  # add bullet to archives index.md
  printf '* [%s](%s/index.md)\n' "$archive_year" "$archive_year" >> "index.md"

  # add bullet to README.md
  printf '* [%s](archives/%s/index.md)\n' "$archive_year" "$archive_year" >> "$project_root/README.md"

  # change directory to the archive year
  cd "$archive_year" || exit 1

  # add archives headers to archive year's index.md
  printf '# [Hacker News](../../README.md)\n\n' > "index.md"
  printf '## [Archives](../index.md) for [%s](index.md)\n\n' "$archive_year" >> "index.md"

  # shellcheck disable=SC2012
  for archive_date in $(ls -1 | sort -r); do
    if [[ "$archive_date" == 'index.md' ]]; then
      continue;
    fi

    # add bullet to index.md
    printf '* [%s](%s/index.md)\n' "$archive_date" "$archive_date" >> "index.md"
  done

  # go back to where we were :-)
  cd - > /dev/null || exit 1
done
