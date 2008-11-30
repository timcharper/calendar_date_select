module CalendarDateSelect::FormHelpers
  def calendar_date_select_tag( name, value = nil, options = {})
    options, javascript_options = calendar_date_select_process_options(options)
    value = CalendarDateSelect.format_time(value, javascript_options)

    javascript_options.delete(:format)

    options[:id] ||= name
    tag = javascript_options[:hidden] || javascript_options[:embedded] ?
      hidden_field_tag(name, value, options) :
      text_field_tag(name, value, options)

    calendar_date_select_output(tag, options, javascript_options)
  end

  def calendar_date_select(object, method, options={})
    obj = options[:object] || instance_variable_get("@#{object}")

    if !options.include?(:time) && obj.class.respond_to?("columns_hash")
      column_type = (obj.class.columns_hash[method.to_s].type rescue nil)
      options[:time] = true if column_type == :datetime
    end

    use_time = options[:time]

    if options[:time].to_s=="mixed"
      use_time = false if Date===(obj.respond_to?(method) && obj.send(method))
    end

    options, javascript_options = calendar_date_select_process_options(options)

    options[:value] ||=
      if(obj.respond_to?(method) && obj.send(method).respond_to?(:strftime))
        obj.send(method).strftime(CalendarDateSelect.date_format_string(use_time))
      elsif obj.respond_to?("#{method}_before_type_cast")
        obj.send("#{method}_before_type_cast")
      elsif obj.respond_to?(method)
        obj.send(method).to_s
      else
        nil
      end

    tag = ActionView::Helpers::InstanceTag.new_with_backwards_compatibility(object, method, self, options.delete(:object))
    calendar_date_select_output(
      tag.to_input_field_tag( (javascript_options[:hidden] || javascript_options[:embedded]) ? "hidden" : "text", options),
      options,
      javascript_options
    )
  end

  private
    # extracts any options passed into calendar date select, appropriating them to either the Javascript call or the html tag.
    def calendar_date_select_process_options(options)
      options, javascript_options = CalendarDateSelect.default_options.merge(options), {}
      callbacks = [:before_show, :before_close, :after_show, :after_close, :after_navigate]
      for key in [:time, :valid_date_check, :embedded, :buttons, :clear_button, :format, :year_range, :month_year, :popup, :hidden, :minute_interval] + callbacks
        javascript_options[key] = options.delete(key) if options.has_key?(key)
      end

      # if passing in mixed, pad it with single quotes
      javascript_options[:time] = "'mixed'" if javascript_options[:time].to_s=="mixed"
      javascript_options[:month_year] = "'#{javascript_options[:month_year]}'" if javascript_options[:month_year]

      # if we are forcing the popup, automatically set the readonly property on the input control.
      if javascript_options[:popup].to_s == "force"
        javascript_options[:popup] = "'force'"
        options[:readonly] = true
      end

      if (vdc=javascript_options.delete(:valid_date_check))
        if vdc.include?(";") || vdc.include?("function")
          raise ArgumentError, ":valid_date_check function is missing a 'return' statement.  Try something like: :valid_date_check => 'if (date > new(Date)) return true; else return false;'" unless vdc.include?("return");
        end

        vdc = "return(#{vdc})" unless vdc.include?("return")
        vdc = "function(date) { #{vdc} }" unless vdc.include?("function")
        javascript_options[:valid_date_check] = vdc
      end

      javascript_options[:popup_by] ||= "this" if javascript_options[:hidden]

      # surround any callbacks with a function, if not already done so
      for key in callbacks
        javascript_options[key] = "function(param) { #{javascript_options[key]} }" unless javascript_options[key].include?("function") if javascript_options[key]
      end

      javascript_options[:year_range] = format_year_range(javascript_options[:year_range] || 10)
      [options, javascript_options]
    end

    def calendar_date_select_output(input, options = {}, javascript_options = {})
      out = input
      if javascript_options[:embedded]
        uniq_id = "cds_placeholder_#{(rand*100000).to_i}"
        # we need to be able to locate the target input element, so lets stick an invisible span tag here we can easily locate
        out << content_tag(:span, nil, :style => "display: none; position: absolute;", :id => uniq_id)
        out << javascript_tag("new CalendarDateSelect( $('#{uniq_id}').previous(), #{options_for_javascript(javascript_options)} ); ")
      else
        out << " "
        out << image_tag(options[:image],
            :onclick => "new CalendarDateSelect( $(this).previous(), #{options_for_javascript(javascript_options)} );",
            :style => 'border:0px; cursor:pointer;')
      end
      out
    end

    def format_year_range(year) # nodoc
      return year unless year.respond_to?(:first)
      return "[#{year.first}, #{year.last}]" unless year.first.respond_to?(:strftime)
      return "[#{year.first.year}, #{year.last.year}]"
    end
end

module ActionView
  module Helpers
    class FormBuilder
      def calendar_date_select(method, options = {})
        @template.calendar_date_select(@object_name, method, options.merge(:object => @object))
      end
    end
  end
end
