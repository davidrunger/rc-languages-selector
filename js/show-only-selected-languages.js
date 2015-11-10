// A globally exported function. Manipulates the page to only show code samples
// for selected languages, hiding all other code samples (and headings).
function showOnlySelectedLanguages(selectedLanguages) {
  // RosettaCode pages are layed out roughly as follows:
  // ...
  // <h2>PHP</h2>
  // <pre>A PHP code sample</pre>
  // <pre>Another PHP code sample</pre>
  // <h2>Python</h2>
  // <pre>A Python code sample</pre>
  // <pre>Another Python code sample</pre>
  // ...
  //
  // The extension operates by iterating through DOM elements and alternating
  // its `mode` between 'show' and 'hide', that is, whether to show or hide the
  // current and subsequent DOM elements. When the extension reaches an `h2`
  // tag, it checks whether that language is included in the set of languages
  // that the user wants displayed. If so, the `mode` is switched to 'show', and
  // the <h2> is shown, along with subsequent <pre> elements or other elements.
  // If the language is not to be displayed, then the mode is set to 'hide',
  // until the next <h2> is reached, the `mode` is then set for that language,
  // etc.
  var mode = 'hide';

  // iterate over sibling elements that come after the table of contents
  $('#toc').find('~').each(function (_index, el) {
    var $el = $(el);

    // If this is an H2 element, then we are beginning a new section for a new
    // language. We will want to update the current mode (hide or show) for this
    // and subsequent elements (until we reach the next H2, and change the mode
    // again, etc.)
    if (el.tagName === 'H2') {
      setMode($el);
    }

    if (mode === 'hide') {
      $el.addClass('rcls-hidden');
    }
    else {
      $el.removeClass('rcls-hidden');
    }
  });

  function setMode($h2) {
    var language = $h2.find('span.mw-headline').text();
    var showingLanguage = selectedLanguages.some(function (selectedLanguage) {
      // Sometimes the languages are capitalized inconsistently
      return language.toLowerCase() === selectedLanguage.toLowerCase();
    });
    mode = showingLanguage ? 'show' : 'hide';

    // special case; Mathematica and Wolfram share a single code sample
    if ( language === 'Mathematica / Wolfram Language' &&
          ( selectedLanguages.indexOf('Mathematica') !== -1 ||
             selectedLanguages.indexOf('Wolfram Language' ) !== -1) ) {
      mode = 'show';
    }
  }
}
