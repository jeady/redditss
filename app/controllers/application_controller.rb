require 'ruby_reddit_api'

class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :authenticate

  def authenticate
    if user = authenticate_with_http_basic do |username, password|
      api = Reddit::Api.new username, password
      if api.login
        session[:user] = username
        session[:pass] = password
        @api = api
        username
      else
        false
      end
    end
    else
      request_http_basic_authentication('Reddit')
    end
  end
end
