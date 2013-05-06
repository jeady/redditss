class SsController < ApplicationController
  def index
    after = ''
    if params.has_key? :after
      after = "?after=#{params[:after]}"
    end
    submissions = @api.read("/hot.json#{after}")
    @img = submissions
             .map { |s| {url: s.url, title: s.title, id: s.id} }
             .select { |s| s[:url].include? 'imgur' }
             .reject { |s| s[:url].include? '/a/' }
             .reject { |s| s[:url].include? '/r/' }
             .each { |s| s[:url] += '.jpg' if !s[:url].ends_with?('.jpg') }

    @next = @img[-1][:id]
    if request.xhr?
      render :json => {img: @img, next: @next}
    end
  end
end
