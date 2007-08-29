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
  
  cattr_accessor :image
  @@image = "calendar.gif"
  
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
      value = (value.strftime(calendar_options[:format]) rescue value) if (value.respond_to?("strftime"))
      
      calendar_options.delete(:format)
      
      options[:id] ||= name
      tag = calendar_options[:embedded] ? 
        hidden_field_tag(name, value, options) :
        text_field_tag(name, value, options)
      
      calendar_date_select_output(tag, calendar_options)
    end
    
    def calendar_date_select_process_options(options)
      calendar_options = {}
      callbacks = [:before_show, :before_close, :after_show, :after_close, :after_navigate]
      for key in [:time, :embedded, :buttons, :format, :year_range] + callbacks
        calendar_options[key] = options.delete(key) if options.has_key?(key)
      end
      
      # surround any callbacks with a function, if not already done so
      for key in callbacks
        calendar_options[key] = "function(param) { #{calendar_options[key]} }" unless calendar_options[key].include?("function") if calendar_options[key]
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
      
      value = obj.send(method).strftime(calendar_options[:format]) rescue obj.send("#{method}_before_type_cast")

      calendar_options.delete(:format)
      options = options.merge(:value => value)

      tag = ActionView::Helpers::InstanceTag.new(object, method, self, nil, options.delete(:object))
      calendar_date_select_output(
        tag.to_input_field_tag(calendar_options[:embedded] ? "hidden" : "text", options), 
        calendar_options
      )
    end  
    
    def calendar_date_select_output(input, calendar_options = {})
      out = input
      if calendar_options[:embedded]
        uniq_id = "cds_placeholder_#{(rand*100000).to_i}"
        # we need to be able to locate the target input element, so lets stick an invisible span tag here we can easily locate
        out << content_tag(:span, nil, :style => "display: none; position: absolute;", :id => uniq_id)
        
        out << javascript_tag("new CalendarDateSelect( $('#{uniq_id}').previous(), #{options_for_javascript(calendar_options)} ); ")
      else
        out << " "
        
        out << image_tag(CalendarDateSelect.image, 
            :onclick => "new CalendarDateSelect( $(this).previous(), #{options_for_javascript(calendar_options)} );",
            :style => 'border:0px; cursor:pointer;')
      end
      
      out
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
