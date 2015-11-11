require 'sinatra/base'

class TestServer < Sinatra::Base
  before do
    response.headers['Access-Control-Allow-Origin'] = 'http://rosettacode.org'
  end

  def self.absolute_path(relative_path)
    File.expand_path(relative_path, __FILE__)
  end

  get '/support/:file' do
    filename = params['file']
    path = TestServer.absolute_path("../support/#{filename}")
    begin
      File.read( path )
    rescue Errno::ENOENT
      status 404
    end
  end

  get '/html/:file' do
    filename = params['file']
    path = TestServer.absolute_path("../../html/#{filename}")
    File.read(path)
  end

  # Our test server stores a local version of a programming task page
  # (which should be more performant and put less unnecessary load on
  # rosettacode.org). However, this means that relative URLs will then
  # request resources from our server that it doesn't have, so for all
  # other requests we will forward them along to rosettacode.org.
  get '*' do
    path = request.fullpath
    redirect to('http://rosettacode.org' + path)
  end
end

TestServer.run!
