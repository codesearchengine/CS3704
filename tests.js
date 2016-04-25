// QUnit.test( "hello test", function( assert ) {
//   assert.ok( 1 == "1", "Passed!" );
// });

test("test Max", function(){
  // var visualObj= createVisual();
  // alert('testing!');
  var arr = [[2, 4], [3, 6], [5,1]];
  var max = findMax(arr, arr.length);
  // alert(max);
  ok(6 == max);

});

test("visalAdded", function(){

  if ( $( "#svg" ).length ) {

    $( "#myDiv" ).show();

}
  ok(6 == max);

});
