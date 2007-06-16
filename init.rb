<<EOF.split("\n").each { |file| load File.join( File.dirname(__FILE__), "lib",file) }
calendar_date_select.rb 
includes_helper.rb
EOF

ActionView::Helpers::FormHelper.send(:include, CalendarDateSelect::FormHelper)
ActionView::Base.send(:include, CalendarDateSelect::FormHelper)
ActionView::Base.send(:include, CalendarDateSelect::IncludesHelper)

# install files
['/public/javascripts', '/public/stylesheets', '/public/images'].each{|dir|
  source = File.join(directory,dir)
  dest = RAILS_ROOT + dir
  FileUtils.cp_r(Dir.glob(source+'/*.*'), dest)
} unless File.exists?(RAILS_ROOT + '/public/javascripts/calendar_date_select.js')
