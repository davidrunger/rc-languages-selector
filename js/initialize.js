// The extension is launched here.
$(function () {
  'use strict';
  // Is the current page a Programming Task?
  var isRegularTaskPage = !!$('#catlinks a[title="Category:Programming Tasks"]').length;
  var isDraftTaskPage = !!$('#catlinks a[title="Category:Draft Programming Tasks"]').length;
  // Do nothing if this isn't a task page.
  var isTaskPage = isRegularTaskPage || isDraftTaskPage;
  if (!isTaskPage) return;

  var languageSelector = new LanguageSelector();
  languageSelector.run();
});
