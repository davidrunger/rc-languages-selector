// The extension is launched here.
$(function () {
  'use strict';
  // Is the current page a Programming Task?
  var isTaskPage = !!$('#catlinks a[title="Category:Programming Tasks"]').length;
  // Do nothing if this isn't a task page.
  if (!isTaskPage) return;

  var languageSelector = new LanguageSelector();
  languageSelector.run();
});
