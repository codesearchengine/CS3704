// QUnit.test( "hello test", function( assert ) {
//   assert.ok( 1 == "1", "Passed!" );
// });

test("findMax test", function(){
  // var visualObj= createVisual();
  // alert('testing!');
  var arr = [[2, 4], [3, 6], [5,1]];
  var max = findMax(arr, arr.length);
  // alert(max);
  ok(6 == max);

  arr = [[3, 7], [10, 6], [5,21]];
  var max = findMax(arr, arr.length);
  // alert(max);
  ok(21 == max);
});

test("piCharts test", function(){

  var r = [[2,3], [3,6], [4,5]];
  ok(true == piCharts(r));
  var s = [[5,8], [3,62], [4,15]];
ok(true == piCharts(s));
});

test("barCharts test", function(){

  var r = [[2,3], [3,6], [4,5]];
  ok(true == barCharts(r));

    var s = [[5,8], [3,62], [4,15]];
  ok(true == barCharts(s));

});

test("clearCanvas test", function(){

  ok(true == clearCanvas());


});
