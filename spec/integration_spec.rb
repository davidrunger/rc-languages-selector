require_relative 'spec_helper'

RCLS_ID = '#rc-languages-selector'
TASK_PAGE = 'http://localhost:4567/support/hello_world_task.html'

describe 'Rosetta Code Languages Selector', type: :feature, js: true do
  feature "when it shouldn't be active" do
    it "doesn't inject itself on the home page" do
      page.visit('http://rosettacode.org/')
      expect(page).not_to have_content 'Rosetta Code Languages Selector'
    end

    it "doesn't inject itself on a language page" do
      page.visit('http://rosettacode.org/wiki/Category:Ruby')
      expect(page).not_to have_content 'Rosetta Code Languages Selector'
    end
  end

  feature 'when it should be active' do
    it 'injects itself', js: :true do
      page.visit(TASK_PAGE)
      expect(page).to have_content 'Rosetta Code Languages Selector'
    end
  end

  feature 'when the extension initializes' do
    before(:each) do
      page.visit(TASK_PAGE)
    end

    it 'lists the current languages' do
      expect(page).to have_content('Currently showing: 591 languages')
    end

    it 'starts out with the form hidden' do
      expect(extension).not_to have_css("form")
    end

    it 'has a button to expand the form' do
      expect(extension).to have_button('Select Languages')
    end

    it 'expands the form when button is clicked' do
      extension.click_button('Select Languages')
      expect(extension).to have_css("form")
    end

    it 'doesn\'t hide any table of contents entries' do
      expect(page).to have_css('#toc span', text: 'C++')
      expect(page).to have_css('#toc span', text: 'Ruby')
    end

    it 'doesn\'t hide any code samples' do
      expect(page).to have_css('h2 span', text: 'C++')
      expect(page).to have_css('h2 span', text: 'Ruby')
    end
  end

  feature 'when the form is expanded' do
    before(:each) do
      page.visit(TASK_PAGE)
      extension.click_button('Select Languages')
    end

    it 'changes the button text' do
      expect(extension).to have_button('Hide Form')
    end

    it 'toggles the button text back and forth' do
      extension.click_button('Hide Form')
      expect(extension).to have_button('Select Languages')
      extension.click_button('Select Languages')
      expect(extension).to have_button('Hide Form')
    end

    it 'shows all languages' do
      expect(extension.find('#languages').all('li').length).to eq(591)
      # check for some random languages
      expect(extension.find('#languages')).to have_css('li', text: 'C#')
      expect(extension.find('#languages')).to have_css('li', text: 'Ruby')
    end

    describe 'the language filter' do
      it 'is on the page' do
        expect(extension).to have_css('input#search[type=text]')
      end

      it 'filters languages' do
        extension.find('input#search').set 'C++'
        expect(extension.find('#languages')).to have_css('li', text: 'C++')
        expect(extension.find('#languages')).to have_css('li', text: 'OpenC++')
        expect(extension.find('#languages')).not_to have_css('li', text: 'Ruby')
      end
    end

    feature 'when toggling a language off' do
      before(:each) do
        page.find('input[type=checkbox][value=Ruby]').click
      end

      it 'hides the table of contents entry' do
        expect(page).not_to have_css('#toc span', text: 'Ruby')
      end

      it 'hides the code sample' do
        expect(page).not_to have_css('h2 span', text: 'Ruby')
        expect(page).not_to have_content('STDOUT.write "Hello world!\n"')
      end

      it 'indicates the removal in the language list' do
        expect(page).to have_content('Currently showing: 590 languages')
      end

      it 'can be toggled back on' do
        page.find('input[type=checkbox][value=Ruby]').click
        expect(page).to have_css('#toc span', text: 'Ruby')
        expect(page).to have_css('h2 span', text: 'Ruby')
        expect(page).to have_content('STDOUT.write "Hello world!\n"')
      end
    end

    feature 'when toggling all languages' do
      before(:each) do
        expect(extension.find('input#check-all[type=checkbox]')).to be_checked
        extension.find('input#check-all[type=checkbox]').click # toggle it off
      end

      it 'says that it\'s showing no languages' do
        expect(page).to have_content('Currently showing: None')
      end

      it 'shows no languages when all are toggled off' do
        expect(page).not_to have_css('#toc ~ *')
      end

      it 'toggles off individual language checkboxes', js: true do
        ruby_checkbox = 'input[type=checkbox][value=Ruby]'
        expect(extension.find(ruby_checkbox)).not_to be_checked
      end
    end

    feature 'when working with a smaller number of languages' do
      before(:each) do
        expect(extension.find('input#check-all[type=checkbox]')).to be_checked
        extension.find('input#check-all[type=checkbox]').click # toggle off
        extension.find('input[type=checkbox][value=Ruby]').click
        extension.find('input[type=checkbox][value=Python]').click
      end

      it 'lists the individual languages' do
        expect(page).to have_content('Currently showing: Python, Ruby')
      end
    end

    feature 'when navigating away from the page and back' do
      before(:each) do
        expect(extension.find('input#check-all[type=checkbox]')).to be_checked
        extension.find('input#check-all[type=checkbox]').click # toggle off all
      end

      it 'persists the selection of a few languages' do
        extension.find('input[type=checkbox][value=Ruby]').click # enable Ruby
        extension.find('input[type=checkbox][value=C]').click # enable C
        expect(page).to have_content('Currently showing: C, Ruby')
        visit 'http://www.google.com', reset_local_storage: false
        visit TASK_PAGE, reset_local_storage: false
        expect(page).to have_content('Currently showing: C, Ruby')
      end

      it 'persists the selection of all languages' do
        extension.find('input[type=checkbox][value=Ruby]').click # enable Ruby
        extension.find('input#check-all[type=checkbox]').click # toggle on all
        expect(page).to have_content('Currently showing: 591 languages')
        visit 'http://www.google.com', reset_local_storage: false
        visit TASK_PAGE, reset_local_storage: false
        expect(page).to have_content('Currently showing: 591 languages')
      end
    end
  end
end
