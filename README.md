[![Build Status](https://travis-ci.org/davidrunger/rc-languages-selector.svg?branch=master)](https://travis-ci.org/davidrunger/rc-languages-selector)

# Rosetta Code Languages Selector

[rosettacode.org][rosettacode] is a great website for comparing
programming languages and/or learning a new language based on others
that you already know. However, for each sample programming task, there
are so many implementations available in different languages that it can
be difficult to sift through the clutter and find the code samples for
the languages that you are focusing on. This extension solves that
problem by only showing code samples for languages that you have
specifically selected.

# Installation

Install through the Google Chrome Web Store:
[Rosetta Code Languages Selector][rcls]

[rcls]: https://chrome.google.com/webstore/detail/rosetta-code-languages-se/icjinpkbplhheomciikehmieadoibljg

# Usage

Navigate to any programming Task page at [rosettacode.org][rosettacode].
*Note*: The extension will only be activated on Task pages.

[most-revised]: http://rosettacode.org/wiki/Special:MostRevisions

After the page loads, the extension will inject a box that looks
something like this at the top of the page:

![Languages Selector Screenshot](images/screenshot-collapsed.png?raw=true)

Click the "Select Languages" button to reveal a form that allows you to
select which languages to display.

![Languages Selector Screenshot](images/screenshot-expanded-640x400.png?raw=true)

You can select all/none of the languages using the "Toggle all" button.
Because there are so many languages, it is highly recommended that you
search using the "Filter" input box when toggling any specific language
on or off, rather than scrolling to it.

When you are done selecting your language(s), click "Hide Form" to hide
the form again. Your language preferences will be persisted as you
navigate between programming tasks and also after closing and reopening
the browser.

"Pause Filtering" will temporarily show all languages and allow you
later to resume filtering your selected list of languages.

Enjoy your greatly decluttered Rosetta Code browsing experience. :)

# Changelog

[See here.][changelog]

[changelog]: ./CHANGELOG.md

# Running the Tests

From the root directory of the project, launch the test server with

```sh
ruby spec/test_server.rb
```

After you have run `$ bundle install` and installed a modern version of
phantomjs, run the tests in a separate tab with

```sh
rspec
```

# Contributing

Open an issue and/or pull request. Thanks!

# License

MIT

[rosettacode]: http://rosettacode.org
