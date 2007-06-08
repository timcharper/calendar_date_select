// CalendarDateSelect - a small prototype based date picker
// Version 1.1
// Questions, comments, bugs? - email the Author - Tim Harper <"timseeharper@gmail.seeom".gsub("see", "c")> 
Element.addMethods({
  purgeChildren: function(element) {
    $A(element.childNodes).each(function(e){$(e).remove();});
  },
  build: function(element, type, options, style) {
    newElement = Element.build(type, options, style);
    element.appendChild(newElement);
    return newElement;
  }
});

Element.build = function(type, options, style)
{
  e = $(document.createElement(type));
  
  $H(options).each(function(pair) {
    eval("e." + pair.key + " = pair.value" );
  });
  
  if (style) $H(style).each(function(pair) {
    eval("e.style." + pair.key + " = pair.value" );
  });

  return e;
};
nil=null;

CalendarDateSelect = Class.create();
CalendarDateSelect.weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
CalendarDateSelect.months = $w("January February March April May June July August September October November December" );
CalendarDateSelect.padded2 = function(hour) { padded2 = hour.toString(); if (parseInt(hour) < 10) padded2="0" + padded2; return padded2; }
CalendarDateSelect.ampm = function(hour) { return (hour < 12) ? "AM" : "PM"; }
CalendarDateSelect.ampm_hour = function(hour) { return (hour == 0) ? 12 : (hour > 12 ? hour - 12 : hour ) }
Date.one_day = 24*60*60*1000;
Date.prototype.strip_time = function() { this.setHours(0); this.setMinutes(0); this.setSeconds(0); this.setMilliseconds(0); return this;};
Date.prototype.days_distance = function(compare_date) { return (compare_date - this) / Date.one_day; };

window.f_height = function() { return([window.innerHeight ? window.innerHeight : null, document.documentElement ? document.documentElement.clientHeight : null, document.body ? document.body.clientHeight : null].compact().first()); }
window.f_scrollTop = function() { return ([window.pageYOffset ? window.pageYOffset : null, document.documentElement ? document.documentElement.scrollTop : null, document.body ? document.body.scrollTop : null].compact().first() ); }

CalendarDateSelect.date_string = function(date, include_time){
  if (! date) return ""; 
  str = CalendarDateSelect.months[date.getMonth()] + " " + date.getDate().toString() + ", " + date.getFullYear().toString();
  
  if (include_time) { hour=date.getHours(); str += " " + CalendarDateSelect.ampm_hour(hour).toString() + ":" + CalendarDateSelect.padded2( date.getMinutes() ) + " " + CalendarDateSelect.ampm(hour) }
  return str;
}

CalendarDateSelect.prototype = {
  initialize: function(target_element, options) {
    // initialize the date control
    this.options = $H({
      embedded: false,
      time: false,
      year_range: 10,
      calendar_div: nil,
      close_on_click: nil,
      minute_interval: 5
    }).merge(options || {});
    
    this.target_element = $(target_element); // make sure it's an element, not a string
    this.selection_made = $F(this.target_element)!="";
    
    if (this.target_element.calendar_date_select)
    {
      this.target_element.calendar_date_select.close();
      return false;
    }
    this.target_element.calendar_date_select = this;
    
    this.calendar_div = $(this.options['calendar_div']);
    if (!this.target_element) { alert("Target element " + target_element + " not found!"); return false;}
    
    this.parse_date();
    
    // by default, stick it by the target element (if embedded, that's where we'll want it to show up)
    if (this.calendar_div == nil) { this.calendar_div = $( this.options.embedded ? this.target_element.parentNode : document.body ).build('div'); }
    if (!this.options.embedded) {
      this.calendar_div.style.position = "absolute";
      this.position_calendar_div();
    }
    
    this.calendar_div.addClassName("calendar_date_select");
    
    if (this.options["embedded"]) this.options["close_on_click"]=false;
    // logic for close on click
    if (this.options['close_on_click']===nil )
    {
      if (this.options['time'])
        this.options["close_on_click"] = false;
      else
        this.options['close_on_click'] = true;
    }
    
    // set the click handler to check if a user has clicked away from the document
    if(!this.options["embedded"]) Event.observe(document.body, "mousedown", this.body_click_handler=this.body_click.bindAsEventListener(this));
    
    this.init_frame();
    if(!this.options["embedded"]) setTimeout(function(){
      if (( parseInt(this.calendar_div.style.top) + this.calendar_div.getDimensions().height ) > (window.f_scrollTop() + window.f_height()))
        this.position_calendar_div(true);
      }.bindAsEventListener(this), 1);
  },
  position_calendar_div: function(above) {
    pos = Position.cumulativeOffset(this.target_element);
    
    this.calendar_div.style.left = pos[0].toString() + "px";
    if (above)
      this.calendar_div.style.top = (pos[1] - this.calendar_div.getDimensions().height ).toString() + "px";
    else
      this.calendar_div.style.top = (pos[1] + this.target_element.getDimensions().height ).toString() + "px";
  },
  init_frame: function() {
    that=this;
    // create the divs
    $w("header body time buttons footer").each(function(name) {
      eval(name + "_div = that." + name + "_div = that.calendar_div.build('div', { className: '"+name+"' }, { clear: 'left'} ); ");
    });
    
    this.init_time_div();
    this.init_buttons_div();
    
    this.update_footer("&nbsp;");
    // make the header buttons
    this.prev_month_button = header_div.build("input", { type: "button", value : "<", className: "button" });

    this.month_select = header_div.build("select");
    this.year_select = header_div.build("select");
    this.next_month_button = header_div.build("input", { type: "button", value : ">", className: "button" });
    
    // make the month selector
    for(x=0; x<12; x++)
      this.month_select.options[x]=new Option(CalendarDateSelect.months[x],x);
    Event.observe(this.prev_month_button, 'mousedown', function () { this.nav_month(-1) }.bindAsEventListener(this));
    Event.observe(this.next_month_button, 'mousedown', (function () { this.nav_month(1) }).bindAsEventListener(this));
    Event.observe(this.month_select, 'change', (function () { this.set_month($F(this.month_select)) }).bindAsEventListener(this));
    Event.observe(this.year_select, 'change', (function () { this.set_year($F(this.year_select)) }).bindAsEventListener(this));
    
    // build the calendar day grid
    this.calendar_day_grid = [];
    days_table = body_div.build("table", { cellPadding: "0px", cellSpacing: "0px", width: "100%" }).build("tbody");

    // make the weekdays!
    weekdays_row = days_table.build("tr", {className: "weekdays"});
    CalendarDateSelect.weekdays.each( function(weekday) { 
      weekdays_row.build("td", {innerHTML: weekday});
    });
    
    // Make the days!
    for(cell_index=0; cell_index<42; cell_index++)
    {
      if ( cell_index %7==0 ) days_row = days_table.build("tr", {className: "days"});
      (this.calendar_day_grid[cell_index] = days_row.build("td", {
          calendar_date_select: this,
          onmouseover: function () { this.calendar_date_select.day_hover(this); },
          onmouseout: function () { this.calendar_date_select.day_hover_out(this) },
          onclick: function() { this.calendar_date_select.update_selected_date(this); }
        },
        { cursor: "pointer" }
      )).build("div");
      this.calendar_day_grid[cell_index];
    }
    this.refresh();
  },
  init_buttons_div: function()
  {
    buttons_div = this.buttons_div;
    
    buttons_div.build("input", {
      value: (this.options["time"] ? "Now" : "Today" ),
      onclick: this.today.bindAsEventListener(this), 
      type: "button"
    });
    if (this.allow_close_buttons()) 
    {
      buttons_div.build("input", {
        value: "Ok",
        onclick: this.ok.bindAsEventListener(this),
        type: "button"
      });
      buttons_div.build("input", {
        value: "Cancel",
        onclick: this.close.bindAsEventListener(this), 
        type: "button"
      });
    }
  },
  init_time_div: function()
  {
    time_div = this.time_div;
    // make the time div
    if (this.options["time"])
    {
      time_div.build("span", {innerHTML:" @ "})
      this.hour_select = time_div.build("select", {
        calendar_date_select: this,
        onchange: function() { this.calendar_date_select.update_selected_date( { hour: this.value });}
      });
      time_div.build("span", {innerHTML:"&nbsp; : "});
      this.minute_select = time_div.build("select", {
        calendar_date_select: this,
        onchange: function() { this.calendar_date_select.update_selected_date( {minute: this.value }) }
      });
      
      // populate hours
      for(x=0;x<=23;x++) { this.hour_select.options[x] = new Option( CalendarDateSelect.ampm_hour(x).toString() + " " + CalendarDateSelect.ampm(x), x ) }
      // populate minutes
      x=0; for(m=0;m<=60;m+=this.options["minute_interval"]) { this.minute_select.options[x++] = new Option( CalendarDateSelect.padded2(m), m ) }
    } else (time_div.remove());
  },
  allow_close_buttons: function() { return ( !this.options["embedded"]); },
  nav_month: function(dir) {
    this.set_month(this.date.getMonth() + dir )
  },
  date_string: function() {
    return (this.selection_made) ? CalendarDateSelect.date_string(this.selectedDate, this.options['time']) : "&nbsp;";
  },
  set_month: function(month) {
    prev_day = this.date.getDate();
    this.date.setMonth(month);
    
    this.refresh();
  },
  set_year: function(year) {
    this.date.setYear(year);
    this.refresh();
  },
  refresh: function ()
  {
    // set the month
    this.month_select.selectedIndex = this.date.getMonth();
    
    // set the year, 
    range=this.options["year_range"];
    this.year_select.purgeChildren();
    for( x=0; x<=range*2; x++)
    {
      year = x+(this.date.getFullYear() - range);
      this.year_select.options[x]=new Option(year,year);
    }
    
    this.year_select.selectedIndex = range;
    
    // populate the calendar_day_grid
    iterator = new Date(this.date);
    iterator.setDate(1);
    pre_days = iterator.getDay() // draw some days before the fact
    if (pre_days < 3) pre_days+=7;
    
    iterator.strip_time().setDate(1 - pre_days);
    beginning_date = new Date(iterator);
    today = new Date().strip_time();
    this_month = this.date.getMonth();
    for (cell_index=0;cell_index<42; cell_index++)
    {
      day = iterator.getDate(); month = iterator.getMonth();
      cell = this.calendar_day_grid[cell_index];
      Element.remove(cell.childNodes[0]); cell.build("div", {innerHTML:day});
      cell.day=day; cell.month = month; cell.year = iterator.getFullYear();
      cell.className = month==this_month ? "" : "other"; //clear the class

      iterator.setDate( day + 1);
    }
    if ( $R(0,42).include(days_until = beginning_date.days_distance(today)) ) this.calendar_day_grid[days_until].addClassName("today");
     
    // set the time
    if (this.options["time"]) {
      this.hour_select.selectedIndex = this.selectedDate.getHours();
      this.minute_select.selectedIndex = this.selectedDate.getMinutes() / this.options["minute_interval"];
      
      this.hour_select.onchange();
      this.minute_select.onchange();
    }
    
    this.set_selected_class();
    this.update_footer();
  },
  day_hover: function(element) {
    element.addClassName("hover");
    hover_date = new Date(this.selectedDate);
    hover_date.setYear(element.year); hover_date.setMonth(element.month); hover_date.setDate(element.day);
    this.update_footer(CalendarDateSelect.date_string(hover_date, this.options['time']));
  },
  day_hover_out: function(element) { element.removeClassName("hover"); this.update_footer(); },
  set_selected_class: function() {
    // clear selection
    this.body_div.getElementsBySelector(".selected").each(function(e) { e.removeClassName("selected")});
    if (!this.selection_made) return;
    day = this.selectedDate.getDate(); month = this.selectedDate.getMonth();
    this.body_div.getElementsBySelector("td").each(function(e) { if ((e.day == day) && (e.month == month)) {e.addClassName("selected")} } );
  },
  reparse: function() { this.parse_date(); this.refresh(); },
  parse_date: function()
  {
    this.date = new Date(this.options['date'] || $F(this.target_element));
    if (isNaN(this.date.getDate())) this.date = new Date();
    this.selectedDate = new Date(this.date);
    this.date.setDate(1);
  },
  update_footer:function(text) { if (!text) text=this.date_string(); this.footer_div.purgeChildren(); this.footer_div.build("text", {innerHTML: text }); },
  update_selected_date:function(parts) {
    if (parts.day) {
      this.selectedDate.setDate(parts.day);
      this.selectedDate.setMonth(parts.month);
      this.selectedDate.setYear(parts.year);
      this.selection_made = true;
    }
    
    if (parts.hour) this.selectedDate.setHours(parts.hour);
    if (parts.minute) this.selectedDate.setMinutes(parts.minute);
    
    if (this.options.embedded) { this.target_element.value = this.date_string(); }
    if (this.options.close_on_click) { this.ok(); }
    this.update_footer();
    this.set_selected_class();
  },
  ok: function() {
    this.target_element.value = this.date_string();
    if (this.options.onok) this.options.onok(this);
    this.close();
  },
  today: function() {
    this.selection_made=true;
    this.selectedDate = new Date();
    this.date = new Date();
    this.refresh();
  },
  close: function() {
    this.target_element.calendar_date_select = nil;
    Event.stopObserving(document.body, "mousedown", this.body_click_handler);
    this.calendar_div.remove();
  },
  body_click: function(e) { // checks to see if somewhere other than calendar date select grid was clicked.  in which case, close
    if (! $(Event.element(e)).descendantOf(this.calendar_div) ) this.close();
  }
}