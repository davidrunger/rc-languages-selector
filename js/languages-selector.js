// This is the main extension file, where the extension is started
$(function () {
  'use strict';
  // Is the current page a Programming Task?
  var isTaskPage = !!$('#catlinks a[title="Category:Programming Tasks"]').length;

  // If we're at a task page, run the extension.
  if (isTaskPage) {
    var selectedLanguages;
    var languageCheckboxesTemplateFn;
    var showingForm = false;
    var LOCAL_STORAGE_KEY = 'rcls-selected-languages';
    var allLanguages = window.rclsAllLanguages;

    // User preferences are persisted via localStorage.
    var previouslyStoredLanguages = window.localStorage[LOCAL_STORAGE_KEY] &&
      JSON.parse(window.localStorage[LOCAL_STORAGE_KEY]);
    selectedLanguages = previouslyStoredLanguages || allLanguages;

    runExtension();
  }
  // If we're not at a Programming Task page, do nothing.
  else {
    return;
  }

  function runExtension() {
    injectExtension();
    // globally exported function defined in js/show-only-selected-languages.js
    showOnlySelectedLanguages(selectedLanguages);
  }

  // Inject the form for selecting languages at the top of the page.
  function injectExtension() {
    $.get( chrome.extension.getURL('/html/languages-selector-main.html') )
    .then(function (mainTemplate) {
      var mainTemplateFn = _.template(mainTemplate);
      var content = mainTemplateFn({
        showingForm: showingForm,
        showingAllLanguages: allLanguages.length === selectedLanguages.length
      });

      $(content).prependTo('#content');
      injectDynamicContent();
      bindHandlers();
    });
  }

  // Which languages match the user's search/filter string?
  function filteredLanguages(filter) {
    if (filter === '') {
      return allLanguages;
    }
    else {
      return allLanguages.filter(function (language) {
        return language.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
      });
    }
  }

  function injectDynamicContent() {
    injectListOfSelectedLanguages();
    injectLanguageCheckboxes();
  }

  // Gives a summary of which languages are currently being displayed.
  function injectListOfSelectedLanguages() {
    var languagesList;
    if (selectedLanguages.length === 0) {
      languagesList = 'None';
    }
    else if (selectedLanguages.length > 20) {
      languagesList = selectedLanguages.length + ' languages';
    }
    else {
      languagesList = selectedLanguages.sort().join(', ');
    }
    $('#rc-languages-selector #languages-list').text(languagesList);
  }

  // The checkboxes are rendered dynamically using a template function so that
  // the `checked` attribute can be set correctly when the list is initially
  // rendered based on the user's previously selected language choices. Also,
  // when the user enters a "Filter" search string, we will re-render the list
  // of checkboxes, displaying only matching languages.
  function injectLanguageCheckboxes(filter) {
    filter = filter || '';
    if (!languageCheckboxesTemplateFn) {
      $.get( chrome.extension.getURL('/html/language-checkboxes.html' ) )
      .then(function (languageCheckboxesTemplate) {
        languageCheckboxesTemplateFn = _.template(languageCheckboxesTemplate);
        injectLanguageCheckboxes(filter);
      });
    }
    else {
      var content = languageCheckboxesTemplateFn({
        filteredLanguages: filteredLanguages(filter),
        selectedLanguages: selectedLanguages
      });
      $('#rc-languages-selector #languages').html(content);
    }
  }

  function handleSelectedLanguagesChange() {
    // store the user's updated set of languages in localStorage
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(selectedLanguages)
    );

    injectListOfSelectedLanguages();
    showOnlySelectedLanguages(selectedLanguages);
  }

  function bindHandlers() {
    // shows/hides the form
    $('#rc-languages-selector #toggle-form').click(function (event) {
      event.preventDefault();
      showingForm = !showingForm;
      event.target.innerText = showingForm ? 'Hide Form' : 'Select Languages';
      $('#rc-languages-selector form').toggleClass('rcls-hidden');
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
      injectLanguageCheckboxes(filter);
    });

    // handle "Toggle all" checkbox
    $("#rc-languages-selector #check-all").change(function (event) {
      $('#rc-languages-selector input:checkbox').not(this).prop('checked', this.checked);
      if (this.checked) {
        // copy allLanguages (so we can manipulate the copy)
        selectedLanguages = allLanguages.slice();
      }
      else {
        selectedLanguages = [];
      }
      handleSelectedLanguagesChange();
    });

    // Handle checking/unchecking of a specific language.
    // It is important to use event delegation here, as different/new checkboxes
    // will be added to the DOM even after this handler is bound (in response to
    // keystrokes in the filter/search input).
    $('#rc-languages-selector form #languages')
    .on('change', 'input[type="checkbox"]', function (event) {
      var language = event.currentTarget.value;
      var idx = selectedLanguages.indexOf(language);
      if (event.currentTarget.checked) {
        // add language to the list if it's not there already
        if (idx === -1) {
          selectedLanguages.push(language);
        }
      }
      else {
        // remove language from the list if it is in the list
        if (idx !== -1) {
          selectedLanguages.splice(idx, 1);
        }
      }

      handleSelectedLanguagesChange();
    });
  }
});
