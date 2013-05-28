require 'json'
require 'ruby_reddit_api'
require 'sinatra'

set :public_folder, File.dirname(__FILE__) + '/assets'
set :port, 3000
set :bind, '0.0.0.0'

helpers do
  def need_api!
    return if authenticated?
    headers['WWW-Authenticate'] = 'Basic realm="Reddit"'
    halt 401, "Not Authorized\n"
  end

  def authenticated?
    @auth ||= Rack::Auth::Basic::Request.new(request.env)
    @api ||= Reddit::Api.new @auth.credentials[0], @auth.credentials[1]
    @api.login
  end
end

get '/' do
  send_file File.dirname(__FILE__) + '/assets/index.html'
end

get '/fetch/after/:id' do |id|
  need_api!
  content_type :json

  parse_reddit "/hot.json?after=#{id}"
end

get '/fetch' do
  need_api!
  content_type :json

  parse_reddit '/hot.json'
end

def parse_reddit(url)
  @img = Array.new

  puts "Reading: #{url}"
  submissions = @api.read(url)
  @img +=
    submissions
     .map { |s| {url: s.url, title: s.title, id: s.id} }
     .select { |s| s[:url].include? 'imgur' }
     .reject { |s| s[:url].include? '/a/' }
     .reject { |s| s[:url].include? '/r/' }
     .each { |s| s[:url] += '.jpg' if !s[:url].end_with?('.jpg', '.gif') }

  @next = @img[-1][:id]
  after = "?after=#{@next}"

  {img: @img, next: @next}.to_json
end
