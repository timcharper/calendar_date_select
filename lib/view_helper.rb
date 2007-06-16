module CalendarDateSelect
  module ViewHelper
    def calendar_date_select_includes(template=nil)
      css_file = "calendar_date_select"
      css_file << "_#{template}" if template
      
      [
        javascript_include_tag("calendar_date_select"),
        stylesheet_link_tag(template)
      ] * "\n"
    end
  end
end
