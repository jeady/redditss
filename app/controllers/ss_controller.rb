class SsController < ApplicationController
  def index
    submissions = @api.read('/hot.json')
    @img = submissions
             .map { |s| {url: s.url, title: s.title} }
             .select { |s| s[:url].include? 'imgur' }
             .reject { |s| s[:url].include? '/a/' }
             .reject { |s| s[:url].include? '/r/' }
             .each { |s| s[:url] += '.jpg' if !s[:url].ends_with?('.jpg') }
  end
end
