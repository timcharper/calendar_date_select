class CalendarDateSelect
  module ActiveRecordExtension
    # use this function to create accessors which parse the date string
    # according to the format specified with CalendarDateSelect.format.
    # This permits to simply assign the string from the text input to
    # an object's date-type attribute even if the formated string isn't
    # parsed correctly by the database. An example is the :finnish format
    # where %d.%m.%Y is interpreted as %m/%d/%Y; month and day are swaped.
    #
    # It is highly recomended to mark every attribute which is manipulated
    # with a calendar_date_select. Please not that this overwrites the
    # default accessors!
    # 
    #   class Foo < ActiveRecord::Base
    #     calendar_date_attributes :created_at, :updated_at
    #   end
    #
    def calendar_date_attributes(*attrs)
      attrs.each do |attribute|
        module_eval <<-END_EVAL
          def #{attribute}=(date)
            write_attribute :#{attribute}, CalendarDateSelect.parse_date(date)
          end
        END_EVAL
      end
    end # calendar_date_attributes
  end # module ActiveRecordHelper
end # class CalendarDateSelect
