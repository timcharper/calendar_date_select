require "calendar_date_select/version"
require "calendar_date_select/calendar_date_select"
require "action_view/helpers"

module CalendarDateSelect
  class Engine < Rails::Engine
    # Thanks to http://robots.thoughtbot.com/post/159805560/tips-for-writing-your-own-rails-engine for:
    config.to_prepare do
      ActionView::Helpers::FormHelper.send(:include, CalendarDateSelect::FormHelpers)
      ActionView::Helpers.send :include, CalendarDateSelect::FormHelpers
      ActionView::Helpers.send :include, CalendarDateSelect::IncludesHelper
    end
  end
end
