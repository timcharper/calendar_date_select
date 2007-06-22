module CalendarDateSelect
  module FormHelper
    def calendar_date_select_tag( name, value = nil, options = {})
      calendar_options = calendar_date_select_process_options(options)
      value = (value.strftime(options[:format]) rescue "") if (value.respond_to?("strftime"))
      
      options.delete(:format)
      
      options[:id] ||= name
      
      if calendar_options[:embedded]
        out = hidden_field_tag(name, value, options)
        out << javascript_tag("new CalendarDateSelect('#{options[:id]}', #{options_for_javascript(calendar_options)} ); ")
      else
        out = text_field_tag(name, value, options)
        out << " "
        
        out << image_tag("calendar.gif", 
            :onclick => "new CalendarDateSelect('#{options[:id]}', #{options_for_javascript(calendar_options)} );",
            :id => "_#{name}_link", 
            :style => 'border:0px; cursor:pointer;')
      end
    end
    
    def calendar_date_select_process_options(options)
      calendar_options = {}
      calendar_options[:time] = options.delete(:time) ? true : false
      calendar_options[:embedded] = options.delete(:embedded) ? true : false
      calendar_options[:year_range] = options.delete(:year_range) || 10
      
      options[:format] ||= "%B %d, %Y" + (calendar_options[:time] ? " %I:%M %p" : '')
      
      calendar_options
    end
    
    def calendar_date_select(object, method, options={})
      obj = instance_eval("@#{object}") || options[:object]
      
      if obj.class.respond_to?("columns_hash")
        column_type = (obj.class.columns_hash[method.to_s].type rescue nil)
        options[:time] ||= true if column_type==:datetime
      end
      
      calendar_options = calendar_date_select_process_options(options)
      
      value = obj.send(method).strftime(options[:format]) rescue ""
      
      options.delete(:format)
      
      options[:id]||="#{object}#{obj.id ? ('_'+obj.id.to_s) : ''}_#{method}"

      if calendar_options[:embedded]
        out = hidden_field(object, method, options.merge('value' => value))
        out << javascript_tag("new CalendarDateSelect('#{options[:id]}', #{options_for_javascript(calendar_options)} ); ")
      else
        out = text_field(object, method, options.merge('value' => value))
        out << " "
        
        out << image_tag("calendar.gif", 
            :onclick => "new CalendarDateSelect('#{options[:id]}', #{options_for_javascript(calendar_options)} );",
            :id => "_#{options[:id]}_link", 
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
