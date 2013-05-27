class SsController < ApplicationController
  def index
    if request.xhr?
      after = ''
      after = "?after=#{params[:after]}" if params.has_key? :after

      how_many = 1
      how_many = params[:how_many].to_i if params.has_key? :how_many

      @img = Array.new

      how_many.times do
        puts "Reading: /hot.json#{after}"
        sleep 1
        submissions = @api.read("/hot.json#{after}")
        @img += submissions
                 .map { |s| {url: s.url, title: s.title, id: s.id} }
                 .select { |s| s[:url].include? 'imgur' }
                 .reject { |s| s[:url].include? '/a/' }
                 .reject { |s| s[:url].include? '/r/' }
                 .each { |s| s[:url] += '.jpg' if !s[:url].ends_with?('.jpg') }

        @next = @img[-1][:id]
        after = "?after=#{@next}"
      end
      render :json => {img: @img, next: @next}
    end
  end
end
