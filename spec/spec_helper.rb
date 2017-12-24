require 'capybara'
require 'capybara/rspec'
require 'json'
require 'selenium-webdriver'

RSpec.configure do |config|
  config.filter_run focus: true
  config.run_all_when_everything_filtered = true
  config.silence_filter_announcements = true
end

Dir[File.expand_path('../support/**/*.rb', __FILE__)].each { |f| require f }

Capybara.register_driver :chrome do |app|
  Capybara::Selenium::Driver.new(
    app,
    browser: :chrome,
    options: Selenium::WebDriver::Chrome::Options.new(
      args: %w[headless disable-gpu no-sandbox window-size=1280,1024]
    )
  )
end

Capybara.default_driver = :chrome
Capybara.javascript_driver = :chrome
Capybara.save_and_open_page_path = 'tmp'

# As Chrome would do for us when the extension is installed, we want to
# inject our JavaScript into each page we visit with PhantomJS. We'll
# monkey patch Capybara::Session#visit to accomplish this.
class Capybara::Session
  alias_method :old_visit, :visit

  def visit(url, options = {reset_local_storage: true})
    old_visit(url)
    execute_script('localStorage.clear()') if options[:reset_local_storage]
    SpecHelper.inject_assets(self)
  end
end

module SpecHelper
  def self.absolute_path(path)
    File.expand_path("../../#{path}", __FILE__)
  end

  def self.css_assets
    return @css_assets if @css_assets

    css_asset_paths = manifest['content_scripts'][0]['css']
    @css_assets = css_asset_paths.map do |path|
      File.read(absolute_path(path))
    end
  end

  def self.inject_assets(page)
    inject_css(page)
    inject_extension_api_polyfill(page)
    inject_js_assets(page)
  end

  def self.js_assets
    return @js_assets if @js_assets

    js_asset_paths = manifest['content_scripts'][0]['js']
    @js_assets = js_asset_paths.map do |path|
      File.read(absolute_path(path))
    end
  end

  def self.inject_css(page)
    css_assets.each do |css|
      js = <<-JS
      function appendStyle(styles) {
        var css = document.createElement('style');
        css.type = 'text/css';

        if (css.styleSheet) css.styleSheet.cssText = styles;
        else css.appendChild(document.createTextNode(styles));

        document.getElementsByTagName("head")[0].appendChild(css);
      }

      appendStyle('#{css.gsub("\n", " ")}');
      JS
      page.execute_script(js);
    end
  end

  def self.inject_extension_api_polyfill(page)
    script = <<-JS
    window.chrome = {};
    window.chrome.extension = {
      getURL: function getURL(url) {
        if (url === '/html/language-checkboxes.html') {
          return 'http://localhost:4567/html/language-checkboxes.html'
        } else if (url === '/html/languages-selector-main.html') {
          return 'http://localhost:4567/html/languages-selector-main.html'
        } else {
          throw new Error('Missing mock on window.chrome.extension.');
        }
      }
    }
    JS
    page.execute_script(script)
  end

  def self.inject_js_assets(page)
    js_assets.each do |script|
      page.execute_script(script)
    end
  end

  def self.manifest
    manifest_path = File.expand_path("../../manifest.json", __FILE__)
    JSON.parse(File.read(manifest_path))
  end
end
