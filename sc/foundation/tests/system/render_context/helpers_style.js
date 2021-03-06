// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same same */

var context = null;

// ..........................................................
// styles
// 
module("SC.RenderContext#styles", {
  setup: function() {
    context = SC.RenderContext() ;
  }
});

test("returns empty hash if no current styles", function() {
  same(context.styles(), {}, 'styles') ;
});

test("styles(hash) replaces styles", function() {
  var styles = { foo: 'bar' };
  equals(context.styles(styles), context, "returns receiver");
  same(context.styles(), styles, 'Styles');
});

test("returns styles if set", function() {
  var styles = { foo: 'bar' };
  context.styles(styles);
  equals(context.styles(), styles, 'styles');
});

test("clone on next retrieval if styles(foo) set with cloneOnModify=YES", function() {
  var styles = { foo: 'bar' };
  context.styles(styles, YES);
  
  var result = context.styles();
  ok(result !== styles, "styles is NOT same instance");
  same(result, styles, "but styles are equivalent");
  
  equals(result, context.styles(), "2nd retrieval is same instance");
});

test("extracts styles from element on first retrieval", function() {
  var elem = document.createElement('div');
  SC.$(elem).attr('style', 'color: black; height: 20px; border-top: 1px solid hotpink; -webkit-column-count: 3');
  context = SC.RenderContext(elem);
  
  var result = context.styles();
  
  
  same(result, { color: 'black', height: '20px', borderTop: '1px solid hotpink', webkitColumnCount: '3' }, 'extracted style. This is failing in IE8 because it return styles like cOLOR.');
  
  equals(context.styles(), result, "should reuse same instance thereafter");
});

// ..........................................................
// addStyle
// 
module("SC.RenderContext#addStyle", {
  setup: function() {
    context = SC.RenderContext().styles({ foo: 'foo' }) ;
  }
});

test("should add passed style name to value", function() {
  context.addStyle('bar', 'bar');
  equals('bar', context.styles().bar, 'verify style name');
});

test("should replace passed style name  value", function() {
  context.addStyle('foo', 'bar');
  equals('bar', context.styles().foo, 'verify style name');
});

test("should return receiver", function() {
  equals(context, context.addStyle('foo', 'bar'));
});

test("should create styles hash if needed", function() {
  context = SC.RenderContext();
  equals(context._styles, null, 'precondition - has no styles');
  
  context.addStyle('foo', 'bar');
  equals('bar', context.styles().foo, 'has styles');
});

test("should assign all styles if a hash is passed", function() {
  context.addStyle({ foo: 'bar', bar: 'bar' });
  same(context.styles(), { foo: 'bar', bar: 'bar' }, 'has same styles');
});

test("css() should be an alias for addStyle()", function() {
  equals(SC.RenderContext.fn.css, SC.RenderContext.fn.addStyle, 'methods');
});

