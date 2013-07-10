ENV["RAILS_ENV"] = "test"

require File.expand_path("../dummy/config/environment.rb",  __FILE__)
require 'rspec/rails'
# require 'active_support'
# require 'action_pack'
# require 'action_controller'
# require 'action_view'

Rails.backtrace_cleaner.remove_silencers!
