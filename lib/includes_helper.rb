module CalendarDateSelect
  module IncludesHelper
    def calendar_date_select_includes(template=nil)
      cds_css_file = "calendar_date_select"
      cds_css_file << "_#{template}" if template
      
      [
        javascript_include_tag("calendar_date_select"),
        stylesheet_link_tag(cds_css_file)
      ] * "\n"
    end
  end
end
