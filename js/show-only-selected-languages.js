// This file exports a single global function.
function showOnlySelectedLanguages(selectedLanguages) {
  var mode = 'hide';

  function decodeLanguageIdAttr(idAttr) {
    name = idAttr.replace(/_/g, ' ').replace(/\.([a-fA-F0-9]{2})/g, '%$1');

    // special cases
    if (idAttr === '.E0.AE.89.E0.AE.AF.E0.AE.BF.E0.AE.B0.E0.AF.8D.2FUyir') {
      return 'உயிர்/Uyir';
    } else if (idAttr === 'D.C3.A9j.C3.A0_Vu') {
      return 'Déjà Vu';
    }
    // normal case
    else {
      return decodeURIComponent(name);
    }
  }

  function setMode($el) {
    var idAttr = $el.find('span.mw-headline').attr('id');
    var language = decodeLanguageIdAttr(idAttr);
    var lowercaseSelectedLanguages = selectedLanguages.map(function (language) {
      return language.toLowerCase();
    });
    mode = (lowercaseSelectedLanguages.indexOf(language.toLowerCase()) === -1) ? 'hide' : 'show';

    // special case
    if (language === 'Mathematica / Wolfram Language' && (selectedLanguages.indexOf('Mathematica') !== -1 || selectedLanguages.indexOf('Wolfram Language') !== -1)) {
      mode = 'show';
    }
  }

  // iterate over siblings that come after the table of contents
  $('#toc').find('~').each(function (_index, el) {
    var $el = $(el);

    // If this is an H2 element, then we are beginning a new section
    // for a new language. We will want to update the current mode
    // (hide or show) for this and subsequent elements (until we reach
    // the next H2, and change the mode yet again, etc.)
    if (el.tagName === 'H2') {
      setMode($el);
    }

    if (mode === 'hide') {
      $el.addClass('rcls-hidden');
    } else {
      $el.removeClass('rcls-hidden');
    }
  });
}
