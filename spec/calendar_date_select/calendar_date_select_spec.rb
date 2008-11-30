require File.dirname(__FILE__) + '/../spec_helper'

describe CalendarDateSelect do
  it "should detect presence of time in a string" do
    CalendarDateSelect.has_time?("January 7, 2007").should == false
    CalendarDateSelect.has_time?("January 7, 2007 5:50pm").should == true
    CalendarDateSelect.has_time?("January 7, 2007 5:50 pm").should == true
    CalendarDateSelect.has_time?("January 7, 2007 16:30 pm").should == true
  end
end
