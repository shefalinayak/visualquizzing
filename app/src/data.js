// BST Insertion
export const data10tree = "32 30 56 17 42 67 54 61 89 66";
export const data10ins = "23 95 60";
export const data11tree = "38 20 75 10 26 46 98 23 44 66";
export const data11ins = "16 17 57";

// BST Search
export const data20tree = "27 24 70 23 36 85 18 53 78 74";
export const data20key = "40"; // 27 70 36 53
export const data21tree = "96 49 19 59 27 75 21 70 79 89";
export const data21key = "95"; // 60 59 39 19

// Red-Black BST Coloring
export const data30 = "54 48 82 40 52 68 99 35 43 49 63 72 32"; // 32 40 49 68
export const data31 = "68 59 82 24 66 77 93 21 57 61 71 78 92"; // 24 61 77 92

// Red-Black BST Insertion
export const data40tree = "66 56 92 18 59 81 93 17 51 11";
export const data40red = "11 18";
export const data40ins = "38 60 44"; // 66 44 92 18 56 81 93 17 38 51 60 11 59
// 66 56 92 18 59 81 93 17 51 11              [ red links = 11 18 ]
// 38: 66 56 92 18 59 81 93 17 51 11 38       [ red links = 11 18 38 ]
// 60: 66 56 92 18 60 81 93 17 51 59 11 38    [ red links = 11 18 38 59 ]
// 44: 66 44 92 18 56 81 93 17 38 51 60 11 59 [ red links = 11 44 59 ]

export const data41tree = "38 20 75 10 26 46 98 23 44 66";
export const data41red = "84 69 87";
export const data41ins = "23 46"; // 75 38 87 20 46 84 98 10 26 44 69 23 66
// 38 20 75 10 26 46 98 23 44 66              [ red links = 23 46 ]
// 84: 38 20 75 10 26 46 98 23 44 66 84       [ red links = 23 46 84 ]
// 69: 38 20 75 10 26 46 98 23 44 69 84 66    [ red links = 23 46 66 84 ]
// 87: 75 38 87 20 46 84 98 10 26 44 69 23 66 [ red links = 23 38 66 ]


export function getHierarchy(data) {
  var parsed = data.split(" ");
  var root = {};
  for (var i = 0; i < data.length; i++) {
    var curVal = parsed[i];
    root = insert(root, curVal);
  }

  return root;
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
    return false;
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

function insert(x, k) {
  // Base case: insert key at null node
  if (x.name === undefined) {
    var newNode = {
      name: k.toString(),
      children: [{},{}]
    };
    return newNode;
  }

  var xVal = parseInt(x.name);
  if (k < xVal) x.children[0] = insert(x.children[0], k);
  else if (k > xVal) x.children[1] = insert(x.children[1], k);

  return x;
}
