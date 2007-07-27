class CalendarDateSelect
  FORMATS = {
    :natural => {
      :date => "%B %d, %Y",
      :time => " %I:%M %p"
    },
    :hyphen_ampm => {
      :date => "%Y-%m-%d",
      :time => " %I:%M %p",
      :javascript_include => "calendar_date_select_format_hyphen_ampm"
    }
  }
  
  cattr_reader :format
  @@format = FORMATS[:natural]
  class << self
    def format=(format)
      raise "CalendarDateSelect: Unrecognized format specification: #{format}" unless FORMATS.has_key?(format)
      @@format = FORMATS[format]
    end
    
    def javascript_format_include
      @@format[:javascript_include]
    end
    
    def date_format_string(time=false)
      @@format[:date] + ( time ? @@format[:time] : "" )
    end
  end
  
  module FormHelper
    def calendar_date_select_tag( name, value = nil, options = {})
      calendar_options = calendar_date_select_process_options(options)
      value = (value.strftime(calendar_options[:format]) rescue "") if (value.respond_to?("strftime"))
      
      calendar_options.delete(:format)
      
      options[:id] ||= name
      
      if calendar_options[:embedded]
        out = hidden_field_tag(name, value, options)
        out << javascript_tag("new CalendarDateSelect('#{options[:id]}', #{options_for_javascript(calendar_options)} ); ")
      else
        out = text_field_tag(name, value, options)
        out << " "
        
        out << image_tag("calendar.gif", 
            :onclick => "new CalendarDateSelect('#{options[:id]}', #{options_for_javascript(calendar_options)} );",
            :id => "#{name}_image_link", 
            :style => 'border:0px; cursor:pointer;')
      end
    end
    
    def calendar_date_select_process_options(options)
      calendar_options = {}
      for key in [:time, :embedded, :buttons, :format, :year_range]
        calendar_options[key] = options.delete(key) if options.has_key?(key)
      end
      calendar_options[:year_range] ||= 10
      calendar_options[:format] ||= CalendarDateSelect.date_format_string(calendar_options[:time])
      
      calendar_options
    end
    
    def calendar_date_select(object, method, options={})
      obj = instance_eval("@#{object}") || options[:object]
      
      if !options.include?(:time) && obj.class.respond_to?("columns_hash")
        column_type = (obj.class.columns_hash[method.to_s].type rescue nil)
        options[:time] = true if column_type==:datetime
      end
      
      calendar_options = calendar_date_select_process_options(options)
      
      value = obj.send(method).strftime(calendar_options[:format]) rescue ""
      
      calendar_options.delete(:format)
      
      options[:id]||="#{object}#{obj.id ? ('_'+obj.id.to_s) : ''}_#{method}"

      if calendar_options[:embedded]
        out = hidden_field(object, method, options.merge('value' => value))
        out << javascript_tag("new CalendarDateSelect('#{options[:id]}', #{options_for_javascript(calendar_options)} ); ")
      else
        out = text_field(object, method, options.merge('value' => value))
        out << " "
        
        out << image_tag("calendar.gif", 
            :onclick => "new CalendarDateSelect('#{options[:id]}', #{options_for_javascript(calendar_options)} );",
            :id => "#{options[:id]}_image_link", 
            :style => 'border:0px; cursor:pointer;')
      end
      
      if obj.respond_to?(:errors) and obj.errors.on(method) then
        ActionView::Base.field_error_proc.call(out, nil) # What should I pass ?
      else
        out
      end
    end  
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
