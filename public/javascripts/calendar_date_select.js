// CalendarDateSelect version 1.6.0 - a small prototype based date picker
// Questions, comments, bugs? - email the Author - Tim Harper <"timseeharper@gmail.seeom".gsub("see", "c")> 
if (typeof Prototype == 'undefined')
  alert("CalendarDateSelect Error: Prototype could not be found. Please make sure that your application's layout includes prototype.js (e.g. <%= javascript_include_tag :defaults %>) *before* it includes calendar_date_select.js (e.g. <%= calendar_date_select_includes %>).");

Element.addMethods({
  purgeChildren: function(element) { $A(element.childNodes).each(function(e){$(e).remove();}); },
  build: function(element, type, options, style) {
    newElement = Element.build(type, options, style);
    element.appendChild(newElement);
    return newElement;
  }
});

Element.build = function(type, options, style)
{
  e = $(document.createElement(type));
  $H(options).each(function(pair) { eval("e." + pair.key + " = pair.value" ); });
  if (style) 
    $H(style).each(function(pair) { eval("e.style." + pair.key + " = pair.value" ); });
  return e;
};
nil=null;

Date.one_day = 24*60*60*1000;
Date.weekdays = $w("S M T W T F S");
Date.months = $w("January February March April May June July August September October November December" );
Date.padded2 = function(hour) { padded2 = hour.toString(); if (parseInt(hour) < 10) padded2="0" + padded2; return padded2; }
Date.prototype.getPaddedMinutes = function() { return Date.padded2(this.getMinutes()); }
Date.prototype.getAMPMHour = function() { hour=this.getHours(); return (hour == 0) ? 12 : (hour > 12 ? hour - 12 : hour ) }
Date.prototype.getAMPM = function() { return (this.getHours() < 12) ? "AM" : "PM"; }
Date.prototype.stripTime = function() { return new Date(this.getFullYear(), this.getMonth(), this.getDate());};
Date.prototype.daysDistance = function(compare_date) { return Math.round((compare_date - this) / Date.one_day); };
Date.prototype.toFormattedString = function(include_time){
  str = Date.months[this.getMonth()] + " " + this.getDate() + ", " + this.getFullYear();
  
  if (include_time) { hour=this.getHours(); str += " " + this.getAMPMHour() + ":" + this.getPaddedMinutes() + " " + this.getAMPM() }
  return str;
}
Date.parseFormattedString = function(string) { return new Date(string);}
window.f_height = function() { return( [window.innerHeight ? window.innerHeight : null, document.documentElement ? document.documentElement.clientHeight : null, document.body ? document.body.clientHeight : null].select(function(x){return x>0}).first()||0); }
window.f_scrollTop = function() { return ([window.pageYOffset ? window.pageYOffset : null, document.documentElement ? document.documentElement.scrollTop : null, document.body ? document.body.scrollTop : null].select(function(x){return x>0}).first()||0 ); }

_translations = {
  "OK": "OK",
  "Now": "Now",
  "Today": "Today"
}
CalendarDateSelect = Class.create();
CalendarDateSelect.prototype = {
  initialize: function(target_element, options) {
    // initialize the date control
    this.options = $H({
      embedded: false,
      time: false,
      buttons: true,
      year_range: 10,
      calendar_div: nil,
      close_on_click: nil,
      minute_interval: 5,
      onchange: nil
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
    
    this.parseDate();
    
    // by default, stick it by the target element (if embedded, that's where we'll want it to show up)
    if (this.calendar_div == nil) { this.calendar_div = $( this.options.embedded ? this.target_element.parentNode : document.body ).build('div'); }
    if (!this.options.embedded) {
      this.calendar_div.setStyle( { position:"absolute", visibility: "hidden" } )
      this.positionCalendarDiv();
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
    if(!this.options["embedded"]) Event.observe(document.body, "mousedown", this.bodyClick_handler=this.bodyClick.bindAsEventListener(this));
    
    this.initFrame();
    if(!this.options["embedded"]) { this.positionCalendarDiv(true) }//.bindAsEventListener(this), 1);
  },
  positionCalendarDiv: function(post_painted) {
    above=false;
    c_pos = Position.cumulativeOffset(this.target_element); c_left = c_pos[0]; c_top = c_pos[1]; c_dim = this.calendar_div.getDimensions(); c_height = c_dim.height; c_width = c_dim.width; 
    w_top = window.f_scrollTop(); w_height = window.f_height();
    e_dim = Position.cumulativeOffset(this.target_element); e_top = e_dim[1]; e_left = e_dim[0];
    
    if ( (post_painted) && (( c_top + c_height ) > (w_top + w_height)) && ( c_top - c_height > w_top )) above=true;
    left_px = e_left.toString() + "px";
    top_px = (above ? (e_top - c_height ) : ( e_top + this.target_element.getDimensions().height )).toString() + "px";
    
    this.calendar_div.style.left = left_px;  this.calendar_div.style.top = top_px;
    
    // draw an iframe behind the calendar -- ugly hack
    if (post_painted)
    {
      this.iframe = $(document.body).build("iframe", {}, { position:"absolute", left: left_px, top: top_px, height: c_height.toString()+"px", width: c_width.toString()+"px", border: "0px"})
      this.calendar_div.setStyle({visibility:""});
    }
  },
  initFrame: function() {
    that=this;
    // create the divs
    $w("header body time footer buttons").each(function(name) {
      eval(name + "_div = that." + name + "_div = that.calendar_div.build('div', { className: 'cds_"+name+"' }, { clear: 'left'} ); ");
    });
    
    this.initTimeDiv();
    this.initButtonsDiv();
    
    this.updateFooter("&nbsp;");
    // make the header buttons
    this.next_month_button = header_div.build("input", { type: "button", value : ">", className: "next" });
    this.prev_month_button = header_div.build("input", { type: "button", value : "<", className: "prev" });
    this.month_select = header_div.build("select", { className: "month"});
    this.year_select = header_div.build("select", { className: "year"});
    
    // make the month selector
    for(x=0; x<12; x++)
      this.month_select.options[x]=new Option(Date.months[x],x);
    Event.observe(this.prev_month_button, 'mousedown', function () { this.navMonth(this.date.getMonth() - 1 ) }.bindAsEventListener(this));
    Event.observe(this.next_month_button, 'mousedown', function () { this.navMonth(this.date.getMonth() + 1 ) }.bindAsEventListener(this));
    Event.observe(this.month_select, 'change', (function () { this.navMonth($F(this.month_select)) }).bindAsEventListener(this));
    Event.observe(this.year_select, 'change', (function () { this.navYear($F(this.year_select)) }).bindAsEventListener(this));
    
    // build the calendar day grid
    this.calendar_day_grid = [];
    days_table = body_div.build("table", { cellPadding: "0px", cellSpacing: "0px", width: "100%" }).build("tbody");

    // make the weekdays!
    weekdays_row = days_table.build("tr", {className: "weekdays"});
    Date.weekdays.each( function(weekday) { 
      weekdays_row.build("td", {innerHTML: weekday});
    });
    
    // Make the days!
    for(cell_index=0; cell_index<42; cell_index++)
    {
      weekday=cell_index%7;
      if ( cell_index %7==0 ) days_row = days_table.build("tr", {className: "days"});
      (this.calendar_day_grid[cell_index] = days_row.build("td", {
          calendar_date_select: this,
          onmouseover: function () { this.calendar_date_select.dayHover(this); },
          onmouseout: function () { this.calendar_date_select.dayHoverOut(this) },
          onclick: function() { this.calendar_date_select.updateSelectedDate(this); },
          className: (weekday==0) || (weekday==6) ? " weekend" : "" //clear the class
        },
        { cursor: "pointer" }
      )).build("div");
      this.calendar_day_grid[cell_index];
    }
    this.refresh();
  },
  initButtonsDiv: function()
  {
    buttons_div = this.buttons_div;
    if (!this.options["buttons"]) { Element.remove(buttons_div); return false; };
    
    b=buttons_div.build("input", {
      onclick: this.today.bindAsEventListener(this), 
      type: "button"
    });
    b.value = (this.options["time"] ? _translations["Now"] : _translations["Today"] );
    
    if (this.allowCloseButtons()) {
      b=buttons_div.build("input", {
        onclick: this.close.bindAsEventListener(this),
        type: "button"
      });
      b.value = _translations["OK"];
    }
  },
  initTimeDiv: function()
  {
    time_div = this.time_div;
    // make the time div
    if (this.options["time"])
    {
      time_div.build("span", {innerHTML:" @ "})
      this.hour_select = time_div.build("select", {
        calendar_date_select: this,
        onchange: function() { this.calendar_date_select.updateSelectedDate( { hour: this.value });}
      });
      time_div.build("span", {innerHTML:"&nbsp; : "});
      this.minute_select = time_div.build("select", {
        calendar_date_select: this,
        onchange: function() { this.calendar_date_select.updateSelectedDate( {minute: this.value }) }
      });
      t=new Date();
      // populate hours
      for(x=0;x<=23;x++) { t.setHours(x); this.hour_select.options[x] = new Option( "" + t.getAMPMHour() + " " + t.getAMPM(), x ) }
      // populate minutes
      x=0; for(m=0;m<60;m+=this.options["minute_interval"]) { this.minute_select.options[x++] = new Option( Date.padded2(m), m ) }
    } else (time_div.remove());
  },
  allowCloseButtons: function() { return ( !this.options["embedded"] && this.options["time"]); },
  dateString: function() {
    return (this.selection_made) ? this.selected_date.toFormattedString(this.options['time']) : "&nbsp;";
  },
  navMonth: function(month) {
    prev_day = this.date.getDate();
    this.date.setMonth(month);
    
    this.refresh();
  },
  navYear: function(year) {
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
    this.beginning_date = new Date(this.date).stripTime();
    this.beginning_date.setDate(1);
    pre_days = this.beginning_date.getDay() // draw some days before the fact
    if (pre_days < 3) pre_days+=7;
    this.beginning_date.setDate(1 - pre_days);
    
    iterator = new Date(this.beginning_date);
    
    today = new Date().stripTime();
    this_month = this.date.getMonth();
    for (cell_index=0;cell_index<42; cell_index++)
    {

      day = iterator.getDate(); month = iterator.getMonth();
      cell = this.calendar_day_grid[cell_index];
      Element.remove(cell.childNodes[0]); div = cell.build("div", {innerHTML:day});
      if (month!=this_month) div.className = "other";
      cell.day=day; cell.month = month; cell.year = iterator.getFullYear();
      iterator.setDate( day + 1);
    }
    
    if (this.today_cell) this.today_cell.removeClassName("today");
    
    if ( $R(0,42).include(days_until = this.beginning_date.daysDistance(today)) ) {
      this.today_cell = this.calendar_day_grid[days_until];
      this.today_cell.addClassName("today");
    }
    
    // set the time
    if (this.options["time"]) {
      this.hour_select.selectedIndex = this.selected_date.getHours();
      this.minute_select.selectedIndex = this.selected_date.getMinutes() / this.options["minute_interval"];
      
      this.hour_select.onchange();
      this.minute_select.onchange();
    }
    
    this.setSelectedClass();
    this.updateFooter();
  },
  dayHover: function(element) {
    element.addClassName("hover");
    hover_date = new Date(this.selected_date);
    hover_date.setYear(element.year); hover_date.setMonth(element.month); hover_date.setDate(element.day);
    this.updateFooter(hover_date.toFormattedString(this.options['time']));
  },
  dayHoverOut: function(element) { element.removeClassName("hover"); this.updateFooter(); },
  setSelectedClass: function() {
    if (!this.selection_made) return;
    
    // clear selection
    if (this.selected_cell) this.selected_cell.removeClassName("selected");
    
    if ($R(0,42).include( days_until = this.beginning_date.daysDistance(this.selected_date.stripTime()) )) {
      this.selected_cell = this.calendar_day_grid[days_until];
      this.selected_cell.addClassName("selected");
    }
  },
  reparse: function() { this.parseDate(); this.refresh(); },
  parseDate: function()
  {
    this.date = Date.parseFormattedString(this.options['date'] || $F(this.target_element));
    if (isNaN(this.date)) this.date = new Date();
    this.selected_date = new Date(this.date);
    this.date.setDate(1);
  },
  updateFooter:function(text) { if (!text) text=this.dateString(); this.footer_div.purgeChildren(); this.footer_div.build("text", {innerHTML: text }); },
  updateSelectedDate:function(parts) {
    if (this.target_element.disabled || this.target_element.readOnly) return false;
    if (parts.day) {
      this.selection_made = true;
      for (x=0; x<=1; x++) {
      this.selected_date.setDate(parts.day);
      this.selected_date.setMonth(parts.month);
      this.selected_date.setYear(parts.year);}
    }
    
    if (parts.hour) this.selected_date.setHours(parts.hour);
    if (parts.minute) this.selected_date.setMinutes(parts.minute);
    
    this.updateFooter();
    this.setSelectedClass();
    
    if (this.selection_made) this.updateValue();
    if (this.options.close_on_click) { this.close(); }
    
  },
  updateValue: function() {
    this.target_element.value = this.dateString();
    if (this.target_element.onchange) { this.target_element.onchange(); }
  },
  today: function() {
    this.date = new Date();
    d=new Date(); this.updateSelectedDate( { day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), hour: d.getHours(), minute: d.getMinutes() } );
    this.refresh();
  },
  close: function() {
    this.target_element.calendar_date_select = nil;
    Event.stopObserving(document.body, "mousedown", this.bodyClick_handler);
    this.calendar_div.remove();
    if (this.iframe) this.iframe.remove();
    this.target_element.focus();
  },
  bodyClick: function(e) { // checks to see if somewhere other than calendar date select grid was clicked.  in which case, close
    if (! $(Event.element(e)).descendantOf(this.calendar_div) ) this.close();
  }
}