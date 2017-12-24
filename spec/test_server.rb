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
end

TestServer.run!
