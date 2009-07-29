# -*- ruby -*-


begin
  require 'jeweler'
  Jeweler::Tasks.new do |gemspec|
    gemspec.name = "calendar_date_select"
    gemspec.summary = "calendar_date_select fork; includes highlighting"
    gemspec.description = "This is a fork of the original calendar_date_select, including the additional feature of highlighting dates on the calendar without disabling other dates"
    gemspec.email = "egarcia@splendeo.es"
    gemspec.homepage = "http://github.com/kikito/calendar_date_select"
    gemspec.description = "calendar_date_select fork; includes highlighting"
    gemspec.authors = ["Enrique Garcia Cota (kikito)", "Tim Charper", "Lars E. Hoeg"]
  end
rescue LoadError
  puts "Jeweler not available. Install it with: sudo gem install technicalpickles-jeweler -s http://gems.github.com"
end

desc "Set the current gem version in the code (VERSION=version)"
task :set_version do
  ["lib/calendar_date_select/calendar_date_select.rb", "public/javascripts/calendar_date_select/calendar_date_select.js"].each do |file|
    abs_file = File.dirname(__FILE__) + "/" + file
    src = File.read(abs_file);
    src = src.map do |line|
      case line
      when /^ *VERSION/                        then "  VERSION = '#{ENV['VERSION']}'\n"
      when /^\/\/ CalendarDateSelect version / then "// CalendarDateSelect version #{ENV['VERSION']} - a prototype based date picker\n"
      else
        line
      end
    end.join
    File.open(abs_file, "wb") { |f| f << src }
  end
end
# vim: syntax=Ruby
