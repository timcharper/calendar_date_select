# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'calendar_date_select/version'

Gem::Specification.new "calendar_date_select", CalendarDateSelect::VERSION do |spec|
  spec.authors       = ["Shih-gian Lee", "Enrique Garcia Cota (kikito)", "Tim Charper", "Lars E. Hoeg", "Marc-André Lafortune"]
  spec.email         = ["github@marc-andre.ca"]
  spec.description   = "Calendar date picker for rails"
  spec.summary       = "Calendar date picker for rails"
  spec.homepage      = "http://github.com/marcandre/calendar_date_select"
  spec.license       = "MIT"

  spec.files         = `git ls-files lib app MIT-LICENSE`.split($/)

  spec.add_dependency "rails", ">= 3.1"

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
end
