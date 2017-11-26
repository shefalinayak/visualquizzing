import * as d3 from 'd3';

class Tree {
  constructor(divID, data, toInsert) {
    this.divId = divID;

    var margin = { top: 30, right: 5, bottom: 20, left: 5 };

    this.height = 500 - margin.top - margin.bottom;
    this.width = 600 - margin.left - margin.right;

    this.i = 0;
    this.duration = 100;

    this.selected = [-1];
    this.toInsert = toInsert;
    this.toRotate = [-1];
    this.onRotate = false;
    this.treemap = d3.tree().size([this.width, this.height]);
    this.root = d3.hierarchy(data, function(d) {
      return d.children;
    });
    this.root.x0 = this.width / 2;
    this.root.y0 = 0;

    this.svg = d3
      .select(`#${this.divId}`)
      .append("svg")
      .attr("width", this.width + margin.left + margin.right)
      .attr("height", this.height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    this.diagonal = this.diagonal.bind(this);
    this.insertClick = this.insertClick.bind(this);
    this.selectClick = this.selectClick.bind(this);
    this.onclick = this.onclick.bind(this);
    this.getNodeClass = this.getNodeClass.bind(this);
    this.styleNodes = this.styleNodes.bind(this);
    this.styleLinks = this.styleLinks.bind(this);
    this.getLinkClass = this.getLinkClass.bind(this);
    this.getLevelOrder = this.getLevelOrder.bind(this);
    this.getSelected = this.getSelected.bind(this);
    this.insert = this.insert.bind(this);

    this.update(this.root);
  }

  insert(d) {
    if (this.toInsert.length == 0) return;
    d.data.name = this.toInsert.shift();

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

    this.update(d);
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

  update(src) {
    var treeObj = this;
    // Assign x and y position for the nodes
    var treeData = this.treemap(this.root);
    // Compute the new tree layout
    var nodes = treeData.descendants();
    var links = treeData.descendants().slice(1);
    // Normalize for fixed depth
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
  }

  styleNodes(container) {
    container
      .selectAll(".node")
      .style("fill", "white");
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

  getNodeClass(d) {
    var classes = "node ";
    var ind = this.selected.indexOf(d);
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

  styleLinks(container) {
    container.selectAll(".link").style("stroke", "black");
    container
      .selectAll(".link")
      .filter(".leaf")
      .style("stroke", "gray");
  }

  getLinkClass(d) {
    var classes = "link ";
    if (!d.data.name) {
      classes += "leaf ";
    }
    return classes;
  }

  onclick(d) {
    if (this.toInsert) this.insertClick(d);
    else this.selectClick(d);
  }

  insertClick(d) {
    if (!d.data.name) {
      this.insert(d);
    } else {
      console.log(d.data.name);
    }
  }

  selectClick(d) {
    if (!d.data.name) return;
    console.log(d.data.name);
    var ind = this.selected.indexOf(d);
    if (ind < 0) this.selected.push(d);
    else this.selected.splice(ind, 1);
    this.update(d);
  }

  diagonal(s, d) {
    return `M ${s.x} ${s.y}
    C ${s.x} ${(s.y + d.y) / 2},
    ${d.x} ${(s.y + d.y) / 2},
    ${d.x} ${d.y}`;
  }
}

class RBTree extends Tree {
  constructor(divID, data, toInsert) {
    super(divID, data, toInsert);
    this.rotateClick = this.rotateClick.bind(this);
    this.onclick = this.onclick.bind(this);
    this.getLinkClass = this.getLinkClass.bind(this);
    this.getNodeClass = this.getNodeClass.bind(this);
    this.styleNodes = this.styleNodes.bind(this);
    this.styleLinks = this.styleLinks.bind(this);
    this.rotate = this.rotate.bind(this);
  }

  onclick(d) {
    if (!d.data.name && this.toInsert) this.insert(d);
    else if (this.onRotate) this.rotateClick(d);
    else this.selectClick(d);
  }

  rotateClick(d) {
    if (!d.data.name) return;
    console.log(d.data.name);
    var ind = this.toRotate.indexOf(d);
    if (ind < 0) {
      if (this.toRotate.length > 2) return;
      this.toRotate.push(d);
    }
    else this.toRotate.splice(ind, 1);
    this.update(d);
  }

  getLinkClass(d) {
    var classes = "link ";
    var ind = this.selected.indexOf(d);
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

  getNodeClass(d) {
    var classes = "node ";
    var ind = this.selected.indexOf(d);
    if (ind >= 0) {
      classes += "selected ";
    } else {
      classes += "unselected ";
    }
    var ind2 = this.toRotate.indexOf(d);
    if (ind2 >= 0) {
      classes += "rotate ";
    } else {
      classes += "unrotate "
    }
    if (!d.data.name) {
      classes += "leaf ";
    }
    return classes;
  }

  styleNodes(container) {
    container.selectAll(".node").style("stroke-width", "3px");
    container.selectAll(".node .rotate").style("fill", "paleturquoise");
    container.selectAll(".node .unrotate").style("fill", "#fff");
    container.selectAll(".node .unselected").style("stroke", "black");
    container.selectAll(".node .leaf").style("stroke", "gray");
    container.selectAll(".node .selected").style("stroke", "red");
  }

  styleLinks(container) {
    container
      .selectAll(".link")
      .filter(".unselected")
      .style("stroke", "black");
    container
      .selectAll(".link")
      .filter(".selected")
      .style("stroke", "red");
  }

  rotate() {
    if (this.toRotate.length < 3) {
      console.log("Error: Must Select Two Nodes");
    }

    var n1 = this.toRotate[1];
    var n2 = this.toRotate[2];

    var child;

    if (n1.parent == n2) child = n1;
    else if (n2.parent == n1) child = n2;
    else console.log("Error: Nodes Must Be Linked");

    var parent = child.parent;
    var grandparent = parent.parent;
    var left = parent.children[1] === child;
    if (left) {
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

    this.toRotate = [-1];

    this.update(this.root);
  }
}

export { Tree, RBTree };
