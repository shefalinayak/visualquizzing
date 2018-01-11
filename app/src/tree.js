import * as d3 from 'd3';
var clone = require('clone');

class Tree {
  constructor(divID, data, toInsert, maxSelection) {
    this.divId = divID;

    var margin = { top: 30, right: 5, bottom: 20, left: 5 };

    this.height = 500 - margin.top - margin.bottom;
    this.width = 600 - margin.left - margin.right;

    this.i = 0;
    this.duration = 100;

    this.treemap = d3.tree().size([this.width, this.height]);

    var root = d3.hierarchy(data, function(d) {
      return d.children;
    });
    root.x0 = this.width / 2;
    root.y0 = 0;

    this.toRotate = [-1];
    this.onRotate = false;

    this.state = [{
      root: root,
      toInsert: toInsert,
      selected: [-1],
      red: [-1]
    }];

    this.svg = d3
      .select(`#${this.divId}`)
      .append("svg")
      .attr("width", this.width + margin.left + margin.right)
      .attr("height", this.height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    this.maxSelection = maxSelection + 1;

    this.diagonal = this.diagonal.bind(this);
    this.select = this.select.bind(this);
    this.deselect = this.deselect.bind(this);
    this.color = this.color.bind(this);
    this.uncolor = this.uncolor.bind(this);
    this.insert = this.insert.bind(this);
    this.remove = this.remove.bind(this);
    this.toggleSelect = this.toggleSelect.bind(this);
    this.onclick = this.onclick.bind(this);
    this.getNodeClass = this.getNodeClass.bind(this);
    this.styleNodes = this.styleNodes.bind(this);
    this.styleLinks = this.styleLinks.bind(this);
    this.getLinkClass = this.getLinkClass.bind(this);
    this.getLevelOrder = this.getLevelOrder.bind(this);
    this.getSelected = this.getSelected.bind(this);
    this.undo = this.undo.bind(this);

    this.update(this.state[0].root);
  }

  getSelected() {
    var s = "";
    for (var i = 1; i < this.selected.length; i++) {
      var d = this.selected[i];
      s += d.data.name;
      if (i != this.selected.length - 1) s += " ";
    }
    return s;
  }

  getLevelOrder() {
    var levelOrder = this.root.data.name;
    var nodes = [this.root];
    while (nodes.length > 0) {
      // Get next node
      var node = nodes.shift();
      // Base case for leaves
      if (!node.children) return;
      // Add children to string and queue
      var left = node.children[0];
      var right = node.children[1];
      if (left.data.name) {
        levelOrder += " " + left.data.name;
        nodes.push(left);
      }
      if (right.data.name) {
        levelOrder += " " + right.data.name;
        nodes.push(right);
      }
    }
    return levelOrder;
  }

  // updates current state
  update(src) {
    var treeObj = this;
    // get reference to current state
    var currentState = this.state.pop();
    this.state.push(currentState);
    // Assign x and y position for the nodes
    var treeData = this.treemap(currentState.root);
    // Compute the new tree layout
    var nodes = treeData.descendants();
    var links = treeData.descendants().slice(1);
    // Normalize for fixed depth
    // Account for extra reds
    nodes.forEach(function(d) {
      d.depth = d.parent ? d.parent.depth + 1 : 0;
      d.y = d.children ? d.depth * 80 : d.parent.y + 40;
    });

    // ********** NODES ********** //
    var node = this.svg.selectAll("g.node").data(nodes, function(d) {
      return d.id || (d.id = ++treeObj.i);
    });
    // Enter new nodes at the parent's previous position
    var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
        return `translate(${src.x0},${src.y0})`;
    })
    .on("click", treeObj.onclick);
    // Add circle for new nodes
    nodeEnter
      .append("circle")
      .attr("class", "node")
      .attr("r", 1e-6)
      .style("fill", "#fff");
    // Add labels for the nodes
    nodeEnter
      .append("text")
      .attr("dy", ".35em")
      .attr("y", "0")
      .attr("text-anchor", "middle")
      .attr("cursor", "pointer")
      .text(function(d) {
      return d.data.name;
    });

    // Update
    var nodeUpdate = nodeEnter.merge(node);
    // Transition to the proper position
    nodeUpdate
      .transition()
      .duration(treeObj.duration)
      .attr("transform", function(d) {
      return `translate(${d.x},${d.y})`;
    });
    // Update the style
    nodeUpdate
      .select("circle.node")
      .attr("cursor", "pointer")
      .attr("class", treeObj.getNodeClass)
      .transition()
      .duration(treeObj.duration)
      .attr("r", function(d) {
      return d.data.children ? 15 : 5;
    });
    nodeUpdate
      .select("text")
      .text(function(d) {
      return d.data.name;
    });

    treeObj.styleNodes(d3.select(`#${this.divId}`));

    // Exit
    var nodeExit = node.exit().remove();
    // Reduce circle size and label text
    nodeExit.select("circle").attr("r", 1e-6);
    nodeExit.select("text").style("fill-opacity", 1e-6);

    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // ********** LINKS ********** //
    var link = this.svg.selectAll("path.link").data(links, function(d) {
      return d.id || (d.id = ++treeObj.i);
    });
    // Enter new links at parent's previous location
    var linkEnter = link
    .enter()
    .insert("path", "g")
    .attr("class", treeObj.getLinkClass)
    .attr("d", function(d) {
      var o = { x: d.parent.x0, y: d.parent.y0 };
      return treeObj.diagonal(o, o);
    })
    .style("fill", "none")
    .style("stroke-width", "2px");

    // Update
    var linkUpdate = linkEnter.merge(link);
    // Transition back to parent position
    linkUpdate
      .transition()
      .duration(treeObj.duration)
      .attr("d", function(d) {
      return treeObj.diagonal(d, d.parent);
    });
    // Update class
    linkUpdate.attr("class", treeObj.getLinkClass);

    treeObj.styleLinks(d3.select(`#${this.divId}`));

    // Exit
    var linkExit = link
    .exit()
    .transition()
    .duration(treeObj.duration)
    .attr("d", function(d) {
      var p = d.parent ? d.parent : treeObj.root;
      var o = { x: p.x, y: p.y };
      return treeObj.diagonal(o, o);
    })
    .remove();

    if (currentState.toInsert) {
      var nextInsert = currentState.toInsert[0];
      d3.select('span').html(nextInsert);
    }
  }

  styleNodes(container) {
    container
      .selectAll(".node .unselected")
      .style("stroke", "black")
      .style("stroke-width", "3px");
    container
      .selectAll(".node .leaf")
      .style("stroke", "gray");
    container
      .selectAll(".node .selected")
      .style("stroke", "turquoise")
      .style("stroke-width", "5px");
  }

  styleLinks(container) {
    container.selectAll(".link").style("stroke", "black");
    container
      .selectAll(".link")
      .filter(".leaf")
      .style("stroke", "gray");
  }

  getNodeClass(d) {
    var currentState = this.state.pop();
    this.state.push(currentState);

    var classes = "node ";
    var ind = currentState.selected.indexOf(d);
    if (ind >= 0) {
      classes += "selected ";
    } else {
      classes += "unselected ";
    }
    if (!d.data.name) {
      classes += "leaf ";
    }
    return classes;
  }

  getLinkClass(d) {
    var classes = "link ";
    if (!d.data.name) {
      classes += "leaf ";
    }
    return classes;
  }

  onclick(d) {
    var currentState = this.state.pop();
    this.state.push(currentState);

    if (currentState.toInsert) this.insert(d);
    else this.toggleSelect(d);
  }

  toggleSelect(d) {
    var currentState = this.state.pop();
    this.state.push(currentState);

    if (!d.data.name) return;
    console.log(d.data.name);
    var ind = currentState.selected.indexOf(d);
    if (ind < 0) this.select(d);
    else this.deselect(d);
    this.update(d);
  }

  // changes state
  insert(d) {
    // peek at top of state stack for current state
    var newState = this.state.pop();
    // duplicate to remember old state
    var oldState = clone(newState);
    this.state.push(oldState);
    this.state.push(newState);

    // only insert if there are items to insert
    if (newState.toInsert.length == 0) return;
    // only insert in empty nodes
    if (d.data.name) {
      console.log("Error: cannot insert in non-empty node");
      return;
    }

    // set value
    d.data.name = newState.toInsert.shift();

    // create children
    var leftNode = {
      type: 'node-type',
      name: "",
    };
    var rightNode = {
      type: 'node-type',
      name: "",
    };

    var childL = d3.hierarchy(leftNode, function(d) {
      return d.children;
    });
    childL.depth = d.depth + 1;
    childL.parent = d;
    var childR = d3.hierarchy(rightNode, function(d) {
      return d.children;
    });
    childR.depth = d.depth + 1;
    childR.parent = d;

    d.children = [];
    d.data.children = [];
    d.children.push(childL);
    d.data.children.push(childL);
    d.children.push(childR);
    d.data.children.push(childR);

    // set as red and deselect
    newState.red.push(d);
    var ind = newState.selected.indexOf(d);
    if (ind >= 0) newState.selected.splice(ind, 1);

    this.update(d);
  }

  // changes state
  remove(d) {
    // peek at top of state stack for current state
    var newState = this.state.pop();
    // duplicate to remember old state
    var oldState = clone(newState);
    this.state.push(oldState);
    this.state.push(newState);

    if (d.children[0].name || d.children[1].name) {
      console.log("Error: cannot remove node with children");
      return;
    }

    var p = d.parent;
    if (p.children[0] == d) {
      p.children[0] = {};
    } else {
      p.children[1] = {};
    }
  }

  // changes state
  select(d) {
    // peek at top of state stack for current state
    var newState = this.state.pop();
    // duplicate to remember old state
    var oldState = clone(newState);
    this.state.push(oldState);
    this.state.push(newState);

    if (!d.data.name) return;
    var ind = newState.selected.indexOf(d);
    if (ind < 0) {
      if (newState.selected.length == this.maxSelection) {
        newState.selected.pop();
      }
      newState.selected.push(d);
    }
  }

  // changes state
  deselect(d) {
    // peek at top of state stack for current state
    var newState = this.state.pop();
    // duplicate to remember old state
    var oldState = clone(newState);
    this.state.push(oldState);
    this.state.push(newState);

    if (!d.data.name) return;
    var ind = newState.selected.indexOf(d);
    if (ind >= 0) newState.selected.splice(ind, 1);
  }

  // changes state
  color(d) {
    // peek at top of state stack for current state
    var newState = this.state.pop();
    // duplicate to remember old state
    var oldState = clone(newState);
    this.state.push(oldState);
    this.state.push(newState);

    if (!d.data.name) return;
    var ind = newState.red.indexOf(d);
    if (ind < 0) newState.red.push(d);
  }

  // changes state
  uncolor(d) {
    // peek at top of state stack for current state
    var newState = this.state.pop();
    // duplicate to remember old state
    var oldState = clone(newState);
    this.state.push(oldState);
    this.state.push(newState);

    if (!d.data.name) return;
    var ind = newState.red.indexOf(d);
    if (ind >= 0) newState.red.splice(ind, 1);
  }

  // reverts to previous state
  undo() {
    if (this.state.length < 2) {
      return;
    }
    var currentState = this.state.pop();
    var oldState = this.state.pop();
    this.state.push(oldState);
    this.update(oldState.root);
  }

  diagonal(s, d) {
    return `M ${s.x} ${s.y}
    C ${s.x} ${(s.y + d.y) / 2},
    ${d.x} ${(s.y + d.y) / 2},
    ${d.x} ${d.y}`;
  }
}

class RBTree extends Tree {
  constructor(divID, data, toInsert, maxSelection) {
    super(divID, data, toInsert, maxSelection);
    this.onclick = this.onclick.bind(this);
    this.getLinkClass = this.getLinkClass.bind(this);
    this.getNodeClass = this.getNodeClass.bind(this);
    this.styleNodes = this.styleNodes.bind(this);
    this.styleLinks = this.styleLinks.bind(this);
    this.rotateLeft = this.rotateLeft.bind(this);
    this.rotateRight = this.rotateRight.bind(this);
    this.rotate = this.rotate.bind(this);
    this.colorFlip = this.colorFlip.bind(this);

    // Account for extra reds
    var currentState = this.state[0];
    var treeData = this.treemap(currentState.root);
    var nodes = treeData.descendants();
    nodes.forEach(function(d) {
      if (d.data.name == '11' || d.data.name == '18') {
        currentState.red.push(d);
      }
    });
    this.update(currentState.root);
  }

  onclick(d) {
    var currentState = this.state.pop();
    this.state.push(currentState);

    if (!d.data.name && currentState.toInsert) {
      this.insert(d);
      this.toggleSelect(d);
    }
    else if (this.onRotate) this.rotateClick(d);
    else this.toggleSelect(d);
  }

  rotateRight() {
    this.rotate(false);
  }

  rotateLeft() {
    this.rotate(true);
  }

  getLinkClass(d) {
    var currentState = this.state.pop();
    this.state.push(currentState);

    var classes = "link ";
    var ind = currentState.selected.indexOf(d);
    if (ind >= 0) {
      classes += "selected ";
    } else {
      classes += "unselected ";
    }
    ind = currentState.red.indexOf(d);
    if (ind >= 0) {
      classes += "red ";
    } else {
      classes += "black ";
    }
    if (!d.data.name) {
      classes += "leaf ";
    }
    return classes;
  }

  getNodeClass(d) {
    var currentState = this.state.pop();
    this.state.push(currentState);

    var classes = "node ";
    var ind = currentState.selected.indexOf(d);
    if (ind >= 0) {
      classes += "selected ";
    } else {
      classes += "unselected ";
    }
    ind = currentState.red.indexOf(d);
    if (ind >= 0) {
      classes += "red ";
    } else {
      classes += "black "
    }
    if (!d.data.name) {
      classes += "leaf ";
    }
    return classes;
  }

  styleNodes(container) {
    container.selectAll(".node").style("stroke-width", "3px");
    container.selectAll(".node .selected").style("fill", "paleturquoise");
    container.selectAll(".node .unselected").style("fill", "#fff");
    container.selectAll(".node .black").style("stroke", "black");
    container.selectAll(".node .leaf").style("stroke", "gray");
    container.selectAll(".node .red").style("stroke", "red");
  }

  styleLinks(container) {
    container
      .selectAll(".link")
      .filter(".black")
      .style("stroke", "black");
    container
      .selectAll(".link")
      .filter(".red")
      .style("stroke", "red");
  }

  colorFlip() {
    // peek at top of state stack for current state
    var newState = this.state.pop();
    // duplicate to remember old state
    var oldState = clone(newState);
    this.state.push(oldState);
    this.state.push(newState);

    if (newState.selected.length < 2) {
      console.log("Must select node to color flip");
      return;
    }

    var d = newState.selected.pop();
    if (!d.data.name) {
      this.state.pop();
      console.log("Cannot color flip null node");
      return;
    }

    var cl = d.children[0];
    var cr = d.children[1];

    var cl_ind = newState.red.indexOf(cl);
    if (cl_ind < 0 && cl.data.name) newState.red.push(cl);
    else newState.red.splice(cl_ind, 1);

    var cr_ind = newState.red.indexOf(cr);
    if (cr_ind < 0 && cr.data.name) newState.red.push(cr);
    else newState.red.splice(cr_ind, 1);

    var d_ind = newState.red.indexOf(d);
    if (d_ind < 0) newState.red.push(d);
    else newState.red.splice(d_ind, 1);

    newState.selected = [-1];
    this.update(d);
  }

  rotate(isLeft) {
    // peek at top of state stack for current state
    var newState = this.state.pop();
    // duplicate to remember old state
    var oldState = clone(newState);
    this.state.push(oldState);
    this.state.push(newState);

    if (newState.selected.length < 2) {
      console.log("Error: Must Select Node to Rotate");
    }

    // node to rotate
    var nodeToRotate = newState.selected.pop();

    var child;
    if (isLeft) child = nodeToRotate.children[1];
    else child = nodeToRotate.children[0];

    if (!child.data.name) {
      console.log("Error: Cannot Rotate in this Direction");
    }

    var parent = child.parent;
    var grandparent = parent.parent;

    if (isLeft) {
      var grandchild = child.children[0];
      parent.children[1] = grandchild;
      grandchild.parent = parent;
      child.children[0] = parent;
      parent.parent = child;
    } else {
      var grandchild = child.children[1];
      parent.children[0] = grandchild;
      grandchild.parent = parent;
      child.children[1] = parent;
      parent.parent = child;
    }

    if (grandparent != null) {
      if (grandparent.children[0] === parent) {
        grandparent.children[0] = child;
        child.parent = grandparent;
      } else {
        grandparent.children[1] = child;
        child.parent = grandparent;
      }
    } else {
      this.root = child;
      child.parent = null;
    }

    // child color = parent color
    var XisRed = newState.red.indexOf(child) != -1;
    var DisRed = newState.red.indexOf(parent) != -1;
    if (XisRed != DisRed) {
      if (DisRed) newState.red.push(child);
      else {
        var ind = newState.red.indexOf(child);
        newState.red.splice(ind, 1);
      }
    }
    // parent color = red
    if (!DisRed) {
      newState.red.push(parent);
    }

    newState.selected = [-1];
    this.update(newState.root);
  }
}

export { Tree, RBTree };
