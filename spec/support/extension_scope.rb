module ExtensionScope
  def extension
    find(RCLS_ID)
  end
end

RSpec.configure do |config|
  config.include ExtensionScope, type: :feature
end
