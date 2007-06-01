module CalendarDateSelect
  module FormHelper
    def calendar_date_select_tag( name, value = nil, options = {})

      time_field, embedded = calendar_date_select_process_options(options)
      value = (value.strftime(options[:format]) rescue "") if (value.respond_to?("strftime"))
      options[:id] ||= name
      
      if embedded
        out = hidden_field_tag(name, value, options)
        out << javascript_tag("new CalendarDateSelect('#{options[:id]}', { time: #{time_field}, embedded: true } ); ")
      else
        out = text_field_tag(name, value, options)
        out << " "
        
        out << image_tag("calendar.gif", 
            :onclick => "new CalendarDateSelect('#{options[:id]}', { time: #{time_field} } );",
            :id => "_#{name}_link", 
            :style => 'border:0px; cursor:pointer;')
      end
    end
    
    def calendar_date_select_process_options(options)
      time_field = options.delete(:time) ? true : false
      embedded = options.delete(:embedded) ? true : false
      
      options[:format]||="%B %d, %Y" + (time_field ? " %I:%M %p" : '')
      
      [time_field, embedded]
    end
    
    def calendar_date_select(object, method, options={})
      obj = instance_eval("@#{object}")

      time_field, embedded = calendar_date_select_process_options(options)

      
      value = obj.send(method).strftime(options[:format]) rescue ""
      
      options[:id]||="#{object}#{obj.id ? ('_'+obj.id.to_s) : ''}_#{method}"
      
      out = text_field(object, method, options.merge('value' => value))
      out << " "
      
      out << image_tag("calendar.gif", 
          :onclick => "new CalendarDateSelect('#{options[:id]}', { time: #{time_field}, embedder: #{embedded} } );",
          :id => "_#{options[:id]}_link", 
          :style => 'border:0px; cursor:pointer;')
      
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
