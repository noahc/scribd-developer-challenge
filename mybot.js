//game_state Schema
// Each fruit can be refrenced by fruit[fruit_num], because of a blank [] in front.
// Each Fruit Row Contains [total, mine, his, won]
//won can be either 0 for still winnable, -1 for category lost, or 1 for category won.

function make_move() 
{
  game_state = build_game_state();
  heat_map = make_heat_map();
  populate_heat_map();
  x = get_my_x(),
  y = get_my_y();

  current = heat_map[x][y];
  north = get_my_y() > 0 ? heat_map[x][y-1] : -1;
  south = get_my_y() < (HEIGHT-1) ? heat_map[x][y+1] : -1;
  west = get_my_x() > 0 ? heat_map[x-1][y] : -1;
  east = get_my_x() < (WIDTH-1) ? heat_map[x+1][y] : -1;

  max = Math.max(north, south, west, east, current);

  if(current == max && board[x][y] > 0) return TAKE;
  max = Math.max(north, south, west, east)
  if (north == max) return NORTH;
  if (south == max) return SOUTH;
  if (east == max) return EAST;
  if (west == max) return WEST;
  return PASS;
}

function build_game_state()
{
  state = [[0]] 
  fruit_count = get_number_of_item_types();
  for (var i = 1; i <= fruit_count; i++)
  {
    total = get_total_item_count(i);
    mine = get_my_item_count(i);
    his = get_opponent_item_count(i);
    won = determine_win_status(i,total,mine,his)
    if(won == 0){
      state[0][0] += total - mine - his;
    }
    fruits_array = [total, mine, his, won];
    state.push(fruits_array);
  }
  return state
}

function determine_win_status(fruit)
{
  if(mine > total / 2 ){return 1}
  if(his > total / 2 ){return -1}
  return 0
}

function make_heat_map()
{
  heat_map = [];
  for (var x = 0; x < WIDTH; x++) {
    heat_map.push([])
    for (var y = 0; y < HEIGHT; y++) {
      heat_map[x][y] = 0;
    }
  }
  return heat_map
}

function populate_heat_map()
{
  board = get_board();

  for (var x = 0; x < WIDTH; x++) {
    for (var y = 0; y < HEIGHT; y++) {
       if (board[x][y] > 0 && game_state[board[x][y]][3] == 0) {
         add_heat([x, y]);
       }
    }
  }
}

function add_heat(field) {
  //p1 increase to make less common fruits more valuable
  //p2 incease to make clincher fruits more valuable
  //p3 fruit distance
  //p4 picking up fruit based on distance
  //p5 fruit clumpyness.
  var p1 = 1.5, p2 = 1.5, p3 = 0.5, p4 = 1.75, p5 = 0.06;
  var board = get_board();
  var fruit = board[field[0]][field[1]];
  var mult = Math.pow(game_state[fruit][0], -p1);
  remaining_fruit = game_state[fruit][0] - game_state[fruit][1] - game_state[fruit][2]
  var clinch = Math.pow(game_state[fruit][0] / remaining_fruit, p2);
  var clump = Math.pow(fruit_clumpyness(fruit,field), -p5)

  var para = mult * clinch * clump;
 
  for (var x = 0; x < WIDTH; x++) {
    for (var y = 0; y < HEIGHT; y++) {
      var dist = distance(field, [x, y]);
      if (dist == 0)
        heat_map[x][y] += p4 * para;
      else
        heat_map[x][y] += Math.pow(distance(field, [x, y]), -p3) * para;
    }
  }
}
 

function distance(a, b) {
  //returns distance in turns
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function fruit_clumpyness(fruit, field){
  var board = get_board()
  fruit_positions = []
  for (var x = 0; x < WIDTH; x++) {
    for (var y = 0; y < HEIGHT; y++) {
      if(board[x][y] == fruit) fruit_positions.push([x,y])
    }
  }
    var x = field[0]
    var y = field[1]
   for(var i = 0; i < fruit_positions.length; i++) {
    if(fruit_positions[i][0] == x && fruit_positions[i][1] == y){
      fruit_holder = fruit_positions.splice(i,1)
      fruit_holder.concat(fruit_positions)


    }
   }

  if(fruit_positions.length >= 1){
  fruit_positions.sort(
    function(a,b){
      a_dist = distance(a, field)
      b_dist = distance(b, field)
      if(a_dist < b_dist) return -1
      if(a_dist == b_dist) return 0
      if(a_dist > b_dist) return 1
    }
    )
  needed_to_win = game_state[fruit][0] / 2
  mine = game_state[fruit][1] + 1
  total_distance = 1
  for(var p=1; p<fruit_positions.length; p++){
    if(mine >= needed_to_win) {
      break;
    }
    else{
      total_distance += distance(fruit_positions[p-1],fruit_positions[p]) + 1
      mine += 1
    }
  }
  return total_distance  
  }
  else{
    return 1
  }
}
