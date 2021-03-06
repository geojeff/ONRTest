// ==========================================================================
// Project:   DateTime Unit Test
// Copyright: ©2009 Martin Ottenwaelter
// ==========================================================================
/*globals module test ok equals same stop start */

module('Time');

var dt, options, ms, timezone, startTime, timezones;

module("SC.DateTime", {
  setup: function() {
    ms = 487054822032; // June 8, 1985, 05:00:22:32 UTC
    options = { year: 1985, month: 6, day: 8, hour: 4, minute: 0, second: 22, millisecond: 32, timezone: 60 }; // an arbitrary time zone
    dt = SC.DateTime.create(options);
    timezones = [480, 420, 0, -60, -120, -330]; // PST, PDT, UTC, CET, CEST, Mumbai
  },
  teardown: function() {
    dt = options = ms = timezone = startTime = null;
  }
});

function timeShouldBeEqualToHash(t, h) {
  if (h === undefined) h = options;
  if (h.timezone === undefined) h.timezone = SC.DateTime.timezone;
  
  equals(t.get('year'), h.year , 'year');
  equals(t.get('month'), h.month, 'month');
  equals(t.get('day'), h.day, 'day');
  equals(t.get('hour'), h.hour, 'hour');
  equals(t.get('minute'), h.minute, 'minute');
  equals(t.get('second'), h.second, 'second');
  equals(t.get('millisecond'), h.millisecond, 'millisecond');
  equals(t.get('timezone'), h.timezone, 'timezone');
}

function formatTimezone(offset) {
  var modifier = offset < 0 ? '+' : '-';
  offset = Math.abs(offset);
  var minutes = offset % 60;
  var hours = (offset - minutes) / 60;
  return modifier + SC.DateTime._pad(hours) + ':' + SC.DateTime._pad(minutes);
}

test('_toMilliseconds()', function() {
  var originalTimezone = options.timezone;
  var originalHour = options.hour;

  dt = SC.DateTime;
  timezone = 300;
  startTime = 1264958583000; // Sun, 31 Jan 2010 17:23:03 GMT (a randomly chosen time with which to re-init the internal date object for more robustness)

  // Check the default behavior
  equals(dt._toMilliseconds(null, ms, timezone), ms, "Should equal start milliseconds when no options hash provided");
  equals(dt._toMilliseconds({}, ms, timezone), ms, "Should equal start milliseconds when empty options hash provided");
  
  // Test a completely defined date/time hash with no specified start milliseconds.
  equals(dt._toMilliseconds(options, null, options.timezone), ms, "Milliseconds should express the parsed options hash");

  // Now specify the same time in timezone (+60), one hour west of the prime meridian.
  // Pass in 'startTime' to force a reset of the internal date object so we can be sure we're not
  // succeeding because of old values.
  options.hour = originalHour - 1;
  equals(dt._toMilliseconds(options, startTime, options.timezone + 60), ms, "Should get same milliseconds when expressing time in westerly time zone");

  // Now specify the same time in timezone (-60), one hour east of the prime meridian
  options.hour = originalHour + 1;
  equals(dt._toMilliseconds(options, startTime, options.timezone - 60), ms, "Should get same milliseconds when expressing time in easterly time zone");

  // Now start at the original 1985 time, but modify only the hour as specified in time zone 60.
  options = { hour: originalHour - 1 };
  equals(dt._toMilliseconds(options, ms, originalTimezone + 60, NO), ms, "Should get same result modifying only the hour as expressed in westerly time zone");

  // Now do the same thing the other way
  options = { hour: originalHour + 1 };
  equals(dt._toMilliseconds(options, ms, originalTimezone - 60, NO), ms, "Should get same result modifying only the hour as expressed in westerly time zone");
});

test('create with a hash', function() {
  timeShouldBeEqualToHash(dt, options);
});

test('create with local time milliseconds', function() {
  var d = new Date(); // create a local date
  var hash = { // create a hash that represents it, expressed in local time
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds(),
    millisecond: d.getMilliseconds(),
    timezone: d.getTimezoneOffset()
  };
  
  dt = SC.DateTime.create(d.getTime()); // init a DateTime using that date's milliseconds
  timeShouldBeEqualToHash(dt, hash);

  // Now try creating with 0 milliseconds
  equals(SC.DateTime.create(0).get('milliseconds'), 0, "Can create with 0 milliseconds");
});

test('create with default time zone', function() {
  var d = new Date();

  // Check that the default creation time zone is local
  timezone = d.getTimezoneOffset(); // get the current location's time zone.
  dt = SC.DateTime.create();
  equals(dt.get('timezone'), timezone, "Default time zone should be local");
});

test('create with a hash containing milliseconds and a specified time zone', function() {
  // Check that creating a predefined date from milliseconds returns the correct values
  dt = SC.DateTime.create({ milliseconds: ms, timezone: options.timezone });
  timeShouldBeEqualToHash(dt, options);
});

test('create with hashes expressed in various time zones', function() {
  timezones.forEach(function(timezone) {
    options.timezone = timezone;
    dt = SC.DateTime.create(options);
    timeShouldBeEqualToHash(dt, options);
  });
});

test('create with default time zone', function() {
  var d = new Date();

  // Check that the default creation time zone is local
  timezone = d.getTimezoneOffset(); // get the current location's time zone.
  dt = SC.DateTime.create();
  equals(dt.get('timezone'), timezone, "Default time zone should be local");
});

test('create with a hash containing milliseconds and a specified time zone', function() {
  // Check that creating a predefined date from milliseconds returns the correct values
  dt = SC.DateTime.create({ milliseconds: ms, timezone: options.timezone });
  timeShouldBeEqualToHash(dt, options);
});

test('Adjust with hashes expressed in various time zones', function() {
  timezones.forEach(function(timezone) {
    var newHour;

    options.timezone = timezone;
    dt = SC.DateTime.create(options);

    // According to Date specs, must specify all three of year, month, and date if we specify one of them,
    // for the calculation to be correct.  Calling adjust to change only one can have
    // unpredictable results, depending on what the other two values already were.
    timeShouldBeEqualToHash(dt.adjust({ year: 2005, month: 9, day: 30 }), {year: 2005, month: 9, day: 30, hour: options.hour, minute: options.minute, second: options.second, millisecond: options.millisecond, timezone: timezone});

    // Setting only the hour should cascade minute, second, and millisecond to 0, etc
    timeShouldBeEqualToHash(dt.adjust({ hour:         3 }), { year: options.year, month: options.month, day: options.day, hour: 3, minute: 0, second: 0, millisecond: 0, timezone: timezone});
    timeShouldBeEqualToHash(dt.adjust({ minute:       1 }), { year: options.year, month: options.month, day: options.day, hour: options.hour, minute: 1, second: 0, millisecond: 0, timezone: timezone});
    timeShouldBeEqualToHash(dt.adjust({ second:      12 }), { year: options.year, month: options.month, day: options.day, hour: options.hour, minute: options.minute, second: 12, millisecond: 0, timezone: timezone});
    timeShouldBeEqualToHash(dt.adjust({ millisecond: 18 }), { year: options.year, month: options.month, day: options.day, hour: options.hour, minute: options.minute, second: options.second, millisecond: 18, timezone: timezone});
    
    // Test taking each to time zone 0.  Manually calculate what the hour should be
    // then test that a call to get() returns that value.
    newHour = Math.floor((options.hour + 48 + (timezone / 60)) % 24); // small hack -- add 48 hours to ensure positive results when adding negative time zone offsets (doesn't affect the calculation since we mod by 24)
    equals(dt.adjust({ timezone: 0 }).get('hour'), newHour);
  });
});

test('advance', function() {
  var o = options;
  
  timeShouldBeEqualToHash(
    dt.advance({ year: 1, month: 1, day: 1, hour: 1, minute: 1, second: 1, millisecond: 1 }),
    { year: o.year + 1, month: o.month + 1, day: o.day + 1, hour: o.hour + 1, minute: o.minute + 1, second: o.second + 1, millisecond: o.millisecond + 1, timezone: o.timezone });
  
  timeShouldBeEqualToHash(dt.advance({year:         1}), { year: o.year + 1, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: o.timezone });
  timeShouldBeEqualToHash(dt.advance({month:        1}), { year: o.year, month: o.month + 1, day: o.day, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: o.timezone });
  timeShouldBeEqualToHash(dt.advance({day:          1}), { year: o.year, month: o.month, day: o.day + 1, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: o.timezone });
  timeShouldBeEqualToHash(dt.advance({hour:         1}), { year: o.year, month: o.month, day: o.day, hour: o.hour + 1, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: o.timezone });
  timeShouldBeEqualToHash(dt.advance({minute:       1}), { year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute + 1, second: o.second, millisecond: o.millisecond, timezone: o.timezone });
  timeShouldBeEqualToHash(dt.advance({second:       1}), { year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second + 1, millisecond: o.millisecond, timezone: o.timezone });
  timeShouldBeEqualToHash(dt.advance({millisecond:  1}), { year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond + 1, timezone: o.timezone });
  
  // Convert time from CEST to UTC, then UTC to UTC+05:30 (Mumbai)
  var h = { year: 1985, month: 5, day: 8, hour: 1, minute: 0, second: 22, millisecond: 925, timezone: -120 };
  var t = SC.DateTime.create(h);
  timeShouldBeEqualToHash(t, h);
  timeShouldBeEqualToHash(t.advance({ timezone: 120 }), { year: 1985, month: 5, day: 7, hour: 23, minute: 0, second: 22, millisecond: 925, timezone: 0 });
  timeShouldBeEqualToHash(t.advance({ timezone: 120 }).advance({ timezone: -330 }), { year: 1985, month: 5, day: 8, hour: 4, minute: 30, second: 22, millisecond: 925, timezone: -330 });
  equals(SC.DateTime.compare(
    t.advance({ timezone: 120 }).advance({ timezone: -330 }),
    t.advance({ timezone: -210 })),
    0);
});

test('compare', function() {
  var exception = null;
  
  equals(SC.DateTime.isComparable, YES, "SC.DateTime is comparable");
  equals(SC.compare(dt, dt), 0, "A DateTime instance is equal to itself via compare()");
  equals(dt.isEqual(dt), YES, "A DateTime instance is equal to itself via isEqual()");
  equals(dt.advance({hour: 1}).isEqual(dt), NO);
  equals(SC.compare(dt, dt.advance({hour: 1})), -1);
  equals(SC.compare(dt.advance({hour: 1}), dt), 1);
  equals(SC.DateTime.compareDate(dt, dt.advance({hour: 1})), 0);
  equals(SC.DateTime.compareDate(dt, dt.adjust({hour: 0}).advance({day: 1, second: -1})), 0);
  equals(SC.DateTime.compareDate(dt, dt.adjust({hour: 0}).advance({day: 1})), -1);
  equals(SC.DateTime.compareDate(dt, dt.advance({day: 1})), -1);
  equals(SC.compare(
    SC.DateTime.create({year: 1985, month: 5, day: 7, hour: 23, minute: 0, second: 22, millisecond: 925, timezone:    0}),
    SC.DateTime.create({year: 1985, month: 5, day: 8, hour:  1, minute: 0, second: 22, millisecond: 925, timezone: -120})),
    0, "The expressions of the same date in two different time zones are considered equal");
  
  try {
    equals(SC.DateTime.compareDate(
      SC.DateTime.create({year: 1985, month: 5, day: 7, hour: 23, minute: 0, second: 22, millisecond: 925, timezone:    0}),
      SC.DateTime.create({year: 1985, month: 5, day: 8, hour:  1, minute: 0, second: 22, millisecond: 925, timezone: -120})),
      0);
  } catch(e) {
    exception = e;
  } finally {
    ok(!SC.none(exception), "Comparing two dates with a different timezone via compareDate() should throw an exception.");
  }
});

test('Format', function() {
  equals(
    dt.toFormattedString('%a %A %b %B %d %H %I %j %m %M %p %S %w %y %Y %%a'),
    'Sat Saturday Jun June 08 04 04 159 06 00 AM 22 6 85 1985 %a');
  
  equals(dt.toFormattedString('%Z'), formatTimezone(dt.get('timezone')));
  equals(dt.adjust({ timezone:    0 }).toFormattedString('%Y-%m-%d %H:%M:%S %Z'), '1985-06-08 05:00:22 +00:00');
  equals(dt.adjust({ timezone: -120 }).toFormattedString('%Y-%m-%d %H:%M:%S %Z'), '1985-06-08 07:00:22 +02:00');
  equals(dt.adjust({ timezone:  420 }).toFormattedString('%Y-%m-%d %H:%M:%S %Z'), '1985-06-07 22:00:22 -07:00'); // the previous day
});

test('fancy getters', function() {
  equals(dt.get('isLeapYear'), NO);

  // (note must set all three components of a date
  // in order to get predictable results, per JS Date object spec)
  equals(SC.DateTime.create({ year: 1900, month: 1, day: 1 }).get('isLeapYear'), NO);
  equals(SC.DateTime.create({ year: 2000, month: 1, day: 1 }).get('isLeapYear'), YES);
  equals(SC.DateTime.create({ year: 2004, month: 1, day: 1 }).get('isLeapYear'), YES);
  
  equals(dt.get('daysInMonth'), 30); // june
  equals(SC.DateTime.create({ year: 2000, month: 2, day: 1 }).get('daysInMonth'), 29);
  equals(SC.DateTime.create({ year: 2001, month: 2, day: 1 }).get('daysInMonth'), 28);
  
  equals(dt.get('dayOfYear'), 159);
  equals(SC.DateTime.create({ year: 2000, month: 12, day: 31 }).get('dayOfYear'), 366);
  equals(SC.DateTime.create({ year: 2001, month: 12, day: 31 }).get('dayOfYear'), 365);

  equals(dt.get('week'), 22);
  equals(SC.DateTime.create({ year: 2006, month:  1, day:  1 }).get('week0'),  1);
  equals(SC.DateTime.create({ year: 2006, month:  1, day:  1 }).get('week1'),  0);
  equals(SC.DateTime.create({ year: 2006, month:  1, day:  8 }).get('week0'),  2);
  equals(SC.DateTime.create({ year: 2006, month:  1, day:  8 }).get('week1'),  1);
  equals(SC.DateTime.create({ year: 2006, month: 12, day: 31 }).get('week0'), 53);
  equals(SC.DateTime.create({ year: 2006, month: 12, day: 31 }).get('week1'), 52);

  equals(dt.get('lastMonday'), dt.advance({ day: -5 }), 'dt.advance(day: -5)');
  equals(dt.get('nextFriday'), dt.advance({ day: 6 }), 'dt.advance(day: 6)');
  equals(dt.get('lastWednesday'), dt.advance({ day: -3 }), 'dt.advance(day: -3)');
});
 
test('parse', function() {
  timeShouldBeEqualToHash(
    SC.DateTime.parse('08/05/1985 01:00:22 %a', '%d/%m/%Y %H:%M:%S %%a'),
    { year: 1985, month: 5, day: 8, hour: 1, minute: 0, second: 22, millisecond: 0 });
  timeShouldBeEqualToHash(
    SC.DateTime.parse('08/05/1985 01:00:22 PM', '%d/%m/%Y %H:%M:%S %p'),
    { year: 1985, month: 5, day: 8, hour: 13, minute: 0, second: 22, millisecond: 0 }); 
  timeShouldBeEqualToHash(
    SC.DateTime.parse('Wed 08 May 1985 01:00:22 AM', '%a %d %b %Y %H:%M:%S %p'),
    { year: 1985, month: 5, day: 8, hour: 1, minute: 0, second: 22, millisecond: 0 });
  ok(
    SC.DateTime.parse('Tue 08 May 1985 01:00:22 AM', '%a %d %b %Y %H:%M:%S %p')
    === null, '1985-05-08 is not a tuesday');
  timeShouldBeEqualToHash(
    SC.DateTime.parse('70-01-01 00:00:00', '%y-%m-%d %H:%M:%S'),
    { year: 2070, month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }); 
  timeShouldBeEqualToHash(
    SC.DateTime.parse('71-01-01 00:00:00', '%y-%m-%d %H:%M:%S'),
    { year: 1971, month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 });
});

test('parse with time zones',function() {
  equals(
    SC.DateTime.parse('08/05/1985 01:00:22 %a -0700', '%d/%m/%Y %H:%M:%S %%a %Z').toISO8601(),
    "1985-05-08T01:00:22-07:00");
  equals(
    SC.DateTime.parse('08/05/1985 01:00:22 %a +02:00', '%d/%m/%Y %H:%M:%S %%a %Z').toISO8601(),
    "1985-05-08T01:00:22+02:00");
  equals(
    SC.DateTime.parse('07/01/2020 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z').toISO8601(),
    "2020-01-07T18:33:22+00:00");
});

test('binding', function() {
  var fromObject = SC.Object.create({value: dt});
  var toObject = SC.Object.create({value: ''});
  var format = '%Y-%m-%d %H:%M:%S';
  var binding = SC.Binding.dateTime(format).from('value', fromObject).to('value', toObject).connect();
  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), dt.toFormattedString(format));
});

test('cache', function() {
  
  SC.DateTime.create(options);
  var cache_length_1 = SC.keys(SC.DateTime._dt_cache).length;
  SC.DateTime.create(options);
  var cache_length_2 = SC.keys(SC.DateTime._dt_cache).length;
  equals(
    cache_length_1, cache_length_2,
    "Creating twice the same datetime should not modify the cache's length");
  
  var dates = [];
  for (var i = 0; i < 3*SC.DateTime._DT_CACHE_MAX_LENGTH; i++) {
    dates[i] = SC.DateTime.create(i);
  }
  ok(
    SC.keys(SC.DateTime._dt_cache).length <= 2*SC.DateTime._DT_CACHE_MAX_LENGTH,
    "Creating a lot of datetimes should not make a cache larger than the maximum allowed size");

});

test('timezones', function() {
  var o = options;
  
  options.timezone = 0;
  timeShouldBeEqualToHash(SC.DateTime.create(options), options);
  
  options.timezone = -120;
  timeShouldBeEqualToHash(SC.DateTime.create(options), options);

  options.timezone = 330;
  timeShouldBeEqualToHash(SC.DateTime.create(options), options);
  
  options.timezone = 0; // note that test dates will now be created at timezone 0
  dt = SC.DateTime.create(options);

  timeShouldBeEqualToHash(dt,                  {year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: o.timezone });
  timeShouldBeEqualToHash(dt.toTimezone(480),  {year: o.year, month: o.month, day: o.day - 1, hour: 20, minute:  o.minute, second: o.second, millisecond: o.millisecond, timezone: 480 });
  timeShouldBeEqualToHash(dt.toTimezone(420),  {year: o.year, month: o.month, day: o.day - 1, hour: 21, minute:  o.minute, second: o.second, millisecond: o.millisecond, timezone: 420 });
  timeShouldBeEqualToHash(dt.toTimezone(),     {year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: 0 });
  timeShouldBeEqualToHash(dt.toTimezone(-60),  {year: o.year, month: o.month, day: o.day, hour: 5, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: -60 });
  timeShouldBeEqualToHash(dt.toTimezone(-120), {year: o.year, month: o.month, day: o.day, hour: 6, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: -120 });
  timeShouldBeEqualToHash(dt.toTimezone(-330), {year: o.year, month: o.month, day: o.day, hour: 9, minute: 30, second: o.second, millisecond: o.millisecond, timezone: -330 });
});
