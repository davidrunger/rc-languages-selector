window.LanguageSelector = function LanguageSelector() {
  var allLanguages = LanguageSelector.ALL_LANGUAGES;
  this.selectedLanguages = this.previouslyStoredLanguages() || allLanguages;
  this.showingForm = false;
  this.paused = false;
}

LanguageSelector.ALL_LANGUAGES = window.rclsAllLanguages;
LanguageSelector.LOCAL_STORAGE_KEY = 'rcls-selected-languages';

LanguageSelector.prototype.previouslyStoredLanguages = function () {
  var key = LanguageSelector.LOCAL_STORAGE_KEY;
  if (window.localStorage[key]) {
    return JSON.parse(window.localStorage[key]);
  } else {
    return null;
  }
};

LanguageSelector.prototype.run = function () {
  var self = this;
  this.fetchTemplates()
  .then(function (mainTemplate, checkboxesTemplate) {
    self.templatize(mainTemplate, checkboxesTemplate);
    self.injectExtension();
    self.bindHandlers();
    self.showOnlySelectedLanguages(this.selectedLanguages);
  })
};

LanguageSelector.prototype.fetchTemplates = function () {
  // wait for all templates to be fetched
  return $.when(
    $.get(chrome.extension.getURL('/html/languages-selector-main.html'))
    .then(function (template, _, _) { return template }),

    $.get(chrome.extension.getURL('/html/language-checkboxes.html'))
    .then(function (template, _, _) { return template })
  );
};

LanguageSelector.prototype.templatize = function (mainTemplate, checkboxesTemplate) {
  this.mainTemplateFn = _.template(mainTemplate);
  this.languageCheckboxesTemplateFn = _.template(checkboxesTemplate);
};

LanguageSelector.prototype.injectExtension = function () {
  var allLanguages = LanguageSelector.ALL_LANGUAGES;
  var content = this.mainTemplateFn({
    showingForm: this.showingForm,
    showingAllLanguages: allLanguages.length === this.selectedLanguages.length
  });

  $(content).prependTo('#content');
  this.injectDynamicContent();
};

LanguageSelector.prototype.matchingLanguages = function (search) {
  var allLanguages = LanguageSelector.ALL_LANGUAGES;

  if (search === '') {
    return allLanguages;
  }
  else {
    return allLanguages.filter(function (language) {
      return language.toLowerCase().indexOf(search.toLowerCase()) !== -1;
    });
  }
};

LanguageSelector.prototype.injectDynamicContent = function () {
  this.injectListOfSelectedLanguages();
  this.injectLanguageCheckboxes();
};

LanguageSelector.prototype.injectListOfSelectedLanguages = function (text) {
  var languagesList;
  if (text) {
    languagesList = text;
  }
  else if (this.selectedLanguages.length === 0) {
    languagesList = 'None';
  }
  else if (this.selectedLanguages.length > 20) {
    languagesList = this.selectedLanguages.length + ' languages';
  }
  else {
    languagesList = this.selectedLanguages.sort().join(', ');
  }
  $('#rc-languages-selector #languages-list').text(languagesList);
};


// The checkboxes are rendered dynamically using a template function so that
// the `checked` attribute can be set correctly when the list is initially
// rendered based on the user's previously selected language choices. Also,
// when the user enters a "Filter" search string, we will re-render the list
// of checkboxes, displaying only matching languages.
LanguageSelector.prototype.injectLanguageCheckboxes = function (search) {
  search = search || '';
  var content = this.languageCheckboxesTemplateFn({
    filteredLanguages: this.matchingLanguages(search),
    selectedLanguages: this.selectedLanguages
  });
  $('#rc-languages-selector #languages').html(content);
};

LanguageSelector.prototype.handleSelectedLanguagesChange = function () {
  // store the user's updated set of languages in localStorage
  window.localStorage.setItem(
    LanguageSelector.LOCAL_STORAGE_KEY,
    JSON.stringify(this.selectedLanguages)
  );

  this.injectListOfSelectedLanguages();
  this.showOnlySelectedLanguages();
};

LanguageSelector.prototype.pause = function () {
  this.injectListOfSelectedLanguages('All languages. Filtering is paused.');
  this.showAllLanguages();
};

LanguageSelector.prototype.unpause = function () {
  this.injectListOfSelectedLanguages();
  this.showOnlySelectedLanguages();
};

LanguageSelector.prototype.bindHandlers = function () {
  var self = this;

  // shows/hides the form
  $('#rc-languages-selector #toggle-form').click(function (event) {
    event.preventDefault();
    self.showingForm = !self.showingForm;
    var hideFormHtml = '<span class="arrow-icon-up">⌃</span><span class="text-hide">Hide Form</span>'
    var showFormHtml = '<span class="arrow-icon-down">⌵</span><span class="text-show">Select Languages</span>'
    $(event.currentTarget).html(self.showingForm ? hideFormHtml : showFormHtml);
    $('#rc-languages-selector form').toggleClass('rcls-hidden');
  });

  $('#rc-languages-selector #pause').click(function (event) {
    event.preventDefault();
    self.paused = !self.paused;
    var resumeHtml = '<span class="text-hide">Resume Filtering</span>'
    var pauseHtml = '<span class="text-hide">Pause Filtering</span>'
    $(event.currentTarget).html(self.paused ? resumeHtml : pauseHtml);
    self.paused ? self.pause() : self.unpause();
  });

  // clears the filter input (and focuses it for user convenience)
  $('#rc-languages-selector #clear-filter').click(function (event) {
    event.preventDefault();
    // trigger 'input' event to trigger re-rendering of checkboxes list with
    // all languages
    $('#rc-languages-selector #search').val('').focus().trigger('input');
  });

  // updates the list of language checkboxes to match the user's search term
  $('#rc-languages-selector #search').on('input', function (event) {
    var filter = event.currentTarget.value;
    self.injectLanguageCheckboxes(filter);
  });

  // handle "Toggle all" checkbox
  $("#rc-languages-selector #check-all").change(function (event) {
    $('#rc-languages-selector input:checkbox').not(this).prop('checked', this.checked);
    if (this.checked) {
      // copy allLanguages (so we can manipulate the copy)
      self.selectedLanguages = LanguageSelector.ALL_LANGUAGES.slice();
    }
    else {
      self.selectedLanguages = [];
    }
    self.handleSelectedLanguagesChange();
  });

  // Handle checking/unchecking of a specific language.
  // It is important to use event delegation here, as different/new checkboxes
  // will be added to the DOM even after self handler is bound (in response to
  // keystrokes in the filter/search input).
  $('#rc-languages-selector form #languages')
  .on('change', 'input[type="checkbox"]', function (event) {
    var language = event.currentTarget.value;
    var idx = self.selectedLanguages.indexOf(language);
    if (event.currentTarget.checked) {
      // add language to the list if it's not there already
      if (idx === -1) {
        self.selectedLanguages.push(language);
      }
    }
    else {
      // remove language from the list if it is in the list
      if (idx !== -1) {
        self.selectedLanguages.splice(idx, 1);
      }
    }

    self.handleSelectedLanguagesChange();
  });
};

LanguageSelector.prototype.showAllLanguages = function () {
  var alwaysTrue = function () { return true; }

  this.showOrHideEachTableOfContentsLink(alwaysTrue);
  this.showOrHideEachContentSection(alwaysTrue);
};

// Manipulates the DOM to show only the user's selected languages
LanguageSelector.prototype.showOnlySelectedLanguages = function () {
  this.showOrHideEachTableOfContentsLink();
  this.showOrHideEachContentSection();
}

LanguageSelector.prototype.showOrHideEachTableOfContentsLink = function (test) {
  var self = this;

  var $tocLinks = $('#toc').find('.toclevel-1');

  var defaultTest = function ($el) {
    // `eq(0)` because there could be subheadings with class `toctext` that we
    // don't want to include
    var language = $el.find('.toctext').eq(0).text();
    return self.isLanguageSelected(language);
  }
  test = test || defaultTest;

  this.showOrHideElements($tocLinks, test);
};

// The main content of RosettaCode pages are layed out roughly as follows:
// ...
// <h2>PHP</h2>
// <pre>A PHP code sample</pre>
// <pre>Another PHP code sample</pre>
// <h2>Python</h2>
// <pre>A Python code sample</pre>
// <pre>Another Python code sample</pre>
// ...
//
// The extension operates by iterating through DOM elements and switching a
// boolean `showingElements` flag, indicating whether to show or hide the
// current and subsequent DOM elements. When the extension reaches an `h2`
// tag, it checks whether that language is included in the set of languages
// that the user wants displayed. If so, the `mode` is switched to 'show', and
// the <h2> is shown, along with subsequent <pre> elements or other elements.
// If the language is not to be displayed, then the mode is set to 'hide',
// until the next <h2> is reached, the `mode` is then set for that language,
// etc.
LanguageSelector.prototype.showOrHideEachContentSection = function (test) {
  var self = this;

  // the sibling elements of the table of contents (TOC) that come after the
  // TOC are the main content sections (headings, code samples, etc.)
  var $contentSections = $('#toc').find('~')

  var defaultTest = function ($el, showingElements) {
    // If this is an H2 element, then we are beginning a new section for a new
    // language. We will want to update the `showingElements` flag for this
    // and subsequent elements (until we reach the next H2, and change the
    // mode again, etc.)
    if ($el[0].tagName === 'H2') {
      var language = $el.find('span.mw-headline').text();
      if ( self.isLanguageSelected(language) ) {
        return true;
      } else {
        return false
      }
    }
    // continue in whatever mode we were in before
    else {
      return showingElements;
    }
  };
  test = test || defaultTest;

  this.showOrHideElements($contentSections, test);
};

// shouldShowTest is a function that will be passed a jQuerified version
// of each HTML element in the jQuery object and whether we are
// currently showing elements. The function should return true or false
// for each element in turn to indicate whether the element should be
// shown.
LanguageSelector.prototype.showOrHideElements = function ($jqObject, shouldShowTest) {
  var showingElements = true;
  $jqObject.each(function (_index, el) {
    var $el = $(el);
    showingElements = shouldShowTest($el, showingElements);
    showingElements ? $el.show() : $el.hide();
  });
};


LanguageSelector.prototype.isLanguageSelected = function (language) {
  // special case; Mathematica and Wolfram share a single code sample
  if ( language === 'Mathematica / Wolfram Language' &&
        ( this.isLanguageSelected('Mathematica') ||
           this.isLanguageSelected('Wolfram Language') ) ) {
    return true;
  }

  return this.selectedLanguages.some(function (selectedLanguage) {
    // sometimes the languages are capitalized inconsistently
    return language.toLowerCase() === selectedLanguage.toLowerCase();
  });
};
