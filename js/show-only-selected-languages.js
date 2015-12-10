;(function () {
  var showingElements;

  // Manipulates the DOM to show only the user's selected languages
  window.showOnlySelectedLanguages = function showOnlySelectedLanguages(selectedLanguages) {
    showOrHideEachTableOfContentsLink(selectedLanguages);
    showOrHideEachContentSection(selectedLanguages);
  }

  function showOrHideEachTableOfContentsLink(selectedLanguages) {
    var $tocLinks = $('#toc').find('.toclevel-1');

    var test = function ($el) {
      // `eq(0)` because there could be subheadings with class `toctext` that we
      // don't want to include
      var language = $el.find('.toctext').eq(0).text();
      return isLanguageSelected(selectedLanguages, language);
    }

    showOrHideElements($tocLinks, test);
  }

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
  function showOrHideEachContentSection(selectedLanguages) {
    // the sibling elements of the table of contents (TOC) that come after the
    // TOC are the main content sections (headings, code samples, etc.)
    var $contentSections = $('#toc').find('~')

    var test = function ($el) {
      // If this is an H2 element, then we are beginning a new section for a new
      // language. We will want to update the `showingElements` flag for this
      // and subsequent elements (until we reach the next H2, and change the
      // mode again, etc.)
      if ($el[0].tagName === 'H2') {
        var language = $el.find('span.mw-headline').text();
        if ( isLanguageSelected(selectedLanguages, language) ) {
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

    showOrHideElements($contentSections, test);
  }

  // shouldShowTest is a function that will be passed a jQuerified version of
  // each HTML element in the jQuery object. The function should return true or
  // false for each element in turn to indicate whether the element should be
  // shown.
  function showOrHideElements($jqObject, shouldShowTest) {
    $jqObject.each(function (_index, el) {
      var $el = $(el);
      showingElements = shouldShowTest($el);
      showingElements ? $el.show() : $el.hide();
    });
  }

  function isLanguageSelected(selectedLanguages, language) {
    // special case; Mathematica and Wolfram share a single code sample
    if ( language === 'Mathematica / Wolfram Language' &&
          ( isLanguageSelected(selectedLanguages, 'Mathematica') ||
             isLanguageSelected(selectedLanguages, 'Wolfram Language') ) ) {
      return true;
    }

    return selectedLanguages.some(function (selectedLanguage) {
      // sometimes the languages are capitalized inconsistently
      return language.toLowerCase() === selectedLanguage.toLowerCase();
    });
  }

}());
