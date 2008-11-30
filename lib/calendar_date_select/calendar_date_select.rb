module CalendarDateSelect
  VERSION = '1.12'
  FORMATS = {
    :natural => {
      :date => "%B %d, %Y",
      :time => " %I:%M %p"
    },
    :hyphen_ampm => {
      :date => "%Y-%m-%d",
      :time => " %I:%M %p",
      :javascript_include => "format_hyphen_ampm"
    },
    :iso_date => {
      :date => "%Y-%m-%d",
      :time => " %H:%M",
      :javascript_include => "format_iso_date"
    },
    :finnish => {
      :date => "%d.%m.%Y",
      :time => " %H:%M",
      :javascript_include => "format_finnish"
    },
    :american => {
      :date => "%m/%d/%Y",
      :time => " %I:%M %p",
      :javascript_include => "format_american"
    },
    :euro_24hr => {
      :date => "%d %B %Y",
      :time => " %H:%M",
      :javascript_include => "format_euro_24hr"
    },
    :euro_24hr_ymd => {
      :date => "%Y.%m.%d",
      :time => " %H:%M",
      :javascript_include => "format_euro_24hr_ymd"
    },
    :italian => {
      :date => "%d/%m/%Y",
      :time => " %H:%M",
      :javascript_include => "format_italian"
    },
    :db => {
      :date => "%Y-%m-%d",
      :time => "%H:%M",
      :javascript_include => "format_db"
    }
  }

  def self.default_options
    @default_options ||= { :image => "calendar_date_select/calendar.gif" }
  end

  def self.image=(value)
    default_options[:image] = value
  end

  def self.format
    @format ||= FORMATS[:natural]
  end

  def self.format=(format)
    raise "CalendarDateSelect: Unrecognized format specification: #{format}" unless FORMATS.has_key?(format)
    default_options[:format] = format
  end

  def self.date_format_string(time = false)
    format[:date] + (time ? format[:time] : "")
  end

  def self.format_date(date)
    if date.is_a?(Date)
      date.strftime(date_format_string(false))
    else
      date.strftime(date_format_string(true))
    end
  end

  def self.format_time(value, options = {})
    return value unless value.respond_to?("strftime")
    if options[:time]
      format_date(value)
    else
      format_date(value.to_date)
    end
  end

  def self.has_time?(value)
    /[0-9]:[0-9]{2}/.match(value.to_s) ? true : false
  end

  def self.version
    VERSION
  end
end
