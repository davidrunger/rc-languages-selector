guard :rspec, cmd: "bundle exec rspec" do
  watch(/^spec\/.+\.rb$/) { 'spec' }
  watch(/^js\/(?!vendor\/).+$/) { 'spec' }
  watch(/^html\/.+$/) { 'spec' }
end
