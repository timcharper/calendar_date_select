class CalendarDateSelect
  module IncludesHelper
    def calendar_date_select_includes(*args)
      options = (Hash === args.last) ? args.pop : {}
      options.assert_valid_keys(:template, :format)
      
      template = options[:template] || args.shift
      
      cds_css_file = "calendar_date_select"
      cds_css_file << "_#{template}" if template
      
      output = []
      output << javascript_include_tag("calendar_date_select")
      output << javascript_include_tag(CalendarDateSelect.javascript_format_include) if CalendarDateSelect.javascript_format_include
      output << stylesheet_link_tag(cds_css_file)
      output * "\n"
    end
  end
end
